# Cursor Automations for UN80 WP15 Research

Three automations cover the research loop: **monitor** (cron), **ingest** (webhook), and **compile** (cron + optional webhook).

## Prerequisites

1. GitHub repo: `techpolicycomms/un80-wp15-research` (private recommended)
2. Connect repo in [Cursor Automations](https://cursor.com/automations) or Agents Window
3. Enable **Memories** on monitor and compiler automations
4. Attach **Notion MCP** on compiler automation for Notion sync
5. Privacy mode: storage-eligible (required for automations)

---

## Automation 1: Weekly ICT/TAP landscape monitor

**Trigger:** Cron — `0 6 * * 1` (Mondays 06:00 UTC)

**Repo:** `un80-wp15-research` @ `main`

**Tools:** Open pull request, Memories, MCP (optional: web search)

**What it does:**

1. Reads existing `data/secondary-sources/` and Memories to avoid duplicate scans
2. Searches approved public sources (see `.cursor/skills/un80-landscape-monitor/SKILL.md`)
3. Writes `data/secondary-sources/YYYY-MM-DD-scan.yaml`
4. Updates `data/overlap-signals.yaml` if warranted
5. Runs `npm run validate && npm run build:dashboard`
6. Opens PR with landscape summary, or skips PR if no material changes

**Prompt:** See [landscape-monitor.prompt.md](./landscape-monitor.prompt.md)

---

## Automation 2: Webhook source ingest

**Trigger:** Webhook (private URL generated after you save the automation)

**Repo:** Same

**Tools:** Open pull request, Memories

### Why a webhook?

Cron handles **scheduled** scanning. Webhook handles **event-driven** ingest:

- A colleague submits a public source via internal form
- Notion button / Zapier / Make posts a curated link
- GitHub Action in another repo forwards a relevant publication
- Future: AI Toolkit survey publishes **aggregated public-safe** stats (not raw responses)

### Payload format

POST to your automation webhook URL with header `Authorization: Bearer <API_KEY>`.

```json
{
  "event": "source_submission",
  "payload": {
    "title": "ICC Annual Report 2025 — shared services section",
    "url": "https://www.unicc.org/...",
    "topic": "shared_ict_services",
    "relevance": "action_61",
    "summary": "One-paragraph summary of why this matters for consolidation.",
    "submitted_by": "research-team"
  }
}
```

Schema: `data/schemas/webhook-ingest.schema.json`

**What the automation does:**

1. Validates payload shape
2. Appends finding to a new or existing dated YAML in `data/secondary-sources/`
3. Rebuilds dashboard data
4. Opens PR titled `data: ingest source — <title>`
5. Optionally triggers Notion "Sources inbox" page update (if Notion MCP enabled)

**Test locally:** `./scripts/trigger-webhook-example.sh` (after you paste webhook URL + key in `.env`)

**Prompt:** See [webhook-ingest.prompt.md](./webhook-ingest.prompt.md)

---

## Automation 3: Monthly briefing compiler (+ Notion)

**Trigger:** Cron — `0 8 1 * *` (1st of month, 08:00 UTC)

**Optional second trigger:** Webhook with `"event": "manual_refresh"` for on-demand runs before CEB/Steering Committee meetings

**Repo:** Same

**Tools:** Open pull request, Memories, Notion MCP, Send to Slack (optional)

**What it does:**

1. Reads all `data/` and secondary sources since last report
2. Drafts `reports/YYYY-MM-member-state-update.md` from template
3. Updates Notion page (see `docs/notion-setup.md` for page IDs)
4. Opens PR for human editorial review
5. Does **not** publish externally — review gate required

**Prompt:** See [briefing-compiler.prompt.md](./briefing-compiler.prompt.md)

---

## Chaining: webhook → dashboard refresh

Recommended pattern:

1. **Webhook ingest** automation merges data PR
2. **GitHub trigger** (push to `main` on `data/**`) runs a lightweight automation:
   - `npm run validate && npm run build:dashboard`
   - Commits `dashboard/dist/` if you choose to track built output, or rely on GitHub Pages from CI

Alternatively, include dashboard rebuild inside each automation that touches `data/`.

---

## Import automations

Open prefill URLs in [prefill-urls.md](./prefill-urls.md) to load drafts in the Automations UI, then:

1. Connect your GitHub repo
2. Save each automation (webhook URL appears after save for Automation 2)
3. Store webhook API key in your secrets manager — not in this repo

---

## Future cross-reference (internal surveys)

When AI Toolkit inventory and org AI policy surveys are ready:

- Keep **raw survey data** out of this public-secondary repo
- Add a **fourth webhook automation** `survey_aggregate_ingest` that accepts only anonymized, approved aggregate JSON
- Store aggregates in `data/internal-crossref/` (private repo only) with a separate automation prompt
