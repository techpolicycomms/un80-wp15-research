# SDK Lane 04 — full UN80 WP15 ops task (Cursor SDK, local)

Use with **cursor-agent-orchestrator**:

```bash
cd ~/Projects/cursor-agent-orchestrator
uv run orchestrator fleet lane lane-04 --stream
# resume: uv run orchestrator fleet lane lane-04 --resume --stream
```

Optional planning pass (orchestrator workspace, no repo edits):

```bash
uv run orchestrator karpathy run think-before-coding \
  "Read ~/Projects/un80-wp15-research/automations/sdk-lane-04-task.prompt.md and output assumptions + phased plan only"
```

---

## Mission

Execute the **complete UN80 WP15 research hub loop** in `techpolicycomms/un80-wp15-research` as a **local SDK agent** (lane-04). Mirror what Cursor Automations do, on branch **`sprint/review-bundle`** (or current feature branch if handoff says so). All outputs **DRAFT** — not agreed UN policy.

## Non-negotiables

1. **Public secondary data only** in repo — no internal survey raw data.
2. **Do not edit** Cursor Automation UI config. You MAY edit repo files: `automations/*.prompt.md`, `docs/`, scripts, data, reports (code/docs that automations read).
3. Run **`npm run validate && npm run build:dashboard`** before claiming done.
4. End with: **commit → push → PR** + handoff markdown (see orchestrator `workspaces/lanes/lane-04/`).
5. Use skills in `.cursor/skills/` — load each before its phase.

---

## Phase 0 — Orient (read-only)

Read in order:

- `docs/OPERATIONS.md`, `docs/DAILY-DIGEST.md`, `docs/ACADEMIC-RIGOUR.md`, `docs/LINEAR.md`
- `automations/workflows.json`, `automations/daily-digest.prompt.md`
- `.cursor/skills/un80-daily-digest/SKILL.md` (primary merged workflow)
- Latest `reports/2026-05-23-REVIEW-BUNDLE.md` if present
- `data/action-tracker.yaml`, `data/ict-spend-baseline.json`

Note: SDK lane runs **in parallel** with Cursor cloud automations — produce **comparable artifacts**, not duplicate billing triggers.

---

## Phase 1 — Data fetch (scripts, cheap)

```bash
npm install
npm run fetch:monitor      # RSS + YouTube + coverage
npm run fetch:academic     # OpenAlex citation refresh
npm run validate
```

Fix schema errors if any. Do not skip validation.

---

## Phase 2 — Landscape (Action 61 & 62)

Follow `.cursor/skills/un80-landscape-monitor/SKILL.md` + `.cursor/skills/un80-academic-evidence/SKILL.md`.

1. Scan approved **public** sources (UNICC, UN pages, standards bodies, think tanks).
2. Write/update `data/secondary-sources/YYYY-MM-DD-scan.yaml` (today's date).
3. Update `data/overlap-signals.yaml` only if duplication/interop evidence is clear.
4. If material: `reports/YYYY-MM-DD-landscape-scan-summary.md` from `templates/landscape-scan-summary.md`.

---

## Phase 3 — Social & news

Follow `.cursor/skills/un80-social-monitor/SKILL.md`.

1. Use `data/un-agencies-social.yaml` registry.
2. Write `data/social-monitor/YYYY-MM-DD-social.yaml`.
3. Merge deduped signals into `data/social-signals.yaml`.
4. Summary: `reports/YYYY-MM-DD-social-scan-summary.md`.

---

## Phase 4 — Daily digest + briefing

Follow `.cursor/skills/un80-daily-digest/SKILL.md`, `un80-briefing-writer`, `un80-academic-evidence`.

1. **Required every run:** `reports/YYYY-MM-DD-daily-digest.md` from `templates/daily-digest.md`.
2. Include 2–4 **Tier A footnotes** from `data/academic-literature/wp15-core-references.yaml` where analytical claims appear.
3. If today is **1st of month:** refresh `reports/YYYY-MM-member-state-update.md`.
4. Run `npm run verify:claims` → note path in PR (`reports/verification/`).

---

## Phase 5 — Dashboard & PR

```bash
npm run validate && npm run build:dashboard
```

1. Open PR: `digest: SDK lane-04 WP15 — YYYY-MM-DD` (or `data:` / `chore:` if data-only).
2. PR body must include:
   - Executive summary (5 bullets)
   - Files changed
   - **Linear sync notes** (project UN80 WP15 Research Hub) — issue title `[run] SDK daily digest — YYYY-MM-DD`
   - Comparison note: what matches / differs from last Cursor automation PR
   - DRAFT disclaimer
3. Do **not** merge — human review gate.

---

## Phase 6 — Handoff (orchestrator)

Write `workspaces/lanes/lane-04/artifacts/handoff/handoff.md` in **cursor-agent-orchestrator** repo (or path orchestrator expects):

- **Done** (checklist from phases 1–5)
- **Blocked** (if any)
- **Deploy URL:** https://techpolicycomms.github.io/un80-wp15-research/
- **Next run task** (one paragraph)
- **agent_id** for `--resume`

---

## Definition of done

- [ ] `npm run validate` passes
- [ ] `npm run build:dashboard` passes; `dashboard/dist/data.json` coherent
- [ ] Today's `reports/*-daily-digest.md` exists
- [ ] Landscape + social YAML updated if material evidence found
- [ ] Academic footnotes + claim verification file referenced
- [ ] PR open on sprint branch with Linear notes
- [ ] Handoff artifact saved

---

## Out of scope (human / other systems)

- Configuring GitHub SMTP secrets (`docs/github-secrets-digest-email.example`) — human
- Enabling Cursor Daily Digest automation in UI — human
- Disabling legacy Mon/Wed/monthly crons — human
- External distribution of briefings — human after steering approval
