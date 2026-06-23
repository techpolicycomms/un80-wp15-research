#!/usr/bin/env node
/**
 * Innovation-jobs collector — pulls UN-system job postings that mention
 * "innovation", from 2020 onwards, from the ReliefWeb API (which archives
 * closed postings with dates), and writes data/innovation-jobs.json.
 *
 * ReliefWeb v2 requires a free, self-serve appname:
 *   https://apidoc.reliefweb.int/parameters#appname
 * Put it in .env as RELIEFWEB_APPNAME=<your-appname>, then:
 *   npm run collect:jobs
 *
 * Without an appname this script exits cleanly without overwriting the dataset,
 * so the curated starter set in data/innovation-jobs.json is preserved.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./lib/orchestration/config.mjs";
import { classifyTitleType } from "./lib/orchestration/jobs.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "data/innovation-jobs.json");
const log = (m) => process.stdout.write(`${m}\n`);

// UN-system source shortnames to keep (ReliefWeb lists many NGOs too).
const UN_SOURCES = new Set([
  "WFP", "UNICEF", "UNDP", "UNHCR", "ITU", "FAO", "WHO", "UNOPS", "UNFPA", "IOM",
  "UNEP", "UN Women", "OCHA", "UNESCO", "ILO", "UNIDO", "UNV", "UNDRR", "UN-Habitat",
  "UNODC", "UN Secretariat", "UNAIDS", "WIPO", "UNRWA", "ITC", "UNCDF", "UNU",
]);

const FAMILY_RULES = [
  [/\b(ai|artificial intelligence|data scien|machine learning|analytics|data engineer)\b/i, "AI / data"],
  [/\b(digital|technology|ict|software|platform|engineer|developer)\b/i, "Digital transformation"],
  [/\b(partnership|ecosystem|alliance|private sector)\b/i, "Partnerships / ecosystem"],
  [/\b(research|policy|evidence|evaluation)\b/i, "Research / policy"],
  [/\b(operations|supply|logistics|procurement)\b/i, "Operations"],
  [/\b(innovation strateg|portfolio|accelerator|venture|incubat)\b/i, "Innovation strategy"],
  [/\b(programme|program|project|coordinator|officer)\b/i, "Programme delivery"],
];
function familyFor(title = "", categories = []) {
  const hay = `${title} ${categories.join(" ")}`;
  for (const [re, fam] of FAMILY_RULES) if (re.test(hay)) return fam;
  return "Programme delivery";
}

async function fetchPage(appname, offset, limit) {
  const params = new URLSearchParams();
  params.append("appname", appname);
  params.append("query[value]", "innovation");
  params.append("query[fields][]", "title");
  params.append("query[fields][]", "body");
  params.append("filter[operator]", "AND");
  params.append("filter[conditions][0][field]", "date.created");
  params.append("filter[conditions][0][value][from]", "2020-01-01T00:00:00+00:00");
  for (const f of ["title", "source.shortname", "date.created", "country.name", "url", "career_categories.name"]) {
    params.append("fields[include][]", f);
  }
  params.append("sort[]", "date.created:asc");
  params.append("offset", String(offset));
  params.append("limit", String(limit));
  const r = await fetch(`https://api.reliefweb.int/v2/jobs?${params}`);
  if (!r.ok) throw new Error(`ReliefWeb HTTP ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return r.json();
}

async function main() {
  const env = loadEnv(join(root, ".env"));
  const appname = env.RELIEFWEB_APPNAME;
  if (!appname || appname.length < 3) {
    log("RELIEFWEB_APPNAME not set — skipping live pull (curated starter set preserved).");
    log("Register a free appname at https://apidoc.reliefweb.int/parameters#appname, add it to .env, and re-run.");
    return;
  }

  const limit = 200;
  let offset = 0;
  let total = Infinity;
  const seen = new Set();
  const records = [];
  while (offset < total) {
    const page = await fetchPage(appname, offset, limit);
    total = page.totalCount ?? page.data?.length ?? 0;
    for (const item of page.data || []) {
      const f = item.fields || {};
      const agency = f.source?.[0]?.shortname;
      if (!agency || !UN_SOURCES.has(agency)) continue;
      const title = f.title || "";
      const key = `${agency}:${title}:${(f.date?.created || "").slice(0, 10)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      records.push({
        id: `rw-${item.id}`,
        title,
        agency,
        grade: null,
        location: f.country?.map((c) => c.name).join(", ") || null,
        family: familyFor(title, (f.career_categories || []).map((c) => c.name)),
        source: "official",
        sourceUrl: f.url || null,
        date: (f.date?.created || "").slice(0, 10) || null,
        note: "ReliefWeb-archived UN posting (innovation keyword).",
      });
    }
    offset += limit;
    if (!page.data || page.data.length < limit) break;
  }

  // Merge: keep any non-ReliefWeb starter records, replace the official/ReliefWeb layer.
  let meta = { generated: new Date().toISOString().slice(0, 10) };
  let starter = [];
  if (existsSync(OUT)) {
    try {
      const prev = JSON.parse(readFileSync(OUT, "utf8"));
      meta = { ...prev.meta, generated: new Date().toISOString().slice(0, 10) };
      starter = (prev.records || []).filter((r) => r.source !== "official");
    } catch { /* fresh */ }
  }
  meta.reliefwebPull = { at: new Date().toISOString(), kept: records.length, query: "innovation, UN sources, date.created>=2020-01-01" };
  const all = [...starter, ...records];

  writeFileSync(OUT, JSON.stringify({ meta, records: all }, null, 2));
  const core = all.filter((r) => classifyTitleType(r.title) === "core").length;
  log(`Collected ${records.length} ReliefWeb UN innovation postings (+${starter.length} starter).`);
  log(`Total ${all.length} records · ${core} core / ${all.length - core} embedded → ${OUT.replace(root + "/", "")}`);
}

main().catch((e) => { console.error("Collector failed:", e.message); process.exit(1); });
