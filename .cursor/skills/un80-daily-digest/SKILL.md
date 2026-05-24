---
name: un80-daily-digest
description: Run the consolidated daily UN80 WP15 digest — landscape, social/news, and briefing summary in one pass. Use for the single daily Cursor automation at 08:00 CEST.
---

# UN80 Daily Digest (merged automation)

One run replaces the former Mon landscape, Wed social, and daily briefing slice.

## Schedule

- **08:00 CEST** → cron `0 6 * * *` (UTC)
- **08:00 CET** (winter) → change cron to `0 7 * * *` in Cursor UI

## Rules

1. All outputs **DRAFT** — not agreed UN policy.
2. Public secondary data only.
3. Load `.cursor/skills/un80-landscape-monitor/SKILL.md`, `.cursor/skills/un80-social-monitor/SKILL.md`, `.cursor/skills/un80-briefing-writer/SKILL.md`, `.cursor/skills/un80-academic-evidence/SKILL.md` as needed.
4. **Always** write `reports/YYYY-MM-DD-daily-digest.md` (even if no material delta — say so explicitly).
5. Open PR when **any** of: new landscape findings, new social signals, or digest narrative changed materially. If truly no delta, still commit digest with "No material change" and open a lightweight PR so the email Action fires.

## Run sequence

1. `npm install && npm run fetch:monitor && npm run fetch:academic`
2. Landscape pass — update `data/secondary-sources/YYYY-MM-DD-scan.yaml` if new public evidence; touch `overlap-signals.yaml` only if warranted
3. Social pass — `data/social-monitor/YYYY-MM-DD-social.yaml`, merge into `data/social-signals.yaml`
4. Write **`reports/YYYY-MM-DD-daily-digest.md`** using `templates/daily-digest.md`
5. On **1st of month**: also refresh `reports/YYYY-MM-member-state-update.md` (full Member State draft)
6. `npm run validate && npm run build:dashboard && npm run verify:claims`
7. Open PR titled `digest: daily WP15 — YYYY-MM-DD`
8. Notion: row in Automation log; update Living Analysis if material signals
9. Linear: `[run] Daily digest — YYYY-MM-DD`

## Digest quality bar

- Executive summary ≤ 10 bullets
- Separate **Action 61** / **Action 62** sections
- Link every claim to repo data or URL
- 1–2 Tier A footnotes where analytical framing appears
- Flag items needing human review

## Email

Pushing the digest file triggers `.github/workflows/daily-digest-email.yml` → `rahul.jha@itu.int` (configure SMTP secrets on GitHub).
