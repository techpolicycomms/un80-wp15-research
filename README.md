# UN80 WP15 Research Hub

Automated research, monitoring, and reporting for **UN80 Work Package 15** — ICT consolidation (**Action 61**) and the Technology Accelerator Platform (**Action 62**).

> **Scope:** Public secondary data only. All outputs are **DRAFT working documents** and do not represent agreed UN positions.

## Live links

| Resource | URL |
|----------|-----|
| **Dashboard** | https://techpolicycomms.github.io/un80-wp15-research/ |
| **GitHub** | https://github.com/techpolicycomms/un80-wp15-research |
| **Notion hub** | https://www.notion.so/36805383491f813fa227f709c187584a |
| **Linear project** | https://linear.app/ituinnovation-hub/project/un80-wp15-research-hub-1b948218cb9e |
| **Daily digest guide** | [docs/DAILY-DIGEST.md](./docs/DAILY-DIGEST.md) |
| **Operations runbook** | [docs/OPERATIONS.md](./docs/OPERATIONS.md) |
| **Academic rigour** | [docs/ACADEMIC-RIGOUR.md](./docs/ACADEMIC-RIGOUR.md) |
| **Linear guide** | [docs/LINEAR.md](./docs/LINEAR.md) |

---

## What this does

This hub supports UN80 WP15 by turning recurring research into a **repeatable pipeline**:

