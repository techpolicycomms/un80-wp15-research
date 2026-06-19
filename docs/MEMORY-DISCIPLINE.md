# Cursor Memories — discipline for cloud agents

Cloud automations have **Memories** enabled. Human reviewers should write Memories after each PR review so agent quality compounds across runs.

## What to store in Memories

| Type | Example |
|------|---------|
| Steering decisions | "Do not claim TAP phase 2 scope until CEB confirms May 2026 progress report language." |
| Rejected sources | "URL X was rejected — duplicate of UNICC biennial report; do not re-ingest." |
| Framing preferences | "Action 61: emphasize UNIQCloud as existing backbone, not greenfield cloud." |
| Agency watch list | "ODET had no WP15 posts in 14 days as of 2026-06-10 — flag in social summary." |
| False positives | "UN News Ebola article matched `ict` substring — ignore similar hits." |
| Approved ingest | "HLCM April 2026 deck accepted via webhook — cite as Tier B only." |

## What not to store

- Webhook API keys or SMTP credentials
- Internal survey raw responses
- Personal data or non-public UN restricted material
- Sci-Hub or paywall circumvention instructions

## When agents read Memories

Every automation prompt starts with "Read Memories" (landscape, social, briefing). Agents should apply Memories before searching or drafting.

## Reviewer workflow

After merging or rejecting an agent PR:

1. Open the automation in [Cursor Automations](https://cursor.com/automations)
2. Add a Memory summarizing the decision in one or two sentences
3. For rejections: include URL or claim to avoid
4. For approvals: note any wording that must carry forward

## Link to living analysis

Material steering decisions that affect narrative should also appear in the next human-edited rollforward block in `reports/living-analysis.md` so the repo remains the source of truth if Memories are reset.
