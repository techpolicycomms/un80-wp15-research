# TAP Synthesis Dashboard + Build-Time Multi-Model Engine

**Date:** 2026-06-24
**Workstream:** UN80 / WP15 / TAP
**Status:** Approved design — ready for implementation plan.

## Problem

The current dashboard (`dashboard/index.html`, built by `scripts/build-dashboard.mjs`)
is a generic, data-driven telemetry view organised around "Action 61 / Action 62"
with metric cards, charts, a report library, and signal feeds. It does **not**
reflect the editorial structure of the TAP "Research and Secondary Data Agent Loop"
working synthesis, which is a narrative briefing with a fixed 8-section structure.

We are rebuilding the dashboard's information architecture to mirror that synthesis,
and producing its content via a build-time multi-model orchestration engine
(DeepSeek + Claude + GPT + Gemini) so claims are cross-checked and evidence-scored.

## Constraints

- **Static deploy.** Site ships to GitHub Pages. No API keys in the deployed bundle.
  All LLM calls happen at build time (locally or CI), baked into static output.
- **Primary 23 June files are absent** from the repo. The engine runs on the pasted
  synthesis text + existing `data/*.yaml`, not on the missing DOCX/PPTX/PDF extracts.
- **Integrity framing preserved.** Keep `DRAFT / public secondary data only /
  human review required` banners. Nothing is promoted to "final" by a model alone.

## A. Multi-Model Orchestration — `scripts/orchestrate-synthesis.mjs`

Plain Node + `fetch` to each provider's HTTP API (no SDK installs). Keys from `.env`.
Pipeline with a deterministic reconciliation step:

| Stage | Model | Role | Output |
|------|-------|------|--------|
| 1. Extract/normalize | DeepSeek (`deepseek-chat`) | Parse synthesis + `data/*.yaml` into atomic claims & RQ blocks | `claims_raw[]` |
| 2. Synthesize | Claude (`claude-opus-4-8`) | Author the 8-section structured content + per-RQ answer/evidence | `synthesis.json` |
| 3. Adversarial check | GPT (OpenAI) | Red-team each claim: supported? overstated? → verdict | `verdicts[]` |
| 4. Evidence scoring | Gemini | Independently bucket each claim: safe / caveat / do-not-cite + confidence | `scores[]` |
| 5. Reconcile | Node (deterministic) | Merge per rule below | `data/tap-synthesis.json` + `data/claim-ledger.jsonl` |

**Reconciliation rule:** a claim is `safe` only if Claude asserts it AND at least one
of {GPT verdict = supported, Gemini bucket = safe}. Any disagreement → `caveat`.
GPT-refuted or Gemini do-not-cite (with Claude low confidence) → `do-not-cite`.

**Graceful degradation:** missing key or failed call → that stage is skipped, the
reconciler lowers confidence and records the gap in provenance, never crashes.

**Auditability:** each model's raw response saved to
`data/orchestration-runs/<timestamp>/<stage>.json`.

## B. Data Artifacts (new)

- `data/tap-synthesis.json` — 8 sections as structured data:
  - `leadAnswer` (statement + 4 sharpening points)
  - `status`, `previousWork` (jobs-scan stats: 114 / 85 / 29 / 32, job families)
  - `newFiles[]` (provenance list)
  - `rq[]` — `{id, question, answer, evidence[], confidence, citeStatus}`
  - `evidenceQuality` — `{strongNow[], useWithCaveats[]}`
  - `agentLoop` — `{agents[], cadence[]}`
  - `sources[]` — `{name, useFor, url}`
  - `nextActions[]`
- `data/claim-ledger.jsonl` — per claim: text, sourceIds, model verdicts, citeStatus,
  staleDate, deckSlide, nextCheck.
- JSON schemas in `data/schemas/` for both, validated by `validate-data.mjs`.

## C. Dashboard Information Architecture (replaces current layout)

Nav + sections map 1:1 to the document:

1. **Lead Answer** — hero panel: framing statement + 4 sharpening points as cards.
2. **Status & Previous Work** — working-synthesis status banner + jobs-scan metric cards.
3. **New Files Incorporated** — source provenance list.
4. **Research Answers** — RQ-001…015 filterable accordion/grid; each shows answer +
   evidence + a cite-status chip (green safe / amber caveat / red do-not-cite).
5. **Evidence Quality** — two columns: "Strong enough to use now" vs "Use with caveats".
6. **Agent Loop** — 8 agents as a pipeline diagram + weekly cadence (Mon→Fri).
7. **Secondary Data Sources** — source cards (MPTF, CRAF'd, IATI, WFP, UNICEF,
   Global Pulse, OECD OPSI) with links.
8. **Next Actions** — checklist.

Footer **"Engine provenance"** panel: which models ran, when, links to run artifacts.

## D. Visual Design

Briefing-document aesthetic (credible UN working document), not a telemetry dashboard.
Apply `artifact-design`/`frontend-design` guidance for typography + palette. Retain the
DRAFT / human-review integrity framing.

## E. Build & Deploy

```
orchestrate-synthesis.mjs (needs keys; local/CI)
  → data/tap-synthesis.json + data/claim-ledger.jsonl
  → build-dashboard.mjs (extended to read these)
  → dashboard/dist/  → GitHub Pages   [NO keys in bundle]
```

New npm scripts: `orchestrate` (the engine), unchanged `build:dashboard`,
`validate` extended to cover the new schemas.

## Out of Scope

- Runtime/in-browser LLM calls (explicitly rejected: static deploy).
- Extracting from the absent 23 June primary files (run when added later).
- Reworking the social-monitor / academic-evidence pipelines.
