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
