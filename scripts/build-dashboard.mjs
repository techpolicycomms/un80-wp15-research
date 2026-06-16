#!/usr/bin/env node
/**
 * Builds a static dashboard from data/, reports/, and git history into dashboard/dist/.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";
import { extname, join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import yaml from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const out = join(root, "dashboard/dist");

mkdirSync(out, { recursive: true });

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readYaml(path) {
  return yaml.parse(readFileSync(path, "utf8"));
}

function listFiles(dir, predicate = () => true) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path, predicate));
    else if (predicate(path)) files.push(path);
  }
  return files.sort();
}

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferDate(path, content = "") {
  const relativePath = relative(root, path);
  const dateMatch = relativePath.match(/20\d{2}-\d{2}-\d{2}/);
  if (dateMatch) return dateMatch[0];
  const monthMatch = relativePath.match(/20\d{2}-\d{2}(?=[^0-9]|$)/);
  if (monthMatch) return monthMatch[0];
  const contentDate = content.match(/\b20\d{2}-\d{2}-\d{2}\b/);
  return contentDate ? contentDate[0] : null;
}

function inferReportCategory(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower.includes("/handoff/")) return "handoff";
  if (lower.includes("/verification/")) return "claim verification";
  if (lower.includes("daily-digest")) return "daily digest";
  if (lower.includes("landscape")) return "landscape scan";
  if (lower.includes("social")) return "social scan";
  if (lower.includes("member-state")) return "member state";
  if (lower.includes("living-analysis")) return "living analysis";
  if (lower.includes("review-bundle")) return "review bundle";
  if (lower.includes("test-report")) return "test report";
  if (lower.endsWith(".html")) return "html report";
  return "report";
}

function decodeBasicEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function firstHeading(content, fallback) {
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return decodeBasicEntities(heading[1].trim());
  const title = content.match(/<title>([^<]+)<\/title>/i);
  if (title) return decodeBasicEntities(title[1].trim());
  return decodeBasicEntities(fallback
    .replace(/\.(md|html)$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function summarize(content) {
  return stripMarkdown(content).slice(0, 360);
}

const THEME_DEFINITIONS = [
  {
    id: "shared_ict",
    label: "Shared ICT And Cloud",
    action: "action_61",
    terms: [
      "ict",
      "cloud",
      "private cloud",
      "hybrid cloud",
      "data centre",
      "data-center",
      "software services",
      "procurement",
      "m365",
      "network",
      "cybersecurity",
      "shared service",
      "one un it",
      "erp",
    ],
  },
  {
    id: "tap_acceleration",
    label: "TAP And Innovation Pipeline",
    action: "action_62",
    terms: [
      "technology accelerator platform",
      "tap",
      "accelerator",
      "innovation pipeline",
      "portfolio",
      "pooled capacity",
      "proposal cycle",
      "solution portfolio",
      "demand identification",
    ],
  },
  {
    id: "digital_identity",
    label: "Digital Identity",
    action: "action_62",
    terms: [
      "digital id",
      "digital identity",
      "identity",
      "verifiable credential",
      "credential",
      "did",
      "unjspf",
      "consent-based",
      "issuer",
      "holder",
      "verifier",
    ],
  },
  {
    id: "ai_conferencing",
    label: "AI, Translation And Conferencing",
    action: "action_62",
    terms: [
      "artificial intelligence",
      " ai ",
      "ai-assisted",
      "translation",
      "conferencing",
      "conference",
      "language services",
      "transcript",
      "meeting",
      "modern conferencing",
      "toolbox",
    ],
  },
  {
    id: "governance_interop",
    label: "Governance And Interoperability",
    action: "both",
    terms: [
      "governance",
      "interoperability",
      "fragmentation",
      "duplication",
      "coordination",
      "standards",
      "policy",
      "ceB",
      "hlcm",
      "steering",
      "common",
    ],
  },
  {
    id: "evidence_rigour",
    label: "Evidence And Claim Rigour",
    action: "both",
    terms: [
      "claim verification",
      "gptzero",
      "footnote",
      "references",
      "doi",
      "academic",
      "openalex",
      "source",
      "evidence",
      "human review",
    ],
  },
  {
    id: "operations_automation",
    label: "Operations And Automation",
    action: "operations",
    terms: [
      "automation",
      "cursor",
      "github actions",
      "dashboard",
      "notion",
      "linear",
      "webhook",
      "cron",
      "handoff",
      "deploy",
      "smtp",
    ],
  },
  {
    id: "social_signals",
    label: "Social And Public Signals",
    action: "both",
    terms: [
      "social",
      "facebook",
      "youtube",
      "rss",
      "x public",
      "news",
      "feed",
      "monitor",
      "signal",
      "public indexed",
    ],
  },
];

const ENTITY_DEFINITIONS = [
  ["UNICC", ["unicc", "international computing centre"]],
  ["CEB", ["ceb", "unsceb"]],
  ["HLCM", ["hlcm"]],
  ["OICT", ["oict"]],
  ["ODET", ["odet", "office for digital and emerging technologies"]],
  ["UNIN", ["un innovation network", "unin"]],
  ["UN Global Pulse", ["un global pulse", "global pulse"]],
  ["ITU", ["itu", "international telecommunication union"]],
  ["UNESCO", ["unesco"]],
  ["WHO", ["world health organization", "who"]],
  ["WFP", ["wfp", "world food programme"]],
  ["UNJSPF", ["unjspf", "joint staff pension fund"]],
  ["WIPO", ["wipo"]],
  ["W3C", ["w3c", "verifiable credentials", "decentralized identifiers"]],
  ["ISO", ["iso/iec", " iso "]],
  ["Member States", ["member state", "member states"]],
];

const REVIEW_SIGNALS = [
  "human review",
  "gptzero",
  "before distribution",
  "not final",
  "blocked",
  "pending",
  "weak",
  "paywalled",
  "false positive",
  "403",
  "404",
  "failed",
  "smtp",
  "x api",
  "external distribution",
];

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "agent",
  "also",
  "and",
  "are",
  "before",
  "being",
  "both",
  "can",
  "data",
  "draft",
  "for",
  "from",
  "has",
  "have",
  "into",
  "not",
  "only",
  "public",
  "report",
  "review",
  "scan",
  "source",
  "that",
  "the",
  "this",
  "with",
  "work",
  "working",
]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countTerm(text, term) {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) return 0;
  const escaped = escapeRegExp(normalizedTerm);
  const boundaryStart = /^[a-z0-9]/.test(normalizedTerm) ? "\\b" : "";
  const boundaryEnd = /[a-z0-9]$/.test(normalizedTerm) ? "\\b" : "";
  return (text.match(new RegExp(`${boundaryStart}${escaped}${boundaryEnd}`, "gi")) ?? [])
    .length;
}

function countTerms(text, terms) {
  return terms.reduce((total, term) => total + countTerm(text, term), 0);
}

function extractLinks(content) {
  const markdownLinks = [...content.matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/gi)].map(
    (match) => match[1]
  );
  const bareLinks = [...content.matchAll(/https?:\/\/[^\s)>"']+/gi)].map((match) => match[0]);
  return [...new Set([...markdownLinks, ...bareLinks])].map((url) =>
    url.replace(/[.,;:]+$/g, "")
  );
}

function domainFor(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function wordStats(content) {
  const words = stripMarkdown(content)
    .toLowerCase()
    .match(/[a-z][a-z0-9-]{2,}/g) ?? [];
  return {
    words,
    word_count: words.length,
  };
}

function topTerms(words, limit = 10) {
  const counts = {};
  for (const word of words) {
    if (STOP_WORDS.has(word)) continue;
    counts[word] = (counts[word] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }));
}

function sentenceScore(sentence, themeScores, entityScores) {
  const text = sentence.toLowerCase();
  const actionScore =
    countTerms(text, ["action 61", "action 62", "ict", "tap", "technology accelerator"]) * 5;
  const themeScore = themeScores.reduce((total, theme) => {
    if (!theme.count) return total;
    return total + countTerms(text, THEME_DEFINITIONS.find((item) => item.id === theme.id).terms);
  }, 0);
  const entityScore = entityScores.reduce((total, entity) => {
    if (!entity.count) return total;
    const terms = ENTITY_DEFINITIONS.find(([label]) => label === entity.label)?.[1] ?? [];
    return total + countTerms(text, terms);
  }, 0);
  const evidenceScore = countTerms(text, ["evidence", "source", "public", "progress", "signal"]) * 2;
  return actionScore + themeScore + entityScore + evidenceScore;
}

function keySentences(content, themeScores, entityScores, limit = 3) {
  return stripMarkdown(content)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 80 && sentence.length <= 320)
    .map((sentence) => ({ sentence, score: sentenceScore(sentence, themeScores, entityScores) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.sentence);
}

function analyzeReport(content, category) {
  const lower = ` ${stripMarkdown(content).toLowerCase()} `;
  const { words, word_count } = wordStats(content);
  const links = extractLinks(content);
  const domains = links.map(domainFor).filter(Boolean);
  const domainCounts = Object.entries(
    domains.reduce((acc, domain) => {
      acc[domain] = (acc[domain] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([domain, count]) => ({ domain, count }));

  const themes = THEME_DEFINITIONS.map((theme) => ({
    id: theme.id,
    label: theme.label,
    action: theme.action,
    count: countTerms(lower, theme.terms),
  })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const entities = ENTITY_DEFINITIONS.map(([label, terms]) => ({
    label,
    count: countTerms(lower, terms),
  }))
    .filter((entity) => entity.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const action61_score =
    countTerms(lower, ["action 61", "ict consolidation"]) * 5 +
    themes.filter((theme) => theme.action === "action_61").reduce((sum, theme) => sum + theme.count, 0) +
    themes.filter((theme) => theme.action === "both").reduce((sum, theme) => sum + Math.ceil(theme.count / 2), 0);
  const action62_score =
    countTerms(lower, ["action 62", "technology accelerator platform"]) * 5 +
    themes.filter((theme) => theme.action === "action_62").reduce((sum, theme) => sum + theme.count, 0) +
    themes.filter((theme) => theme.action === "both").reduce((sum, theme) => sum + Math.ceil(theme.count / 2), 0);
  const review_signal_count = countTerms(lower, REVIEW_SIGNALS);
  const url_count = links.length;
  const footnote_count = (content.match(/\[\^[^\]]+\]/g) ?? []).length;
  const doi_count = (content.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi) ?? []).length;
  const confidence_counts = {
    high: countTerm(lower, "high"),
    medium: countTerm(lower, "medium"),
    low: countTerm(lower, "low"),
  };
  const evidence_score = url_count * 3 + footnote_count * 2 + doi_count * 4;
  const risk_level =
    review_signal_count >= 12 || category === "member state"
      ? "high"
      : review_signal_count >= 5 || /verification|handoff/.test(category)
        ? "medium"
        : "low";
  const action_focus =
    action61_score > action62_score * 1.25
      ? "Action 61"
      : action62_score > action61_score * 1.25
        ? "Action 62"
        : action61_score + action62_score > 0
          ? "Both"
          : "Operations";

  return {
    word_count,
    top_terms: topTerms(words),
    themes,
    top_theme: themes.find((theme) => theme.count > 0) ?? null,
    entities,
    action61_score,
    action62_score,
    action_focus,
    review_signal_count,
    review_risk: risk_level,
    evidence_score,
    evidence_density: word_count ? Number((evidence_score / (word_count / 1000)).toFixed(1)) : 0,
    url_count,
    footnote_count,
    doi_count,
    domains: domainCounts,
    confidence_counts,
    key_sentences: keySentences(content, themes, entities),
  };
}

function sumCounts(items, picker) {
  const counts = {};
  for (const item of items) {
    for (const entry of picker(item)) {
      const key = entry.label ?? entry.domain ?? entry.id ?? entry.term;
      counts[key] = (counts[key] ?? 0) + (entry.count ?? 0);
    }
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function dateBucket(date) {
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : date?.slice(0, 7) ?? "Undated";
}

function aggregateTimeline(reports) {
  const buckets = new Map();
  for (const report of reports) {
    const key = dateBucket(report.date);
    const current =
      buckets.get(key) ?? {
        date: key,
        reports: 0,
        words: 0,
        action61_score: 0,
        action62_score: 0,
        review_signals: 0,
        evidence_score: 0,
      };
    current.reports += 1;
    current.words += report.analysis.word_count;
    current.action61_score += report.analysis.action61_score;
    current.action62_score += report.analysis.action62_score;
    current.review_signals += report.analysis.review_signal_count;
    current.evidence_score += report.analysis.evidence_score;
    buckets.set(key, current);
  }
  return [...buckets.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function matrixByCategory(reports) {
  const byCategory = {};
  for (const report of reports) {
    const row =
      byCategory[report.category] ?? {
        category: report.category,
        reports: 0,
        action61_score: 0,
        action62_score: 0,
        evidence_score: 0,
        review_signals: 0,
        words: 0,
      };
    row.reports += 1;
    row.action61_score += report.analysis.action61_score;
    row.action62_score += report.analysis.action62_score;
    row.evidence_score += report.analysis.evidence_score;
    row.review_signals += report.analysis.review_signal_count;
    row.words += report.analysis.word_count;
    byCategory[report.category] = row;
  }
  return Object.values(byCategory).sort((a, b) => b.reports - a.reports || a.category.localeCompare(b.category));
}

function buildInsights(reports, themeTotals, entityTotals, timeline) {
  const totalAction61 = reports.reduce((sum, report) => sum + report.analysis.action61_score, 0);
  const totalAction62 = reports.reduce((sum, report) => sum + report.analysis.action62_score, 0);
  const topTheme = themeTotals[0];
  const topEntity = entityTotals[0];
  const reviewCount = reports.filter((report) => report.analysis.review_risk !== "low").length;
  const newest = [...reports].sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")))[0];
  const latestBucket = timeline[timeline.length - 1];
  const insights = [];

  if (topTheme) {
    insights.push({
      title: "Center of gravity",
      body: `${topTheme.label} is the dominant extracted theme across the report set, with ${topTheme.count} weighted mentions. This is where readers should start when they want the fastest sense of the research narrative.`,
    });
  }
  insights.push({
    title: "Action balance",
    body:
      totalAction61 > totalAction62
        ? `Action 61 currently carries the heavier textual evidence load (${totalAction61} vs ${totalAction62}), mostly around ICT consolidation, shared services, cloud, procurement and interoperability.`
        : `Action 62 currently carries the heavier textual evidence load (${totalAction62} vs ${totalAction61}), mostly around TAP, digital ID, AI translation/conferencing and innovation pipeline design.`,
  });
  if (topEntity) {
    insights.push({
      title: "Most visible institution",
      body: `${topEntity.label} is the most frequently detected institution/entity in generated reports, appearing ${topEntity.count} times. Treat this as a signal of evidence concentration, not endorsement.`,
    });
  }
  insights.push({
    title: "Review load",
    body: `${reviewCount} report artifact(s) carry medium/high review-risk signals such as human review, GPTZero, pending approval, false positives or operational blockers. These should be read as draft intelligence, not distribution-ready text.`,
  });
  if (newest) {
    insights.push({
      title: "Latest evidence package",
      body: `The latest dated report in the corpus is "${newest.title}" (${newest.date}), classified as ${newest.category} and focused on ${newest.analysis.action_focus}.`,
    });
  }
  if (latestBucket) {
    insights.push({
      title: "Recent activity pulse",
      body: `${latestBucket.date} contains ${latestBucket.reports} report artifact(s), ${latestBucket.words.toLocaleString()} words, and ${latestBucket.evidence_score} evidence-weight points in the generated corpus.`,
    });
  }
  return insights;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] ?? "unknown";
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function runGit(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
  } catch {
    return "";
  }
}

function runGitRaw(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return "";
  }
}

function parseGitLog(output) {
  if (!output) return [];
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [sha, short_sha, committed_at, author, refs, subject] = line.split("\x1f");
      return {
        sha,
        short_sha,
        committed_at,
        author,
        refs: refs?.trim() ?? "",
        subject,
        url: `https://github.com/techpolicycomms/un80-wp15-research/commit/${sha}`,
      };
    });
}

function commitFiles(sha) {
  if (!sha) return [];
  const output = runGit(["show", "--name-only", "--format=", sha]);
  return output.split("\n").filter(Boolean).sort();
}

function safeRefName(ref) {
  return ref.replace(/^origin\//, "").replace(/[^A-Za-z0-9._-]+/g, "__");
}

function githubBranchName(ref) {
  return ref.replace(/^origin\//, "");
}

function availableRefs() {
  const output = runGit([
    "for-each-ref",
    "--format=%(refname:short)",
    "refs/heads",
    "refs/remotes",
  ]);
  return [...new Set(output.split("\n").filter(Boolean))]
    .filter((ref) => !ref.endsWith("/HEAD"))
    .sort();
}

function reportEntry({
  content,
  dashboardPath,
  githubUrl,
  path,
  sourceRef,
  sourceType,
  blob,
}) {
  const relativePath = path.replaceAll("\\", "/");
  const bytes = Buffer.byteLength(content, "utf8");
  const category = inferReportCategory(relativePath);
  return {
    id: `${relativePath}:${blob ?? sourceRef ?? "worktree"}`,
    path: relativePath,
    dashboard_path: dashboardPath,
    github_url: githubUrl,
    title: firstHeading(content, relativePath.split("/").pop()),
    category,
    date: inferDate(join(root, relativePath), content),
    extension: extname(relativePath).replace(".", "").toLowerCase(),
    bytes,
    line_count: content.split(/\r?\n/).length,
    status: /DRAFT/i.test(content) ? "DRAFT" : "working",
    human_review: /human review|required|GPTZero|before distribution/i.test(content),
    summary: summarize(content),
    content,
    analysis: analyzeReport(content, category),
    source_refs: [sourceRef].filter(Boolean),
    source_type: sourceType,
    blob,
  };
}

const baseline = readJson(join(root, "data/ict-spend-baseline.json"));
const tap = readYaml(join(root, "data/tap-use-cases.yaml"));
const tracker = readYaml(join(root, "data/action-tracker.yaml"));
const overlap = readYaml(join(root, "data/overlap-signals.yaml"));
let socialSignalCount = 0;
let monitorMeta = {};
let socialSignals = [];
try {
  const social = readYaml(join(root, "data/social-signals.yaml"));
  socialSignals = social.signals ?? [];
  socialSignalCount = socialSignals.length;
} catch {
  /* optional */
}
try {
  const registry = readYaml(join(root, "data/un-agencies-social.yaml"));
    monitorMeta = {
    agencies_registered: registry.agencies?.length ?? 0,
    system_feeds: (registry.system_feeds ?? registry.meta?.system_feeds ?? []).length,
  };
  const today = new Date().toISOString().slice(0, 10);
  const coveragePath = join(root, "data/social-monitor", `${today}-coverage.yaml`);
  try {
    const cov = readYaml(coveragePath);
    monitorMeta.feeds_ok = cov.meta?.feeds_ok;
    monitorMeta.feeds_total = cov.meta?.feeds_total;
    monitorMeta.agent_review_agencies = cov.meta?.agent_review_agencies;
  } catch {
    /* run npm run check:monitor */
  }
} catch {
  /* optional */
}

