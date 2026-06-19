# Project handover — UN80 WP15 Research Hub

**From:** Rahul Jha (ITU)  
**Audience:** Successor operators (Codex, local SDK, or human maintainers)  
**Repo:** https://github.com/techpolicycomms/un80-wp15-research  
**Handover date:** 2026-06-15 (update as needed)

> **Operational model:** **Cursor cloud agents remain the production pipeline.** Codex and SDK lane-04 may propose repo/skill changes via PR; they do not replace scheduled automations unless explicitly migrated. See [CLOUD-AGENT-IMPROVEMENTS.md](./CLOUD-AGENT-IMPROVEMENTS.md).

---

## 1. What this project is

Automated **DRAFT** research and monitoring for **UN80 Work Package 15**:

- **Action 61** — ICT consolidation (shared services, UNICC, cloud, overlap reduction)
- **Action 62** — Technology Accelerator Platform (TAP): digital ID, expertise on demand, modern conferencing

**Not official UN policy.** Public secondary data only. Human review before any external distribution.

---

## 2. How cloud agents run the work

Four **Cursor Automations** (cloud agents) target `techpolicycomms/un80-wp15-research` @ `main`:

| Automation | Cron (UTC) | ID | Opens PR when |
|------------|------------|-----|----------------|
| Landscape Monitor | Mon 06:00 | `9267c6a1-fd79-4d72-81ca-6415647ab198` | New public sources found |
| Social Monitor | Wed 07:00 | `7b162585-6d97-4e1c-8476-6f2548b9315c` | New social/RSS signals |
| Briefing Compiler | 1st 08:00 | `50fd2872-5154-49ee-a71f-31c3ffc0a058` | Monthly Member State draft |
| Webhook Ingest | On demand | `132e3dc9-f9c7-4b80-97e0-8ad28449282a` | Team submits a source |

**Agent behaviour** is defined in:

- `automations/*.prompt.md`
- `.cursor/skills/un80-*.md`
- `automations/workflows.json` (machine-readable IDs, Notion data sources)

Each run should: update `data/` or `reports/` → `npm run validate && npm run build:dashboard` → open PR → (optional) Notion + Linear rows.

**Planned but not enabled:** merged Daily Digest at 08:00 CEST — see `docs/DAILY-DIGEST.md`.

---

## 3. Repository map (what Codex owns)

```
data/                          # Source of truth (YAML/JSON)
  secondary-sources/           # Landscape scans by date
  social-monitor/              # Daily/weekly social passes
  social-signals.yaml          # Deduped rollup
  overlap-signals.yaml         # Duplication/interop signals
  academic-literature/         # Footnote library + OpenAlex discovery
  tap-use-cases.yaml           # TAP portfolio (Action 62)
  action-tracker.yaml          # Phase status
reports/                       # DRAFT markdown outputs
  *-daily-digest.md
  *-landscape-scan-summary.md
  *-social-scan-summary.md
  *-member-state-update.md
  2026-05-wp15-living-analysis.md
scripts/                       # fetch:monitor, fetch:academic, validate, dashboard
automations/                   # Cloud agent prompts + prefill URLs
.github/workflows/             # CI validate/build/deploy + digest email
docs/                          # OPERATIONS, DAILY-DIGEST, ACADEMIC-RIGOUR, LINEAR
```

**Commands Codex must know:**

```bash
npm install
npm run validate
npm run fetch:monitor
npm run fetch:academic
npm run verify:claims
npm run build:dashboard
```

---

## 4. External systems

| System | URL | Codex responsibility |
|--------|-----|----------------------|
| GitHub | repo + PRs | Review/merge agent PRs; keep `main` green |
| Dashboard | https://techpolicycomms.github.io/un80-wp15-research/ | Updates on push to `main` |
| Notion hub | https://www.notion.so/36805383491f813fa227f709c187584a | Mirror briefings/scans if MCP available |
| Linear | UN80 WP15 Research Hub project | `[run]` issues per automation pass |
| Cursor automations | https://cursor.com/automations | Do not delete; tune prompts in repo |

**Secrets (human-provided, not in repo):**

