---
name: un80-social-monitor
description: Monitor public news, X, Facebook, YouTube, LinkedIn, and Instagram from official UN agency accounts for WP15 topics (Action 61/62). Use for social monitoring automation runs.
---

# UN80 Social Monitor

## Run sequence

1. Read Memories for steering context and tier-1 review checklist
2. `npm install && npm run fetch:academic && npm run fetch:monitor`
3. Review pre-fetched data in `data/social-monitor/` (GitHub Action may have refreshed feeds)

## Scope

- **Public posts and press releases only** from accounts in `data/un-agencies-social.yaml`
- **25+ UN agencies** across tiers (ICT backbone, funds/programmes, specialized agencies)
- Topics: ICT consolidation, shared services, cloud, cybersecurity, digital transformation, innovation, digital ID, AI, TAP
- **Not** private messages, personal accounts, or leaked content

## Platforms

### News + YouTube (automated)
- `npm run fetch:monitor` — UN News, ReliefWeb, UN Global Pulse, UNICC, WHO, YouTube RSS
- Writes `data/social-monitor/YYYY-MM-DD-feeds.yaml` and updates `data/social-signals.yaml`

### X, Facebook, LinkedIn, Instagram (agent review)
- Each Wed run: review agencies in `agent_review_required` from coverage report
- **Tier-1 priority:** OICT, ODET, ITU, UNESCO — manual review checklist even when API limited
- Search recent public posts for keyword tiers in `scripts/lib/monitor-keywords.mjs`
- When **ITU-123** (X API) is available: use for tier-1 handles first

### Signal scoring
- **High**: ICC, shared services, cloud, cybersecurity, TAP, digital ID, DPG
- **Medium**: digital transformation, AI, innovation
- **Low**: general technology/digital mentions (word-boundary `ict` matching)

## Output

1. `data/social-monitor/YYYY-MM-DD-feeds.yaml` — automated RSS scan
2. `data/social-monitor/YYYY-MM-DD-social.yaml` — combined with agent-reviewed social
   - Optional per signal: `evidence_tier`, `claim_ids`, `cross_ref_scan`, `links_to`
3. `data/social-monitor/YYYY-MM-DD-coverage.yaml` — platform coverage health
4. Update `data/social-signals.yaml` rollup (dedupe by URL)
5. `reports/YYYY-MM-DD-social-scan-summary.md` using **`templates/social-scan-summary.md`**
6. Append rollforward to **`reports/living-analysis.md`**
7. `npm run validate && npm run build:dashboard && npm run verify:claims reports/YYYY-MM-DD-social-scan-summary.md`
8. Notion Sources inbox + Automation log
9. **Open PR only if material WP15 signals** (new high/medium signals or summary changed). No-op → Notion log only.

## Value-add checks each run

- **Watch list**: tier-1 agencies with zero WP15 signals in 14 days
- **Cross-reference**: dedupe URLs in `data/secondary-sources/`; set `cross_ref_scan`
- **Overlap flag**: link to `data/overlap-signals.yaml` via `links_to.overlap_signals`
- **TAP mapping**: tag high-priority Action 62 signals with `claim_ids` from `data/tap-use-cases.yaml`

## Relevance

- `action_61` — ICT, cloud, shared services, ICC, OICT, UNICC
- `action_62` — innovation, digital ID, AI, TAP, UNDCO, UN Global Pulse
- `both` — cross-cutting digital transformation

## Report quality bar

- Executive summary ≤ 10 bullets; **New this period** vs **Carried forward**
- Map Action 62 signals to TAP phase 1 portfolio when relevant
- Flag keyword false positives and platform API limitations
- Optional 1 Tier A footnote for analytical framing
