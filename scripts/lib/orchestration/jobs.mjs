// Innovation-jobs dataset compute: turns sourced job records into the
// distributions the dashboard renders. Pure functions — no I/O, fully testable.
import { existsSync, readFileSync } from "node:fs";

export function classifyTitleType(title = "") {
  return /innovat/i.test(title) ? "core" : "embedded";
}

function tally(items, keyFn, sort = true) {
  const m = new Map();
  for (const it of items) {
    const k = keyFn(it);
    if (k == null || k === "") continue;
    m.set(k, (m.get(k) || 0) + 1);
  }
  const arr = [...m.entries()].map(([label, value]) => ({ label, value }));
  return sort ? arr.sort((a, b) => b.value - a.value || String(a.label).localeCompare(b.label)) : arr;
}

const SOURCE_LABEL = {
  official: "Official recruitment sources",
  aggregator: "UN Talent aggregator / manual discovery",
  "web-research": "Web research (this session, sourced)",
};

export function computeJobsIntelligence(records = []) {
  const total = records.length;
  const core = records.filter((r) => classifyTitleType(r.title) === "core").length;

  const bySource = ["official", "aggregator", "web-research"]
    .map((key) => ({ key, label: SOURCE_LABEL[key], value: records.filter((r) => r.source === key).length }))
    .filter((x) => x.value > 0);

  return {
    total,
    byRole: [
      { label: "Explicit core innovation roles", value: core, note: "“innovation” in the title" },
      { label: "Embedded in other functions", value: total - core, note: "innovation in scope, not title" },
    ],
    bySource,
    byAgency: tally(records, (r) => r.agency),
    byFamily: tally(records, (r) => r.family),
    byYear: tally(records, (r) => (r.date || "").slice(0, 4), false).sort((a, b) => String(a.label).localeCompare(String(b.label))),
  };
}

// Load data/innovation-jobs.json if present. Returns {meta, records} or null.
export function loadJobsDataset(path) {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    if (!Array.isArray(parsed.records)) return null;
    return parsed;
  } catch {
    return null;
  }
}
