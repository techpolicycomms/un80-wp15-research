import { test } from "node:test";
import assert from "node:assert/strict";
import { computeJobsIntelligence, classifyTitleType } from "./jobs.mjs";

test("classifyTitleType flags innovation in the title as core", () => {
  assert.equal(classifyTitleType("Innovation Officer"), "core");
  assert.equal(classifyTitleType("Data Scientist"), "embedded");
});

test("computeJobsIntelligence aggregates totals, sources, role types, agencies, years", () => {
  const recs = [
    { title: "Innovation Specialist", agency: "WFP", source: "official", date: "2024-03-01", family: "Innovation strategy" },
    { title: "Digital Transformation Lead", agency: "UNICEF", source: "official", date: "2022-07-01", family: "Digital transformation" },
    { title: "Data Analyst", agency: "WFP", source: "web-research", date: "2024-11-01", family: "AI / data" },
  ];
  const r = computeJobsIntelligence(recs);
  assert.equal(r.total, 3);
  assert.equal(r.byRole.find((x) => x.label.includes("core")).value, 1);
  assert.equal(r.byRole.find((x) => x.label.includes("Embedded")).value, 2);
  assert.equal(r.bySource.find((x) => x.key === "official").value, 2);
  assert.equal(r.byAgency.find((x) => x.label === "WFP").value, 2);
  assert.equal(r.byYear.find((x) => x.label === "2024").value, 2);
});

test("empty dataset yields zeroed intelligence, never throws", () => {
  const r = computeJobsIntelligence([]);
  assert.equal(r.total, 0);
  assert.deepEqual(r.byAgency, []);
});
