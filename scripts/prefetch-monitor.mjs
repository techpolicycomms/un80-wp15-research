#!/usr/bin/env node
/**
 * Pre-fetch monitor data before cloud agent runs (landscape Mon / social Wed).
 * Invoked by .github/workflows/prefetch-monitor.yml or manually:
 *   npm run prefetch:monitor
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

console.log("UN80 WP15 pre-fetch — monitor + academic + validate");

run("npm run fetch:monitor");
run("npm run fetch:academic");
run("npm run validate");

console.log("\nPre-fetch complete. Cloud agents can start with fresh RSS, YouTube, and citation data.");
