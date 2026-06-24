# Social & news scan summary — 2026-05-27 (SDK lane-04)

**Status:** DRAFT — for human review  
**Data:** `data/social-monitor/2026-05-27-social.yaml`, `data/social-monitor/2026-05-27-feeds.yaml`, `data/social-signals.yaml`

## Coverage

| Metric | Value |
|--------|-------|
| Agencies registered | 27 |
| Automated feeds OK | 9/12 |
| Feeds failed | 3 (UN News, UN Global Pulse, UNICC) |
| WP15 signals (RSS today) | 1 |
| High priority (new today) | 0 |
| Agent review pending | 18 agencies (X/FB/LinkedIn) |

## Delta vs 2026-05-24

- **Feed degradation:** 9/12 feeds OK (down from 12/12 on 2026-05-24). UNICC 504, UN Global Pulse 403, UN News timeout.
- **No new high-priority signals** — UNICC cluster unchanged but sourced from carry-forward, not fresh RSS.
- **1 medium RSS hit** (WHO primary health care) — same item as 2026-05-24 pass.
- **2026-05-26 run skipped** — this pass is catch-up for the daily cadence.
- Social rollup `last_updated`: 2026-05-27; total signals: 17 in `data/social-signals.yaml`.

## Top signals for WP15 review

### High priority — Action 61 (carried forward)

| Agency | Headline | Why it matters |
|--------|----------|----------------|
| UNICC | AI-driven crisis simulation (Geneva Cyber Week) | Shared cyber capacity — feed unreachable today |
| UNICC | Biennial Report 2024–2025 | Primary ICC performance source |
| UNICC | Secure/resilient UN operations (Bonn) | Regional shared infrastructure delivery |

### High priority — Action 62 / both (carried forward)

| Agency | Headline | Why it matters |
|--------|----------|----------------|
| UNICC | Virtual Worlds Day — AI & emerging tech | Innovation at infrastructure provider |
| UNICC / UN Innovation Network | Innovation Update April 2026 | System innovation pipeline |
| UN Global Pulse | AI, innovation & SDG partnerships | TAP-aligned themes — feed 403 today |

## Feed failures (retry before next digest)

| Feed | Error | Impact |
|------|-------|--------|
| UN News | Request aborted | System news coverage gap |
| UN Global Pulse | HTTP 403 | Action 62 TAP signals not refreshed |
| UNICC | HTTP 504 | Action 61 primary source not refreshed |

## Watch list (no automated hit)

- **ODET / @UNDigitalEmerg** — tier 1; needs X/LinkedIn agent review
- **ITU, WFP, UNDP, UNESCO** — registered, no RSS keyword match this pass

## Recommended review actions

- [ ] Re-run `npm run fetch:monitor` when UNICC/UN News feeds recover
- [ ] Confirm carry-forward UNICC signals still suitable for living analysis citation
- [ ] Schedule X/FB/LinkedIn pass on tier-1 agencies (ITU-121)
- [ ] Investigate UN Global Pulse 403 — may need User-Agent or feed URL update