- Webhook API key → `.env` (see `.env.example`, `docs/WEBHOOK-KEY-ROTATION.md`)
- GitHub SMTP for daily email → repo secrets (see `docs/github-secrets-digest-email.example`)

---

## 5. Current state at handover

### Merged to `main` (last: 2026-05-26)

- First iteration research bundle (May 23)
- SDK daily digest pass (May 24)
- Academic rigour layer, daily digest design, email workflow
- 27-agency social monitor, Linear integration

### Open cloud-agent PRs (review backlog) — **Codex priority #1**

| PR | Date | Content |
|----|------|---------|
| [#18](https://github.com/techpolicycomms/un80-wp15-research/pull/18) | 2026-06-15 | **Latest** — CEB/HLCM, UN80 Progress Report, TAP phase 1 |
| [#17](https://github.com/techpolicycomms/un80-wp15-research/pull/17) | 2026-06-10 | Social scan + Notion updates |
| [#16](https://github.com/techpolicycomms/un80-wp15-research/pull/16) | 2026-06-08 | Landscape — UN Digital ID, DIDs |
| [#15](https://github.com/techpolicycomms/un80-wp15-research/pull/15) | 2026-06-03 | Social — ITU, WHO AI |
| [#14](https://github.com/techpolicycomms/un80-wp15-research/pull/14) | 2026-06-01 | **June Member State briefing** |
| [#13](https://github.com/techpolicycomms/un80-wp15-research/pull/13) | 2026-06-01 | Landscape — UNIN, W3C VC 2.0 |
| [#10–12](https://github.com/techpolicycomms/un80-wp15-research/pulls) | May | Earlier landscape/social/digest |

All open automation PRs should have **green CI** (`validate-and-build`).

### Known gaps

- Dashboard stale until June PRs merged
- Daily merged automation **not** enabled in Cursor UI
- GPTZero human review not completed on claim checklists
- X/LinkedIn tier-1 agencies still manual (ITU-123 backlog)
- Boss/steering approval before external use (ITU-122)

---

## 6. Codex operating rhythm

### Weekly (while legacy crons active)

- **Monday:** review landscape PR (`cursor/un80-landscape-*`)
- **Wednesday:** review social PR (`cursor/wp15-social-*`)
- **1st of month:** review briefing PR

### After each merge

1. Confirm GitHub Actions deployed dashboard
2. Spot-check https://techpolicycomms.github.io/un80-wp15-research/
3. Update Linear issue to Done with PR link

### Quality gates (never skip)

- `npm run validate` passes
- DRAFT disclaimer on all reports
- Tier A footnotes for analytical claims (`data/academic-literature/wp15-core-references.yaml`)
- `npm run verify:claims` before Member State drafts
- No Sci-Hub; public URLs/DOIs only

---

## 7. Key research narrative (for continuity)

**Action 61:** Consolidation builds on existing UNICC/UNIQCloud backbone — scale-up, not greenfield. HLCM/CEB now publicly link fragmentation → shared ICT/software/One UN IT.

**Action 62:** TAP phase 1 = AI conferencing/translation, expertise-on-demand, common digital identity. Align with **ODET**, Digital Cooperation Portal, UN Innovation Network — avoid parallel steering.

---

## 8. What Codex should do first (ordered)

1. Read `docs/OPERATIONS.md`, `automations/workflows.json`, `reports/2026-05-23-REVIEW-BUNDLE.md`
2. Review and merge **PR #18**, then **#14**, **#17** (resolve conflicts if any)
3. Batch-review remaining open PRs #10–16 or close duplicates
4. Confirm dashboard reflects June data
5. Decide: enable Daily Digest automation vs keep weekly crons
6. Configure SMTP secrets if daily email wanted
7. Keep Cursor automations running; edit prompts only via repo PRs

---

## 9. Contacts / governance

- **Human reviewer:** Rahul Jha — rahul.jha@itu.int
- **Steering gate:** no external distribution until boss/steering sign-off
- **Linear backlog:** ITU-122 (approval), ITU-123 (X API), ITU-124 (webhook rotation)

---

*Update this file when handover recipient or priorities change.*
