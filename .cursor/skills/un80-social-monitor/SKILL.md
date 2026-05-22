---
name: un80-social-monitor
description: Monitor public news, X, Facebook, YouTube, LinkedIn, and Instagram from official UN agency accounts for WP15 topics (Action 61/62). Use for social monitoring automation runs.
---

# UN80 Social Monitor

## Scope

- **Public posts and press releases only** from accounts in `data/un-agencies-social.yaml`
- **25+ UN agencies** across tiers (ICT backbone, funds/programmes, specialized agencies)
- Topics: ICT consolidation, shared services, cloud, cybersecurity, digital transformation, innovation, digital ID, AI, TAP
- **Not** private messages, personal accounts, or leaked content

## Platforms

### News + YouTube (automated)
- Run `npm run fetch:monitor` (or `fetch:feeds` + `check:monitor`)
- System feeds: UN News, ReliefWeb UN, UN Global Pulse
- Agency feeds: UNICC blog, WHO news, agency YouTube RSS where verified
- Writes `data/social-monitor/YYYY-MM-DD-feeds.yaml` and updates `data/social-signals.yaml`

### X, Facebook, LinkedIn, Instagram (agent review)
- Each Wed run: review agencies in `agent_review_required` from coverage report
- Search recent public posts for keyword tiers in `scripts/lib/monitor-keywords.mjs`
- Assign **priority**: high (Action 61/62 specific), medium, low

### Signal scoring
- **High**: ICC, shared services, cloud, cybersecurity, TAP, digital ID, DPG
- **Medium**: digital transformation, AI, innovation
- **Low**: general technology/digital mentions

## Output

1. `data/social-monitor/YYYY-MM-DD-feeds.yaml` — automated RSS scan
2. `data/social-monitor/YYYY-MM-DD-social.yaml` — combined with agent-reviewed social
3. `data/social-monitor/YYYY-MM-DD-coverage.yaml` — platform coverage health
4. Update `data/social-signals.yaml` rollup
5. `reports/YYYY-MM-DD-social-scan-summary.md`
6. Notion Sources inbox + Living Analysis + Automation log
7. Open PR if material WP15 signals found

## Value-add checks each run

- **Watch list**: tier-1 agencies with zero WP15 signals in 14 days
- **Cross-reference**: dedupe URLs already in `data/secondary-sources/`
- **Overlap flag**: social signal mentions same topic as `data/overlap-signals.yaml`
- **Briefing feed**: high-priority signals tagged for monthly compiler

## Relevance

- `action_61` — ICT, cloud, shared services, ICC, OICT, UNICC
- `action_62` — innovation, digital ID, AI, TAP, UNDCO, UN Global Pulse
- `both` — cross-cutting digital transformation
