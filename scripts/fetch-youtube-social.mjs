#!/usr/bin/env node
/** @deprecated Use fetch-public-feeds.mjs — kept for npm script compatibility */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const r = spawnSync("node", [join(__dirname, "fetch-public-feeds.mjs")], { stdio: "inherit" });
process.exit(r.status ?? 1);
