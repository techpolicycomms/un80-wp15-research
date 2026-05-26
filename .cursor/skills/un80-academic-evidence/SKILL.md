---
name: un80-academic-evidence
description: Add peer-reviewed footnotes and verify factual claims for UN80 WP15 reports. Use when drafting briefings, landscape summaries, or living analysis that need academic rigour, OpenAlex/WoS/Scopus citations, or GPTZero claim checks.
---

# UN80 Academic Evidence

## Mandatory rules

1. **No Sci-Hub or paywall circumvention** — use DOI, Unpaywall, or institutional access only.
2. **No invented citations** — every footnote must exist in `data/academic-literature/wp15-core-references.yaml` or a verified public URL in `data/secondary-sources/`.
3. **DRAFT disclaimer** always present on reports.
4. Run **`npm run fetch:academic`** before citing citation counts (they change over time).

## Before writing analytical claims

1. Read `data/academic-literature/wp15-core-references.yaml`.
2. Pick references where `use_when` matches your section (Action 61, 62, or both).
3. Prefer `confidence: high` and `cited_by_count` ≥ 500 when multiple papers fit.

## Footnote workflow

1. Inline marker: `… consolidation rationale [^1].`
2. End section **References** with full citation (authors, year, journal, DOI URL).
3. Map to YAML `footnote_id` (e.g. `^1`) — keep numbering consistent within one report.
4. Tag evidence tier in review notes (see `docs/ACADEMIC-RIGOUR.md`).

### When to footnote

| Report section | Minimum |
|----------------|---------|
| Member State briefing — Why this matters | 1–2 Tier A |
| Action 61 — shared services / cloud | 1 Tier A (cloud/consolidation) |
| Action 62 — TAP / innovation | 1 Tier A (AI, identity, or open gov) |
| Landscape scan summary | Tier B–E for sources; Tier A optional for framing |

## Refresh literature

```bash
npm run fetch:academic
npm run validate
```

Review `data/academic-literature/YYYY-MM-DD-discovery.yaml` — merge worthy candidates into core YAML with human-written `wp15_rationale`.

## WoS / Scopus (optional)

If user has institutional access:

1. Confirm journal is peer-reviewed and relevant.
2. Add entry to `wp15-core-references.yaml` with `source_index: institutional_wos` or `institutional_scopus`.
3. Include DOI; run fetch script to sync OpenAlex metadata.

## Claim verification (required for briefings)

After drafting:

```bash
npm run verify:claims reports/YYYY-MM-member-state-update.md
```

1. Open output in `reports/verification/`.
2. Paste claims into https://gptzero.me/hallucination-detector
3. Fix flagged claims; document review in PR.

## Quality bar

- Analytical framing → Tier A footnote
- Operational facts → Tier B URL in `secondary-sources`
- Thin evidence → flag gap explicitly; do not footnote weak papers to appear rigorous
