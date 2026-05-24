# Academic rigour — UN80 WP15 Research Hub

This hub produces **DRAFT** policy research from public secondary data. Academic rigour is enforced through **indexed literature**, **tiered citations**, **legitimate access paths**, and **human claim verification** — not through unauthorized full-text access.

## What we do (and do not do)

| Approach | Status |
|----------|--------|
| OpenAlex / Crossref citation metadata | **Automated** (`npm run fetch:academic`) |
| Unpaywall legal open-access links | **Automated** (set `UNPAYWALL_EMAIL` in `.env`) |
| Curated peer-reviewed footnote library | **Maintained** in `data/academic-literature/wp15-core-references.yaml` |
| Institutional Web of Science / Scopus | **Manual** — use ITU/library credentials where available |
| Sci-Hub or other paywall circumvention | **Not used** — violates copyright and project policy |
| GPTZero hallucination check | **Human step** — see [Claim verification](#claim-verification) |

## Evidence tiers

Reports should label sources implicitly through footnote quality:

1. **Tier A — Peer-reviewed / formal standards**  
   Journal articles, IEEE/ACM surveys, NIST/ISO standards.  
   Stored in `data/academic-literature/wp15-core-references.yaml`.

2. **Tier B — Official public UN / agency sources**  
   UNICC, entity websites, SG reports (public), JIU public summaries.

3. **Tier C — Standards & interoperability bodies**  
   W3C, OASIS, ITU-T public recommendations.

4. **Tier D — Grey literature**  
   OECD, World Bank, academic working papers — cite clearly; lower confidence unless cross-verified.

5. **Tier E — Automated monitor signals**  
   Social/landscape scans — **must be verified** before Member State language.

## Footnote format in reports

Use Markdown footnotes tied to the curated library:

```markdown
Consolidation aligns with established cloud service models [^1][^2].

## References

[^1]: Armbrust, M. et al. (2010). *A view of cloud computing.* Communications of the ACM. https://doi.org/10.1145/1721654.1721672
[^2]: Mell, P. & Grance, T. (2011). *The NIST definition of cloud computing.* NIST SP 800-145. https://doi.org/10.6028/nist.sp.800-145
```

Rules for agents (see `.cursor/skills/un80-academic-evidence/SKILL.md`):

- Add **1–3 Tier A footnotes** per briefing where analytical claims benefit from scholarly grounding.
- Match `footnote_id` in YAML when citing curated references.
- Never invent DOIs, citation counts, or journal names — run `npm run fetch:academic` to refresh.
- Prefer **highly cited** works in **influential journals** (GIQ, CACM, SMJ, IEEE surveys) when multiple options exist.

## Web of Science & Scopus (institutional)

OpenAlex aggregates citation data from Crossref and overlaps heavily with WoS/Scopus-indexed works. For **journal prestige filtering** or **UN library compliance**:

1. Search WoS / Scopus with ITU credentials.
2. Confirm DOI and export to `data/academic-literature/wp15-core-references.yaml`.
3. Set `source_index: institutional_wos` or `institutional_scopus`.
4. Run `npm run fetch:academic` to sync citation counts from OpenAlex.

Do not commit paywalled PDFs to GitHub.

## Legitimate full-text access

1. **Open access** — DOI link or Unpaywall URL in reference YAML.
2. **Author manuscript** — arXiv / institutional repository linked from OpenAlex.
3. **Institutional login** — WoS, Scopus, or publisher via ITU library.
4. **Interlibrary loan** — for critical sources not available OA.

## Automated workflows

```bash
# Refresh citation counts + discover new candidates
npm run fetch:academic

# Validate schemas
npm run validate

# Extract claims for GPTZero review
npm run verify:claims
# → reports/verification/YYYY-MM-DD-claims-for-review.md
```

### Environment (optional)

```bash
# .env (not committed)
OPENALEX_MAILTO=your@itu.int
UNPAYWALL_EMAIL=your@itu.int
```

## Claim verification

Before merging briefing PRs or updating Notion:

1. Run `npm run verify:claims`.
2. Open [GPTZero Hallucination Detector](https://gptzero.me/hallucination-detector).
3. Paste the **Claims block** from the verification file.
4. For each flagged claim:
   - Trace to `data/secondary-sources/` or academic YAML
   - Fix, soften, or remove unsupported language
   - Note verification in PR review

GPTZero has **no stable public API** in this project; verification is a **required human gate** for external-facing drafts. If ITU procures API access later, wire it in `scripts/prepare-claim-verification.mjs`.

## Discovery candidates

`npm run fetch:academic` writes `data/academic-literature/YYYY-MM-DD-discovery.yaml` with OpenAlex hits filtered by relevance keywords. **Do not footnote discovery candidates** until a human merges them into `wp15-core-references.yaml` with `wp15_rationale` and `use_when`.

## Agent skills & automations

| Component | Academic rigour hook |
|-----------|---------------------|
| `.cursor/skills/un80-academic-evidence/SKILL.md` | Footnote + verification workflow |
| `.cursor/skills/un80-briefing-writer/SKILL.md` | References section required |
| `.cursor/skills/un80-landscape-monitor/SKILL.md` | Tier A–E tagging |
| Briefing / landscape automations | Load academic evidence skill |

## Review checklist (maintainers)

- [ ] At least one Tier A footnote where analytical framing is used
- [ ] All numeric claims trace to repo data or cited URL/DOI
- [ ] `npm run validate` passes
- [ ] GPTZero claim review completed for Member State drafts
- [ ] No paywalled PDFs or unauthorized sources in repo
