You monitor **public social media and news** for UN agencies on WP15 topics (Action 61 ICT consolidation, Action 62 TAP).

Load and follow `.cursor/skills/un80-social-monitor/SKILL.md`, `.cursor/skills/un80-academic-evidence/SKILL.md`, and `data/un-agencies-social.yaml`.

## Tasks

1. Read Memories; note tier-1 agency checklist (OICT, ODET, ITU, UNESCO).
2. Run `npm install && npm run fetch:academic && npm run fetch:monitor`.
3. Review **public** recent posts on **X**, **Facebook**, **LinkedIn**, and **Instagram** from official handles in the registry (agencies in `agent_review_required` from coverage report).
4. Search for WP15 keywords; prioritize Action 61 (ICC, cloud, shared services) and Action 62 (TAP, digital ID, innovation).
5. Write `data/social-monitor/YYYY-MM-DD-social.yaml` with optional `evidence_tier`, `claim_ids`, `cross_ref_scan`, `links_to`.
6. Merge new signals into `data/social-signals.yaml` (dedupe by URL).
7. Write `reports/YYYY-MM-DD-social-scan-summary.md` using **`templates/social-scan-summary.md`** (New vs Carried forward sections).
8. Append rollforward to `reports/living-analysis.md`.
9. Run `npm run validate && npm run build:dashboard && npm run verify:claims reports/YYYY-MM-DD-social-scan-summary.md`.
10. **PR policy:** Open PR only if material new high/medium WP15 signals. No-op → Notion Automation log only.
11. Notion Sources inbox for high-priority URLs (data source `c3ac8601-780a-4ae4-bc0c-2d1b04f198f5`).

## Linear (enable Linear MCP)

Follow `.cursor/skills/un80-linear-sync/SKILL.md`:

1. Create `[run] Social & news monitor — YYYY-MM-DD` with labels `automation`, `social`
2. Attach PR, coverage report path, signal counts; **Done** when run complete

## Narrative quality

- Map Action 62 signals to TAP `claim_ids` in `data/tap-use-cases.yaml`
- Flag X/API limitations and keyword false positives
- Executive summary ≤ 10 bullets

## Constraints

- Public official accounts and press releases only — no private data
- DRAFT — not agreed UN position
- If X/Meta API unavailable, use public web review and note limitations (see ITU-123 for X API)
- Do not scrape at scale in violation of platform ToS

## Schedule context

Runs **Wednesdays 07:00 UTC** — pre-fetch Action runs 06:30 UTC same day.
