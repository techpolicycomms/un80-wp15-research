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

const dashboardData = {
  generated_at: new Date().toISOString(),
  disclaimer: "DRAFT — public secondary data only; not agreed UN position",
  baseline,
  tap,
  tracker,
  overlap_signal_count: overlap.signals?.length ?? 0,
  portfolio_count: tap.portfolio?.length ?? 0,
};

writeFileSync(join(out, "data.json"), JSON.stringify(dashboardData, null, 2));
copyFileSync(join(root, "dashboard/index.html"), join(out, "index.html"));
copyFileSync(join(root, "dashboard/styles.css"), join(out, "styles.css"));
copyFileSync(join(root, "dashboard/app.js"), join(out, "app.js"));

console.log("Dashboard built → dashboard/dist/");