const reportMap = new Map();
const historicalReportCopies = [];

const reportPaths = listFiles(join(root, "reports"), (path) =>
  [".md", ".html"].includes(extname(path).toLowerCase())
);
for (const path of reportPaths) {
  const content = readFileSync(path, "utf8");
  const relativePath = relative(root, path).replaceAll("\\", "/");
  const blob = runGit(["rev-parse", `HEAD:${relativePath}`]) || null;
  const entry = reportEntry({
    path: relativePath,
    content,
    dashboardPath: relativePath,
    githubUrl: `https://github.com/techpolicycomms/un80-wp15-research/blob/main/${relativePath}`,
    sourceRef: "main",
    sourceType: "worktree",
    blob,
  });
  reportMap.set(`${entry.path}:${entry.blob ?? entry.id}`, entry);
}

for (const ref of availableRefs()) {
  const files = runGit(["ls-tree", "-r", "--name-only", ref, "reports"])
    .split("\n")
    .filter((path) => [".md", ".html"].includes(extname(path).toLowerCase()));
  for (const file of files) {
    const blob = runGit(["rev-parse", `${ref}:${file}`]) || null;
    const key = `${file}:${blob ?? ref}`;
    const existing = reportMap.get(key);
    if (existing) {
      if (!existing.source_refs.includes(ref)) existing.source_refs.push(ref);
      continue;
    }
    const content = runGitRaw(["show", `${ref}:${file}`]);
    if (!content) continue;
    const refPath = `reports/_refs/${safeRefName(ref)}/${file.replace(/^reports\//, "")}`;
    const entry = reportEntry({
      path: file,
      content,
      dashboardPath: refPath,
      githubUrl: `https://github.com/techpolicycomms/un80-wp15-research/blob/${githubBranchName(ref)}/${file}`,
      sourceRef: ref,
      sourceType: "git-ref",
      blob,
    });
    reportMap.set(key, entry);
    historicalReportCopies.push({ path: refPath, content });
  }
}

