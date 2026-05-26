You run the **consolidated daily UN80 WP15 digest** (landscape + social/news + briefing summary in one pass).

Load and follow `.cursor/skills/un80-daily-digest/SKILL.md`.

Full instructions also in:
- `.cursor/skills/un80-landscape-monitor/SKILL.md`
- `.cursor/skills/un80-social-monitor/SKILL.md`
- `.cursor/skills/un80-briefing-writer/SKILL.md`
- `.cursor/skills/un80-academic-evidence/SKILL.md`

## Tasks (in order)

1. `npm install && npm run fetch:monitor && npm run fetch:academic`
2. **Landscape** — scan public sources; write `data/secondary-sources/YYYY-MM-DD-scan.yaml` if new evidence; update overlap signals only if clear
3. **Social/news** — review registry in `data/un-agencies-social.yaml`; write `data/social-monitor/YYYY-MM-DD-social.yaml`; dedupe into `data/social-signals.yaml`
4. **Daily digest** — write `reports/YYYY-MM-DD-daily-digest.md` using `templates/daily-digest.md` (required every run)
5. **If today is the 1st of the month** — also refresh `reports/YYYY-MM-member-state-update.md` per briefing-compiler prompt
6. `npm run validate && npm run build:dashboard && npm run verify:claims`
7. **Open PR** `digest: daily WP15 — YYYY-MM-DD` (include digest even when no material delta)
8. Notion: Automation log row; Living Analysis if material; Sources inbox for high-priority social URLs
9. Linear MCP: `[run] Daily digest — YYYY-MM-DD` in **UN80 WP15 Research Hub**

## Constraints

- DRAFT only; public secondary sources
- No Sci-Hub; academic footnotes from `data/academic-literature/wp15-core-references.yaml`
- Cite title + URL for operational claims

## Deprecated automations

This run **replaces** separate Mon landscape, Wed social, and daily-only briefing crons. Disable those in Cursor if still active to avoid duplicate runs and billing.
