---
name: commit
description: Use this skill whenever the user wants to create a git commit in the Gamma repo. Trigger phrases include "commit this", "commit the changes", "make a commit", "ship this", "git commit", "commit and push" (push is refused), or any request that involves finalizing staged changes into a commit. Runs the 9 pre-commit hooks on staged files, applies safe auto-fixes (trailing whitespace, EOF newline), reports and blocks on unsafe findings (committed secrets, em dashes, banned words, large files, merge markers), and creates the commit with a Co-Authored-By footer once the gate is clean. Never skips hooks. Never auto-fixes secrets or banned words. Never pushes.
---

# commit: run the pre-commit gate and create a clean commit in one shot

This skill collapses the "commit -> pre-commit fails -> fix -> restage -> commit again" loop into a single invocation. It is the only commit path agents should use in the Gamma repo during Phase 2 through Phase 7. Ad-hoc `git commit` calls from inside an agent session bypass the project discipline and should not happen.

## Hard rules (from CLAUDE.md)

1. **Never `git commit --no-verify` or `--no-gpg-sign`.** Rule 10. If a hook fails, fix the root cause, not the check.
2. **Never commit without the founder asking.** Rule 9. This skill is invoked by the founder or by an agent explicitly told to commit. It never self-initiates.
3. **Never auto-replace banned words or em dashes silently.** Replacement choice is context-dependent (utilisation -> work time vs capacity vs contribution; em dash -> hyphen vs parenthesis vs restructure). Show, propose, wait for approval. Never silent mechanical find-and-replace.
4. **Never push to remote.** This skill only creates the commit. Pushing is a separate explicit action from the founder.
5. **Never force-add a gitignored file.** If a file is gitignored, assume the rule is correct and ask before overriding.
6. **Never amend existing commits.** If a hook fails after commit, create a NEW commit with the fix. Amending published commits breaks history.

## When to use this skill

**Use it when:**
- The user says "commit this", "commit the changes", "ship this change", "git commit"
- An agent has finished a scoped piece of work and needs to land it
- After a `/build-page` or `/scaffold-*` skill run, to commit the output
- After the user has manually staged files with `git add`

**Do NOT use it when:**
- The user is asking for a code review (use `/run-flawless-gate` or manual review)
- The user wants to push to remote (push is a separate action; this skill refuses to push)
- The user wants to amend an existing commit (refuse and explain why)
- There is nothing staged (refuse with "Nothing staged. Run `git add <files>` first.")
- The user wants to commit secrets or gitignored files (refuse)

## Inputs you need from the user

Before running, confirm:

1. **The commit message.** One short sentence in imperative mood ("Add month-end close page", not "Added..." or "Adding..."). The skill adds the Co-Authored-By footer automatically. If the user did not provide a message, generate one from the staged diff (see Step 2a) and ask for confirmation before proceeding.
2. **The staged file set** is correct. Run `git status --short` and show the user what is about to be committed. If anything looks wrong, stop and ask.

## The procedure

### Step 1: Pre-flight

Run these commands in order. Abort if any check fails.

```bash
# 1a. Confirm we are in the Gamma repo root
cd /home/kerzika/ai-workspace/claude-projects/gammahr_v2

# 1b. Check for staged changes
git diff --cached --quiet && echo "NOTHING_STAGED" || echo "HAS_STAGED"

# 1c. Show the user what is about to be committed
git status --short
git diff --cached --stat
```

If `NOTHING_STAGED`, stop and tell the user: "Nothing is staged. Run `git add <files>` first, then invoke this skill again." Do NOT attempt to stage files on behalf of the user.

If the staged set includes any file matching sensitive patterns (`.env`, `*.pem`, `*.key`, `service-account*.json`, `gcp-credentials*.json`, `*.tfstate`, `id_rsa`, `id_ed25519`, `.claude/settings.local.json`), stop immediately and tell the user: "Sensitive file pattern detected in staged set: `<file>`. Refusing to commit. Confirm the file does not contain secrets OR remove it from staging." This is a first-pass check; gitleaks in Step 3 is the real enforcement.

### Step 2: Show the diff summary to the user

Print the output of `git diff --cached --stat`. This is the last chance for the user to see what is going in.

### Step 2a: Generate commit message if none provided

If the user did not supply a message, read the full staged diff:

```bash
git diff --cached
```