const reports = [...reportMap.values()].sort((a, b) => {
  const dateCompare = String(b.date ?? "").localeCompare(String(a.date ?? ""));
  if (dateCompare) return dateCompare;
  const pathCompare = a.path.localeCompare(b.path);
  if (pathCompare) return pathCompare;
  return a.source_refs.join(",").localeCompare(b.source_refs.join(","));
});

const secondarySources = listFiles(join(root, "data/secondary-sources"), (path) =>
  path.endsWith(".yaml")
).map((path) => {
  const parsed = readYaml(path);
  const relativePath = relative(root, path).replaceAll("\\", "/");
  return {
    path: relativePath,
    date: parsed.meta?.scan_date ?? inferDate(path),
    automation: parsed.meta?.automation ?? null,
    disclaimer: parsed.meta?.disclaimer ?? null,
    finding_count: parsed.findings?.length ?? 0,
    findings: parsed.findings ?? [],
  };
});

const socialScans = listFiles(join(root, "data/social-monitor"), (path) =>
  path.endsWith(".yaml")
).map((path) => {
  const parsed = readYaml(path);
  const relativePath = relative(root, path).replaceAll("\\", "/");
  return {
    path: relativePath,
    date: parsed.meta?.scan_date ?? inferDate(path),
    automation: parsed.meta?.automation ?? null,
    signal_count: parsed.signals?.length ?? parsed.items?.length ?? 0,
    meta: parsed.meta ?? {},
  };
});

