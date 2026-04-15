# Tenant Provisioning

> **Who this is for.** The founder or the designated ops operator. Not customer-self-service. Every tenant creation is a manual step until the operator console ships in Phase 2.
> **When to run.** Every new customer tenant (test or real). Also run to create the first internal demo tenant, the canonical seed tenant (`acme-demo`), and each pilot customer in Phase 3-5. This is a frequent runbook (it will run dozens of times before Phase 5) but still a runbook (not a skill) because it has authorization implications: creates a schema, runs migrations, creates an initial owner user with access to Confidential-tier data.
> **Time estimate.** 15 to 20 minutes per tenant end to end. Most of that is waiting on the schema migration runner.
> **Authorization.** You need: (1) GCP operator access to the target project (prod or staging), (2) `gamma-ops` library installed, (3) Cloud SQL Auth Proxy running locally (or a VPC-side shell), (4) the customer info collected in the pre-flight checklist, (5) legal approval if the tenant is in a new country that has not yet been enabled in `public.country_holidays` (see `specs/DATA_ARCHITECTURE.md` §14).
> **Reversibility.** Yes. Test tenants can be hard-deleted with `--grace-days 0`. Real tenants follow the 30-day grace period in the suspended-account lifecycle (see ADR-001 and `docs/ROLLBACK_RUNBOOK.md`). The per-tenant CMEK key is disabled (not deleted) on tenant deletion, per Cloud KMS constraints.
> **Cross-references.** ADR-001 (schema-per-tenant), ADR-005 (per-tenant CMEK), `specs/DATA_ARCHITECTURE.md` §12.10 (canonical seed data), §14 (multi-country scaffolding), `docs/DATA_INGESTION.md` (CSV onboarding), `docs/ROLLBACK_RUNBOOK.md` section 3 (per-tenant rollback).

---

## 1. Pre-flight checklist

- [ ] `gamma-ops` library installed and `gamma-ops tenants --help` works
- [ ] Cloud SQL Auth Proxy running against the target environment: `cloud-sql-proxy gamma-prod-001:europe-west9:gamma-prod-db-001 --port=5433 &`
- [ ] `DATABASE_URL` in `.env` points at the proxy: `postgresql://gamma_app_user@127.0.0.1:5433/gamma_app`
- [ ] Target environment confirmed (`ENV=prod` or `ENV=staging`). Do not test in prod
- [ ] Customer info collected:
  - [ ] Company legal name (e.g., "Acme Consulting SAS")
  - [ ] Display name (e.g., "Acme")
  - [ ] Legal jurisdiction (ISO country code: FR, GB, CA, MA, NE). Only FR and GB are enabled in year 1. Others require unlocking `public.country_holidays` + legal review per §14
  - [ ] Base currency (EUR, GBP, CAD, MAD, XOF, etc.)
  - [ ] Primary locale (e.g., `fr-FR`, `en-GB`). Must be one of the supported locales in `messages/*.json`
  - [ ] Owner email (the person who will receive the invitation)
  - [ ] Plan (Gamma Standard or Gamma Enterprise). This drives `tenants.plan` and entitlement defaults
  - [ ] Slug (short lowercase identifier, e.g., `acme`). Must match `^[a-z0-9-]{3,32}$`. This becomes part of the schema name `tenant_<slug>`
- [ ] The slug is not already taken: `psql -c "SELECT 1 FROM public.tenants WHERE slug = 'acme'"` returns zero rows
- [ ] For a real customer: signed order form, plan selected, billing method on file
- [ ] For a test tenant: suffix the slug with `-test` (e.g., `acme-test`) so the cleanup job can find it later

## 2. The procedure, step by step

### Step 1. Create the tenant record and schema

Intent: one command that inserts into `public.tenants`, creates the `tenant_<slug>` schema, runs `alembic upgrade head` against that schema, and records the run in `public.alembic_runs`.

