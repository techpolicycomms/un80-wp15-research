# UN80 WP15 Research Hub

Automated research, monitoring, and reporting for **UN80 Work Package 15** — ICT consolidation (Action 61) and the Technology Accelerator Platform (Action 62).

> **Scope:** Public secondary data only. All outputs are **DRAFT working documents** and do not represent agreed UN positions.

## Structure

```
data/                  Canonical datasets (YAML/JSON) — single source of truth
data/secondary-sources/ Dated public-source snapshots from automated scans
data/schemas/          JSON Schema for validation
templates/             Briefing, survey, and report templates
reports/               Generated drafts (automation output)
dashboard/             Static dashboard (reads from data/)
automations/           Cursor Automation workflow definitions + setup guide
.cursor/skills/        Repeatable agent instructions
scripts/               Validation and dashboard build helpers
```

## Quick start

```bash
# Validate data files against schemas
npm run validate

# Build dashboard static site
npm run build:dashboard

# Serve dashboard locally
npm run serve:dashboard
```

## Cursor Automations

See [automations/README.md](./automations/README.md) for:

- **Weekly landscape monitor** (cron) — scans public sources, updates `data/secondary-sources/`
- **Webhook ingest** — accepts curated source submissions, triggers normalization + dashboard refresh
- **Monthly briefing compiler** (cron) — drafts Member State / CEB update from repo state
- **Notion sync** — pushes approved summaries to Notion via automation MCP

Prefill URLs to import automations: [automations/prefill-urls.md](./automations/prefill-urls.md)

## Notion

Research summaries and executive briefs mirror to Notion. Setup: [docs/notion-setup.md](./docs/notion-setup.md)

## Governance

- Public secondary sources only in this repo
- Internal surveys (AI Toolkit inventory, org AI policy) are cross-referenced later — not stored here initially
- Human review required before any external distribution