const academicFiles = listFiles(join(root, "data/academic-literature"), (path) =>
  path.endsWith(".yaml")
).map((path) => {
  const parsed = readYaml(path);
  return {
    path: relative(root, path).replaceAll("\\", "/"),
    date: inferDate(path),
    reference_count: parsed.references?.length ?? parsed.results?.length ?? 0,
    title: parsed.meta?.title ?? parsed.meta?.updated ?? relative(root, path),
  };
});

const mainlineCommits = parseGitLog(
  runGit([
    "log",
    "--first-parent",
    "--pretty=format:%H%x1f%h%x1f%cI%x1f%an%x1f%d%x1f%s",
    "--max-count=500",
  ])
).map((commit) => {
  const files = commitFiles(commit.sha);
  return {
    ...commit,
    changed_file_count: files.length,
    report_file_count: files.filter((file) => file.startsWith("reports/")).length,
    data_file_count: files.filter((file) => file.startsWith("data/")).length,
    changed_files: files,
  };
});

const allCommits = parseGitLog(
  runGit([
    "log",
    "--all",
    "--pretty=format:%H%x1f%h%x1f%cI%x1f%an%x1f%d%x1f%s",
    "--max-count=1000",
  ])
);

const latestReportDate = reports.find((report) => report.date)?.date ?? null;
const reportCategoryCounts = countBy(reports, "category");
const themeTotals = sumCounts(reports, (report) =>
  report.analysis.themes.filter((theme) => theme.count > 0)
);
const entityTotals = sumCounts(reports, (report) => report.analysis.entities);
const domainTotals = sumCounts(reports, (report) =>
  report.analysis.domains.map((domain) => ({ label: domain.domain, count: domain.count }))
);
const corpusTopTerms = sumCounts(reports, (report) =>
  report.analysis.top_terms.map((term) => ({ label: term.term, count: term.count }))
).slice(0, 24);
const analysisTimeline = aggregateTimeline(reports);
const categoryMatrix = matrixByCategory(reports);
const action61Total = reports.reduce((sum, report) => sum + report.analysis.action61_score, 0);
const action62Total = reports.reduce((sum, report) => sum + report.analysis.action62_score, 0);
const totalWords = reports.reduce((sum, report) => sum + report.analysis.word_count, 0);
const totalUrls = reports.reduce((sum, report) => sum + report.analysis.url_count, 0);
const totalFootnotes = reports.reduce((sum, report) => sum + report.analysis.footnote_count, 0);
const reviewRiskCounts = countBy(
  reports.map((report) => ({ risk: report.analysis.review_risk })),
  "risk"
);
const actionFocusCounts = countBy(
  reports.map((report) => ({ focus: report.analysis.action_focus })),
  "focus"
);
const topEvidenceReports = [...reports]
  .sort((a, b) => b.analysis.evidence_score - a.analysis.evidence_score)
  .slice(0, 8)
  .map((report) => ({
    id: report.id,
    title: report.title,
    path: report.path,
    date: report.date,
    category: report.category,
    source_refs: report.source_refs,
    evidence_score: report.analysis.evidence_score,
    evidence_density: report.analysis.evidence_density,
    url_count: report.analysis.url_count,
    footnote_count: report.analysis.footnote_count,
    doi_count: report.analysis.doi_count,
    key_sentences: report.analysis.key_sentences,
  }));
