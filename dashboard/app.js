function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    if (typeof child === "string") node.appendChild(document.createTextNode(child));
    else if (child) node.appendChild(child);
  }
  return node;
}

function statusBadge(status) {
  return el("span", { className: `status ${status}`, text: status.replace(/_/g, " ") });
}

function deliverableStatusBadge(status) {
  return el("span", { className: `deliverable-status ${status}`, text: status.replace(/_/g, " ") });
}

function factorRoleColor(role) {
  const map = {
    key_lever: "#3ecf8e",
    engine: "#4da3ff",
    precondition: "#f5a623",
    requirement: "#8b9cb3",
    checkpoint: "#6b7c93",
    bottleneck: "#ff6b6b",
  };
  return map[role] ?? "#4da3ff";
}

function renderPillarNav(pillars, onSelect, activeId) {
  const nav = document.getElementById("pillar-nav");
  nav.replaceChildren();
  for (const p of pillars) {
    const rqCount = p.research_questions?.length ?? 0;
    const delCount = p.deliverables?.length ?? 0;
    const tab = el("button", {
      className: `pillar-tab${p.id === activeId ? " active" : ""}`,
      type: "button",
      "data-pillar": p.id,
      style: `border-color: ${p.color}`,
    }, [
      el("span", { className: "tab-title", text: p.title }),
      el("span", {
        className: "tab-count",
        text: `${rqCount} research questions · ${delCount} deliverables`,
      }),
    ]);
    tab.addEventListener("click", () => onSelect(p.id));
    nav.appendChild(tab);
  }
}

function renderResearchQuestions(questions) {
  return el("ul", { className: "rq-list" }, questions.map((q) => el("li", { text: q })));
}

function renderDeliverables(deliverables) {
  return el(
    "ul",
    { className: "deliverable-list" },
    (deliverables ?? []).map((d) =>
      el("li", {}, [
        deliverableStatusBadge(d.status ?? "planned"),
        el("span", { text: d.label }),
      ])
    )
  );
}

function renderStsFindings(findings) {
  if (!findings?.length) return el("p", { className: "meta", text: "No Wave 1 findings mapped yet." });
  return el(
    "div",
    {},
    findings.map((f) =>
      el("div", { className: "finding-card" }, [
        el("h4", { text: f.theme }),
        el("p", { text: f.summary }),
        f.since_2022 ? el("p", { html: `<strong>Since 2022:</strong> ${f.since_2022}` }) : null,
        f.quote ? el("blockquote", { text: f.quote }) : null,
        ...(f.evidence_quotes ?? []).map((q) => el("blockquote", { text: q })),
      ])
    )
  );
}

function renderSurveyFactors(factors) {
  if (!factors?.length) return null;
  const maxCorr = Math.max(...factors.map((f) => f.correlation ?? 0));
  return el("div", {}, [
    el("h3", { text: "StS 2.0 survey — prioritised scaling factors" }),
    el("p", { className: "meta", text: "Wave 1 conversion analysis (N=58 completed). Correlation to scaling KPI." }),
    ...factors.map((f) => {
      const pct = Math.round(((f.correlation ?? 0) / maxCorr) * 100);
      return el("div", { className: "factor-bar-row" }, [
        el("div", {}, [
          el("div", { className: "factor-bar-label", text: f.label }),
          el("div", { className: "factor-role", text: f.role?.replace(/_/g, " ") ?? "" }),
        ]),
        el("div", { className: "factor-bar-track" }, [
          el("div", {
            className: "factor-bar-fill",
            style: `width:${pct}%;background:${factorRoleColor(f.role)}`,
          }),
        ]),
        el("div", { text: `r=${f.correlation}` }),
      ]);
    }),
    el(
      "ul",
      { className: "rq-list" },
      factors.map((f) =>
        el("li", {
          text: `${f.label} (${f.met_pct}% felt condition met): ${f.note}`,
        })
      )
    ),
  ]);
}

function renderJourneyGates(gates) {
  if (!gates?.length) return null;
  return el("div", {}, [
    el("h3", { text: "Innovation journey — friction gates" }),
    el(
      "table",
      {},
      [
        el("thead", {}, [
          el("tr", {}, [
            el("th", { text: "Gate" }),
            el("th", { text: "Self-reported support need" }),
            el("th", { text: "Note" }),
          ]),
        ]),
        el(
          "tbody",
          {},
          gates.map((g) =>
            el("tr", {}, [
              el("td", { text: g.gate }),
              el("td", { text: `${g.support_need_pct}%` }),
              el("td", { text: g.note }),
            ])
          )
        ),
      ]
    ),
  ]);
}

