# Populate Notion with WP15 Living Analysis (2 minutes)

Notion MCP must be enabled in Cursor for automations to sync automatically. To populate **manually once** for demo:

## 1. Create living analysis page

1. Open https://www.notion.so/36805383491f813fa227f709c187584a
2. Click **+ New page** under the hub
3. Title: **WP15 Living Analysis (auto-updated)**
4. Icon: 📊
5. Copy entire contents of `reports/2026-05-wp15-living-analysis.md` into the page

## 2. Briefings database row

Open [Briefings](https://www.notion.so/f7ec4bd52e4542d9abc82d649afbc3a5) → New:

| Field | Value |
|-------|-------|
| Title | UN80 WP15 — Living Analysis — 2026-05 |
| Status | Draft |
| Period | 2026-05-22 |
| Actions covered | Action 61, Action 62 |
| Work package | WP15 |
| GitHub PR | https://github.com/techpolicycomms/un80-wp15-research |

## 3. Landscape scans row

Open [Landscape scans](https://www.notion.so/053ca4ba780c415c878b69610ced5b9d) → New:

| Field | Value |
|-------|-------|
| Title | Living analysis test run — 2026-05-22 |
| Scan date | 2026-05-22 |
| Material changes | Yes |
| GitHub PR | (link after PR merge) |

## 4. Enable auto-updates

Ensure these automations have **Notion MCP** enabled:

- Weekly Landscape Monitor
- Monthly Briefing Compiler
- **UN80 Social Monitor** (4th — import from automations/prefill-urls.md)

Prompts instruct agents to update **WP15 Living Analysis** page after each run.

## 5. Embed dashboard

On hub page: `/embed` → `https://techpolicycomms.github.io/un80-wp15-research/`