1. **Daily digest** — one merged run at **08:00 CEST** (landscape + social + briefing summary → email)
2. **Ingest** — on-demand submission of curated public links via webhook
3. **Compile** — monthly draft briefings for Member State / CEB updates, mirrored to Notion
4. **Monitor social** — weekly X, Facebook, YouTube scan for UN agencies on WP15 topics
5. **Synthesize** — a build-time multi-model engine (`npm run orchestrate`) fans the TAP working synthesis out to Claude (synthesize), DeepSeek (extract atomic claims) and Gemini (score evidence), then a deterministic reconciler merges them into `data/tap-synthesis.json` + `data/claim-ledger.jsonl` with a `safe` / `caveat` / `do-not-cite` verdict per claim. Keys live in `.env`; the deployed site stays static and key-free, and each stage degrades to a curated fallback so a missing key or provider outage never breaks the build. **The Claude stage runs through the Anthropic API when `ANTHROPIC_API_KEY` has credits, and otherwise falls back to the local Claude Code CLI** (`claude -p`), which uses your Claude subscription auth instead of API credits — force it with `CLAUDE_PROVIDER=cli npm run orchestrate`. Model IDs are overridable via `ANTHROPIC_MODEL` / `DEEPSEEK_MODEL` / `GEMINI_MODEL`.
6. **Collect innovation jobs** — `npm run collect:jobs` pulls UN-system postings mentioning *innovation* (2020-onwards) from the ReliefWeb API into `data/innovation-jobs.json`, classified by agency and job family. Needs a free `RELIEFWEB_APPNAME` in `.env` ([self-serve](https://apidoc.reliefweb.int/parameters#appname)); without it, the curated, web-sourced starter set (23 real postings across WFP, UNDP, ITU, UNICEF) is preserved. The dashboard renders the resulting by-agency / by-family distributions in Section 02.
7. **Visualize** — the dashboard rebuilds around the 8-section TAP synthesis (Lead Answer → RQ-001…015 → Evidence Quality → Agent Loop → Sources → Next Actions), with a cite-status chip on every research answer and an honest engine-provenance footer.
8. **Review** — every automation opens a GitHub PR; humans merge and approve before anything is treated as final. No model alone promotes a claim to "final".

Aligned to the WP15 pre-briefing: >$2B annual UN system ICT spend, baseline across 28 entities, TAP portfolio (digital ID, expertise on demand, modern conferencing).

---

## How this was created

This is a **pilot of Cursor Automations** applied to UN80 research workflow design — not an official UN system product.

### Architecture

```
┌─────────────────┐     cron (Mon)      ┌──────────────────────────┐
│ Cursor          │ ──────────────────► │ GitHub: un80-wp15-research│
│ Automations     │     webhook         │  data/ · reports/ · CI   │
│ (cloud agents)  │ ──────────────────► └───────────┬──────────────┘
└────────┬────────┘                                 │
         │ Notion MCP                               │ GitHub Actions
         ▼                                          ▼
┌─────────────────┐                    ┌──────────────────────────┐
│ Notion hub      │                    │ Dashboard (GitHub Pages)  │
│ Briefings ·     │                    │ Action 61/62 metrics      │
│ Sources · Scans │                    └──────────────────────────┘
└─────────────────┘
```

### Stack

| Layer | Technology | Role |
|-------|------------|------|
| Data store | GitHub repo (`data/*.yaml`, `data/*.json`) | Single source of truth, versioned |
| Agents | [Cursor Automations](https://cursor.com/docs/cloud-agent/automations) | Scheduled + webhook-triggered cloud agents |
| Skills | `.cursor/skills/` | Repeatable instructions (briefing writer, landscape monitor, academic evidence) |
| Validation | JSON Schema + `npm run validate` | Data quality gate |
| Dashboard | Static HTML/JS + GitHub Pages | Public-facing metrics view |
| Collaboration | Notion databases | Editorial review queue |
| CI | GitHub Actions (`.github/workflows/dashboard.yml`) | Validate, build, deploy dashboard |

### Live Cursor automations (May 2026)

| Automation | Trigger | Purpose |
|------------|---------|---------|
| [UN80 Weekly Landscape Monitor](https://cursor.com/automations/9267c6a1-fd79-4d72-81ca-6415647ab198) | Cron — Mon 06:00 UTC | Public source scan → PR |
| [UN80 Webhook Source Ingest](https://cursor.com/automations/132e3dc9-f9c7-4b80-97e0-8ad28449282a) | Webhook | Team source submissions → PR |
| [UN80 Monthly Briefing Compiler](https://cursor.com/automations/50fd2872-5154-49ee-a71f-31c3ffc0a058) | Cron — 1st of month 08:00 UTC | Draft briefing → PR + Notion |
| **UN80 Social Monitor** | Cron — Wed 07:00 UTC | X / Facebook / YouTube → PR + Notion living analysis |

**Living analysis artifact:** [`reports/2026-05-wp15-living-analysis.md`](./reports/2026-05-wp15-living-analysis.md) — synced to Notion page *WP15 Living Analysis (auto-updated)* by automations. Setup: [docs/notion-living-analysis-setup.md](./docs/notion-living-analysis-setup.md)

Import the 4th automation: [automations/prefill-urls.md §4](./automations/prefill-urls.md)

Prompts and workflow metadata: [`automations/`](./automations/) · Machine-readable IDs: [`automations/workflows.json`](./automations/workflows.json)

### Build sequence (reproducible)

1. Scaffold repo with structured baseline data from WP15 pre-briefing (Action 61/62)
2. Add JSON Schema validation and static dashboard generator
3. Author Cursor **skills** for consistent agent behaviour
4. Create **Notion hub** with Briefings, Landscape scans, Sources inbox, Automation log databases
5. Configure three **Cursor Automations** (repo attached, Open PR + Memories + Notion MCP)
6. Enable **GitHub Pages** via Actions workflow on push to `main`
7. Run validation landscape scan ([PR #1](https://github.com/techpolicycomms/un80-wp15-research/pull/1)) to prove the pipeline

### Governance

- Public secondary sources only in this repository
- Peer-reviewed footnotes via OpenAlex + curated YAML (`npm run fetch:academic`) — see [docs/ACADEMIC-RIGOUR.md](./docs/ACADEMIC-RIGOUR.md)
- Claim verification via [GPTZero Hallucination Detector](https://gptzero.me/hallucination-detector) before external use (`npm run verify:claims`)
- Internal surveys (AI Toolkit inventory, org AI policy) are cross-referenced later — raw responses stay out of GitHub
- Human review required before external distribution
- All generated text carries DRAFT / working document status

---

## Repository structure

```
data/                   Canonical datasets (YAML/JSON)
data/secondary-sources/ Dated public-source snapshots
data/schemas/           JSON Schema for validation
templates/              Briefing and scan templates
reports/                Generated draft reports
dashboard/              Static dashboard (built to dashboard/dist/)
automations/            Agent prompts + workflow definitions
.cursor/skills/         Cursor skills for agent consistency
docs/                   Notion setup + operations runbook
scripts/                Validation, webhook test, ops check
```

---

## Quick start (local)

```bash
git clone https://github.com/techpolicycomms/un80-wp15-research.git
cd un80-wp15-research
npm install
npm run validate
npm run build:dashboard
npm run serve:dashboard   # http://localhost:3456
./scripts/ops-check.sh    # full ops sanity check
```

### Webhook testing (maintainers)

```bash
cp .env.example .env
# Add WEBHOOK_URL and WEBHOOK_API_KEY from Cursor webhook automation settings
./scripts/trigger-webhook-example.sh
```

---

## For the team

- **Weekly:** review Monday landscape PRs — [operations guide](./docs/OPERATIONS.md#weekly-rhythm-action-61--62-monitoring)
- **Anytime:** submit a public source via webhook — [submit guide](./docs/OPERATIONS.md#submitting-a-public-source-webhook)
- **Monthly:** review briefing draft PR + Notion — [monthly guide](./docs/OPERATIONS.md#monthly-rhythm-member-state--ceb-drafts)

---

## Related documentation

- [Operations runbook](./docs/OPERATIONS.md)
- [Automation setup](./automations/README.md)
- [Notion hub setup](./docs/notion-setup.md)
- [Webhook key rotation](./docs/WEBHOOK-KEY-ROTATION.md) (one-time security step)
- [Email template for Talea & Nestor](./docs/email-talea-nestor.md)
