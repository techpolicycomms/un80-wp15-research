# TAP Synthesis Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the UN80 WP15 dashboard around the 8-section TAP working-synthesis structure, with content produced by a build-time multi-model orchestration engine (DeepSeek + Claude + Gemini; OpenAI optional).

**Architecture:** A Node orchestration script fans the synthesis + repo data out to three providers (DeepSeek extracts atomic claims, Claude synthesizes the 8 sections, Gemini scores evidence), then a deterministic reconciler merges them into `data/tap-synthesis.json` + `data/claim-ledger.jsonl`. The existing `build-dashboard.mjs` is extended to bake these into the static `dashboard/dist/` bundle. A rewritten `dashboard/{index.html,styles.css,app.js}` renders the 8 sections. No keys ship in the deployed site.

**Tech Stack:** Node 18+ ESM (`.mjs`), `@anthropic-ai/sdk` for the Claude stage, raw `fetch` for DeepSeek (OpenAI-compatible) and Gemini, `ajv`/`ajv-formats` (already deps) for schema validation, vanilla JS + CSS for the dashboard.

## Global Constraints

- **Static deploy, no keys in bundle.** All LLM calls happen in `scripts/orchestrate-synthesis.mjs` (run locally/CI). `dashboard/dist/` must never contain an API key. — verbatim from spec §Constraints.
- **Graceful degradation.** A missing key or failed provider call skips that stage and lowers confidence in the reconciler; it must never crash the run. — spec §A.
- **Claude model ID is exactly `claude-opus-4-8`.** Adaptive thinking (`thinking: {type: "adaptive"}`), no `budget_tokens`, no `temperature`/`top_p`/`top_k` (all 400 on this model).
- **Provider model names are env-overridable** (`DEEPSEEK_MODEL`, `GEMINI_MODEL`, `ANTHROPIC_MODEL`) with defaults, so a provider rename degrades rather than hard-fails.
- **Reconciliation rule (OpenAI absent):** a claim is `safe` only if Claude asserts it AND Gemini scores it `safe`; any disagreement → `caveat`; Gemini `do-not-cite` + low Claude confidence → `do-not-cite`. — spec §A, adjusted for no GPT.
- **Integrity framing preserved:** keep the `DRAFT / public secondary data only / human review required` banner and footer. — spec §Constraints.
- **Secrets:** read keys from `.env` (already gitignored). Never log key values; never commit `data/orchestration-runs/` raw outputs if they would contain secrets (they won't — only model text).

---

### Task 1: Seed input + env loader + provider config

**Files:**
- Create: `data/tap-source-synthesis.md` (the pasted synthesis, verbatim — the engine's primary input)
- Create: `scripts/lib/orchestration/config.mjs`
- Test: `scripts/lib/orchestration/config.test.mjs`

**Interfaces:**
- Produces: `loadEnv(path)` → `{ANTHROPIC_API_KEY?, GEMINI_API_KEY?, DEEPSEEK_API_KEY?, OPENAI_API_KEY?}` (only keys with non-empty, >8-char values are returned — filters out the 3-char OpenAI placeholder); `providerStatus(env)` → `{anthropic:bool, gemini:bool, deepseek:bool, openai:bool}`; `MODELS` → `{anthropic, deepseek, gemini}` resolved from env with defaults `claude-opus-4-8` / `deepseek-chat` / `gemini-2.5-pro`.

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/lib/orchestration/config.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { providerStatus, MODELS } from "./config.mjs";

test("placeholder/short keys count as absent", () => {
  const s = providerStatus({ OPENAI_API_KEY: "n/a", ANTHROPIC_API_KEY: "sk-ant-".padEnd(40, "x") });
  assert.equal(s.openai, false);
  assert.equal(s.anthropic, true);
  assert.equal(s.gemini, false);
});

test("models default when env unset", () => {
  assert.equal(MODELS({}).anthropic, "claude-opus-4-8");
  assert.equal(MODELS({ DEEPSEEK_MODEL: "deepseek-reasoner" }).deepseek, "deepseek-reasoner");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/lib/orchestration/config.test.mjs`
Expected: FAIL — `Cannot find module './config.mjs'`

- [ ] **Step 3: Write the implementation**

```javascript
// scripts/lib/orchestration/config.mjs
import { readFileSync } from "node:fs";

export function loadEnv(path = ".env") {
  let raw = "";
  try { raw = readFileSync(path, "utf8"); } catch { return { ...process.env }; }
  const env = { ...process.env };
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const present = (v) => typeof v === "string" && v.trim().length > 8;

export function providerStatus(env) {
  return {
    anthropic: present(env.ANTHROPIC_API_KEY) || present(env.CLAUDE_API_KEY),
    gemini: present(env.GEMINI_API_KEY) || present(env.GOOGLE_API_KEY),
    deepseek: present(env.DEEPSEEK_API_KEY),
    openai: present(env.OPENAI_API_KEY),
  };
}

export function MODELS(env) {
  return {
    anthropic: env.ANTHROPIC_MODEL || "claude-opus-4-8",
    deepseek: env.DEEPSEEK_MODEL || "deepseek-chat",
    gemini: env.GEMINI_MODEL || "gemini-2.5-pro",
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/lib/orchestration/config.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 5: Create the seed synthesis file**

Write `data/tap-source-synthesis.md` with the full TAP "Research and Secondary Data Agent Loop" text from the user's request (sections 1–8, all RQ-001…015 answers verbatim). This is the engine's primary input.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/orchestration/config.mjs scripts/lib/orchestration/config.test.mjs data/tap-source-synthesis.md
git commit -m "Add orchestration config loader + seed synthesis input"
```

---

### Task 2: The deterministic reconciler (pure, fully TDD)

**Files:**
- Create: `scripts/lib/orchestration/reconcile.mjs`
- Test: `scripts/lib/orchestration/reconcile.test.mjs`

**Interfaces:**
- Consumes: Claude synthesis object `{leadAnswer, status, previousWork, newFiles, rq[], evidenceQuality, agentLoop, sources, nextActions}`, Gemini scores `[{claimId, bucket: "safe"|"caveat"|"do-not-cite", confidence: 0..1}]`, DeepSeek claims `[{claimId, text, sourceIds[]}]`, and `providerStatus`.
- Produces: `reconcile({synthesis, claims, scores, status})` → `{synthesis: <with citeStatus on each rq + claim>, ledger: [{claimId, text, sourceIds, claudeAsserted, geminiBucket, geminiConfidence, citeStatus, staleDate, nextCheck}], provenance: {ranModels[], skippedModels[], generatedAt: null}}`. (generatedAt left null — stamped by caller; `Date.now()` is unavailable in some contexts and timestamping belongs to the orchestrator.)

- [ ] **Step 1: Write the failing tests**

```javascript
// scripts/lib/orchestration/reconcile.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { citeStatusFor, reconcile } from "./reconcile.mjs";

test("safe only when Claude asserts AND Gemini says safe", () => {
  assert.equal(citeStatusFor({ claudeAsserted: true, geminiBucket: "safe", geminiConfidence: 0.9 }), "safe");
});
test("disagreement downgrades to caveat", () => {
  assert.equal(citeStatusFor({ claudeAsserted: true, geminiBucket: "caveat", geminiConfidence: 0.5 }), "caveat");
});
test("gemini do-not-cite + low claude confidence => do-not-cite", () => {
  assert.equal(citeStatusFor({ claudeAsserted: true, geminiBucket: "do-not-cite", geminiConfidence: 0.2, claudeConfidence: 0.3 }), "do-not-cite");
});
test("gemini absent => caveat (cannot reach safe with one model)", () => {
  assert.equal(citeStatusFor({ claudeAsserted: true, geminiBucket: null }), "caveat");
});
test("reconcile tags every rq and emits a ledger line per claim", () => {
  const out = reconcile({
    synthesis: { rq: [{ id: "RQ-001", question: "q", answer: "a", evidence: ["e"], claims: ["c1"] }] },
    claims: [{ claimId: "c1", text: "claim one", sourceIds: ["s1"] }],
    scores: [{ claimId: "c1", bucket: "safe", confidence: 0.8 }],
    status: { anthropic: true, gemini: true, deepseek: true, openai: false },
  });
  assert.equal(out.synthesis.rq[0].citeStatus, "safe");
  assert.equal(out.ledger.length, 1);
  assert.equal(out.ledger[0].citeStatus, "safe");
  assert.deepEqual(out.provenance.skippedModels, ["openai"]);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test scripts/lib/orchestration/reconcile.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```javascript
// scripts/lib/orchestration/reconcile.mjs
export function citeStatusFor({ claudeAsserted, geminiBucket, geminiConfidence = 0, claudeConfidence = 0.5 }) {
  if (!claudeAsserted) return "do-not-cite";
  if (geminiBucket === "do-not-cite" && claudeConfidence < 0.5) return "do-not-cite";
  if (geminiBucket === "safe" && geminiConfidence >= 0.6) return "safe";
  return "caveat";
}

const STALE_DAYS = 30;

export function reconcile({ synthesis, claims = [], scores = [], status }) {
  const scoreById = new Map(scores.map((s) => [s.claimId, s]));
  const claimById = new Map(claims.map((c) => [c.claimId, c]));

  const ledger = claims.map((c) => {
    const score = scoreById.get(c.claimId) || {};
    const citeStatus = citeStatusFor({
      claudeAsserted: true,
      geminiBucket: score.bucket ?? null,
      geminiConfidence: score.confidence ?? 0,
      claudeConfidence: c.claudeConfidence ?? 0.5,
    });
    return {
      claimId: c.claimId,
      text: c.text,
      sourceIds: c.sourceIds || [],
      claudeAsserted: true,
      geminiBucket: score.bucket ?? null,
      geminiConfidence: score.confidence ?? null,
      citeStatus,
      staleDate: null, // stamped by orchestrator
      nextCheck: null,
    };
  });
  const ledgerById = new Map(ledger.map((l) => [l.claimId, l]));

  const rq = (synthesis.rq || []).map((q) => {
    const statuses = (q.claims || []).map((cid) => ledgerById.get(cid)?.citeStatus).filter(Boolean);
    // RQ inherits the weakest cite status of its claims; default caveat
    const citeStatus = statuses.includes("do-not-cite") ? "do-not-cite"
      : statuses.length && statuses.every((s) => s === "safe") ? "safe" : "caveat";
    return { ...q, citeStatus };
  });

  const skippedModels = Object.entries(status).filter(([, on]) => !on).map(([k]) => k);
  const ranModels = Object.entries(status).filter(([, on]) => on).map(([k]) => k);

  return {
    synthesis: { ...synthesis, rq },
    ledger,
    provenance: { ranModels, skippedModels, staleDays: STALE_DAYS, generatedAt: null },
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test scripts/lib/orchestration/reconcile.test.mjs`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/orchestration/reconcile.mjs scripts/lib/orchestration/reconcile.test.mjs
git commit -m "Add deterministic claim reconciler with cite-status rules"
```

---

### Task 3: Provider clients (Claude SDK + DeepSeek/Gemini fetch)

**Files:**
- Create: `scripts/lib/orchestration/providers.mjs`
- Modify: `package.json` (add `@anthropic-ai/sdk` dependency)
- Test: `scripts/lib/orchestration/providers.test.mjs` (offline-only: validates request shaping + graceful-skip, does NOT hit the network)

**Interfaces:**
- Consumes: `env`, `MODELS(env)`.
- Produces: `callClaude({env, model, system, user, schema})` → parsed object (uses `@anthropic-ai/sdk`, `thinking:{type:"adaptive"}`, `output_config:{effort:"high", format:{type:"json_schema", schema}}`); `callDeepSeek({env, model, system, user})` → string; `callGemini({env, model, system, user})` → string; each returns `null` (not throw) when its key is absent or the call fails, logging a one-line skip notice.

- [ ] **Step 1: Add the SDK dependency**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Write the failing offline test**

```javascript
// scripts/lib/orchestration/providers.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { callDeepSeek, callGemini, callClaude } from "./providers.mjs";

test("missing keys return null, never throw", async () => {
  assert.equal(await callDeepSeek({ env: {}, model: "deepseek-chat", system: "s", user: "u" }), null);
  assert.equal(await callGemini({ env: {}, model: "gemini-2.5-pro", system: "s", user: "u" }), null);
  assert.equal(await callClaude({ env: {}, model: "claude-opus-4-8", system: "s", user: "u", schema: {} }), null);
});
```

- [ ] **Step 3: Run to verify failure**

Run: `node --test scripts/lib/orchestration/providers.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement**

```javascript
// scripts/lib/orchestration/providers.mjs
import Anthropic from "@anthropic-ai/sdk";

const log = (m) => process.stderr.write(`[providers] ${m}\n`);

export async function callClaude({ env, model, system, user, schema }) {
  const key = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY;
  if (!key || key.length < 8) { log("Claude skipped (no key)"); return null; }
  try {
    const client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model,
      max_tokens: 32000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content: user }],
    });
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    return JSON.parse(text);
  } catch (e) { log(`Claude failed: ${e.message}`); return null; }
}

export async function callDeepSeek({ env, model, system, user }) {
  const key = env.DEEPSEEK_API_KEY;
  if (!key || key.length < 8) { log("DeepSeek skipped (no key)"); return null; }
  try {
    const r = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) { log(`DeepSeek HTTP ${r.status}`); return null; }
    const j = await r.json();
    return j.choices?.[0]?.message?.content ?? null;
  } catch (e) { log(`DeepSeek failed: ${e.message}`); return null; }
}

export async function callGemini({ env, model, system, user }) {
  const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (!key || key.length < 8) { log("Gemini skipped (no key)"); return null; }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });
    if (!r.ok) { log(`Gemini HTTP ${r.status}`); return null; }
    const j = await r.json();
    return j.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (e) { log(`Gemini failed: ${e.message}`); return null; }
}
```

- [ ] **Step 5: Run to verify pass**

Run: `node --test scripts/lib/orchestration/providers.test.mjs`
Expected: PASS (1 test)

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/orchestration/providers.mjs scripts/lib/orchestration/providers.test.mjs package.json package-lock.json
git commit -m "Add provider clients (Claude SDK + DeepSeek/Gemini fetch) with graceful skip"
```

---

### Task 4: JSON schemas + validate-data integration

**Files:**
- Create: `data/schemas/tap-synthesis.schema.json`
- Create: `data/schemas/claim-ledger.schema.json`
- Modify: `scripts/validate-data.mjs` (add the two new files to its validation set — follow the existing pattern in that file)
- Test: covered by running `npm run validate` against a fixture in Task 5.

**Interfaces:**
- `tap-synthesis.schema.json` validates `{leadAnswer:{statement, points[]}, status, previousWork:{stats[], jobFamilies[]}, newFiles[], rq:[{id, question, answer, evidence[], citeStatus, claims[]}], evidenceQuality:{strongNow[], useWithCaveats[]}, agentLoop:{agents[], cadence[]}, sources:[{name, useFor, url}], nextActions[], provenance}`.
- `claim-ledger.schema.json` validates one object per line (the orchestrator writes JSONL; validation reads line-by-line).

- [ ] **Step 1: Read the existing validator to match its pattern**

Read `scripts/validate-data.mjs` and note how it loads schemas (ajv) and which files it validates. Add the two new schema files following that exact pattern. If it validates a fixed list, append `data/tap-synthesis.json` (object) and `data/claim-ledger.jsonl` (per-line).

- [ ] **Step 2: Write `tap-synthesis.schema.json`**

Draft-07 schema with `type: "object"`, `required: ["leadAnswer","rq","evidenceQuality","sources","nextActions"]`, `additionalProperties: true`. Each `rq` item requires `id`, `question`, `answer`, `citeStatus` (enum `["safe","caveat","do-not-cite"]`).

- [ ] **Step 3: Write `claim-ledger.schema.json`**

Schema for one ledger line: `required: ["claimId","text","citeStatus"]`, `citeStatus` enum as above.

- [ ] **Step 4: Wire into validate-data.mjs and dry-run**

Run: `npm run validate`
Expected: PASS for existing data (the new files don't exist yet — guard with "skip if file absent" so validation doesn't fail before the first orchestration run).

- [ ] **Step 5: Commit**

```bash
git add data/schemas/tap-synthesis.schema.json data/schemas/claim-ledger.schema.json scripts/validate-data.mjs
git commit -m "Add schemas for tap-synthesis + claim-ledger and wire into validate"
```

---

### Task 5: The orchestrator (wires stages, writes artifacts, stamps time)

**Files:**
- Create: `scripts/orchestrate-synthesis.mjs`
- Modify: `package.json` (add `"orchestrate": "node scripts/orchestrate-synthesis.mjs"`)

**Interfaces:**
- Consumes: everything from Tasks 1–3.
- Produces: writes `data/tap-synthesis.json`, `data/claim-ledger.jsonl`, and `data/orchestration-runs/<ISO-timestamp>/{deepseek,claude,gemini}.json`. Stamps `provenance.generatedAt`, `staleDate`, `nextCheck` using `new Date().toISOString()` (allowed here — this is a normal Node script, not a workflow sandbox). Prints a summary: which models ran, claim count, cite-status histogram.

Flow:
1. `env = loadEnv()`, `status = providerStatus(env)`, `models = MODELS(env)`.
2. Read `data/tap-source-synthesis.md` + load `data/*.yaml` (tap-use-cases, overlap-signals, action-tracker) as extra context.
3. **Stage 1 (DeepSeek):** prompt to extract atomic claims → parse JSON `{claims:[{claimId,text,sourceIds}]}`. If null, fall back to deriving claim stubs from the synthesis RQ list so later stages still run.
4. **Stage 2 (Claude):** prompt to produce the full 8-section `synthesis` object (schema-constrained). If null, fall back to a deterministic parse of `tap-source-synthesis.md` into the schema (so the dashboard always has content even with no Claude key).
5. **Stage 3 (Gemini):** prompt to score each claim → `{scores:[{claimId,bucket,confidence}]}`. If null, scores = [].
6. `reconcile(...)`, stamp timestamps, write artifacts, validate via the Task 4 schemas, print summary.

- [ ] **Step 1: Implement the orchestrator** per the flow above. Save raw provider outputs to the run directory before parsing (audit trail). Wrap each stage so a thrown error downgrades to `null` and the run continues.

- [ ] **Step 2: Add the npm script** to `package.json`.

- [ ] **Step 3: Dry-run with no keys (degradation path)**

Run: `node scripts/orchestrate-synthesis.mjs` with keys temporarily unset
Expected: completes, writes `data/tap-synthesis.json` from the deterministic fallback, prints "ranModels: [], skippedModels: [anthropic,gemini,deepseek,openai]", `npm run validate` passes.

- [ ] **Step 4: Live run with real keys**

Run: `npm run orchestrate`
Expected: DeepSeek + Claude + Gemini run; `data/tap-synthesis.json` + `data/claim-ledger.jsonl` written; cite-status histogram printed; raw outputs in `data/orchestration-runs/<ts>/`. Verify `data/tap-synthesis.json` has all 15 RQs and a non-empty ledger.

- [ ] **Step 5: Commit**

```bash
git add scripts/orchestrate-synthesis.mjs package.json data/tap-synthesis.json data/claim-ledger.jsonl
git commit -m "Add multi-model orchestrator; generate tap-synthesis + claim-ledger"
```

(Do NOT commit `data/orchestration-runs/` — add it to `.gitignore`.)

---

### Task 6: Dashboard build integration

**Files:**
- Modify: `scripts/build-dashboard.mjs` (copy `data/tap-synthesis.json` + `data/claim-ledger.jsonl` into `dashboard/dist/`)
- Modify: `.gitignore` (add `data/orchestration-runs/`)

**Interfaces:**
- Consumes: `data/tap-synthesis.json`.
- Produces: `dashboard/dist/tap-synthesis.json` (+ existing `data.json`).

- [ ] **Step 1: Read `scripts/build-dashboard.mjs`** to find where it assembles `dist/`. Add a copy step for the two new files (guard if absent).

- [ ] **Step 2: Build and verify**

Run: `npm run build:dashboard && ls dashboard/dist/tap-synthesis.json`
Expected: file present in dist.

- [ ] **Step 3: Commit**

```bash
git add scripts/build-dashboard.mjs .gitignore
git commit -m "Bake tap-synthesis into dashboard dist build"
```

---

### Task 7: Dashboard UI — 8-section IA (HTML + CSS + JS)

**Files:**
- Rewrite: `dashboard/index.html`
- Rewrite: `dashboard/styles.css`
- Rewrite: `dashboard/app.js`

**Interfaces:**
- Consumes: `tap-synthesis.json` (fetched relative, works under GitHub Pages subpath).
- Produces: rendered sections 1–8 + engine-provenance footer.

Sections (nav anchors): `lead-answer`, `status`, `new-files`, `research-answers`, `evidence-quality`, `agent-loop`, `sources`, `next-actions`.

- [ ] **Step 1: Rewrite `index.html`** with the 8 section containers, the DRAFT banner, nav, and the provenance footer. Apply `frontend-design` / `artifact-design` guidance for a credible briefing-document aesthetic (load that skill before writing CSS).

- [ ] **Step 2: Rewrite `styles.css`** — briefing-document palette/typography (not telemetry-dashboard). Cite-status chips: green `safe`, amber `caveat`, red `do-not-cite`. Responsive; wide tables scroll inside `overflow-x:auto`.

- [ ] **Step 3: Rewrite `app.js`** — fetch `tap-synthesis.json`, render each section. RQ section: filterable accordion with a cite-status chip per RQ. Agent loop: render the 8 agents as a pipeline + the Mon→Fri cadence. Show an error banner if the JSON fails to load.

- [ ] **Step 4: Serve and verify visually**

Run: `npm run serve:dashboard` then load `http://localhost:3456`
Expected: all 8 sections render with real content; cite-status chips show; no console errors. (Verify with a quick screenshot via Chrome DevTools MCP or Playwright if available.)

- [ ] **Step 5: Commit**

```bash
git add dashboard/index.html dashboard/styles.css dashboard/app.js
git commit -m "Rebuild dashboard UI around 8-section TAP synthesis IA"
```

---

### Task 8: Final verification + README touch-up

**Files:**
- Modify: `README.md` (note the new `orchestrate` step in the pipeline list)

- [ ] **Step 1:** Run `npm run validate && npm run orchestrate && npm run build:dashboard` end-to-end; confirm no errors.
- [ ] **Step 2:** Load the built `dashboard/dist/index.html` via `serve:dashboard`; confirm the 8 sections render from the generated JSON.
- [ ] **Step 3:** Update README's "What this does" list to mention the build-time multi-model synthesis engine and the 8-section dashboard.
- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "Document multi-model synthesis engine in README"
```

## Self-Review Notes

- **Spec coverage:** §A engine → Tasks 1,3,5; §B artifacts → Tasks 4,5; §C IA → Task 7; §D design → Task 7 step 1–2; §E build/deploy → Task 6. ✓
- **OpenAI-absent rule** is in Global Constraints and Task 2's `citeStatusFor` (no path reaches `safe` without Gemini). ✓
- **No keys in bundle:** orchestration is separate from build; only JSON artifacts enter `dist/`. ✓
- **Degradation:** every provider call returns `null` on failure; Claude+DeepSeek have deterministic fallbacks so the dashboard always has content. ✓
