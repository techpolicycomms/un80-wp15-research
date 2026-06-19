# Cloud agent workflow improvements

Implemented **2026-05-26** on branch `sprint/review-bundle`. Cursor cloud agents remain the operational engine; this document records what changed and how to use it.

## Summary

| Area | Change |
|------|--------|
| Source watchlist | `data/approved-source-feeds.yaml` — agents check before open web search |
| Structured evidence | `evidence_tier`, `claim_ids`, `links_to` on secondary-source and social YAML |
| TAP mapping | `claim_id` on each item in `data/tap-use-cases.yaml` |
| Living synthesis | Canonical `reports/living-analysis.md` with rollforward log |
| Report templates | New/carried forward, gaps, human review flags on all report types |
| Academic pipeline | `fetch:academic` + `verify:claims` on landscape, social, digest — not only briefings |
| Pre-fetch | `.github/workflows/prefetch-monitor.yml` — Mon 05:30 / Wed 06:30 UTC |
| PR hygiene | Landscape/social: no PR on no-op; log Notion Automation log instead |
| Keyword noise | Word-boundary matching for `ict`, `tap`, `dpg` in `monitor-keywords.mjs` |
| Daily digest | Thin synthesis mode documented; full depth stays Mon/Wed |

## Agent run checklist

### Landscape (Monday)

1. Memories → approved feeds → `fetch:academic`
2. Write scan YAML with `meta.feeds_checked` and `meta.material_delta`
3. Landscape summary + living analysis rollforward
4. `verify:claims` on landscape summary
5. PR only if material delta

### Social (Wednesday)

1. Pre-fetched feeds in `data/social-monitor/` (from GitHub Action)
2. Tier-1 manual review: OICT, ODET, ITU, UNESCO
3. Social YAML with `claim_ids` / `cross_ref_scan`
4. Social summary + living analysis rollforward
5. `verify:claims` on social summary
6. PR only if material signals

### Briefing (1st of month)

1. Read `reports/living-analysis.md` first
2. Member State draft with new/carried forward sections
3. `verify:claims` + Notion + Linear

### Webhook (on demand)

1. Team submits HLCM PDFs, standards links via webhook
2. See `docs/WEBHOOK-RESEARCH-INTAKE.md`

## Human tasks (not automated)

| Task | Frequency | Owner |
|------|-----------|-------|
| Merge open agent PRs (#10–#18 backlog) | As they arrive | WP15 team |
| GPTZero claim review | Per briefing / major report | Editorial lead |
| WoS/Scopus DOI ingest to core references | Monthly | Research lead with ITU library |
| Enable X API (ITU-123) | When credentials ready | ITU innovation hub |
| Enable daily digest in Cursor UI | Optional | Maintainer |
| Write Memories after PR review | Each review | Reviewer |

## npm scripts

```bash
npm run prefetch:monitor      # fetch:monitor + fetch:academic + validate
npm run verify:claims         # latest narrative reports
npm run verify:claims:all     # all report markdown files
```

## Related docs

- [OPERATIONS.md](./OPERATIONS.md) — day-to-day rhythm
- [MEMORY-DISCIPLINE.md](./MEMORY-DISCIPLINE.md) — Cursor Memories guidance
- [WEBHOOK-RESEARCH-INTAKE.md](./WEBHOOK-RESEARCH-INTAKE.md) — team source submissions
- [ACADEMIC-RIGOUR.md](./ACADEMIC-RIGOUR.md) — evidence tiers and GPTZero
- [DAILY-DIGEST.md](./DAILY-DIGEST.md) — optional daily automation

## Codex / local SDK

Codex and `cursor-agent-orchestrator` lane-04 may propose repo changes via PR. **Operational runs stay on Cursor cloud automations** unless explicitly migrated.
