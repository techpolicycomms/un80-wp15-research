# Operations runbook — UN80 WP15 Research Hub

Live automations are **Active** in Cursor. This document is the day-to-day guide for the team.

## Live system links

| Resource | URL |
|----------|-----|
| GitHub repo | https://github.com/techpolicycomms/un80-wp15-research |
| Dashboard | https://techpolicycomms.github.io/un80-wp15-research/ |
| Notion hub | https://www.notion.so/36805383491f813fa227f709c187584a |
| Cursor automations | https://cursor.com/automations |

## Live automations (May 2026)

| # | Name | Schedule / trigger | Cursor link |
|---|------|-------------------|-------------|
| 1 | UN80 Weekly Landscape Monitor | Mon 06:00 UTC (cron) | https://cursor.com/automations/9267c6a1-fd79-4d72-81ca-6415647ab198 |
| 2 | UN80 Webhook Source Ingest | Webhook (on demand) | https://cursor.com/automations/132e3dc9-f9c7-4b80-97e0-8ad28449282a |
| 3 | UN80 Monthly Briefing Compiler | 1st of month 08:00 UTC (cron) | https://cursor.com/automations/50fd2872-5154-49ee-a71f-31c3ffc0a058 |

All three target repo `techpolicycomms/un80-wp15-research` @ `main`.

---

## Weekly rhythm (Action 61 & 62 monitoring)

**Every Monday ~06:00 UTC** — Landscape monitor runs automatically.

**Your tasks (15–20 min):**

1. Check [GitHub Pull Requests](https://github.com/techpolicycomms/un80-wp15-research/pulls) for a new `data:` or `chore(landscape):` PR
2. If PR exists: review sources, summaries, overlap signals → merge or request edits
3. Check [Notion → Landscape scans](https://www.notion.so/053ca4ba780c415c878b69610ced5b9d) for the run row
4. After merge, confirm [dashboard](https://techpolicycomms.github.io/un80-wp15-research/) updated (CI deploys on push to `main`)

**If no PR:** no material public-source delta — no action required.

---

## Submitting a public source (webhook)

For curated links from the team (ICC reports, standards, public UN pages):

### One-time setup (maintainer)

1. Open [Webhook automation](https://cursor.com/automations/132e3dc9-f9c7-4b80-97e0-8ad28449282a)
2. Copy **Webhook URL** and **API key** from the Webhook trigger section
3. Locally:

```bash
cd ~/Projects/un80-wp15-research
cp .env.example .env
# Edit .env — never commit this file
```

### Submit via script

```bash
./scripts/trigger-webhook-example.sh   # test payload
```

Or POST manually:

```bash
curl -X POST "$WEBHOOK_URL" \
  -H "Authorization: Bearer $WEBHOOK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "source_submission",
    "payload": {
      "title": "Your source title",
      "url": "https://...",
      "topic": "shared_ict_services",
      "relevance": "action_61",
      "summary": "One paragraph on why this matters for WP15.",
      "submitted_by": "your-name"
    }
  }'
```

**After submit:** review the PR + Notion [Sources inbox](https://www.notion.so/2a617795d6294c86a91eb5d41779b0b1) → set Review status to Accepted or Rejected.

---

## Monthly rhythm (Member State / CEB drafts)

**1st of each month ~08:00 UTC** — Briefing compiler runs.

**Your tasks:**

1. Review PR adding `reports/YYYY-MM-member-state-update.md`
2. Review Notion [Briefings](https://www.notion.so/f7ec4bd52e4542d9abc82d649afbc3a5) row (Status = Draft)
3. Edit for accuracy and tone — all outputs remain **DRAFT / working document**
4. Only after human approval: change Notion status to **In review** or **Approved**
5. Do **not** distribute externally until steering sign-off

**Ad-hoc refresh before meetings:** trigger the briefing automation manually from Cursor (**Run now**) or via its webhook with `"event": "manual_refresh"`.

---

## Human review gate (mandatory)

All automation output is **DRAFT**. Nothing represents agreed UN policy.

| Stage | Owner | Action |
|-------|-------|--------|
| Automation creates PR | Cursor agent | Data + draft text only |
| Technical review | WP15 team | Merge PR if sources valid |
| Editorial review | Leads | Edit Notion / report drafts |
| External distribution | Steering / CEB process | Separate approval |

---

## Health check

```bash
npm run validate          # schema check on data/
npm run build:dashboard   # rebuild dashboard locally
./scripts/ops-check.sh    # repo + links sanity check
```

---

## Adding GitHub reviewers (Talea, Nestor, others)

1. Repo → **Settings** → **Collaborators** (or **Manage access**)
2. **Add people** → enter GitHub username or UN email linked to GitHub
3. Role: **Write** (can review/merge PRs) or **Read** (review only via PR comments with read access)
4. Optional: add as [code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) in `.github/CODEOWNERS` for automatic review requests

Example `CODEOWNERS` (create when usernames are known):

```
* @techpolicycomms/talea-username @techpolicycomms/nestor-username
data/ @techpolicycomms/talea-username
reports/ @techpolicycomms/nestor-username
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Automation runs but no PR | No material changes, or repo not attached | Check automation repo setting; review run log |
| PR fails CI | Invalid YAML/JSON | Run `npm run validate` locally; fix schema errors |
| Dashboard stale | No push to `main` after data change | Merge data PR; wait for GitHub Actions |
| Webhook 401 | Wrong API key | Regenerate key in Cursor; update `.env` |
| Notion not updated | Notion MCP not enabled on automation | Enable Notion MCP in automation Tools |

---

## Data boundaries

- **In this repo:** public secondary sources only
- **Not in this repo:** raw survey responses, internal AI Toolkit inventory, org AI policy details
- **Later:** approved anonymized aggregates via a separate ingest path (see `automations/README.md`)
