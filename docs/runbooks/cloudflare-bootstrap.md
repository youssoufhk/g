# Cloudflare Bootstrap

> **Who this is for.** The co-founder (or whoever has domain registrar access and Cloudflare account admin).
> **When to run.** Phase 2 week 1, immediately after `gcp-bootstrap.md` completes for the target environment. You need the four `*.run.app` URLs from GCP step 13 before starting.
> **Time estimate.** 45 to 60 minutes for the first run. ~30 minutes for the second (prod) run.
> **Authorization.** You need: (1) registrar access on `gammahr.com` (or whichever domain is purchased), (2) Cloudflare account admin, (3) a Cloudflare API token with `Zone:Edit`, `DNS:Edit`, `Page Rules:Edit`, `Access:Edit` scoped to the zone, (4) `CLOUDFLARE_API_TOKEN` in your local `.env`.
> **Reversibility.** Yes, DNS and WAF changes are reversible in the Cloudflare dashboard. Propagation is typically under 5 minutes, allow up to 24 hours worst case. Cloudflare Access rules are instant. The one exception: once HSTS is enabled with `includeSubDomains` and `preload`, browsers cache the directive for the max-age, so disabling HSTS takes effect only after that window. Do not enable HSTS until the site is fully green.
> **Cross-references.** ADR-008 (deployment, Cloudflare role), ADR-010 (three-app model, three subdomains), `infra/ops/gamma_ops/cloudflare/`, `docs/runbooks/gcp-bootstrap.md`, `EXECUTION_CHECKLIST.md` §3.1.

---

## 1. Pre-flight checklist

- [ ] Domain registered. If not yet purchased, stop and buy it first. Recommended registrar: Cloudflare Registrar itself for lowest-friction NS updates, or any registrar that exposes the NS fields to edit
- [ ] Cloudflare account created, the domain added as a zone, zone status shows `Active` (green) or `Pending Nameserver Update`
- [ ] Domain nameservers updated at the registrar to the Cloudflare-assigned NS pair (dashboard shows them in the Overview tab). NS propagation can take up to 24 hours; do not run this runbook until the zone is `Active`
- [ ] API token generated under My Profile > API Tokens with the scopes listed above. Token is stored in `.env` as `CLOUDFLARE_API_TOKEN`
- [ ] `gamma-ops` library installed and `gamma-ops cloudflare --help` works
- [ ] The four Cloud Run `*.run.app` URLs from `gcp-bootstrap.md` step 13 are saved somewhere you can paste from
- [ ] GCP environment confirmed (prod or staging). Subdomains for staging are `ops.staging.gammahr.com`, `app.staging.gammahr.com`, `portal.staging.gammahr.com`. Prod drops the `staging` label
- [ ] You are on a stable network. Running this over a flaky tethered connection while editing DNS is a bad idea

## 2. The procedure, step by step

All commands assume `.env` is loaded and `ENV=prod` (or `ENV=staging`) is exported. Replace `<env>` in subdomain examples accordingly.

### Step 1. Verify the zone is active

```bash
gamma-ops cloudflare zones get gammahr.com
```

Expected output: `event=zone.get zone_id=<id> status=active name_servers=[...]`.

Failure recovery: if `status=pending`, the NS update at the registrar has not propagated yet. Wait and retry (`dig NS gammahr.com` from the command line checks propagation without the dashboard).

### Step 2. Create the DNS records for the three audience subdomains

Intent: point `ops`, `app`, `portal` at the Cloud Run service URLs via CNAME. Also create `api` as an alias for the backend.

```bash
gamma-ops cloudflare dns create gammahr.com \
  --name ops --type CNAME \
  --content gamma-ops-xxxxx-ew.a.run.app \
  --proxied

gamma-ops cloudflare dns create gammahr.com \
  --name app --type CNAME \
  --content gamma-app-xxxxx-ew.a.run.app \
  --proxied

gamma-ops cloudflare dns create gammahr.com \
  --name portal --type CNAME \
  --content gamma-portal-xxxxx-ew.a.run.app \
  --proxied
```

Replace the `xxxxx-ew.a.run.app` portion with the actual URLs you saved from GCP step 13. `--proxied` puts the record behind Cloudflare (orange cloud).

Expected output: one `event=dns_record.created` per record with a returned `record_id`.

Failure recovery: if a record already exists (re-running), use `gamma-ops cloudflare dns update` or delete with `gamma-ops cloudflare dns delete <record_id>` first.

### Step 3. Map the Cloud Run domain

Cloud Run requires a domain mapping so that requests to `app.gammahr.com` are routed to the right service. This is done on the GCP side but paired with the DNS step above.

