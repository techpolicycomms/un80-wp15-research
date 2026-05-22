---
name: un80-linear-sync
description: Sync UN80 WP15 automation runs and manual work to Linear. Use when completing automations, opening PRs, or updating project status for the research hub.
---

# UN80 Linear sync

## Config

Read `data/linear-config.yaml` for project name, team, URLs, and tracking issue IDs.

- **Project:** UN80 WP15 Research Hub
- **Team:** ITUInnovation-hub (key `ITU`)
- **Project URL:** https://linear.app/ituinnovation-hub/project/un80-wp15-research-hub-1b948218cb9e

Use **Linear MCP** (`save_issue`, `save_comment`, `list_issues`) when available in Cursor Automations.

## After every automation run

1. **Create or update a run issue:**
   - Title: `[run] {automation name} — YYYY-MM-DD`
   - Team: `ITUInnovation-hub`
   - Project: `UN80 WP15 Research Hub`
   - Labels: `automation`, `ops` (+ `social` for social monitor)
   - State: `In Progress` during run → `Done` when complete (or `Canceled` if failed)

2. **Description template:**

```markdown
## Run summary
- Automation: {name}
- Date: YYYY-MM-DD
- Outcome: PR opened | no material changes | failed

## Links
- GitHub PR: {url or "none"}
- Notion: {page/row if updated}

## Notes
One paragraph on material findings or no-op reason.
```

3. **Attach links** via `links: [{url, title}]` on `save_issue` (PR, Notion, report file on GitHub).

4. **Update tracking issues** when acceptance criteria met:
   - ITU-121 — Social Monitor imported
   - ITU-122 — Boss approval
   - ITU-123 — X API
   - ITU-124 — Webhook key rotated

## Manual / human tasks

When starting substantive work on the repo:

1. Check Linear for an existing issue; update status instead of duplicating.
2. Branch names: use Linear git branch hint when provided (e.g. `rjha1909/itu-123-...`).
3. Close issue when PR merges; add PR link before closing.

## Weekly review (Mondays, human)

1. Open project board in Linear
2. Review **In Progress** and **Backlog** for M2/M3 milestones
3. Cross-check Notion Automation log and GitHub open PRs
4. Post short comment on any stale `In Progress` issue

## Do not

- Store Linear API keys in the repo
- Create duplicate run issues for the same automation + date
- Mark issues Done without noting PR or no-op outcome
