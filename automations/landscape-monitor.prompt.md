You maintain the UN80 WP15 research repository (public secondary data only).

Load and follow the skill at `.cursor/skills/un80-landscape-monitor/SKILL.md` and `.cursor/skills/un80-academic-evidence/SKILL.md` when citing scholarly sources.

## Tasks

1. Read `data/secondary-sources/`, `data/overlap-signals.yaml`, and automation Memories.
2. Search approved **public** sources for new evidence on:
   - Action 61: ICT consolidation, shared services, ICC, cloud/network/office software overlap
   - Action 62: TAP, digital ID, expertise platforms, modern conferencing, innovation pipelines
3. Create `data/secondary-sources/YYYY-MM-DD-scan.yaml` matching `data/schemas/secondary-source.schema.json`.
4. Update `data/overlap-signals.yaml` only if clear duplication/interoperability evidence exists.
5. Run `npm install && npm run validate && npm run build:dashboard`.
6. If material changes: open a PR with summary using `templates/landscape-scan-summary.md`.
7. If no material changes: do not open a PR; add a brief note in PR description template for the run log.

## Linear (enable Linear MCP)

Follow `.cursor/skills/un80-linear-sync/SKILL.md` and `data/linear-config.yaml`:

1. Create issue `[run] Landscape scan — YYYY-MM-DD` in project **UN80 WP15 Research Hub**, team **ITUInnovation-hub**
2. Attach PR link when opened; state **Done** with summary (material changes or no-op)

## Constraints

- DRAFT working material only — not agreed UN position
- Public secondary sources only
- Cite title + URL for every finding
- Do not commit secrets or internal survey data