function renderCandidateCases(cases) {
  if (!cases?.length) return el("p", { className: "meta", text: "Case studies — Wave 2 collection planned." });
  return el(
    "div",
    { className: "case-grid" },
    cases.map((c) =>
      el("div", { className: "case-card" }, [
        el("h4", { text: c.name }),
        el("div", { className: "agency", text: c.agency }),
        el("p", { text: c.topic }),
        c.claim_id ? el("p", { className: "meta", text: `claim: ${c.claim_id}` }) : null,
      ])
    )
  );
}

function renderTapAlignment(alignment) {
  if (!alignment) return null;
  return el("div", {}, [
    el("h3", { text: "TAP alignment (UN80 Action 62)" }),
    el("p", { text: alignment.ambition }),
    el("p", {}, [el("strong", { text: "Endorsed portfolio: " }), document.createTextNode(alignment.endorsed_portfolio?.join(" · ") ?? "")]),
    el("h3", { text: "TAP clients" }),
    el("ul", { className: "rq-list" }, (alignment.clients ?? []).map((c) => el("li", { text: c }))),
    el("h3", { text: "TAP partners" }),
    el("ul", { className: "rq-list" }, (alignment.partners ?? []).map((p) => el("li", { text: p }))),
  ]);
}

function renderTimeline(items) {
  if (!items?.length) return null;
  return el(
    "div",
    { className: "timeline" },
    items.map((m) =>
      el("div", { className: "timeline-item" }, [
        el("strong", { text: m.milestone }),
        el("span", { className: "meta", text: ` — ${m.target}` }),
        el("div", {}, [statusBadge(m.status ?? "pending")]),
      ])
    )
  );
}

function renderActors(actors) {
  if (!actors?.length) return null;
  return el("div", {}, [
    el("h3", { text: "Mapped actors & centres (WP15 public evidence)" }),
    el("ul", { className: "rq-list" }, actors.map((a) => el("li", { text: a }))),
  ]);
}

function renderPillarPanel(pillar, hidden) {
  const panel = el("section", {
    className: "panel pillar-panel",
    id: `pillar-${pillar.id}`,
    hidden: hidden ? "" : null,
    style: `border-left-color: ${pillar.color}`,
  });

  panel.appendChild(el("h2", { text: pillar.title }));

  panel.appendChild(el("h3", { text: "Research questions" }));
  panel.appendChild(renderResearchQuestions(pillar.research_questions ?? []));

  panel.appendChild(el("h3", { text: "Deliverables" }));
  panel.appendChild(renderDeliverables(pillar.deliverables));

  if (pillar.sts_wave1_findings?.length) {
    panel.appendChild(el("h3", { text: "StS 2.0 Wave 1 — emergent findings" }));
    panel.appendChild(renderStsFindings(pillar.sts_wave1_findings));
  }

  if (pillar.survey_factors) panel.appendChild(renderSurveyFactors(pillar.survey_factors));
  if (pillar.innovation_journey_gates) panel.appendChild(renderJourneyGates(pillar.innovation_journey_gates));
  if (pillar.candidate_cases) {
    panel.appendChild(el("h3", { text: "Candidate signature cases" }));
    panel.appendChild(renderCandidateCases(pillar.candidate_cases));
  }
  if (pillar.tap_alignment) panel.appendChild(renderTapAlignment(pillar.tap_alignment));
  if (pillar.project_timeline) {
    panel.appendChild(el("h3", { text: "Research timeline" }));
    panel.appendChild(renderTimeline(pillar.project_timeline));
  }
  if (pillar.wp15_links?.actors) panel.appendChild(renderActors(pillar.wp15_links.actors));

  return panel;
}

