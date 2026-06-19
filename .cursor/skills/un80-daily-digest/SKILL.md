---
name: un80-daily-digest
description: Run the consolidated daily UN80 WP15 digest — landscape, social/news, and briefing summary in one pass. Use for the single daily Cursor automation at 08:00 CEST.
---

# UN80 Daily Digest (merged automation)

**Thin daily mode:** Executive synthesis + links to latest YAML and `reports/living-analysis.md`. Full deep scans remain on **Mon landscape** and **Wed social** unless material breaking news requires extra search.

## Schedule

- **08:00 CEST** → cron `0 6 * * *` (UTC)
- **08:00 CET** (winter) → change cron to `0 7 * * *` in Cursor UI

## Rules

1. All outputs **DRAFT** — not agreed UN policy.
2. Public secondary data only.
3. Load landscape, social, briefing-writer, and academic-evidence skills as needed.
4. **Always** write `reports/YYYY-MM-DD-daily-digest.md` (state "No material change" when true).
5. Open PR when digest narrative or underlying data changed materially. True no-op → optional skip PR (log Notion only); if email delivery needed, lightweight PR with explicit no-delta digest is OK.

## Run sequence

1. `npm install && npm run fetch:monitor && npm run fetch:academic`
2. Read `data/approved-source-feeds.yaml` — spot-check tier-1 feeds only (not full landscape pass)
3. Landscape — update scan YAML **only if** new public evidence since last merged PR
4. Social — refresh social YAML if RSS shows new high-priority signals
5. Write **`reports/YYYY-MM-DD-daily-digest.md`** using `templates/daily-digest.md`
6. On **1st of month**: full `reports/YYYY-MM-member-state-update.md` per briefing-compiler
7. `npm run validate && npm run build:dashboard && npm run verify:claims reports/YYYY-MM-DD-daily-digest.md`
8. PR titled `digest: daily WP15 — YYYY-MM-DD` when material
9. Notion Automation log; living analysis rollforward if material
10. Linear: `[run] Daily digest — YYYY-MM-DD`

## Digest quality bar

- Executive summary ≤ 10 bullets
- **New this period** vs **Carried forward**
- Separate **Action 61** / **Action 62** sections
- Link every claim to repo data or URL
- 1–2 Tier A footnotes where analytical framing appears
- Flag items needing human review

## Email

Pushing the digest file triggers `.github/workflows/daily-digest-email.yml` → configure SMTP secrets on GitHub.

## Coexistence with weekly automations

When daily digest is enabled: disable Mon/Wed/monthly **crons** in Cursor UI to avoid duplicate billing — or keep weekly crons for deep scans and use daily for thin synthesis only (team choice; document in `workflows.json`).
