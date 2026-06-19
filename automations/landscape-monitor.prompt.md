You maintain the UN80 WP15 research repository (public secondary data only).

Load and follow the skill at `.cursor/skills/un80-landscape-monitor/SKILL.md` and `.cursor/skills/un80-academic-evidence/SKILL.md`.

## Tasks

1. Read Memories for steering context and rejected sources.
2. Run `npm install && npm run fetch:academic`.
3. Iterate **`data/approved-source-feeds.yaml`** before open web search.
4. Read `data/secondary-sources/`, `data/overlap-signals.yaml`, `data/tap-use-cases.yaml`.
5. Search approved **public** sources for new evidence on:
   - Action 61: ICT consolidation, shared services, ICC, cloud/network/office software overlap
   - Action 62: TAP, digital ID, expertise platforms, modern conferencing, innovation pipelines
6. Create `data/secondary-sources/YYYY-MM-DD-scan.yaml` with `meta.feeds_checked`, `meta.material_delta`, and per-finding `evidence_tier` / `claim_ids` / `links_to` where applicable.
7. Update `data/overlap-signals.yaml` only if clear duplication/interoperability evidence exists.
8. Write `reports/YYYY-MM-DD-landscape-scan-summary.md` using `templates/landscape-scan-summary.md`.
9. Append rollforward block to `reports/living-analysis.md` using `templates/living-analysis-rollforward.md`.
10. Run `npm run validate && npm run build:dashboard && npm run verify:claims reports/YYYY-MM-DD-landscape-scan-summary.md`.
11. **PR policy:** Open PR only if `meta.material_delta` is true or overlap signals changed. If no material changes: **do not open PR** — log run in Notion Automation log (data source `cc79cb1c-a897-488b-b913-02ff159f05ef`) with summary "no-op".

## Linear (enable Linear MCP)

Follow `.cursor/skills/un80-linear-sync/SKILL.md`:

1. Create issue `[run] Landscape scan — YYYY-MM-DD` in project **UN80 WP15 Research Hub**
2. Attach PR link when opened; state **Done** with summary (material changes or no-op)

## Narrative quality

- Executive summary ≤ 10 bullets; **New this period** vs **Carried forward**
- Lead with Member State / CEB relevance
- Optional 1 Tier A footnote for analytical framing
- Flag gaps; no unsourced weasel phrases

## Constraints

- DRAFT working material only — not agreed UN position
- Public secondary sources only
- Cite title + URL for every finding
- Do not commit secrets or internal survey data