function renderOpsData(data) {
  const b = data.baseline;
  const cards = [
    { value: String(data.research_pillar_count ?? 4), label: "Research pillars" },
    { value: String(data.survey_respondents ?? "—"), label: "StS survey (N)" },
    { value: String(data.interviews ?? "—"), label: "StS interviews" },
    { value: `$${(b.totals.annual_ict_spend_usd_min / 1e9).toFixed(1)}B+`, label: "ICT spend baseline" },
    { value: String(data.portfolio_count), label: "TAP portfolio cases" },
    { value: String(data.overlap_signal_count), label: "Overlap signals" },
    { value: String(data.social_signal_count ?? 0), label: "Social signals" },
    { value: String(data.monitor?.agencies_registered ?? "—"), label: "Agencies monitored" },
  ];

  const cardsRoot = document.getElementById("metric-cards");
  cardsRoot.replaceChildren();
  for (const c of cards) {
    cardsRoot.appendChild(
      el("div", { className: "card" }, [
        el("div", { className: "value", text: c.value }),
        el("div", { className: "label", text: c.label }),
      ])
    );
  }

  const baselineRoot = document.getElementById("baseline-detail");
  baselineRoot.replaceChildren(
    el("ul", {}, [
      el("li", { text: `Overlap in core services: ${b.findings.overlap_in_core_services ? "Yes" : "No"}` }),
      el("li", { text: `Interoperability challenges: ${b.findings.interoperability_challenges ? "Yes" : "No"}` }),
      el("li", { text: `Shared services: ${b.findings.shared_service_adoption}` }),
    ])
  );

  const tapRoot = document.getElementById("tap-portfolio");
  tapRoot.replaceChildren(
    el("table", {}, [
      el("thead", {}, [
        el("tr", {}, [
          el("th", { text: "Use case" }),
          el("th", { text: "Status" }),
          el("th", { text: "claim_id" }),
        ]),
      ]),
      el(
        "tbody",
        {},
        data.tap.portfolio.map((p) =>
          el("tr", {}, [
            el("td", { text: p.name }),
            el("td", { text: p.status }),
            el("td", { text: p.claim_id ?? "—" }),
          ])
        )
      ),
    ])
  );

  const phaseRoot = document.getElementById("phase-tracker");
  phaseRoot.replaceChildren();
  for (const action of data.tracker.actions) {
    phaseRoot.appendChild(el("h4", { text: action.title }));
    phaseRoot.appendChild(
      el("table", {}, [
        el("thead", {}, [
          el("tr", {}, [el("th", { text: "Phase" }), el("th", { text: "Status" })]),
        ]),
        el(
          "tbody",
          {},
          action.phases.map((p) =>
            el("tr", {}, [
              el("td", { text: p.name }),
              el("td", {}, [statusBadge(p.status)]),
            ])
          )
        ),
      ])
    );
  }

  const signals = data.overlap?.signals ?? [];
  document.getElementById("overlap-count").textContent =
    signals.length === 0 ? "No overlap signals yet." : `${signals.length} signal(s) on record.`;
  document.getElementById("overlap-list").replaceChildren(
    ...signals.map((s) => el("li", { text: s.summary ?? s.topic ?? "Signal" }))
  );

  const monitorRoot = document.getElementById("monitor-detail");
  if (data.monitor) {
    const m = data.monitor;
    monitorRoot.replaceChildren(
      el("ul", {}, [
        el("li", { text: `Agencies in registry: ${m.agencies_registered ?? "—"}` }),
        el("li", { text: `Feeds OK: ${m.feeds_ok != null ? `${m.feeds_ok}/${m.feeds_total}` : "—"}` }),
        el("li", { text: `Agent review pending: ${m.agent_review_agencies ?? "—"} agencies` }),
      ])
    );
  }
}

function showPillar(pillarId, pillars) {
  activePillarId = pillarId;
  renderPillarNav(pillars, (id) => showPillar(id, pillars), pillarId);
  for (const p of pillars) {
    const panel = document.getElementById(`pillar-${p.id}`);
    if (panel) panel.hidden = p.id !== pillarId;
  }
}

async function loadDashboard() {
  const res = await fetch("data.json");
  const data = await res.json();
  const plan = data.research_plan;
  const pillars = plan?.pillars ?? [];

  document.getElementById("generated-at").textContent =
    `Generated ${new Date(data.generated_at).toLocaleString()} · ${data.disclaimer}`;

  document.getElementById("research-meta").textContent =
    `${plan?.meta?.sts_advisory_group ?? "Research plan"} · Plan dated ${plan?.meta?.research_plan_date ?? "—"} · Wave 1 ${plan?.meta?.wave_status?.wave_1 ?? "—"} / Wave 2 ${plan?.meta?.wave_status?.wave_2 ?? "—"}`;

  const panelsRoot = document.getElementById("pillar-panels");
  panelsRoot.replaceChildren();
  const defaultId = pillars[0]?.id;
  for (const p of pillars) {
    panelsRoot.appendChild(renderPillarPanel(p, p.id !== defaultId));
  }

  showPillar(defaultId, pillars);
  renderOpsData(data);
}

loadDashboard().catch(console.error);
