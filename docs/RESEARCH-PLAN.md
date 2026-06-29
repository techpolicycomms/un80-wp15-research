# TAP research plan — dashboard alignment

**Source documents:**

- Research plan spreadsheet (12 Jun 2026) — four pillars, research questions, deliverables
- [Scaling the Summit 2.0 Advisory Group 2 deck](https://github.com/techpolicycomms/un80-wp15-research) (18 Jun 2026) — Wave 1 emergent findings and survey results

**Machine-readable:** `data/research-plan.yaml`  
**Dashboard:** https://techpolicycomms.github.io/un80-wp15-research/

## Cron → research question mapping

**Machine-readable:** `data/cron-research-map.yaml`  
**Dashboard:** top panel **Research automation schedule** + per-pillar **Cron jobs → this pillar**

| Job | Schedule | Pillars fed |
|-----|----------|-------------|
| Landscape monitor | Mon 06:00 UTC | Landscape, Barriers, Cases, Hub |
| Social monitor | Wed 07:00 UTC | Landscape, Barriers, Cases, Hub |
| Briefing compiler | 1st 08:00 UTC | Hub (all 7 RQs), Barriers, Landscape |
| Webhook ingest | On demand | All pillars |
| Daily digest | Daily 08:00 CEST | **Inactive** — Landscape, Hub, Barriers |
| Pre-fetch (GitHub) | Mon 05:30 / Wed 06:30 UTC | Landscape, Cases |
| Validate & dashboard (GitHub) | Push/PR | All pillars (publish) |
| Digest email (GitHub) | Push digest file | Hub KPI distribution |

Research questions show **job chips** in each pillar tab (e.g. Q1 fed by Landscape + Social + Pre-fetch).

## Four pillars

| Pillar | Colour | Research focus | Key deliverables |
|--------|--------|----------------|------------------|
| **Innovation landscape** | Green | Entity & system-wide mechanisms; external accelerator practices | Actors map, process map, scaling counts |
| **Needs, barriers & risks** | Orange | Innovation definition, pain points, governance/funding models | Maturity-based innovation definition |
| **Signature innovation cases** | Pink | How successful innovations scaled | Case studies — journeys & breaking points |
| **Hub design (TAP)** | Yellow | TAP ambition, clients, cycle, KPIs, investment, roadmap | Problem statement, client profile, journey map, KPI, roadmap |

## StS 2.0 Wave 1 inputs (18 Jun 2026)

Integrated into `data/research-plan.yaml`:

- **9 interviews** (UNICEF, WFP, IOM, UNHCR, UNDP, OHCHR) + **58 survey respondents**
- **Four emergent themes:** effective scaling; persistent barriers; operating environment; system capabilities
- **Six survey factors:** ecosystem engagement (r=0.60) strongest; funding least predictive alone
- **Innovation journey gates:** admin/procurement (56% support need), adoption/localisation (31%)

## WP15 repo linkage

Public secondary monitoring (`data/secondary-sources/`, social monitor, overlap signals) feeds the **Innovation landscape** and **Signature cases** pillars. Action 61 ICT baseline and TAP portfolio data appear under **WP15 operational data** at the bottom of the dashboard.

## Wave 2 / validation

- Wave 2 interviews: external experts, donors, funders
- Validation workshop: suggested **16 Jul 2026**
- Final report target: **mid September 2026**

Update `data/research-plan.yaml` deliverable `status` fields as research progresses.