```bash
for sub in ops app portal; do
  gcloud run domain-mappings create \
    --service=gamma-$sub \
    --domain=$sub.gammahr.com \
    --region=europe-west9 \
    --project=gamma-prod-001
done
```

Expected output: three `Creating... done.` lines, each returning the DNS verification records Cloud Run needs (TXT or additional CNAME). If the mapping requires a domain verification TXT, add it via `gamma-ops cloudflare dns create gammahr.com --name @ --type TXT --content "google-site-verification=..."` and retry.

Failure recovery: Cloud Run domain mappings require the domain to be verified with Google once (per the operator account, not per project). If the mapping fails with `domain_not_verified`, open Search Console, add `gammahr.com`, complete the verification, then retry.

### Step 4. Verify Universal SSL is on

Universal SSL is on by default for new zones. Confirm:

```bash
gamma-ops cloudflare ssl get gammahr.com
```

Expected output: `event=ssl.get universal_enabled=true always_use_https=<current_value>`.

Failure recovery: if universal SSL is somehow off, enable it via the dashboard (SSL/TLS > Edge Certificates > Universal SSL).

### Step 5. Enable Always Use HTTPS

```bash
gamma-ops cloudflare settings set gammahr.com \
  --always-use-https on
```

Expected output: `event=setting.updated key=always_use_https value=on`.

Failure recovery: none; idempotent toggle.

### Step 6. Configure WAF managed rulesets

Intent: Cloudflare Managed Ruleset plus OWASP Core Ruleset. Both are on the Pro plan or higher; the Free plan has only a subset.

```bash
gamma-ops cloudflare waf enable-managed-rules gammahr.com \
  --rulesets cloudflare_managed,owasp_core
```

Expected output: `event=waf.managed_rules.enabled count=2`.

Failure recovery: if the zone is on the Free plan and the command fails, upgrade to Pro ($20/month) in the Cloudflare dashboard before continuing. Pro is a Phase 2 cost line item in the GTM plan.

### Step 7. Configure rate limiting rules

Intent: protect auth and feedback endpoints from brute force and abuse.

```bash
gamma-ops cloudflare rate-limit create gammahr.com \
  --description "auth endpoints brute-force protection" \
  --match 'http.request.uri.path matches "^/api/v1/auth/.*"' \
  --threshold 100 \
  --period 60 \
  --action block \
  --timeout 600

gamma-ops cloudflare rate-limit create gammahr.com \
  --description "feedback endpoint abuse protection" \
  --match 'http.request.uri.path eq "/api/v1/feedback"' \
  --threshold 20 \
  --period 60 \
  --action block \
  --timeout 600
```

Expected output: two `event=rate_limit.created` lines with returned rule IDs.

Failure recovery: rate limiting on the Free plan is capped at one rule with limited options. Pro covers this use case. If the command fails with a quota error, upgrade the plan.

### Step 8. Configure Cloudflare Access for ops.gammahr.com

Intent: the operator console is ops-team-only. Require a Google Workspace login from the `gammahr.com` Workspace domain.

```bash
gamma-ops cloudflare access create-application gammahr.com \
  --name "Gamma Ops Console" \
  --domain ops.gammahr.com \
  --session-duration 8h \
  --allowed-idps google-workspace \
  --required-email-domain gammahr.com
```

Expected output: `event=access.application.created app_id=<id>`.

Failure recovery: Cloudflare Access requires a Zero Trust (Teams) account tier. The Free tier allows up to 50 users, which is enough for Gamma for the foreseeable future. If the command fails with `zero_trust_not_enabled`, visit the Zero Trust dashboard once to accept the terms, then retry.

### Step 9. Redirect www to app

Intent: a user who types `www.gammahr.com` lands on `app.gammahr.com`. Done via Page Rule or Bulk Redirect.

```bash
gamma-ops cloudflare dns create gammahr.com \
  --name www --type CNAME \
  --content gammahr.com \
  --proxied

gamma-ops cloudflare page-rule create gammahr.com \
  --match "www.gammahr.com/*" \
  --action forwarding_url \
  --forwarding-url "https://app.gammahr.com/$1" \
  --status-code 301
```

Expected output: one DNS record, one page rule.

Failure recovery: Free plan includes 3 page rules. This uses 1, leaving 2 for future needs. If you are out of page rules, use a Bulk Redirect instead.

### Step 10. Enable Bot Fight Mode

```bash
gamma-ops cloudflare settings set gammahr.com \
  --bot-fight-mode on
```

Expected output: `event=setting.updated key=bot_fight_mode value=on`.

### Step 11. Enable HSTS (do this LAST, only after full verification)

Do not run this step until Section 3 verification passes green on all items. HSTS is hard to undo if a TLS issue appears later.

```bash
gamma-ops cloudflare settings set gammahr.com \
  --hsts-enabled on \
  --hsts-max-age 31536000 \
  --hsts-include-subdomains on \
  --hsts-preload off
```

