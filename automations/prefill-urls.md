# Automation prefill URLs

After opening each URL, connect repo `techpolicycomms/un80-wp15-research`, review triggers/tools, and save.

> Prefill URLs are generated locally. If `build_automation_prefill_url` MCP is unavailable, create automations manually at [cursor.com/automations](https://cursor.com/automations) using the prompts in this folder.

## 1. Weekly landscape monitor (cron)

- **Schedule:** `0 6 * * 1` (Mon 06:00 UTC)
- **Prompt file:** [landscape-monitor.prompt.md](./landscape-monitor.prompt.md)
- **Tools:** Open PR, Memories

## 2. Webhook source ingest

- **Trigger:** Webhook (copy URL + API key after save)
- **Prompt file:** [webhook-ingest.prompt.md](./webhook-ingest.prompt.md)
- **Tools:** Open PR, Memories, Notion MCP (optional)

## 3. Monthly briefing compiler (cron + optional webhook)

- **Schedule:** `0 8 1 * *` (1st of month 08:00 UTC)
- **Optional webhook event:** `manual_refresh`
- **Prompt file:** [briefing-compiler.prompt.md](./briefing-compiler.prompt.md)
- **Tools:** Open PR, Memories, Notion MCP

## Manual creation checklist

- [ ] Repo attached: `un80-wp15-research`
- [ ] Branch: `main`
- [ ] Memories enabled
- [ ] Notion MCP on compiler (+ optional ingest)
- [ ] Webhook secrets stored outside repo
