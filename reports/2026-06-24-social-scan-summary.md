# Social & news scan summary - 2026-06-24

**Status:** DRAFT - for human review; not an agreed UN position  
**Data:** `data/social-monitor/2026-06-24-social.yaml`, `data/social-monitor/2026-06-24-feeds.yaml`, `data/social-signals.yaml`

## Coverage

| Metric | Value |
|--------|-------|
| Agencies registered | 27 |
| Official X handles reviewed | 27 |
| Official Facebook pages reviewed | 20 |
| Platforms checked | News/RSS, YouTube RSS, X public web, Facebook public web, official public web cross-check |
| Automated feeds OK | 4/12 |
| RSS items scanned | 32 |
| RSS keyword hits | 13 |
| YouTube RSS material hits | 0 |
| Public X material hits | 0 confirmed |
| Public Facebook material hits | 3 new, 1 existing cross-check |
| Official web material cross-checks | 1 |
| New material WP15 signals added to rollup | 3 |
| Low/non-material or likely false-positive hits | 5 |

## Method and limitations

- Ran `npm run fetch:youtube`, which delegates to the public feed monitor and wrote `data/social-monitor/2026-06-24-feeds.yaml`.
- Reviewed official handles/pages from `data/un-agencies-social.yaml` using public web search/fetch only. No private data, authenticated sessions, APIs, or high-volume scraping were used.
- Verified OICT's official Facebook page (`facebook.com/UnitedNationsUnite`) from OICT public web metadata and added it to the registry for future runs.
- Direct public X access was partly unavailable or sparse: `x.com/UN_OICT` timed out, `x.com/UNDigitalEmerg` and `x.com/ITU` returned public fetch errors, and `x.com/UNESCO` exposed only sparse profile/pinned-post content. Targeted public searches did not surface new indexable official X status URLs for the monitoring keywords.
- Facebook public fetches often exposed only titles or sparse metadata, but targeted public searches surfaced confirmed official OICT, ITU, and UNESCO posts. One Facebook query returned a temporary blocking page, so Facebook coverage is recorded as targeted public review rather than complete page scraping.
- Registered YouTube RSS URLs again returned HTTP 404 in this environment. The automated feed pass still scanned system/news feeds and agency news RSS where available.

## New material WP15 signals

| Platform | Agency | Signal | Relevance | Why it matters |
|----------|--------|--------|-----------|----------------|
| Facebook | OICT | [UN Partner Day on AI readiness, ICT governance, and digital transformation](https://www.facebook.com/UnitedNationsUnite/posts/today-united-nations-office-of-information-and-communications-technology-joined-/1215867983876156/) | Both | Directly links AI readiness, ICT governance, digital transformation, process review, scalable AI solutions, and coordinated UN ICT governance. |
| Facebook | OICT | [UN Open Source Week 2026 site is officially live](https://www.facebook.com/UnitedNationsUnite/posts/-the-un-open-source-week-2026-site-is-officially-livejoin-us-from-2226-june-at-u/1538327924963492/) | Both | Reinforces the ODET/OICT Open Source Week signal on digital cooperation, DPI, AI, OSPOs, and reusable open-source tools. |
| Facebook | ITU | [Artificial intelligence is advancing faster than governance frameworks](https://www.facebook.com/ITU/videos/artificial-intelligence-is-advancing-faster-than-governance-frameworksthe-global/1667321734693446/) | Action 62 | Promotes the July 2026 Global Dialogue on AI Governance and links it to international cooperation and the Global Digital Compact. |

## Existing material context cross-checked

| Platform | Agency | Signal | Relevance | Why it matters |
|----------|--------|--------|-----------|----------------|
| Facebook | UNESCO | [United Nations Global Dialogue on AI Governance](https://www.facebook.com/unesco/videos/united-nations-global-dialogue-on-ai-governance/2008673236353162/) | Action 62 | Existing rollup signal reconfirmed; UNESCO/ITU coordinate the joint secretariat with EOSG and ODET. |
| Official web | ODET / OICT | [UN Open Source Week 2026](https://www.unopensource.org/) | Both | Existing rollup signal reconfirmed during event week; the official page highlights AI, DPI, OSPOs, digital cooperation, and reusable tools. |

## RSS hits and QA notes

The automated feed pass carried forward the known UNICC and UN Global Pulse cluster already present in prior scans:

- UNICC AI-driven crisis simulation during Geneva Cyber Week - shared cybersecurity capacity (Action 61).
- UNICC Biennial Report 2024-2025 - core shared-services source (Action 61).
- UN Virtual Worlds Day and UN Innovation Update - cross-cutting AI/emerging-tech and innovation context (both / Action 62).
- UN Global Pulse AI, innovation, and partnerships item - Action 62 accelerator context.
- UNICC Bonn resilience and UNICC shared innovation items - supporting context for common ICT services and system innovation.

The two new UN News URLs appended by the automated rollup step were reclassified as false positives:

- Sudan sexual-violence report matched `ict` only as a substring in "conflict-related".
- Global learning-losses story matched `ict` only as a substring in "Conflict".

The recurring WHO tobacco item remains a false positive because `ict` matches inside "addiction"; the WHO PABS open letter remains low-confidence background because its technology references concern health countermeasures rather than ICT consolidation or TAP.

## Recommended follow-up

- Tighten `scripts/lib/monitor-keywords.mjs` matching so `ict` and `tap` are word-boundary aware and do not match unrelated substrings or phrases such as "tap tap".
- Refresh or verify registered YouTube channel RSS URLs for UN, UNICEF, WHO, UNHCR, UNDP, UN Women, UNESCO, and FAO.
- Continue using public web review for X/Facebook unless authenticated APIs become available; document access limits each run.
- Carry the OICT AI readiness/ICT governance post into the Living Analysis as a current Action 61/62 social signal.