const topRiskReports = [...reports]
  .filter((report) => report.analysis.review_risk !== "low")
  .sort((a, b) => b.analysis.review_signal_count - a.analysis.review_signal_count)
  .slice(0, 8)
  .map((report) => ({
    id: report.id,
    title: report.title,
    path: report.path,
    date: report.date,
    category: report.category,
    source_refs: report.source_refs,
    review_risk: report.analysis.review_risk,
    review_signal_count: report.analysis.review_signal_count,
    key_sentences: report.analysis.key_sentences,
  }));
const analysisPayload = {
  total_words: totalWords,
  total_urls: totalUrls,
  total_footnotes: totalFootnotes,
  action61_score: action61Total,
  action62_score: action62Total,
  review_risk_counts: reviewRiskCounts,
  action_focus_counts: actionFocusCounts,
  theme_totals: themeTotals,
  entity_totals: entityTotals,
  domain_totals: domainTotals,
  top_terms: corpusTopTerms,
  timeline: analysisTimeline,
  category_matrix: categoryMatrix,
  top_evidence_reports: topEvidenceReports,
  top_risk_reports: topRiskReports,
  insights: buildInsights(reports, themeTotals, entityTotals, analysisTimeline),
};

const dashboardData = {
  generated_at: new Date().toISOString(),
  disclaimer: "DRAFT — public secondary data only; not agreed UN position",
  baseline,
  tap,
  tracker,
  overlap,
  social_signals: socialSignals,
  overlap_signal_count: overlap.signals?.length ?? 0,
  social_signal_count: socialSignalCount,
  monitor: monitorMeta,
  portfolio_count: tap.portfolio?.length ?? 0,
  reports,
  report_count: reports.length,
  latest_report_date: latestReportDate,
  report_category_counts: reportCategoryCounts,
  text_analysis: analysisPayload,
  data_inventory: {
    secondary_sources: secondarySources,
    secondary_source_count: secondarySources.length,
    secondary_finding_count: secondarySources.reduce(
      (total, scan) => total + scan.finding_count,
      0
    ),
    social_scans: socialScans,
    social_scan_count: socialScans.length,
    academic_files: academicFiles,
    academic_file_count: academicFiles.length,
  },
  git: {
    mainline_commits: mainlineCommits,
    mainline_commit_count: mainlineCommits.length,
    all_commits: allCommits,
    all_commit_count: allCommits.length,
    history_note:
      "Mainline commits represent pushes/merges visible from the default branch checkout. Full branch history is included when available in the local or CI checkout.",
  },
};

writeFileSync(join(out, "data.json"), JSON.stringify(dashboardData, null, 2));
rmSync(join(out, "reports"), { recursive: true, force: true });
if (existsSync(join(root, "reports"))) {
  cpSync(join(root, "reports"), join(out, "reports"), {
    recursive: true,
    filter: (source) => {
      if (statSync(source).isDirectory()) return true;
      return [".md", ".html"].includes(extname(source).toLowerCase());
    },
  });
}
for (const copy of historicalReportCopies) {
  const target = join(out, copy.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, copy.content);
}
copyFileSync(join(root, "dashboard/index.html"), join(out, "index.html"));
copyFileSync(join(root, "dashboard/styles.css"), join(out, "styles.css"));
copyFileSync(join(root, "dashboard/app.js"), join(out, "app.js"));

console.log("Dashboard built → dashboard/dist/");
