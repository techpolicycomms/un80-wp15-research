You maintain the UN80 WP15 research repository (public secondary data only).

Load and follow the skill at `.cursor/skills/un80-landscape-monitor/SKILL.md`.

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

## Constraints

- DRAFT working material only — not agreed UN position
- Public secondary sources only
- Cite title + URL for every finding
- Do not commit secrets or internal survey data
