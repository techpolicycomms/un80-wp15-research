# Daily digest — merged automation & email

One **Cursor automation** replaces the former Mon landscape, Wed social, and ad-hoc daily slices. A **GitHub Action** emails the digest to `rahul.jha@itu.int` when the report file is pushed.

## Schedule

| Local time | UTC cron | When |
|------------|----------|------|
| **08:00 CEST** | `0 6 * * *` | Apr – Oct (Geneva summer) |
| **08:00 CET** | `0 7 * * *` | Nov – Mar (change in Cursor UI) |

## Setup (one-time)

### 1. Create the merged Cursor automation

1. Open [prefill URL](../automations/prefill-urls.md#5-un80-daily-digest-merged) or [Cursor Automations](https://cursor.com/automations/new)
2. Confirm repo: `techpolicycomms/un80-wp15-research` @ `main`
3. Enable: **Open pull request**, **Memories**, **Notion MCP**, **Linear MCP**
4. Model: **Composer** or fast model (cost control for daily runs)
5. Save

### 2. Disable old scheduled automations

In Cursor, **disable or delete** the cron triggers on:

- UN80 Weekly Landscape Monitor (`0 6 * * 1`)
- UN80 Social Monitor (`0 7 * * 3`)
- UN80 Monthly Briefing Compiler cron (`0 8 1 * *`) — optional: keep if you want a separate monthly-only run; the daily digest refreshes the full Member State briefing on the **1st** anyway

Keep **Webhook Source Ingest** (on demand).

### 3. GitHub email secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Example | Notes |
|--------|---------|--------|
| `DIGEST_EMAIL_TO` | `rahul.jha@itu.int` | Recipient |
| `DIGEST_EMAIL_FROM` | `un80-digest@itu.int` or allowed sender | Must be permitted by your SMTP |
| `SMTP_SERVER` | `smtp.office365.com` | ITU Microsoft 365 typical |
| `SMTP_PORT` | `587` | STARTTLS |
| `SMTP_USERNAME` | service account or your `@itu.int` | |
| `SMTP_PASSWORD` | app password or service secret | Never commit |

Test manually: **Actions** → **Daily digest email** → **Run workflow**.

### 4. Verify

After the first automation run:

1. PR appears: `digest: daily WP15 — YYYY-MM-DD`
2. File: `reports/YYYY-MM-DD-daily-digest.md`
3. Action **Daily digest email** sends HTML summary + link to the file on GitHub

Email fires on **push** when a `reports/*-daily-digest.md` file changes (including the PR branch Cursor pushes).

---

## Cost notes

- **One** daily cloud agent run ≈ former 3–4 weekly runs per week, but **more** total runs per month than the old weekly schedule
- Use a **fast/cheaper model** for this automation
- Digest always written; PR opened so email + review trail exist
- Monitor spend in [Cursor dashboard](https://cursor.com/dashboard)

---

## Output files

| File | Purpose |
|------|---------|
| `reports/YYYY-MM-DD-daily-digest.md` | Daily email body source |
| `reports/YYYY-MM-member-state-update.md` | Refreshed on **1st of month** only |
| `data/secondary-sources/YYYY-MM-DD-scan.yaml` | Landscape data when new evidence |
| `data/social-monitor/YYYY-MM-DD-social.yaml` | Social/news signals |

---

## Related

- [OPERATIONS.md](./OPERATIONS.md)
- [ACADEMIC-RIGOUR.md](./ACADEMIC-RIGOUR.md)
- Prompt: [automations/daily-digest.prompt.md](../automations/daily-digest.prompt.md)
