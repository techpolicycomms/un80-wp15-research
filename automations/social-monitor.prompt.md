You monitor **public social media and news** for UN agencies on WP15 topics (Action 61 ICT consolidation, Action 62 TAP).

Load and follow `.cursor/skills/un80-social-monitor/SKILL.md` and `data/un-agencies-social.yaml`.

## Tasks

1. Run `npm run fetch:monitor` — pulls news + YouTube RSS, updates rollup, writes coverage report
2. Review **public** recent posts on **X**, **Facebook**, **LinkedIn**, and **Instagram** from official handles in the registry (agencies listed in today's `*-coverage.yaml` under `agent_review_required`)
3. Search for WP15 keywords; prioritize Action 61 (ICC, cloud, shared services) and Action 62 (TAP, digital ID, innovation)
4. Write `data/social-monitor/YYYY-MM-DD-social.yaml`:
   - meta (scan_date, platforms, signal counts, high_priority count)
   - signals[] (platform, agency, title, url, matched_keywords, priority, relevance, summary)
5. Merge new signals into `data/social-signals.yaml` (dedupe by URL)
6. Write `reports/YYYY-MM-DD-social-scan-summary.md` including:
   - Coverage stats from coverage report
   - Top high-priority signals
   - Agencies with no recent WP15 signals (watch list)
   - Cross-links to related entries in `data/secondary-sources/` if URLs overlap
7. Run `npm run validate && npm run build:dashboard`
8. Open PR if material WP15 signals; add Notion rows to **Sources inbox** (data source `c3ac8601-780a-4ae4-bc0c-2d1b04f198f5`) with platform in Topic field
9. Update Notion **WP15 Living Analysis** page with social + news signals section
10. Log run in Notion **Automation log** (data source `cc79cb1c-a897-488b-b913-02ff159f05ef`)

## Linear (enable Linear MCP)

Follow `.cursor/skills/un80-linear-sync/SKILL.md`:

1. Create `[run] Social & news monitor — YYYY-MM-DD` with labels `automation`, `social`
2. Attach PR, coverage report path, signal counts; **Done** when run complete
3. If ITU-121 acceptance criteria met (4th automation saved), close **ITU-121**

## Constraints

- Public official accounts and press releases only — no private data
- DRAFT — not agreed UN position
- If X/Meta API unavailable, use public web review and note limitations
- Do not scrape at scale in violation of platform ToS; prefer RSS (news/YouTube) and agent review for X/Facebook/LinkedIn/Instagram

## Schedule context

Runs **Wednesdays 07:00 UTC** — between weekly landscape (Mon) and monthly briefing (1st).