From the diff, generate a commit message that:
- Uses imperative mood ("Add", "Fix", "Update", "Remove", "Refactor", "Extract" - not "Added", "Fixes", "Adding")
- Is one short sentence, under 72 characters
- Describes WHAT changed and, when non-obvious, WHY
- Does not contain em dashes (use hyphens) or the word "utilisation"
- Matches the style of recent commits: `git log --oneline -10`

Show the proposed message to the user:

```
Proposed message: "<generated message>"
Commit with this message? (yes / edit / cancel)
```

- **yes**: proceed with the generated message
- **edit**: the user types a replacement; use that instead
- **cancel**: abort the commit

Do NOT proceed past Step 2a without explicit confirmation of the message - either the user's own message or an approved generated one.

### Step 3: Run pre-commit on staged files

```bash
pre-commit run --files $(git diff --cached --name-only)
```

NOT `pre-commit run --all-files`. Scanning the whole repo is slow and the only files that matter for a commit are the staged ones.

Pre-commit runs the 9 hooks in order: gitleaks, trailing-whitespace, end-of-file-fixer, check-added-large-files, check-yaml, check-json, check-merge-conflict, no-em-dashes, no-utilisation.

Capture the exit code and the stdout. Parse the output to determine which hooks passed and which failed.

### Step 4: Handle auto-fix hooks

The following hooks auto-fix files when they detect issues. When they do, the file is modified on disk but NOT re-staged automatically. Pre-commit exits 1 in this case to signal "I fixed something, re-stage and re-run."

**Auto-fix hooks (safe to apply without asking):**
- `trailing-whitespace`
- `end-of-file-fixer`

If either of these reported "Fixed" in the output:
1. Re-stage the modified files: `git add $(git diff --cached --name-only) $(git diff --name-only)`
2. Re-run `pre-commit run --files $(git diff --cached --name-only)`
3. Repeat at most 2 times. If the same hooks keep reporting "Fixed" after 2 iterations, something is wrong (e.g., a file is being regenerated by another process). Stop and report.

After the auto-fix loop converges, continue to Step 5.

### Step 5: Handle report-and-block hooks

The following hooks report findings and block the commit. They do NOT auto-fix. This skill does NOT auto-fix them either.

**Report-and-block hooks (human judgment required):**

- **gitleaks**: a secret was detected in the staged diff. Print the gitleaks findings verbatim. Tell the user: "gitleaks found a potential secret. This must be rotated and removed before commit. See `docs/runbooks/secrets-management.md` section 7 for incident response. If this is a false positive, add it to `.gitleaks.toml` allowlist with review." Do NOT commit. Do NOT offer to remove the line.

- **check-added-large-files**: a file over 500 KB was staged. Print the file name and size. Tell the user: "Large file detected. Options: (1) add to `.gitignore` if it should not be committed, (2) use git-lfs for binary assets, (3) if this is a prototype HTML file the `prototype/` path is already excluded; for other necessary large files, ask the founder first." Do NOT commit.

- **check-merge-conflict**: unresolved merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in a staged file. Print the file and line. Tell the user: "Unresolved merge conflict in `<file>`. Resolve manually before committing." Do NOT commit.

- **check-yaml / check-json**: syntax error. Print the file and line. Tell the user: "YAML/JSON syntax error in `<file>:<line>`. Fix the syntax and re-stage." Do NOT commit.

- **no-em-dashes**: em dash or en dash detected. Print each finding with file and line. Tell the user:
  ```
  Em dashes found in <file>:<line>. Replacement is context-dependent:
    - Range: use hyphen (e.g., "Jan 1 to Dec 31")
    - Aside: use parentheses (e.g., "the app does the work (you confirm)")
    - Pause: use a period + capital letter
  Fix manually and re-stage, or run `/commit --fix-em-dashes` for interactive mode.
  ```
  Do NOT commit. Do NOT apply mechanical replacements silently.

- **no-utilisation**: banned word detected. Print each finding. Tell the user:
  ```
  Banned word "utilisation" found in <file>:<line>. Replacement depends on meaning:
    - How much of available time is billable -> "work time"
    - How much total time a team has -> "capacity"
    - What an individual produced -> "contribution"
    - None fit -> restructure the sentence
  Fix manually and re-stage. Never auto-replace.
  ```
  Do NOT commit. Do NOT apply mechanical replacements.

