#!/usr/bin/env node
/**
 * Health check: agency coverage across platforms + feed reachability.
 * Output: data/social-monitor/YYYY-MM-DD-coverage.yaml + console report
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";
import { fetchFeed } from "./lib/rss-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const today = new Date().toISOString().slice(0, 10);

const registry = yaml.parse(
  readFileSync(join(root, "data/un-agencies-social.yaml"), "utf8")
);

const PLATFORMS = ["news_rss", "youtube_rss", "x_url", "facebook_url", "linkedin_url", "instagram_url"];

function agencyPlatforms(agency) {
  return {
    news_rss: Boolean(agency.news_rss),
    youtube_rss: Boolean(agency.youtube_rss),
    x_url: Boolean(agency.x_url),
    facebook_url: Boolean(agency.facebook_url),
    linkedin_url: Boolean(agency.linkedin_url),
    instagram_url: Boolean(agency.instagram_url),
  };
}

const agencies = registry.agencies ?? [];
const coverage = {
  meta: {
    scan_date: today,
    agency_count: agencies.length,
    system_feeds: (registry.system_feeds ?? registry.meta?.system_feeds ?? []).length,
  },
  platform_coverage: {},
  agencies: [],
  feed_health: [],
  gaps: [],
  agent_review_required: [],
};

for (const p of PLATFORMS) {
  const count = agencies.filter((a) => agencyPlatforms(a)[p]).length;
  coverage.platform_coverage[p] = {
    registered: count,
    pct: Math.round((count / agencies.length) * 100),
  };
}

for (const agency of agencies) {
  const platforms = agencyPlatforms(agency);
  const automated = platforms.news_rss || platforms.youtube_rss;
  const socialOnly = platforms.x_url || platforms.facebook_url || platforms.linkedin_url;
  const entry = {
    id: agency.id,
    name: agency.name,
    tier: agency.tier,
    relevance: agency.relevance,
    platforms,
    automated_feed: automated,
    agent_review: socialOnly,
  };
  coverage.agencies.push(entry);

  if (!automated && !socialOnly) {
    coverage.gaps.push(`${agency.name}: no channels registered`);
  } else if (!automated && socialOnly) {
    coverage.agent_review_required.push({
      id: agency.id,
      name: agency.name,
      x: agency.x_url ?? null,
      facebook: agency.facebook_url ?? null,
      linkedin: agency.linkedin_url ?? null,
      instagram: agency.instagram_url ?? null,
    });
  }
}

async function checkUrl(url, label) {
  const r = await fetchFeed(url);
  return { label, url, ok: r.ok, status: r.status, error: r.error ?? null };
}

for (const feed of registry.system_feeds ?? registry.meta?.system_feeds ?? []) {
  coverage.feed_health.push(await checkUrl(feed.url, feed.name));
}
for (const agency of agencies) {
  if (agency.news_rss) {
    coverage.feed_health.push(await checkUrl(agency.news_rss, `${agency.name} news`));
  }
  if (agency.youtube_rss) {
    coverage.feed_health.push(await checkUrl(agency.youtube_rss, `${agency.name} YouTube`));
  }
}

coverage.meta.feeds_ok = coverage.feed_health.filter((f) => f.ok).length;
coverage.meta.feeds_total = coverage.feed_health.length;
coverage.meta.feeds_failed = coverage.feed_health.filter((f) => !f.ok).length;
coverage.meta.agent_review_agencies = coverage.agent_review_required.length;

mkdirSync(join(root, "data/social-monitor"), { recursive: true });
const outPath = join(root, "data/social-monitor", `${today}-coverage.yaml`);
writeFileSync(outPath, yaml.stringify(coverage));

console.log("=== UN80 monitor coverage ===");
console.log(`Agencies registered: ${coverage.meta.agency_count}`);
console.log(`System news feeds:   ${coverage.meta.system_feeds}`);
console.log(`Automated feeds OK:  ${coverage.meta.feeds_ok}/${coverage.meta.feeds_total}`);
console.log("");
console.log("Platform registration (% of agencies):");
for (const [p, v] of Object.entries(coverage.platform_coverage)) {
  console.log(`  ${p.padEnd(16)} ${v.registered}/${agencies.length} (${v.pct}%)`);
}
console.log("");
console.log(`Agent review (X/FB/LinkedIn/Instagram): ${coverage.meta.agent_review_agencies} agencies`);
if (coverage.gaps.length) {
  console.log("\nGaps:");
  coverage.gaps.forEach((g) => console.log(`  - ${g}`));
}
const failed = coverage.feed_health.filter((f) => !f.ok);
if (failed.length) {
  console.log("\nFailed feeds:");
  failed.forEach((f) => console.log(`  - ${f.label}: ${f.status} ${f.error ?? ""}`));
}
console.log(`\nWrote ${outPath}`);

if (coverage.meta.feeds_failed > 0) {
  console.log(`\nNote: ${coverage.meta.feeds_failed} feed(s) unreachable — agent review still covers those agencies via X/Facebook/LinkedIn.`);
}
