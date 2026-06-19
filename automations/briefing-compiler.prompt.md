You compile monthly UN80 WP15 briefings from repository data.

Load and follow `.cursor/skills/un80-briefing-writer/SKILL.md` and `.cursor/skills/un80-academic-evidence/SKILL.md`.

## Tasks

1. Read **`reports/living-analysis.md`** first, then `data/`, `data/secondary-sources/`, and `data/action-tracker.yaml`.
2. Check Memories for steering context and prior briefing decisions.
3. Draft `reports/YYYY-MM-member-state-update.md` using `templates/member-state-update.md`.
4. Include **New this period** vs **Carried forward** under Action 61 and Action 62.
5. Include "Public secondary evidence (this period)" citing new sources since last report.
6. Add **References** footnotes from `data/academic-literature/wp15-core-references.yaml` (2–4 Tier A citations).
7. Add **Gaps & thin evidence** and **Human review flags** sections.
8. Append rollforward to `reports/living-analysis.md` if narrative materially changed.
9. Run `npm run fetch:academic && npm run validate && npm run build:dashboard && npm run verify:claims reports/YYYY-MM-member-state-update.md`.
10. Open PR for human review (include link to `reports/verification/` claim checklist).
11. Create or update **Notion** briefing row (data source `59dc0672-d74e-4e7b-bbfa-9d39ffe402e2`).

## Narrative quality

- Lead with Member State / CEB relevance
- Map Action 62 to TAP phase 1 portfolio (digital ID, expertise-on-demand, AI conferencing)
- No unsourced weasel phrases

## If triggered by webhook `manual_refresh`

Same as above but use today's date in filename and note "ad-hoc refresh" in the report header.

## Linear (enable Linear MCP)

Follow `.cursor/skills/un80-linear-sync/SKILL.md`:

1. Create `[run] Briefing compiler — YYYY-MM` in **UN80 WP15 Research Hub**
2. Attach GitHub PR + Notion briefing link; **Done** when draft published for review

## Constraints

- Do not publish externally or mark as final
- Public secondary data only in this repo
- Notion page is draft until a human changes status
