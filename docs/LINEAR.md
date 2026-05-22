# Linear project management — UN80 WP15 Research Hub

Linear is the **execution tracker** for this project. Notion remains the editorial hub; GitHub remains the source of truth.

## Project board

| Field | Value |
|-------|--------|
| **Project** | [UN80 WP15 Research Hub](https://linear.app/ituinnovation-hub/project/un80-wp15-research-hub-1b948218cb9e) |
| **Team** | ITUInnovation-hub (`ITU`) |
| **Lead** | Rahul Jha |
| **Target** | Aug 2026 |

Machine-readable config: [`data/linear-config.yaml`](../data/linear-config.yaml)

## Milestones

| Milestone | Focus | Target |
|-----------|--------|--------|
| **M1 — Foundation** | Repo, dashboard, Notion hub | May 2026 |
| **M2 — Automations live** | All 4 Cursor automations + integrations | Jun 2026 |
| **M3 — Stakeholder rollout** | Boss approval, Talea/Nestor | Jul 2026 |
| **M4 — Steady-state ops** | Recurring Mon/Wed/monthly rhythm | Aug 2026 |

## Three-system model

```
Linear          Notion              GitHub
──────          ──────              ──────
Issues          Briefings           data/
Milestones      Landscape scans     reports/
Blockers        Sources inbox       PRs + CI
Run logs        Living analysis     Dashboard
```

| When | Linear | Notion | GitHub |
|------|--------|--------|--------|
| Automation completes | Create `[run] …` issue, attach PR | Update scan/briefing row | Merge PR |
| New source submitted | Comment on run or ingest issue | Sources inbox row | `data/secondary-sources/` |
| Stakeholder review | Move ITU-122 when approved | Briefing status | — |
| Weekly ops | Review open ITU issues | Check Automation log | Review open PRs |

## Cursor Automations + Linear

Enable **Linear MCP** on all four automations (alongside Notion MCP).

Each run follows [`.cursor/skills/un80-linear-sync/SKILL.md`](../.cursor/skills/un80-linear-sync/SKILL.md):

1. Create `[run] {automation} — YYYY-MM-DD` issue
2. Attach GitHub PR link (or note no-op)
3. Set **Done** when run completes

## Active tracking issues (May 2026)

| ID | Title | Status |
|----|-------|--------|
| [ITU-121](https://linear.app/ituinnovation-hub/issue/ITU-121) | Import Social Monitor (4th automation) | In Progress |
| [ITU-122](https://linear.app/ituinnovation-hub/issue/ITU-122) | Boss approval for pilot outreach | In Progress |
| [ITU-123](https://linear.app/ituinnovation-hub/issue/ITU-123) | X API integration | Backlog |
| [ITU-124](https://linear.app/ituinnovation-hub/issue/ITU-124) | Rotate webhook API key | Backlog |
| [ITU-125](https://linear.app/ituinnovation-hub/issue/ITU-125) | Linear ↔ automation sync | In Progress |

Completed foundation work is logged as **Done** issues (ITU-117 through ITU-120).

## Manual workflow

### Starting work

1. Find or create a Linear issue in the project
2. Move to **In Progress**
3. Use suggested git branch name from Linear if committing

### Finishing work

1. Open PR; paste URL into Linear issue (`links` or comment)
2. Move issue to **Done** when merged
3. Update Notion if editorial artifact changed

### Weekly status (copy template)

```markdown
# WP15 weekly — YYYY-MM-DD

## Completed
- ITU-XXX short outcome

## In progress
- ITU-XXX status + ETA

## Blockers
- …

## Next automation runs
- Mon landscape | Wed social | 1st briefing
```

## Setup checklist

- [x] Linear project created
- [x] Milestones M1–M4
- [x] Initial issues backfilled
- [x] `data/linear-config.yaml` in repo
- [ ] Enable Linear MCP on all Cursor automations
- [ ] First automated `[run]` issue from live automation

## Troubleshooting

1. Re-authenticate Linear in Cursor → MCP settings
2. Confirm team `ITUInnovation-hub` visible via `list_teams`
3. Use project name exactly: `UN80 WP15 Research Hub`
