---
name: un80-landscape-monitor
description: Scan public secondary sources for UN ICT consolidation and TAP innovation signals. Use for weekly landscape automation runs.
---

# UN80 Landscape Monitor

## Approved public source types

- UN International Computing Centre (unicc.org)
- Official UN system public pages and press releases
- Interoperability standards bodies (W3C, OASIS, ISO public summaries)
- Cloud provider public architecture / government sector pages (no pricing claims without citation)
- Academic and think-tank reports on digital public infrastructure

## Do NOT use

- Paywalled content without license
- Leaked or unofficial documents
- Internal UN restricted materials

## Output

1. New file: `data/secondary-sources/YYYY-MM-DD-scan.yaml` matching `data/schemas/secondary-source.schema.json`
2. Update `data/overlap-signals.yaml` only when duplication/interoperability evidence is clear
3. Summary using `templates/landscape-scan-summary.md`
4. Open PR if material changes; otherwise note "no material delta"

## Relevance tags

- `action_61` — ICT consolidation, shared services, ICC
- `action_62` — TAP, innovation, digital ID, expertise platforms, conferencing
- `both` — cross-cutting digital transformation
