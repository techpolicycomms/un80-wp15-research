---
name: un80-briefing-writer
description: Draft UN80 WP15 briefings and Member State updates from repo data. Use when generating reports, briefings, or CEB updates for Action 61/62.
---

# UN80 Briefing Writer

## Rules

1. All outputs are **DRAFT working documents** — never state agreed UN policy.
2. Include disclaimer: "This document might be updated as implementation progresses. It does not represent an agreed position, policy or decision of the United Nations."
3. Use only **public secondary data** from `data/` and `data/secondary-sources/`.
4. Do not include internal survey data unless explicitly linked in a future cross-reference task.

## Synthesis order

1. **`reports/living-analysis.md`** — rollforward log and current narrative
2. Latest `data/secondary-sources/*-scan.yaml` and `data/social-monitor/*-social.yaml`
3. `data/overlap-signals.yaml`, `data/tap-use-cases.yaml`, `data/action-tracker.yaml`
4. `data/academic-literature/wp15-core-references.yaml`

Load `.cursor/skills/un80-academic-evidence/SKILL.md` for footnotes and claim verification.

## Inputs

- `data/ict-spend-baseline.json`
- `data/tap-use-cases.yaml` (claim_ids for TAP portfolio mapping)
- `data/action-tracker.yaml`
- `data/secondary-sources/*.yaml`
- `data/academic-literature/wp15-core-references.yaml`
- `templates/member-state-update.md`

## Output structure

Follow template: Executive summary, Why this matters, Our goal, Action 61/62 (each with **New this period** + **Carried forward**), Gaps, Human review flags, Next steps, References.

## Narrative quality bar

- Lead with **so what for Member States / CEB**, not process
- Executive summary ≤ 10 bullets
- Every analytical sentence: Tier A footnote or Tier B URL inline
- Replace weasel phrases with sourced facts or explicit gap flags
- Action 62: map to **TAP phase 1 portfolio** (digital ID, expertise-on-demand, AI conferencing/translation) when relevant
- Cite public sources with title and URL (Tier B–E)
- **References** section: 2–4 Tier A footnotes where analytical claims appear
- Run `npm run verify:claims` on the draft; complete GPTZero review per `docs/ACADEMIC-RIGOUR.md`
- Max 2–4 pages for Member State updates
- After drafting: append rollforward to `reports/living-analysis.md` if material narrative change

## Quality bar

- Flag gaps where evidence is thin
- Include **Human review flags** for claims needing steering sign-off
