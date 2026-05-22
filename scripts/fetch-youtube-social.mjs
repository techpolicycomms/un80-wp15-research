#!/usr/bin/env node
/**
 * Fetch recent public YouTube videos from UN agency RSS feeds.
 * Output: data/social-monitor/YYYY-MM-DD-youtube.yaml
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const today = new Date().toISOString().slice(0, 10);

const registry = yaml.parse(
  readFileSync(join(root, "data/un-agencies-social.yaml"), "utf8")
);

const keywords = (registry.monitoring_keywords ?? []).map((k) => k.toLowerCase());

function matchesKeywords(text) {
  const lower = text.toLowerCase();
  return keywords.filter((k) => lower.includes(k));
}

async function fetchRss(agency) {
  if (!agency.youtube_rss) return [];
  const res = await fetch(agency.youtube_rss, {
    headers: { "User-Agent": "un80-wp15-research/0.1 (public monitor)" },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
  return entries.slice(0, 5).map((m) => {
    const block = m[1];
    const title = block.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    const link = block.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? "";
    const published = block.match(/<published>([^<]*)<\/published>/)?.[1] ?? "";
    const matched = matchesKeywords(title);
    return {
      agency_id: agency.id,
      agency_name: agency.name,
      platform: "youtube",
      title,
      url: link,
      published,
      matched_keywords: matched,
      relevance: matched.length > 0 ? agency.relevance : null,
      wp15_signal: matched.length > 0,
    };
  });
}

const allItems = [];
for (const agency of registry.agencies) {
  try {
    const items = await fetchRss(agency);
    allItems.push(...items);
  } catch {
    /* skip failed feeds */
  }
}

const signals = allItems.filter((i) => i.wp15_signal);

const out = {
  meta: {
    scan_date: today,
    platform: "youtube",
    automation: "social-monitor-seed",
    disclaimer: "DRAFT — public posts only",
    total_items_scanned: allItems.length,
    wp15_signals: signals.length,
  },
  items: allItems,
  signals,
};

mkdirSync(join(root, "data/social-monitor"), { recursive: true });
const outPath = join(root, "data/social-monitor", `${today}-youtube.yaml`);
writeFileSync(outPath, yaml.stringify(out));
console.log(`Wrote ${outPath} (${signals.length} WP15 signals from ${allItems.length} videos)`);