If any report-and-block hook failed, stop here. Exit without committing. The user fixes the findings manually and re-invokes the skill.

### Step 6: Interactive em-dash fix mode (optional, `--fix-em-dashes` flag)

If the user invoked the skill with `--fix-em-dashes` (e.g., `/commit --fix-em-dashes "my message"`), and the ONLY failing hook is `no-em-dashes`:

For each finding:
1. Show the file, line number, and the offending line
2. Propose a replacement (default: replace `\u2014` with `-` and `\u2013` with `-`)
3. Show before/after diff
4. Ask the user: "Apply? (y/n/edit/skip)". `y` applies, `n` leaves unchanged, `edit` lets the user provide a custom replacement, `skip` moves to next finding without fixing.
5. Apply the approved fixes and re-stage
6. Re-run pre-commit
7. If still failing, report

This mode does NOT exist for `no-utilisation` because mechanical replacement there is too unreliable.

### Step 7: Create the commit

Once all 9 hooks pass, create the commit with the user's message plus the mandatory footer:

```bash
git commit -m "$(cat <<'EOF'
<user's message>

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

Use a heredoc to preserve exact formatting. Do not use `-m "..."` with inline multi-line string (shell escaping breaks).

### Step 8: Verify the commit landed

```bash
git log -1 --oneline
git status --short
```

- `git log -1 --oneline` shows the new commit SHA and message. Capture this to report to the user.
- `git status --short` should be clean (empty output). If it is not clean, pre-commit may have auto-fixed files that were not staged; warn the user.

Report to the user: "Committed `<sha> <message>`. Working tree clean." (or the warning if not clean).

## What this skill does NOT do

- **Does not push.** Pushing to remote is a separate explicit action. If the user says "commit and push", commit first, then tell them: "Committed. To push, run `git push` or ask me to push explicitly."
- **Does not amend existing commits.** If a hook fails after a previous commit landed, create a new commit with the fix.
- **Does not skip hooks** with `--no-verify`. Ever. Not even if the user asks.
- **Does not commit without message confirmation.** If no message is provided, it generates a proposal from the staged diff and waits for explicit approval before proceeding.
- **Does not stage files** on behalf of the user. Staging is the user's decision about what belongs in this commit.
- **Does not commit the files in `infra/ops/.venv/`, `node_modules/`, `.next/`, `dist/`, `build/`.** These are gitignored; if they somehow end up staged, refuse and explain.
- **Does not commit files from `old/` or `prototype/` or `.continue/`.** These are archived, frozen, or IDE-local.

## Forbidden adjacent skills

NEVER invoke `frontend-design`, `brand-guidelines`, `theme-factory`, `canvas-design`, or `algorithmic-art` from this skill. Commit operations are not styling operations. This rule exists because those skills promote maximalist aesthetics that break the Gamma design system (CLAUDE.md rule 13).

## Example invocations

**Commit with no message (auto-generate):**
```
/commit
```
Claude reads the staged diff, proposes a message ("Add commit skill with auto-message generation"), and waits for yes/edit/cancel.

**Simple commit with message:**
```
/commit "Add month-end close page"
```

**Commit after the user confirmed the staging set manually:**
```
/commit "Add month-end close page" --no-confirm
```
(Skips the "Commit above with message X? (yes/no)" step.)

**Commit with interactive em-dash fix:**
```
/commit "Add month-end close page" --fix-em-dashes
```
(Triggers Step 6 if no-em-dashes is the only failing hook.)

**Refused: push requested:**
```
/commit "Add month-end close page" --push
```
Response: "This skill does not push. Committing now; push separately with `git push` or ask me explicitly."

**Refused: nothing staged:**
```
/commit "Add month-end close page"
```
With no `git add` beforehand. Response: "Nothing is staged. Run `git add <files>` first."

## Cross-references

- `CLAUDE.md` rules 9 and 10 (never commit without founder asking, never skip hooks)
- `docs/runbooks/secrets-management.md` (incident response for leaked secrets)
- `.pre-commit-config.yaml` (the 9 hooks this skill invokes)
- `scripts/hooks/no_em_dashes.py`, `scripts/hooks/no_utilisation.py` (the custom hooks)
- `EXECUTION_CHECKLIST.md` section 1.1 (the 10-step quality chain; this skill is step 9)
