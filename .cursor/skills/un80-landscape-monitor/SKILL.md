---
name: un80-landscape-monitor
description: Scan public secondary sources for UN ICT consolidation and TAP innovation signals. Use for weekly landscape automation runs.
---

# UN80 Landscape Monitor

## Run sequence

1. Read Memories for steering context, rejected sources, and prior scan decisions
2. `npm install && npm run fetch:academic` — refresh citation metadata before writing
3. Iterate **`data/approved-source-feeds.yaml`** — check each feed URL before open web search
4. Read `data/secondary-sources/`, `data/overlap-signals.yaml`, `data/tap-use-cases.yaml`
5. Load `.cursor/skills/un80-academic-evidence/SKILL.md` for footnotes and tiers

## Approved public source types

- Feeds in `data/approved-source-feeds.yaml` (UN80, CEB/HLCM, UNICC, ODET, UNIN, W3C, ISO, ITU-T)
- UN International Computing Centre (unicc.org)
- Official UN system public pages and press releases
- Interoperability standards bodies (W3C, OASIS, ISO public summaries)
- Cloud provider public architecture / government sector pages (no pricing claims without citation)
- Academic and think-tank reports on digital public infrastructure
- Peer-reviewed literature via OpenAlex metadata — link DOI when citing

## Do NOT use

- Paywalled content without license
- Sci-Hub or other unauthorized full-text sources
- Leaked or unofficial documents
- Internal UN restricted materials

## Output

1. `data/secondary-sources/YYYY-MM-DD-scan.yaml` matching `data/schemas/secondary-source.schema.json`
   - Set `meta.feeds_checked` to feed IDs reviewed
   - Set `meta.material_delta` true/false
   - Per finding: optional `evidence_tier`, `claim_ids`, `links_to`, `suggested_footnote`
2. Update `data/overlap-signals.yaml` only when duplication/interoperability evidence is clear
3. `reports/YYYY-MM-DD-landscape-scan-summary.md` using `templates/landscape-scan-summary.md`
4. Append rollforward block to **`reports/living-analysis.md`** using `templates/living-analysis-rollforward.md`
5. `npm run validate && npm run build:dashboard && npm run verify:claims reports/YYYY-MM-DD-landscape-scan-summary.md`
6. **Open PR only if material delta** (new findings, overlap signal change, or summary narrative changed). If no delta: log to Notion Automation log only — no PR.

## Report quality bar

- Executive summary ≤ 10 bullets; lead with **so what for Member States / CEB**
- Separate **New this period** vs **Carried forward**
- Every analytical claim: Tier A footnote or Tier B URL
- Flag gaps explicitly; ban unsourced weasel phrases ("significant progress" without source)
- Optional 1 Tier A footnote in landscape summary when framing consolidation/TAP trends

## Relevance tags

- `action_61` — ICT consolidation, shared services, ICC
- `action_62` — TAP, innovation, digital ID, expertise platforms, conferencing
- `both` — cross-cutting digital transformation

## claim_ids (link to TAP portfolio)

- `tap-digital-identity`, `tap-expertise-on-demand`, `tap-ai-conferencing` — see `data/tap-use-cases.yaml`
