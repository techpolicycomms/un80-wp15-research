#!/usr/bin/env node
/**
 * Fetch and enrich peer-reviewed literature via OpenAlex (+ Unpaywall for OA links).
 * Writes:
 *   - data/academic-literature/wp15-core-references.yaml (merged, curated + discovered)
 *   - data/academic-literature/YYYY-MM-DD-discovery.yaml (raw discovery pass)
 *
 * Usage:
 *   npm run fetch:academic
 *   node scripts/fetch-academic-evidence.mjs --enrich-dois
 *   node scripts/fetch-academic-evidence.mjs --discover-only
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";
import {
  fetchWorkByDoi,
  searchWorks,
  isRelevantWork,
  workToReference,
  enrichWithUnpaywall,
  nextFootnoteId,
} from "./lib/openalex.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const litDir = join(root, "data/academic-literature");
const corePath = join(litDir, "wp15-core-references.yaml");
const queriesPath = join(litDir, "search-queries.yaml");

const args = new Set(process.argv.slice(2));
const discoverOnly = args.has("--discover-only");
const enrichDois = args.has("--enrich-dois") || !discoverOnly;
const unpaywallEmail = process.env.UNPAYWALL_EMAIL || process.env.OPENALEX_MAILTO;

function loadYaml(path) {
  return yaml.parse(readFileSync(path, "utf8"));
}

function saveYaml(path, obj) {
  writeFileSync(path, yaml.stringify(obj, { lineWidth: 0 }), "utf8");
}

async function enrichCoreReferences(core) {
  let updated = 0;
  for (const ref of core.references) {
    if (!ref.doi) continue;
    try {
      const work = await fetchWorkByDoi(ref.doi);
      ref.cited_by_count = work.cited_by_count ?? ref.cited_by_count;
      ref.openalex_id = work.id ?? ref.openalex_id;
      ref.journal = ref.journal || work.primary_location?.source?.display_name || null;
      ref.is_oa = Boolean(work.open_access?.is_oa ?? ref.is_oa);
      if (!ref.open_access_url || ref.open_access_url.includes("webofknowledge")) {
        ref.open_access_url =
          work.best_oa_location?.landing_page_url ??
          work.open_access?.oa_url ??
          ref.open_access_url ??
          `https://doi.org/${ref.doi}`;
      }
      if (unpaywallEmail) {
        Object.assign(ref, await enrichWithUnpaywall(ref, unpaywallEmail));
      }
      updated++;
      await sleep(120);
    } catch (err) {
      console.warn(`WARN enrich ${ref.doi}: ${err.message}`);
    }
  }
  console.log(`Enriched ${updated} references from OpenAlex`);
  return core;
}

async function runDiscovery(core) {
  const config = loadYaml(queriesPath);
  const discovered = [];
  const existingDois = new Set(
    core.references.map((r) => r.doi?.toLowerCase()).filter(Boolean)
  );

  for (const q of config.queries) {
    console.log(`Searching: ${q.id} — ${q.search}`);
    const results = await searchWorks({
      search: q.search,
      minCitations: q.min_citations ?? 50,
      perPage: q.per_page ?? 5,
    });
    for (const work of results) {
      if (!isRelevantWork(work, q.relevance_keywords ?? [])) continue;
      const doi = work.doi?.replace(/^https:\/\/doi\.org\//i, "")?.toLowerCase();
      if (doi && existingDois.has(doi)) continue;
      discovered.push(
        workToReference(work, {
          relevance: q.relevance,
          topicTags: [q.id],
          footnoteId: "(pending)",
          rationale: `Discovered via query "${q.id}"; requires human curation before footnoting.`,
        })
      );
      if (doi) existingDois.add(doi);
    }
    await sleep(200);
  }

  discovered.sort((a, b) => b.cited_by_count - a.cited_by_count);
  const today = new Date().toISOString().slice(0, 10);
  const outPath = join(litDir, `${today}-discovery.yaml`);
  saveYaml(outPath, {
    meta: {
      scan_date: today,
      disclaimer:
        "Auto-discovered candidates — NOT approved for report footnotes until merged into wp15-core-references.yaml after human review.",
      query_file: "data/academic-literature/search-queries.yaml",
    },
    candidates: discovered,
  });
  console.log(`Wrote ${discovered.length} candidates → ${outPath}`);
  return discovered;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  mkdirSync(litDir, { recursive: true });
  const core = loadYaml(corePath);
  const today = new Date().toISOString().slice(0, 10);
  core.meta.updated = today;

  if (enrichDois && !discoverOnly) {
    await enrichCoreReferences(core);
    saveYaml(corePath, core);
    console.log(`Updated ${corePath}`);
  }

  if (discoverOnly || !args.has("--no-discover")) {
    await runDiscovery(core);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
