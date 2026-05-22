# Social & news monitoring (4th automation)

Monitors **public posts and press releases** from **25+ UN agencies** across **news, YouTube, X, Facebook, LinkedIn, and Instagram** for WP15 topics.

## Automation status

| Field | Value |
|-------|-------|
| Name | UN80 Social Monitor |
| Schedule | **Wed 07:00 UTC** (`0 7 * * 3`) |
| Import | [Prefill URL §4](../automations/prefill-urls.md#4-un80-social-monitor) |

**Verify in Cursor:** [Automations dashboard](https://cursor.com/automations) — must show **4 active** automations. If only 3 appear, import the Social Monitor prefill and save.

## Agency registry

`data/un-agencies-social.yaml` — tiered registry:

| Tier | Focus | Examples |
|------|-------|----------|
| 1 | ICT / digital backbone | UN Secretariat, UNICC, OICT, UNDCO, ITU |
| 2 | Funds & programmes | UNICEF, WHO, WFP, UNHCR, UNDP, UNOPS, UN Women |
| 3 | Specialized agencies | UNESCO, FAO, ILO, UNEP, WIPO, IAEA, UN Global Pulse |

**System news feeds:** UN News (all), ReliefWeb UN, UN Global Pulse

## Platform approach

| Platform | Method | Coverage |
|----------|--------|----------|
| **News** | RSS (`npm run fetch:feeds`) | UN News, UNICC, WHO, UN Global Pulse, ReliefWeb |
| **YouTube** | Public RSS | UN, UNICEF, WHO, UNHCR, UN Women, FAO, UNDP Climate |
| **X** | Agent reviews `@handle` each Wed | All 25 agencies registered |
| **Facebook** | Agent reviews public pages | Major agencies |
| **LinkedIn** | Agent reviews company pages | All agencies with LinkedIn URL |
| **Instagram** | Agent spot-check | UN, UNICEF, WFP where registered |

## Local commands

```bash
npm run fetch:feeds      # News + YouTube RSS → signals rollup
npm run check:monitor    # Coverage report + feed health
npm run fetch:monitor    # Both (used by automation)
```

## Signal priority

| Priority | Triggers |
|----------|----------|
| **High** | ICC, shared services, cloud, cybersecurity, TAP, digital ID, DPG |
| **Medium** | Digital transformation, AI, innovation |
| **Low** | General technology/digital mentions |

## Outputs

- `data/social-monitor/YYYY-MM-DD-feeds.yaml` — automated RSS scan
- `data/social-monitor/YYYY-MM-DD-coverage.yaml` — platform coverage health
- `data/social-monitor/YYYY-MM-DD-social.yaml` — full scan (after agent adds X/FB/LinkedIn)
- `data/social-signals.yaml` — rollup for dashboard
- `reports/YYYY-MM-DD-social-scan-summary.md`
- GitHub PR + Notion Living Analysis update

## Value-add (each Wed run)

- **Watch list** — tier-1 agencies with no WP15 signals in 14 days
- **Cross-reference** — dedupe URLs in `data/secondary-sources/`
- **Overlap flag** — link to `data/overlap-signals.yaml` topics
- **Briefing feed** — high-priority signals tagged for monthly compiler

## Optional API keys (local `.env` only)

```bash
X_BEARER_TOKEN=           # X API Basic — richer X monitoring
META_PAGE_ACCESS_TOKEN=   # Facebook Graph API
YOUTUBE_API_KEY=          # optional; RSS preferred
```

## Governance

- Official verified accounts and press releases only
- Public posts only — no DMs or private groups
- DRAFT working material; human review before external use
