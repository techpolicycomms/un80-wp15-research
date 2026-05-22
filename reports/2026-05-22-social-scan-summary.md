# Social & news scan summary — 2026-05-22

**Status:** DRAFT — automated test run  
**Automation:** UN80 Social Monitor (4th — **import pending in Cursor**)

## Test results

| Check | Result |
|-------|--------|
| Agencies registered | 27 |
| X handles | 27/27 (100%) |
| LinkedIn | 27/27 (100%) |
| Facebook | 19/27 (70%) |
| YouTube RSS (automated) | 8/27 (30%) |
| Agency news RSS | 2/27 + 3 system feeds |
| Automated feeds reachable | 14/14 |
| WP15 signals (RSS pass) | 12 (8 high priority) |

## High-priority signals (sample)

Automated fetch surfaced UNICC blog and WHO news items matching Action 61/62 keywords (cloud, cybersecurity, digital transformation, AI). Full list in `data/social-monitor/2026-05-22-feeds.yaml`.

## Agent review still required

**17 agencies** have X/Facebook/LinkedIn registered but no working RSS — the Wed automation agent must review public posts manually (or via optional X/Meta API keys).

## Automation status

Cursor backend shows **3 active automations** — Social Monitor is **not yet saved**. Import from [prefill-urls.md §4](../automations/prefill-urls.md#4-un80-social-monitor) and enable Notion MCP + Open PR.

## Value-add implemented

- Tiered keyword scoring (high / medium / low)
- System news feeds: UN News, ReliefWeb, UN Global Pulse
- Coverage health report (`npm run check:monitor`)
- Cross-platform registry (news, YouTube, X, Facebook, LinkedIn, Instagram)
- Dashboard monitor panel (agencies count, feed health)

## Next Wed run (after automation import)

1. `npm run fetch:monitor`
2. Agent reviews X/FB/LinkedIn for tier-1 agencies
3. Merge into social YAML + Notion Living Analysis
4. Open PR if material changes
