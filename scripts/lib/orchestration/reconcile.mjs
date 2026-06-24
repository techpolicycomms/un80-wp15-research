export function citeStatusFor({ claudeAsserted, geminiBucket, geminiConfidence = 0, claudeConfidence = 0.5 }) {
  if (!claudeAsserted) return "do-not-cite";
  if (geminiBucket === "do-not-cite" && claudeConfidence < 0.5) return "do-not-cite";
  if (geminiBucket === "safe" && geminiConfidence >= 0.6) return "safe";
  return "caveat";
}

const STALE_DAYS = 30;

export function reconcile({ synthesis, claims = [], scores = [], status }) {
  const scoreById = new Map(scores.map((s) => [s.claimId, s]));

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
    const citeStatus = statuses.includes("do-not-cite")
      ? "do-not-cite"
      : statuses.length && statuses.every((s) => s === "safe")
        ? "safe"
        : "caveat";
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
