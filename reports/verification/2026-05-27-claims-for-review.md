# Claim verification checklist — 2026-05-27

**Purpose:** Human review of high-risk factual claims before external distribution.  
**Tool:** [GPTZero Hallucination Detector](https://gptzero.me/hallucination-detector)  
**Status:** DRAFT — automated extraction; not a substitute for source checking.

---

## Instructions

1. Copy the **Claims block** below (or individual numbered claims).
2. Paste into [GPTZero Hallucination Detector](https://gptzero.me/hallucination-detector).
3. For each flagged claim, verify against:
   - `data/secondary-sources/*.yaml` (public evidence)
   - `data/academic-literature/wp15-core-references.yaml` (peer-reviewed footnotes)
   - Original source URL or DOI
4. Record outcomes in the PR review comment or Notion briefing row.

## Evidence tiers (use in footnotes)

| Tier | Source | Example |
|------|--------|---------|
| A | Peer-reviewed journal / standard | Armbrust 2010 [^1] |
| B | Official UN / agency public page | UNICC annual report |
| C | Standards body public spec | W3C VC Data Model |
| D | Grey literature / think tank | OECD digital gov report |
| E | Automated scan — verify before use | Social monitor signal |

---

## Extracted claims

## 2026-05-27-social-scan-summary.md

1. UNICC 504, UN Global Pulse 403, UN News timeout.

2. - **No new high-priority signals** — UNICC cluster unchanged but sourced from carry-forward, not fresh RSS.


## 2026-05-27-daily-digest.md

3. - **No material landscape delta** since 2026-05-24 — UNIQCloud, ODET, WIPO audit, and UNICC RFP evidence unchanged (`data/secondary-sources/2026-05-27-scan.yaml`).

4. - Automated RSS pass **degraded:** **9/12 feeds OK** (UN News timeout, UN Global Pulse 403, UNICC 504); **1 new RSS signal** (WHO medium), **0 high-priority new hits**.

5. - Prior **UNICC high-priority cluster** carried forward from 2026-05-24 — feed failure does not invalidate existing signals .

6. - **18 agencies** still require manual X/Facebook/LinkedIn review (ODET, OICT, ITU tier-1 priority).

7. - UNICC cyber exercise (Geneva Cyber Week), biennial report 2024–2025, and Bonn secure-operations delivery remain top signals — **carried forward** because UNICC RSS returned HTTP 504 today .

8. - UN Innovation Update (April 2026) and UN Global Pulse AI/innovation partnerships remain relevant TAP alignment points — carried forward; UN Global Pulse feed returned 403 today .

9. - UNICC Virtual Worlds Day links infrastructure provider role to emerging-tech portfolio (both actions).

10. - **ODET / OICT / ITU** — tier-1 agencies with no RSS hits; X/LinkedIn agent review needed.

11. - **X API integration** — Linear ITU-123 backlog item for automated handle review.

12. - Landscape: confirm no missed UNICC/ODET publications since 2026-05-24.

13. - Social: verify UNICC feed 504 is transient; re-run `npm run fetch:monitor` before Member State language cites fresh RSS signals.


## 2026-05-wp15-living-analysis.md

14. **First iteration review (2026-05-23)** adds stronger evidence that consolidation builds on **existing shared backbone** (UNICC UNIQCloud, 80+ services, 100+ clients) and that **ODET** provides the system-wide digital coordination layer TAP must align with.

15. Action 61 is advancing a **consolidation proposal** (cloud, network, office software, systems) building on **ICC** shared services experience.

16. **Governance model** — UNICC cost-recovery via MoU/SDA; ODET as system digital focal point
3.

17. UNIQCloud demonstrates that sensitive workloads can run on UN-controlled infrastructure with vendor independence — a concrete option for the proposal's cloud category.

18. The WIPO public audit overview illustrates how entities contract shared services today (MoU → SDA → BCR), informing migration design.

19. Jan 2025)
- **Digital Cooperation Portal** — Global Digital Compact initiative mapping
- **UN Innovation Update (Apr 2026)** — system innovation library
- **UN Global Pulse** — AI/innovation partnerships for SDGs



TAP should **plug into ODET and the Digital Cooperation Portal** rather than create parallel coordination.

20. ---



**First iteration (2026-05-23):** 14 automated RSS signals; **8 high priority** (mostly UNICC news).



---

## Claims block (paste into GPTZero)

```
1. UNICC 504, UN Global Pulse 403, UN News timeout.

2. - **No new high-priority signals** — UNICC cluster unchanged but sourced from carry-forward, not fresh RSS.

3. - **No material landscape delta** since 2026-05-24 — UNIQCloud, ODET, WIPO audit, and UNICC RFP evidence unchanged (`data/secondary-sources/2026-05-27-scan.yaml`).

4. - Automated RSS pass **degraded:** **9/12 feeds OK** (UN News timeout, UN Global Pulse 403, UNICC 504); **1 new RSS signal** (WHO medium), **0 high-priority new hits**.

5. - Prior **UNICC high-priority cluster** carried forward from 2026-05-24 — feed failure does not invalidate existing signals .

6. - **18 agencies** still require manual X/Facebook/LinkedIn review (ODET, OICT, ITU tier-1 priority).

7. - UNICC cyber exercise (Geneva Cyber Week), biennial report 2024–2025, and Bonn secure-operations delivery remain top signals — **carried forward** because UNICC RSS returned HTTP 504 today .

8. - UN Innovation Update (April 2026) and UN Global Pulse AI/innovation partnerships remain relevant TAP alignment points — carried forward; UN Global Pulse feed returned 403 today .

9. - UNICC Virtual Worlds Day links infrastructure provider role to emerging-tech portfolio (both actions).

10. - **ODET / OICT / ITU** — tier-1 agencies with no RSS hits; X/LinkedIn agent review needed.

11. - **X API integration** — Linear ITU-123 backlog item for automated handle review.

12. - Landscape: confirm no missed UNICC/ODET publications since 2026-05-24.

13. - Social: verify UNICC feed 504 is transient; re-run `npm run fetch:monitor` before Member State language cites fresh RSS signals.

14. **First iteration review (2026-05-23)** adds stronger evidence that consolidation builds on **existing shared backbone** (UNICC UNIQCloud, 80+ services, 100+ clients) and that **ODET** provides the system-wide digital coordination layer TAP must align with.

15. Action 61 is advancing a **consolidation proposal** (cloud, network, office software, systems) building on **ICC** shared services experience.

16. **Governance model** — UNICC cost-recovery via MoU/SDA; ODET as system digital focal point
3.

17. UNIQCloud demonstrates that sensitive workloads can run on UN-controlled infrastructure with vendor independence — a concrete option for the proposal's cloud category.

18. The WIPO public audit overview illustrates how entities contract shared services today (MoU → SDA → BCR), informing migration design.

19. Jan 2025)
- **Digital Cooperation Portal** — Global Digital Compact initiative mapping
- **UN Innovation Update (Apr 2026)** — system innovation library
- **UN Global Pulse** — AI/innovation partnerships for SDGs



TAP should **plug into ODET and the Digital Cooperation Portal** rather than create parallel coordination.

20. ---



**First iteration (2026-05-23):** 14 automated RSS signals; **8 high priority** (mostly UNICC news).
```

---

*Generated by `npm run verify:claims` — see docs/ACADEMIC-RIGOUR.md*
