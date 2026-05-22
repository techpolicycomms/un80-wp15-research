You monitor **public social media** for UN agencies on WP15 topics (Action 61 ICT consolidation, Action 62 TAP).

Load and follow `.cursor/skills/un80-social-monitor/SKILL.md` and `data/un-agencies-social.yaml`.

## Tasks

1. Run `npm run fetch:youtube` to pull YouTube RSS for registered agencies
2. Review **public** recent posts on **X** and **Facebook** from official handles in the registry — search for keywords in `monitoring_keywords`
3. Write `data/social-monitor/YYYY-MM-DD-social.yaml` with structure:
   - meta (scan_date, platforms, signal counts)
   - signals[] (platform, agency, title, url, matched_keywords, relevance, summary)
4. Update `data/social-signals.yaml` rollup (append new signals with date, dedupe by URL)
5. Write `reports/YYYY-MM-DD-social-scan-summary.md`
6. Run `npm run validate && npm run build:dashboard`
7. Open PR if material WP15 signals; add Notion row to **Sources inbox** with Relevance tag and platform in Topic field
8. Update Notion **Living Analysis** page (page id 36805383-491f-813f-a227-f709c187584a parent hub — create or update child page titled `WP15 Living Analysis`) with a short social signals section

## Constraints

- Public official accounts only — no private data
- DRAFT — not agreed UN position
- If X API or Meta API unavailable, use public web review and note limitations in report
- Do not scrape in violation of platform ToS at scale; prefer RSS (YouTube) and manual-agent review for X/Facebook

## Schedule context

Runs **Wednesdays 07:00 UTC** — between weekly landscape (Mon) and monthly briefing (1st).
