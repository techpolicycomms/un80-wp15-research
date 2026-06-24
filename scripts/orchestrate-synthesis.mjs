#!/usr/bin/env node
/**
 * Build-time multi-model orchestration engine for the TAP synthesis dashboard.
 *
 * Stages (each degrades gracefully to a deterministic fallback):
 *   1. Claude   — refine the curated synthesis into the final 8-section object.
 *   2. DeepSeek — refine the per-RQ atomic claims (text + source IDs).
 *   3. Gemini   — score each claim: safe / caveat / do-not-cite.
 *   Reconcile   — merge (Claude asserts AND Gemini safe => safe; else caveat/do-not-cite).
 *
 * Writes: data/tap-synthesis.json, data/claim-ledger.jsonl,
 *         data/orchestration-runs/<timestamp>/{claude,deepseek,gemini}.json
 * No API keys are written into any artifact.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, providerStatus, MODELS } from "./lib/orchestration/config.mjs";
import { callClaude, callClaudeCLI, callDeepSeek, callGemini } from "./lib/orchestration/providers.mjs";
import { reconcile } from "./lib/orchestration/reconcile.mjs";
import { fallbackSynthesis } from "./lib/orchestration/fallback-synthesis.mjs";
import { loadJobsDataset, computeJobsIntelligence } from "./lib/orchestration/jobs.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const log = (m) => process.stdout.write(`${m}\n`);

function tryParse(s) {
  if (s == null) return null;
  if (typeof s === "object") return s;
  try { return JSON.parse(s); } catch { return null; }
}

function readContext() {
  const md = readFileSync(join(root, "data/tap-source-synthesis.md"), "utf8");
  const extra = [];
  for (const f of ["tap-use-cases.yaml", "overlap-signals.yaml", "action-tracker.yaml"]) {
    const p = join(root, "data", f);
    if (existsSync(p)) extra.push(`# ${f}\n${readFileSync(p, "utf8")}`);
  }
  return { md, extra: extra.join("\n\n") };
}

async function main() {
  const env = loadEnv(join(root, ".env"));
  const status = providerStatus(env);
  const models = MODELS(env);
  const ts = new Date().toISOString();
  const runDir = join(root, "data/orchestration-runs", ts.replace(/[:.]/g, "-"));
  mkdirSync(runDir, { recursive: true });
  const saveRaw = (name, v) =>
    writeFileSync(join(runDir, `${name}.json`), JSON.stringify(v ?? null, null, 2));

  log(`Orchestration run ${ts}`);
  log(`Providers — anthropic:${status.anthropic} deepseek:${status.deepseek} gemini:${status.gemini} openai:${status.openai}`);

  const { md, extra } = readContext();

  // --- Stage 1: Claude — refine the curated synthesis into the final structure ---
  const synthSchema = JSON.parse(
    readFileSync(join(root, "data/schemas/tap-synthesis.schema.json"), "utf8")
  );
  const stages = { claude: "skipped", deepseek: "skipped", gemini: "skipped" };
  let synthesis = fallbackSynthesis;

  const claudeSystem =
    "You are a UN policy research synthesizer. Return ONLY a JSON object matching the provided schema. " +
    "Preserve all 15 RQ items (RQ-001..RQ-015), each with id, question, answer, evidence[], and claims:[<its id>]. " +
    "Keep claims arrays as [the RQ's own id]. Preserve the innovationJobs object and its numeric figures EXACTLY " +
    "(total, bySource, byRole counts) — you may refine wording but never change a number or invent agency/geography counts. " +
    "Improve clarity and accuracy from the source; do not invent facts or sources.";
  const claudeUser =
    `SOURCE SYNTHESIS (markdown):\n${md}\n\nADDITIONAL REPO CONTEXT:\n${extra}\n\n` +
    `BASELINE STRUCTURE to refine (already schema-valid):\n${JSON.stringify(fallbackSynthesis)}`;
  const usable = (o) => o && Array.isArray(o.rq) && o.rq.length >= 10;
  const preferCli = (env.CLAUDE_PROVIDER || "").toLowerCase() === "cli";

  // Chain: Claude API → local Claude Code CLI (subscription auth) → curated fallback.
  let claudeOut = null;
  if (status.anthropic && !preferCli) {
    log("Stage 1: Claude synthesizing (API)…");
    claudeOut = await callClaude({ env, model: models.anthropic, system: claudeSystem, user: claudeUser, schema: synthSchema });
    saveRaw("claude-api", claudeOut);
    if (usable(tryParse(claudeOut))) stages.claude = "live";
  }
  if (!usable(tryParse(claudeOut))) {
    log(preferCli ? "Stage 1: Claude synthesizing (CLI, forced)…" : "  Claude API unavailable — trying local Claude Code CLI…");
    const cliOut = await callClaudeCLI({ system: claudeSystem, user: claudeUser });
    saveRaw("claude-cli", cliOut);
    if (usable(cliOut)) { claudeOut = cliOut; stages.claude = "cli"; }
  }
  const parsedClaude = tryParse(claudeOut);
  if (usable(parsedClaude)) {
    synthesis = parsedClaude;
    log(`  Claude OK (${stages.claude}) — ${parsedClaude.rq.length} RQ items`);
  } else {
    stages.claude = "fallback";
    log("  Claude unavailable — using curated fallback");
  }

  // --- Build one atomic claim per RQ (deterministic linkage) ---
  let claims = synthesis.rq.map((q) => ({
    claimId: q.id,
    text: q.answer,
    sourceIds: q.evidence || [],
  }));

  // --- Stage 2: DeepSeek — refine claim text + source IDs ---
  if (status.deepseek) {
    log("Stage 2: DeepSeek extracting/refining claims…");
    const dsOut = await callDeepSeek({
      env,
      model: models.deepseek,
      system:
        'Return ONLY JSON: {"claims":[{"claimId":"RQ-XXX","text":"one-sentence atomic claim","sourceIds":["..."]}]}. ' +
        "Keep the same claimIds you are given. Make each claim a single, checkable assertion.",
      user: JSON.stringify({ claims }),
    });
    saveRaw("deepseek", dsOut);
    const parsed = tryParse(dsOut);
    if (parsed && Array.isArray(parsed.claims)) {
      const byId = new Map(parsed.claims.map((c) => [c.claimId, c]));
      claims = claims.map((c) => {
        const r = byId.get(c.claimId);
        return r ? { claimId: c.claimId, text: r.text || c.text, sourceIds: r.sourceIds || c.sourceIds } : c;
      });
      stages.deepseek = "live";
      log(`  DeepSeek OK — ${parsed.claims.length} claims refined`);
    } else {
      log("  DeepSeek output unusable — using RQ-derived claims");
    }
  } else {
    log("Stage 2: DeepSeek skipped — using RQ-derived claims");
  }

  // --- Stage 3: Gemini — score each claim ---
  let scores = [];
  if (status.gemini) {
    log("Stage 3: Gemini scoring evidence…");
    const gOut = await callGemini({
      env,
      model: models.gemini,
      system:
        'You are an evidence auditor. Return ONLY JSON: {"scores":[{"claimId":"RQ-XXX","bucket":"safe|caveat|do-not-cite","confidence":0.0-1.0}]}. ' +
        '"safe" = well-supported, usable now; "caveat" = usable with a caveat; "do-not-cite" = not yet substantiated. ' +
        "Be conservative: prefer caveat unless evidence is clearly strong.",
      user: JSON.stringify({ claims }),
    });
    saveRaw("gemini", gOut);
    const parsed = tryParse(gOut);
    if (parsed && Array.isArray(parsed.scores)) {
      scores = parsed.scores;
      stages.gemini = "live";
      log(`  Gemini OK — ${scores.length} claims scored`);
    } else {
      log("  Gemini output unusable — no scores (all claims => caveat)");
    }
  } else {
    log("Stage 3: Gemini skipped — no scores (all claims => caveat)");
  }

  // --- Innovation-jobs dataset: compute distributions when present ---
  const jobsDs = loadJobsDataset(join(root, "data/innovation-jobs.json"));
  if (jobsDs) {
    const intel = computeJobsIntelligence(jobsDs.records);
    synthesis = {
      ...synthesis,
      innovationJobs: {
        ...(synthesis.innovationJobs || {}),
        collected: { meta: jobsDs.meta, ...intel, records: jobsDs.records },
      },
    };
    log(`Innovation-jobs dataset: ${intel.total} records across ${intel.byAgency.length} agencies`);
  }

  // --- Reconcile + stamp ---
  const result = reconcile({ synthesis, claims, scores, status });
  const staleDate = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  result.provenance.generatedAt = ts;
  result.provenance.models = models;
  result.provenance.stages = stages; // actual per-stage outcome: live | fallback | skipped
  result.ledger = result.ledger.map((l) => ({ ...l, staleDate, nextCheck: staleDate }));

  const outSynth = { ...result.synthesis, provenance: result.provenance };
  writeFileSync(join(root, "data/tap-synthesis.json"), JSON.stringify(outSynth, null, 2));
  writeFileSync(
    join(root, "data/claim-ledger.jsonl"),
    result.ledger.map((l) => JSON.stringify(l)).join("\n") + "\n"
  );

  const hist = result.ledger.reduce((a, l) => ((a[l.citeStatus] = (a[l.citeStatus] || 0) + 1), a), {});
  log("");
  log(`Wrote data/tap-synthesis.json (${outSynth.rq.length} RQ items)`);
  log(`Wrote data/claim-ledger.jsonl (${result.ledger.length} claims)`);
  log(`Cite-status: safe=${hist.safe || 0} caveat=${hist.caveat || 0} do-not-cite=${hist["do-not-cite"] || 0}`);
  log(`Raw outputs: ${runDir.replace(root + "/", "")}`);
}

main().catch((e) => {
  console.error("Orchestration failed:", e);
  process.exit(1);
});
