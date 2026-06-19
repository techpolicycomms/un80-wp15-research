You run the **consolidated daily UN80 WP15 digest** (thin synthesis mode).

Load and follow `.cursor/skills/un80-daily-digest/SKILL.md`.

Full instructions also in:
- `.cursor/skills/un80-landscape-monitor/SKILL.md`
- `.cursor/skills/un80-social-monitor/SKILL.md`
- `.cursor/skills/un80-briefing-writer/SKILL.md`
- `.cursor/skills/un80-academic-evidence/SKILL.md`

## Tasks (in order)

1. `npm install && npm run fetch:monitor && npm run fetch:academic`
2. Read `reports/living-analysis.md` and `data/approved-source-feeds.yaml`
3. **Landscape** — update scan YAML only if new evidence since last merged PR
4. **Social/news** — refresh social YAML if RSS shows new high-priority signals
5. **Daily digest** — write `reports/YYYY-MM-DD-daily-digest.md` using `templates/daily-digest.md` (required every run)
6. **If today is the 1st of the month** — full member-state update per briefing-compiler prompt
7. `npm run validate && npm run build:dashboard && npm run verify:claims reports/YYYY-MM-DD-daily-digest.md`
8. Open PR `digest: daily WP15 — YYYY-MM-DD` when material delta; no-op may skip PR (log Notion)
9. Notion Automation log; living analysis rollforward if material
10. Linear MCP: `[run] Daily digest — YYYY-MM-DD`

## Thin mode

Do not duplicate full Mon/Wed deep scans. Link to latest scan YAML and living analysis rollforward. Spot-check tier-1 approved feeds only.

## Constraints

- DRAFT only; public secondary sources
- No Sci-Hub; academic footnotes from `data/academic-literature/wp15-core-references.yaml`
- Cite title + URL for operational claims

## Enabling daily digest

Import via `automations/prefill-urls.md` §5. Optionally disable Mon/Wed/monthly crons to avoid duplicate runs — or keep weekly for depth + daily for synthesis (document choice in Notion).