Expected output: `event=setting.updated key=hsts value={...}`.

Failure recovery: to disable HSTS, set `--hsts-enabled off`. Browsers that already cached the directive will continue to enforce it for up to `max-age` seconds (1 year). This is why preload is OFF in Phase 2; enable preload only after 6+ months of green ops, per `docs/DEFERRED_DECISIONS.md`.

## 3. Verification

All boxes must be green before enabling HSTS in step 11.

- [ ] `dig app.gammahr.com` returns a Cloudflare IP (e.g., `104.21.x.x` or `172.67.x.x`)
- [ ] `curl -v https://app.gammahr.com` returns a 200 or 3xx from the Cloud Run placeholder service, with `CF-RAY` header present, `Server: cloudflare` header present
- [ ] `curl -v https://app.gammahr.com` shows `Strict-Transport-Security` header only AFTER step 11
- [ ] `curl -v https://ops.gammahr.com` returns a Cloudflare Access login page (HTTP 302 to `https://<team>.cloudflareaccess.com/...`)
- [ ] `curl -v http://app.gammahr.com` returns a 301 to `https://app.gammahr.com` (Always Use HTTPS working)
- [ ] `curl -v https://www.gammahr.com` returns a 301 to `https://app.gammahr.com` (www redirect working)
- [ ] Cloudflare dashboard > Security > Events shows the WAF is evaluating requests (may be empty in the first hour, that is fine)
- [ ] Cloudflare dashboard > Security > Bots shows Bot Fight Mode is on
- [ ] Cloud Run domain mapping for each subdomain shows `status=READY` in `gcloud run domain-mappings describe`
- [ ] A test request from a non-founder IP to `ops.gammahr.com` gets blocked at the Access layer

## 4. Rollback / recovery if something goes wrong

- **DNS record pointing at the wrong Cloud Run URL.** Update with `gamma-ops cloudflare dns update <record_id> --content <correct_url>`. Propagation under 5 minutes.
- **Universal SSL stuck pending.** Cloudflare SSL certificate issuance sometimes takes up to 24 hours on a fresh zone. If pending after 24 hours, delete and recreate the Universal SSL cert from the dashboard.
- **Cloud Run domain mapping stuck in PENDING.** Delete with `gcloud run domain-mappings delete` and recreate. Check that the TXT verification records are in place.
- **WAF blocking legitimate traffic.** Disable the offending ruleset with `gamma-ops cloudflare waf disable-managed-rule <rule_id>`. Investigate which rule, then either tune or add an exception for the affected path.
- **Rate limit too aggressive.** Adjust threshold and period via `gamma-ops cloudflare rate-limit update <rule_id>`. Effect is instant.
- **Access locking the founder out.** Go to the Zero Trust dashboard, edit the application, relax the policy or add the founder's email as an explicit allow. If you cannot reach the dashboard (paradoxically), use the Cloudflare API directly with a full-access token.
- **HSTS enabled too early and now a TLS issue cannot be patched.** Set HSTS off as described in step 11, then wait out the `max-age` window for affected browsers. Mitigation: the first customers are a small group of known testers; reach them directly and ask them to clear HSTS cache in Chrome (`chrome://net-internals/#hsts`).
- **The wrong environment got the DNS records.** If you ran prod steps against the staging zone by mistake, the staging zone now has prod CNAMEs. Delete the wrong records with `gamma-ops cloudflare dns delete <record_id>` and re-run against the correct zone. DNS names are per-zone so there is no name collision risk.

## 5. Follow-ups

This runbook does NOT do the following. After it completes:

- **Cloudflare Tunnel for Cloud SQL admin access.** Deferred (see `docs/DEFERRED_DECISIONS.md` DEF-018 or similar). For now, Cloud SQL admin is via the Auth Proxy from the founder's laptop.
- **Edge-cached static asset strategy.** Deferred until the landing page exists and measurable cache hit rate matters.
- **Cloudflare Pages for the status page** (`status.gammahr.com`). Phase 5 deliverable, covered in the launch runbook.
- **Second environment bootstrap.** Repeat this runbook for staging (before prod) or prod (after staging), using the matching subdomains.
- **Custom Access policies** for the future portal subdomain. Client portal has its own magic-link login flow, not Workspace login, so it does NOT go behind Access. Make sure you did not accidentally apply the Access rule from step 8 to `portal.gammahr.com`.
- **WAF custom rules for country allowlists.** Deferred until a real attack pattern appears. Phase 2 runs with managed rules only.
- **PagerDuty or on-call integration for WAF alerts.** Phase 2 week 2, paired with the Cloud Logging sinks from the GCP runbook follow-ups.
