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

function firstHeading(content, fallback) {
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  const title = content.match(/<title>([^<]+)<\/title>/i);
  if (title) return title[1].trim();
  return fallback
    .replace(/\.(md|html)$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarize(content) {
  return stripMarkdown(content).slice(0, 360);
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
  return {
    id: `${relativePath}:${blob ?? sourceRef ?? "worktree"}`,
    path: relativePath,
    dashboard_path: dashboardPath,
    github_url: githubUrl,
    title: firstHeading(content, relativePath.split("/").pop()),
    category: inferReportCategory(relativePath),
    date: inferDate(join(root, relativePath), content),
    extension: extname(relativePath).replace(".", "").toLowerCase(),
    bytes,
    line_count: content.split(/\r?\n/).length,
    status: /DRAFT/i.test(content) ? "DRAFT" : "working",
    human_review: /human review|required|GPTZero|before distribution/i.test(content),
    summary: summarize(content),
    content,
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
