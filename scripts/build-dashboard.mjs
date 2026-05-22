#!/usr/bin/env node
/**
 * Builds a static dashboard from data/ into dashboard/dist/
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const out = join(root, "dashboard/dist");

mkdirSync(out, { recursive: true });

const baseline = JSON.parse(
  readFileSync(join(root, "data/ict-spend-baseline.json"), "utf8")
);
const tap = yaml.parse(readFileSync(join(root, "data/tap-use-cases.yaml"), "utf8"));
const tracker = yaml.parse(readFileSync(join(root, "data/action-tracker.yaml"), "utf8"));
const overlap = yaml.parse(readFileSync(join(root, "data/overlap-signals.yaml"), "utf8"));
let socialSignalCount = 0;
let monitorMeta = {};
try {
  const social = yaml.parse(readFileSync(join(root, "data/social-signals.yaml"), "utf8"));
  socialSignalCount = social.signals?.length ?? 0;
} catch {
  /* optional */
}
try {
  const registry = yaml.parse(readFileSync(join(root, "data/un-agencies-social.yaml"), "utf8"));
    monitorMeta = {
    agencies_registered: registry.agencies?.length ?? 0,
    system_feeds: (registry.system_feeds ?? registry.meta?.system_feeds ?? []).length,
  };
  const today = new Date().toISOString().slice(0, 10);
  const coveragePath = join(root, "data/social-monitor", `${today}-coverage.yaml`);
  try {
    const cov = yaml.parse(readFileSync(coveragePath, "utf8"));
    monitorMeta.feeds_ok = cov.meta?.feeds_ok;
    monitorMeta.feeds_total = cov.meta?.feeds_total;
    monitorMeta.agent_review_agencies = cov.meta?.agent_review_agencies;
  } catch {
    /* run npm run check:monitor */
  }
} catch {
  /* optional */
}

const dashboardData = {
  generated_at: new Date().toISOString(),
  disclaimer: "DRAFT — public secondary data only; not agreed UN position",
  baseline,
  tap,
  tracker,
  overlap,
  overlap_signal_count: overlap.signals?.length ?? 0,
  social_signal_count: socialSignalCount,
  monitor: monitorMeta,
  portfolio_count: tap.portfolio?.length ?? 0,
};

writeFileSync(join(out, "data.json"), JSON.stringify(dashboardData, null, 2));
copyFileSync(join(root, "dashboard/index.html"), join(out, "index.html"));
copyFileSync(join(root, "dashboard/styles.css"), join(out, "styles.css"));
copyFileSync(join(root, "dashboard/app.js"), join(out, "app.js"));

console.log("Dashboard built → dashboard/dist/");
