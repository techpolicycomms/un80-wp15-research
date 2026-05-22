---
name: un80-social-monitor
description: Monitor public X, Facebook, and YouTube posts from official UN agency accounts for WP15 topics (Action 61/62). Use for social monitoring automation runs.
---

# UN80 Social Monitor

## Scope

- **Public posts only** from accounts in `data/un-agencies-social.yaml`
- Topics: ICT consolidation, shared services, cloud, cybersecurity, digital transformation, innovation, digital ID, AI
- **Not** private messages, personal accounts, or leaked content

## Platforms

### YouTube (automated)
- Run `npm run fetch:youtube` to pull RSS feeds (no API key)
- Write/update `data/social-monitor/YYYY-MM-DD-youtube.yaml`

### X (Twitter)
- Review **public posts** from official handles listed in registry
- Search recent posts for `monitoring_keywords`
- Note: reliable high-volume monitoring may require **X API Basic** (document in PR if unavailable)

### Facebook
- Review **public page posts** from official UN agency pages in registry
- Meta Graph API optional for production scale (`META_PAGE_ACCESS_TOKEN` in env — not committed)

## Output

1. `data/social-monitor/YYYY-MM-DD-social.yaml` combining YouTube + X + Facebook signals
2. Update `data/social-signals.yaml` rollup for dashboard
3. Summary in `reports/YYYY-MM-DD-social-scan-summary.md`
4. Notion **Social signals** row (data source TBD — use Sources inbox with platform tag if no dedicated DB)
5. Open PR if material WP15 signals found

## Relevance

- `action_61` — ICT, cloud, shared services, ICC
- `action_62` — innovation, digital ID, AI, TAP
- `both` — cross-cutting digital transformation
