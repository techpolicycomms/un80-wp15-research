#!/usr/bin/env node
/**
 * Fetch public news + YouTube RSS for UN agency monitoring.
 * Outputs: data/social-monitor/YYYY-MM-DD-feeds.yaml
 * Updates rollup in data/social-signals.yaml (dedupe by URL)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";
import { fetchFeed, parseFeedItems } from "./lib/rss-fetch.mjs";
import { matchKeywords, scoreSignal } from "./lib/monitor-keywords.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const today = new Date().toISOString().slice(0, 10);
const MAX_PER_FEED = 8;

const registry = yaml.parse(
  readFileSync(join(root, "data/un-agencies-social.yaml"), "utf8")
);

function signalFromItem(item, ctx) {
  const matched = matchKeywords(item.text);
  if (matched.length === 0) return null;
  const scored = scoreSignal(matched);
  const agencyRelevance = ctx.relevance ?? "both";
  let relevance = scored.relevance ?? agencyRelevance;
  if (agencyRelevance === "action_61" && scored.relevance === "action_62") relevance = "both";
  if (agencyRelevance === "action_62" && scored.relevance === "action_61") relevance = "both";

  return {
    agency_id: ctx.agency_id ?? ctx.feed_id,
    agency_name: ctx.agency_name ?? ctx.feed_name,
    platform: ctx.platform,
    title: item.title,
    url: item.link,
    published: item.published,
    matched_keywords: [...new Set(matched.map((m) => m.keyword.trim()))],
    keyword_tiers: [...new Set(matched.map((m) => m.tier))],
    priority: scored.priority,
    relevance,
    summary: item.description?.slice(0, 280) || item.title,
    wp15_signal: true,
  };
}

async function scanFeed(url, ctx) {
  const result = await fetchFeed(url);
  if (!result.ok) {
    return { ...ctx, url, status: result.status, error: result.error ?? `HTTP ${result.status}`, items: [], signals: [] };
  }
  const parsed = parseFeedItems(result.body).slice(0, MAX_PER_FEED);
  const signals = [];
  for (const item of parsed) {
    const sig = signalFromItem(item, ctx);
    if (sig) signals.push(sig);
  }
  return {
    ...ctx,
    url,
    status: result.status,
    items_scanned: parsed.length,
    items: parsed.map((p) => ({ title: p.title, url: p.link, published: p.published })),
    signals,
  };
}

const feedResults = [];
const allSignals = [];

const systemFeeds = registry.system_feeds ?? registry.meta?.system_feeds ?? [];
for (const feed of systemFeeds) {
  const res = await scanFeed(feed.url, {
    feed_id: feed.id,
    feed_name: feed.name,
    platform: "news",
    relevance: feed.relevance,
  });
  feedResults.push(res);
  allSignals.push(...res.signals);
}

for (const agency of registry.agencies) {
  if (agency.news_rss) {
    const res = await scanFeed(agency.news_rss, {
      agency_id: agency.id,
      agency_name: agency.name,
      platform: "news",
      relevance: agency.relevance,
    });
    feedResults.push(res);
    allSignals.push(...res.signals);
  }
  if (agency.youtube_rss) {
    const res = await scanFeed(agency.youtube_rss, {
      agency_id: agency.id,
      agency_name: agency.name,
      platform: "youtube",
      relevance: agency.relevance,
    });
    feedResults.push(res);
    allSignals.push(...res.signals);
  }
}

const out = {
  meta: {
    scan_date: today,
    automation: "fetch-public-feeds",
    disclaimer: "DRAFT — public posts and press releases only",
    feeds_checked: feedResults.length,
    feeds_ok: feedResults.filter((f) => f.status === 200).length,
    items_scanned: feedResults.reduce((n, f) => n + (f.items_scanned ?? 0), 0),
    wp15_signals: allSignals.length,
    high_priority: allSignals.filter((s) => s.priority === "high").length,
  },
  feed_results: feedResults.map(({ items, signals, ...rest }) => ({
    ...rest,
    signals_found: signals?.length ?? 0,
  })),
  signals: allSignals,
};

mkdirSync(join(root, "data/social-monitor"), { recursive: true });
const feedsPath = join(root, "data/social-monitor", `${today}-feeds.yaml`);
writeFileSync(feedsPath, yaml.stringify(out));

// Merge into social-signals rollup
const rollupPath = join(root, "data/social-signals.yaml");
let rollup = { meta: { last_updated: today, disclaimer: "Public official posts only — DRAFT" }, signals: [] };
try {
  rollup = yaml.parse(readFileSync(rollupPath, "utf8"));
} catch {
  /* new file */
}
const existingUrls = new Set((rollup.signals ?? []).map((s) => s.url));
let added = 0;
for (const sig of allSignals) {
  if (!sig.url || existingUrls.has(sig.url)) continue;
  existingUrls.add(sig.url);
  rollup.signals.push({
    id: `soc-${today}-${String(rollup.signals.length + 1).padStart(3, "0")}`,
    date: today,
    platform: sig.platform,
    agency: sig.agency_name,
    title: sig.title,
    url: sig.url,
    matched_keywords: sig.matched_keywords,
    priority: sig.priority,
    relevance: sig.relevance,
    summary: sig.summary,
  });
  added++;
}
rollup.meta.last_updated = today;
rollup.meta.total_signals = rollup.signals.length;
writeFileSync(rollupPath, yaml.stringify(rollup));

console.log(
  `Wrote ${feedsPath} — ${allSignals.length} WP15 signals (${out.meta.high_priority} high) from ${out.meta.feeds_ok}/${out.meta.feeds_checked} feeds; +${added} to rollup`
);
