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
const researchPlan = yaml.parse(readFileSync(join(root, "data/research-plan.yaml"), "utf8"));
const cronMap = yaml.parse(readFileSync(join(root, "data/cron-research-map.yaml"), "utf8"));

function enrichResearchPlanWithCrons(plan, jobs) {
  const pillarById = Object.fromEntries(plan.pillars.map((p) => [p.id, p]));

  for (const pillar of plan.pillars) {
    pillar.automation_feeds = [];
    pillar.question_automations = (pillar.research_questions ?? []).map((question, index) => ({
      index,
      question,
      jobs: [],
    }));
  }

  for (const job of jobs) {
    for (const mapping of job.mappings ?? []) {
      const pillar = pillarById[mapping.pillar_id];
      if (!pillar) continue;

      const questions = (mapping.research_question_refs ?? []).map((ref) => ({
        index: ref,
        text: pillar.research_questions?.[ref] ?? `Question ${ref + 1}`,
      }));

      pillar.automation_feeds.push({
        job_id: job.id,
        job_name: job.name,
        platform: job.platform,
        type: job.type,
        schedule_human: job.schedule_human,
        schedule_cron: job.schedule_cron,
        enabled: job.enabled,
        url: job.url,
        note: job.note,
        questions,
        deliverable_ids: mapping.deliverable_ids ?? [],
        rationale: mapping.rationale,
      });

      for (const ref of mapping.research_question_refs ?? []) {
        const qa = pillar.question_automations?.[ref];
        if (qa) {
          qa.jobs.push({
            id: job.id,
            name: job.name,
            enabled: job.enabled,
            platform: job.platform,
          });
        }
      }
    }
  }

  return plan;
}

const enrichedPlan = enrichResearchPlanWithCrons(researchPlan, cronMap.jobs ?? []);

let socialSignalCount = 0;
let monitorMeta = {};
try {
  const social = yaml.parse(readFileSync(join(root, "data/social-signals.yaml"), "utf8"));
  socialSignalCount = social.signals?.length ?? 0;
} catch {
  /* optional */
}
try {
  const registry = yaml.parse(readFileSync(join(root, "data/un-agencies-social.yaml"), "utf8"));
  monitorMeta = {
    agencies_registered: registry.agencies?.length ?? 0,
    system_feeds: (registry.system_feeds ?? registry.meta?.system_feeds ?? []).length,
  };
  const today = new Date().toISOString().slice(0, 10);
  const coveragePath = join(root, "data/social-monitor", `${today}-coverage.yaml`);
  try {
    const cov = yaml.parse(readFileSync(coveragePath, "utf8"));
    monitorMeta.feeds_ok = cov.meta?.feeds_ok;
    monitorMeta.feeds_total = cov.meta?.feeds_total;
    monitorMeta.agent_review_agencies = cov.meta?.agent_review_agencies;
  } catch {
    /* run npm run check:monitor */
  }
} catch {
  /* optional */
}

const dashboardData = {
  generated_at: new Date().toISOString(),
  disclaimer: "DRAFT — public secondary data only; not agreed UN position",
  research_plan: enrichedPlan,
  cron_jobs: cronMap.jobs ?? [],
  cron_job_count: cronMap.jobs?.length ?? 0,
  cron_enabled_count: cronMap.jobs?.filter((j) => j.enabled).length ?? 0,
  research_pillar_count: researchPlan.pillars?.length ?? 0,
  survey_respondents: researchPlan.survey_methodology?.respondents_completed,
  interviews: researchPlan.survey_methodology?.interviews,
  baseline,
  tap,
  tracker,
  overlap,
  overlap_signal_count: overlap.signals?.length ?? 0,
  social_signal_count: socialSignalCount,
  monitor: monitorMeta,
  portfolio_count: tap.portfolio?.length ?? 0,
};

writeFileSync(join(out, "data.json"), JSON.stringify(dashboardData, null, 2));
copyFileSync(join(root, "dashboard/index.html"), join(out, "index.html"));
copyFileSync(join(root, "dashboard/styles.css"), join(out, "styles.css"));
copyFileSync(join(root, "dashboard/app.js"), join(out, "app.js"));

console.log("Dashboard built → dashboard/dist/");