```bash
gamma-ops tenants provision \
  --slug acme \
  --legal-name "Acme Consulting SAS" \
  --display-name "Acme" \
  --legal-jurisdiction FR \
  --base-currency EUR \
  --primary-locale fr-FR \
  --plan standard \
  --owner-email founder@acme.fr
```

Expected output: a sequence of structured log lines:
- `event=tenant.row_inserted tenant_id=<uuid> slug=acme`
- `event=schema.created schema_name=tenant_acme`
- `event=migration.run tenant_id=<uuid> version=head status=started`
- `event=migration.run tenant_id=<uuid> version=<latest> status=success duration_ms=<n>`
- `event=tenant.holidays_seeded country=FR count=<n>`
- `event=tenant.holidays_seeded country=GB count=<n>` (only if the tenant's `legal_jurisdiction` is multi-country)
- `event=tenant.owner_user_created user_id=<uuid> email=founder@acme.fr`
- `event=tenant.invitation_sent email=founder@acme.fr`
- `status=ok tenant_id=<uuid>`

This command is a [STUB] today (Phase 2 week 1). Until it ships, the equivalent manual procedure is:

1. Insert the tenant row directly:
   ```sql
   INSERT INTO public.tenants (id, slug, legal_name, display_name, legal_jurisdiction, base_currency, primary_locale, plan, access_state, created_at)
   VALUES (gen_random_uuid(), 'acme', 'Acme Consulting SAS', 'Acme', 'FR', 'EUR', 'fr-FR', 'standard', 'pending', now())
   RETURNING id;
   ```
2. Create the schema: `CREATE SCHEMA tenant_acme;`
3. Run the migration runner manually: `python -m backend.migrations.runner upgrade --tenant=tenant_acme --to=head`
4. Verify all migrations succeeded in `public.alembic_runs` (look for `status=success` rows)
5. Seed holidays: `INSERT INTO tenant_acme.tenant_holidays SELECT ... FROM public.country_holidays WHERE country_code = 'FR'`
6. Create the owner user in `public.users` and the matching row in `tenant_acme.employees`
7. Flip `tenants.access_state = 'active'`
8. Send the invitation email manually (see `docs/DATA_INGESTION.md` for the template)

Failure recovery: if the migration step fails partway, consult `docs/ROLLBACK_RUNBOOK.md` section 2 (migration failure modes) and section 3 (per-tenant rollback). Do NOT delete the schema by hand during an incident.

### Step 2. Create the per-tenant CMEK CryptoKey

Intent: every tenant's Confidential-tier data (compensation, banking, Art. 9 sensitive fields) is encrypted at rest with a tenant-scoped CMEK key, per ADR-005.

```bash
gamma-ops gcp kms create-key tenant-acme \
  --keyring gamma-tenant-keys \
  --location europe-west9 \
  --rotation-days 365
```

Expected output: `event=kms.key.created key_uri=projects/gamma-prod-001/locations/europe-west9/keyRings/gamma-tenant-keys/cryptoKeys/tenant-acme rotation_period=365d`.

Then record the key URI on the tenant row:

```sql
UPDATE public.tenants SET cmek_key_uri = 'projects/gamma-prod-001/locations/europe-west9/keyRings/gamma-tenant-keys/cryptoKeys/tenant-acme' WHERE slug = 'acme';
```

Failure recovery: KMS keys cannot be deleted. If you create the key with the wrong name, disable it and pick a new name (e.g., `tenant-acme-v2`). Never leave a tenant row pointing at a disabled key.

### Step 3. Verify tenant holiday seeding

Intent: a French tenant should see FR holidays in the calendar on day 1. A UK-billing tenant with a FR-resident workforce needs both FR and GB holidays (see §14). This was auto-seeded in step 1; verify it.

```sql
SET search_path = tenant_acme, public;
SELECT country_code, count(*)
FROM tenant_holidays
GROUP BY country_code
ORDER BY country_code;
```

Expected output: at least one row `country_code=FR count=<11 or more>`. If the tenant has a GB-billing client, expect GB rows too (~8).

Failure recovery: if the count is zero, manually run the seed:

```sql
INSERT INTO tenant_acme.tenant_holidays (id, country_code, date, name, is_recurring)
SELECT gen_random_uuid(), country_code, date, name, is_recurring
FROM public.country_holidays
WHERE country_code IN ('FR');
```

### Step 4. Create and verify the owner user

Intent: the step 1 command auto-created the owner user. For a real tenant, the command also sent a "set your password" email via Workspace SMTP Relay. For a test tenant, you want an immediate password so you can log in.

For a test tenant, override with:

```bash
gamma-ops tenants set-owner-password acme \
  --owner-email founder@acme.fr \
  --password "TestPassword!42"
```

For a real tenant, confirm the invitation was sent:

```sql
SELECT email, invitation_sent_at, password_set_at
FROM public.users
WHERE email = 'founder@acme.fr';
```

`invitation_sent_at` should be within the last few minutes. `password_set_at` will be null until the owner clicks the link.

Failure recovery: if the email did not send (SMTP Relay issue), re-send with `gamma-ops tenants resend-invitation acme --owner-email founder@acme.fr`. Check Workspace SMTP Relay logs in the GCP console for delivery status.

### Step 5. Verify tenant isolation

Intent: confirm that the new schema is wired correctly and that cross-tenant queries are blocked.

```bash
gamma-ops testing verify-isolation tenant-acme
```

Expected output: `event=isolation.verified tenant=tenant_acme tables_checked=<n> cross_tenant_leak=false`.

If that helper is not yet implemented, do a manual spot check:

```sql
SET search_path = tenant_acme, public;
SELECT count(*) FROM employees;  -- expect 1 (the owner)
SELECT count(*) FROM clients;    -- expect 0
SELECT count(*) FROM projects;   -- expect 0
SET search_path = public;        -- drop back to global
SELECT slug, access_state FROM tenants WHERE slug = 'acme';  -- expect 'active'
```

Failure recovery: if employees count is 0, the owner user was not created in the tenant's employees table. Re-run step 4. If `access_state` is still `pending`, flip it:
```sql
UPDATE public.tenants SET access_state = 'active' WHERE slug = 'acme';
```

### Step 6. Audit log spot check

Intent: every step above should have written an audit row to `public.audit_log` with actor `operator:<your-email>`.

```sql
SELECT occurred_at, action, entity_type, entity_id
FROM public.audit_log
WHERE actor_type = 'operator'
  AND (entity_type = 'tenant' OR (entity_type = 'user' AND entity_id::text LIKE '%acme%'))
ORDER BY occurred_at DESC
LIMIT 20;
```

Expected output: rows for `tenant.created`, `schema.created`, `migration.completed`, `kms_key.created`, `user.created`, `invitation.sent`.

Failure recovery: if rows are missing, the audit pipeline has a bug. Alert the founder. Do NOT proceed to customer handover until audit is clean. Audit gaps are a compliance issue.

## 3. Verification

- [ ] `SELECT * FROM public.tenants WHERE slug = 'acme'` returns one row with `access_state = 'active'`, `cmek_key_uri` populated
- [ ] `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'tenant_acme'` returns one row
- [ ] `SELECT count(*) FROM public.alembic_runs WHERE tenant_id = <tenant_uuid> AND status = 'success'` matches the total migration count
- [ ] The owner user row exists in `public.users` and a matching row exists in `tenant_acme.employees` with `role = 'owner'`
- [ ] The owner received the invitation email (check the inbox for real tenants, check the MailHog container or the Workspace SMTP logs for test tenants)
- [ ] The owner can reach the app: navigate to `https://app.gammahr.com` (or the staging equivalent), log in with the credentials, and see an empty tenant with the seeded holidays visible on the calendar page
- [ ] The tenant appears in the operator console at `ops.gammahr.com` (once the operator console ships in Phase 2)
- [ ] The per-tenant CMEK key is listed under `gcloud kms keys list --keyring=gamma-tenant-keys --location=europe-west9`
- [ ] The `public.audit_log` contains the expected provisioning rows

## 4. Rollback / recovery if something goes wrong

- **Test tenant needs to be wiped.** Run `gamma-ops tenants delete acme-test --grace-days 0 --confirm`. This hard-deletes: the tenant row, the schema (`DROP SCHEMA tenant_acme-test CASCADE`), the per-tenant CMEK key (disabled, not hard-deleted), the user rows. The audit log keeps the history per retention policy.
- **Real tenant needs to be wiped immediately** (e.g., test-run that accidentally used a real slug). Same command with `--grace-days 0 --confirm`, but log an incident note in `docs/incidents/` and notify ops@gammahr.com. Real-tenant hard-delete outside the 30-day grace is an exception event.
- **Migration failed partway and tenant is stuck.** Do NOT `DROP SCHEMA` during the incident. Follow `docs/ROLLBACK_RUNBOOK.md` section 3 (per-tenant rollback procedure). The tenant may need to be rolled back to the previous cluster schema version while the broken migration is fixed.
- **CMEK key was created for the wrong tenant slug** (typo). Disable the wrong key, create a new key with the correct name, update `public.tenants.cmek_key_uri`. The typo'd key remains in Cloud KMS as a disabled artifact.
- **Owner email is wrong.** Update `public.users.email` via an operator-tool command (not raw SQL; audited). Re-send the invitation. If the owner has already set a password, use `gamma-ops tenants transfer-ownership acme --from old@example.com --to new@example.com`.
- **Wrong `legal_jurisdiction` set.** If the tenant has not yet used the app, update `public.tenants.legal_jurisdiction` and re-run the holiday seeding step (which is idempotent per-country). If the tenant has already entered data, this is a harder fix: some data may be jurisdiction-tagged (leaves, invoices) and a migration is needed. Alert the founder.
- **Accidentally provisioned in prod when you meant staging.** Run the hard-delete as described above. Verify with `echo $DATABASE_URL` on every session; set your shell prompt to include `$ENV` so you cannot miss it.

## 5. Follow-ups

This runbook does NOT do the following. After it completes:

- **Data import.** Follow `docs/DATA_INGESTION.md` for the CSV onboarding flow. The customer (or the operator on their behalf) imports employees, clients, projects, and historical timesheets via the import UI. For a test tenant, use `gamma-ops testing seed-canonical <tenant_id>` to populate the 201-employee canonical dataset from `specs/DATA_ARCHITECTURE.md` §12.10.
- **Branding.** The tenant's logo, primary color, and invoice header are set via the tenant settings page. Operator can pre-seed via `gamma-ops tenants set-branding acme --logo-file <path>` once that command ships.
- **Integrations.** If the customer wants SSO (Google Workspace, Microsoft Entra), follow the SSO configuration runbook (Phase 5 deliverable, not yet written).
- **Multi-country expansion.** If the tenant adds a UK-billing client (HSBC UK is the canonical example), the GB holidays are already seeded. No action needed.
- **Custom entitlements or contract overrides.** If the customer has a negotiated plan (e.g., higher user count cap, extended retention, custom SLA), insert a row into `public.tenant_custom_contracts` per `specs/DATA_ARCHITECTURE.md`.
- **Welcome handshake.** For real tenants, the founder personally sends a handshake email with the onboarding call booking link. For pilot customers, see `docs/GO_TO_MARKET.md`.
- **Add to the operator dashboard watch list.** New tenants get 7 days of enhanced monitoring (every AI event reviewed, every audit row checked). Add to the watch list via `gamma-ops ops watchlist add acme --days 7`.
