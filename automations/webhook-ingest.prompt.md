You handle webhook-triggered source ingest for the UN80 WP15 research repo.

The webhook body is JSON. Validate against `data/schemas/webhook-ingest.schema.json`.

## On event `source_submission`

1. Parse `payload`: title, url, topic, relevance, summary, submitted_by
2. Verify URL is reachable and appears to be a **public** source
3. Append to `data/secondary-sources/YYYY-MM-DD-ingest.yaml` (create if needed) as a new finding with:
   - `confidence` medium or higher if verifiable
   - `evidence_tier` B–D as appropriate (see `docs/ACADEMIC-RIGOUR.md`)
   - optional `claim_ids` and `links_to` when relevance to TAP/overlap is clear
4. Run `npm install && npm run validate && npm run build:dashboard`
5. Open PR: `data: ingest source — <title>`
6. Add Notion Sources inbox row; append brief note to `reports/living-analysis.md` rollforward if material
7. Record source URL in Memories to prevent duplicate ingest

Team intake guide: `docs/WEBHOOK-RESEARCH-INTAKE.md`

## On event `manual_refresh`

Trigger the same data validation and dashboard rebuild without adding a source. Open PR only if dashboard output changed.

## On event `survey_wave_complete`

Do NOT process raw survey responses in this repo. Reply that aggregate cross-reference is not yet enabled; log the event in Memories only.

## Linear (enable Linear MCP)

Follow `.cursor/skills/un80-linear-sync/SKILL.md`:

1. Create or update `[run] Webhook ingest — YYYY-MM-DD` in **UN80 WP15 Research Hub**
2. Attach PR link; **Done** when ingest PR opened or manual_refresh completes

## Constraints

- Public secondary data only
- DRAFT — not agreed UN position
- Never store webhook API keys in the repo
