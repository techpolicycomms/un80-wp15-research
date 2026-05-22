# Social media monitoring (4th automation)

Monitors **public posts** from official UN agency accounts on **X**, **Facebook**, and **YouTube** for WP15 topics.

## Automation

| Field | Value |
|-------|-------|
| Name | UN80 Social Monitor |
| Schedule | **Wed 07:00 UTC** (`0 7 * * 3`) |
| Import | [Prefill URL](../automations/prefill-urls.md#4-un80-social-monitor) |
| Prompt | [social-monitor.prompt.md](../automations/social-monitor.prompt.md) |
| Skill | [.cursor/skills/un80-social-monitor/SKILL.md](../.cursor/skills/un80-social-monitor/SKILL.md) |

## Agency registry

`data/un-agencies-social.yaml` — UN, UNICC, UNDCO, UNICEF, WHO, WFP, UNHCR (expandable).

## Platform approach

| Platform | Method | Notes |
|----------|--------|-------|
| **YouTube** | RSS feeds (`npm run fetch:youtube`) | No API key; channel IDs in registry |
| **X** | Agent reviews public posts from `@handle` | Production: [X API Basic](https://developer.x.com/) recommended |
| **Facebook** | Agent reviews public page posts | Optional: `META_PAGE_ACCESS_TOKEN` in local `.env` |

## Outputs

- `data/social-monitor/YYYY-MM-DD-social.yaml` — daily scan
- `data/social-signals.yaml` — rollup for dashboard
- `reports/YYYY-MM-DD-social-scan-summary.md`
- GitHub PR + Notion Living Analysis update

## Optional API keys (local `.env` only)

```bash
YOUTUBE_API_KEY=          # optional; RSS preferred
X_BEARER_TOKEN=           # optional; X API Basic
META_PAGE_ACCESS_TOKEN=   # optional; Facebook Graph API
```

## Governance

- Official verified accounts only
- Public posts only — no DMs or private groups
- DRAFT working material; human review before external use
