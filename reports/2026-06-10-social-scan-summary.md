# Social & news scan summary - 2026-06-10

**Status:** DRAFT - for human review; not an agreed UN position  
**Data:** `data/social-monitor/2026-06-10-social.yaml`, `data/social-monitor/2026-06-10-feeds.yaml`, `data/social-signals.yaml`

## Coverage

| Metric | Value |
|--------|-------|
| Agencies registered | 27 |
| Platforms checked | News/RSS, YouTube RSS, X public web, Facebook public web, official public web cross-check |
| Automated feeds OK | 4/12 |
| RSS items scanned | 32 |
| RSS keyword hits | 11 |
| High-priority RSS hits | 8 |
| Public Facebook material hits | 2 |
| Public X material hits | 0 confirmed |
| New material WP15 signals added to rollup | 3 |
| Likely RSS false positives | 2 |

## Method and limitations

- Ran `npm run fetch:youtube`, which delegates to the public feed monitor and wrote `data/social-monitor/2026-06-10-feeds.yaml`.
- Reviewed official handles/pages from `data/un-agencies-social.yaml` using public web search/fetch only. No private data, authenticated sessions, or API-only data were used.
- Direct public fetch of `https://x.com/UNICC` returned HTTP 403, and targeted public search for recent official X status URLs did not produce usable results for registered handles. X is therefore recorded as **limited / no confirmed public signal** for this pass.
- Facebook review found two material public indexed posts from official registry pages: ITU and UNESCO. Facebook pages without indexable matching posts are not counted as signals.
- YouTube RSS endpoints for registered channels returned HTTP 404 in this environment; official YouTube content linked from Facebook was reviewed as source context but counted under the Facebook signal.

## New material signals for WP15 review

| Platform | Agency | Signal | Relevance | Why it matters |
|----------|--------|--------|-----------|----------------|
| Facebook | ITU | [Artificial intelligence is advancing faster than governance frameworks](https://www.facebook.com/ITU/videos/artificial-intelligence-is-advancing-faster-than-governance-frameworksthe-global/1511582170329665/) | Action 62 | Promotes the July 2026 Global Dialogue on AI Governance and links it to the Global Digital Compact. |
| Facebook | UNESCO | [United Nations Global Dialogue on AI Governance](https://www.facebook.com/unesco/videos/united-nations-global-dialogue-on-ai-governance/2008673236353162/) | Action 62 | Notes UNESCO/ITU coordination of the joint secretariat with ODET and EOSG; useful for AI governance landscape tracking. |
| Official web | ODET / OICT | [UN Open Source Week 2026](https://www.unopensource.org/) | Both | Co-organized by ODET and OICT; agenda covers AI, DPI, OSPOs, digital cooperation, and practical reusable tools. |

## RSS signals carried forward

The automated feed pass again surfaced the UNICC cluster already tracked in previous scans:

- AI-driven crisis simulation during Geneva Cyber Week - shared cybersecurity capacity (Action 61).
- UNICC Biennial Report 2024-2025 - core shared-services source (Action 61).
- UN Virtual Worlds Day and UN Innovation Update - cross-cutting AI/emerging tech and innovation signals (both / Action 62).
- UN Global Pulse AI, innovation and partnership item - TAP-aligned accelerator context (Action 62).

Two new WHO RSS hits are treated as false positives: the keyword `ict` matched substrings in `addiction` and `Ituri`, not WP15 substance. They remain visible in the dated feed output for monitor QA but are not counted as material evidence.

## Recommended follow-up

- Add or verify current YouTube channel RSS URLs for UN, UNICEF, WHO, UNHCR, UNDP, UN Women, UNESCO, and FAO; all returned 404 during this run.
- Tighten monitor keyword matching so `ict` does not match inside unrelated words.
- Use the AI Governance / Open Source Week signals in the WP15 living analysis as Action 62 context, with the explicit caveat that this scan is public secondary monitoring only.
