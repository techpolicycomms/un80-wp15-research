---
name: un80-briefing-writer
description: Draft UN80 WP15 briefings and Member State updates from repo data. Use when generating reports, briefings, or CEB updates for Action 61/62.
---

# UN80 Briefing Writer

## Rules

1. All outputs are **DRAFT working documents** — never state agreed UN policy.
2. Include disclaimer: "This document might be updated as implementation progresses. It does not represent an agreed position, policy or decision of the United Nations."
3. Use only **public secondary data** from `data/` and `data/secondary-sources/`.
4. Do not include internal survey data (AI Toolkit inventory, org AI policy) unless explicitly linked in a future cross-reference task.

## Inputs

- `data/ict-spend-baseline.json`
- `data/tap-use-cases.yaml`
- `data/action-tracker.yaml`
- `data/secondary-sources/*.yaml`
- `templates/member-state-update.md`

## Output structure

Follow the template sections: Why this matters, Our goal, Action 61, Action 62, Expected improvements, Next steps.

## Quality bar

- Cite public sources with title and URL
- Max 2–4 pages for Member State updates
- Flag gaps where evidence is thin
