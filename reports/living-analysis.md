# WP15 Living Analysis

**Status:** DRAFT — Working document  
**Work Package:** 15 | Actions 61 & 62  
**Last updated:** 2026-05-26  
**Canonical file:** `reports/living-analysis.md` — landscape and social automations append **Rollforward** blocks below after each run.

> This document might be updated as implementation progresses. It does not represent an agreed position, policy or decision of the United Nations.

**Auto-updated by:** Landscape monitor (Mon), Social monitor (Wed), Briefing compiler (1st), Webhook ingest (on demand), Daily digest (when enabled)

---

## Executive summary

The UN system spends **more than $2B annually** on ICT, with **28 entities** (97% of expenditure) confirming significant **overlap in core services** and **interoperability challenges**. Action 61 is advancing a **consolidation proposal** (cloud, network, office software, systems) building on **ICC** shared services experience. Action 62 has an endorsed **TAP portfolio** (digital ID, expertise on demand, modern conferencing) and is developing a **long-term accelerator concept**.

Public secondary evidence supports four themes:

1. **Shared backbone maturity** — UNIQCloud private cloud, ICC catalog, pooled platform procurement
2. **Governance model** — UNICC cost-recovery via MoU/SDA; ODET as system digital focal point
3. **Interoperability & standards** — W3C VC 2.0, DIDs, ISO 24760 for TAP digital ID
4. **Innovation ecosystem** — Digital Cooperation Portal, UN Innovation Network, UN Global Pulse

Briefing compiler: read this file **first**, then deep-dive `data/secondary-sources/` and `data/social-monitor/` YAML.

---

## Action 61 — ICT consolidation

### Phase status

| Phase | Status | Notes |
|-------|--------|-------|
| Baseline assessment | Complete | 28 entities; >$2B; overlap confirmed |
| Consolidation proposal | In progress | ICC engagement; UNIQCloud reference |
| Implementation plan | Pending | Awaits CEB / Steering Committee direction |

### Evidence highlights (public secondary)

- **UNIQCloud** — OpenStack private cloud from UN data centres; MC-approved pricing (Jan 2025)
- **ICC shared services** — inter-organization facility; 80+ service lines
- **ICC cybersecurity** — Geneva Cyber Week simulation; Bonn secure operations
- **Platform pooling** — 2026 UNICC RFP for ServiceNow/ManageEngine/open source
- **Overlap signals** — parallel entity cloud + mature shared facilities (see `data/overlap-signals.yaml`)

### Analysis

Consolidation is **backbone standardization at scale**. UNIQCloud demonstrates that sensitive workloads can run on UN-controlled infrastructure with vendor independence — a concrete option for the proposal's cloud category.

---

## Action 62 — Technology Accelerator Platform

### Phase status

| Phase | Status | Notes |
|-------|--------|-------|
| Innovation survey | Complete | 200+ contributors |
| Endorsed portfolio | Complete | 3 use cases (see `data/tap-use-cases.yaml`) |
| TAP concept | In progress | Sustainable continuous innovation mechanism |

### Portfolio (endorsed) — map signals to claim_ids

| Use case | claim_id |
|----------|----------|
| Digital ID solutions | `tap-digital-identity` |
| Expertise on demand | `tap-expertise-on-demand` |
| Modern conferencing / AI translation | `tap-ai-conferencing` |

### Evidence highlights

- **ODET** — system digital coordination; TAP must align, not duplicate steering
- **Digital Cooperation Portal** — innovation mapping and DPG alignment
- **UN Innovation Network** — pilots and library updates
- **Standards** — W3C VC 2.0, DIDs; ISO/IEC 24760 identity frameworks

### Analysis

TAP should **plug into ODET and the Digital Cooperation Portal** rather than create parallel coordination. Map each new signal to a **claim_id** and TAP portfolio item when writing rollforward blocks.

---

## Cross-cutting risks & gaps

| Gap | Mitigation |
|-----|------------|
| Public-only evidence | Internal surveys as approved aggregates later |
| Social keyword false positives | Word-boundary matching in `monitor-keywords.mjs` |
| Tier-1 X coverage | Wed agent review + X API when ITU-123 complete |
| Policy status | All outputs DRAFT until human / steering approval |
| Stale dashboard | Merge open agent PRs (#10–#18 backlog) to `main` |

---

## Links

- Dashboard: https://techpolicycomms.github.io/un80-wp15-research/
- GitHub: https://github.com/techpolicycomms/un80-wp15-research
- Notion hub: https://www.notion.so/36805383491f813fa227f709c187584a
- Linear: https://linear.app/ituinnovation-hub/project/un80-wp15-research-hub-1b948218cb9e
- Approved feeds: `data/approved-source-feeds.yaml`

---

## Rollforward log

*Newest entries at top. Use `templates/living-analysis-rollforward.md`.*

### Rollforward — 2026-05-26 (workflow improvements)

**New this period**

- Canonical living analysis file and approved-source-feeds watchlist added to repo
- Academic pipeline and claim verification extended to all report types
- Pre-fetch GitHub Action scheduled before Mon/Wed agent runs

**Carried forward**

- Prior May 2026 narrative remains valid; see `reports/2026-05-wp15-living-analysis.md` for first-iteration detail.

**Gaps flagged**

- June agent PR backlog (#10–#18) not yet merged to `main` — dashboard may lag latest TAP/HLCM signals.

**Sources:** `docs/CLOUD-AGENT-IMPROVEMENTS.md`

---

*Automations append dated rollforward blocks after each landscape/social/briefing run.*
