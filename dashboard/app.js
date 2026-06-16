const state = {
  data: null,
  query: "",
  category: "all",
  selectedReportId: null,
};

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === "className") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    if (typeof child === "string") node.appendChild(document.createTextNode(child));
    else if (child) node.appendChild(child);
  }
  return node;
}

function normalize(value) {
  return String(value ?? "").toLowerCase();
}

function formatDate(value) {
  if (!value) return "Undated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatDateTime(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function statusBadge(status) {
  const normalized = String(status ?? "unknown").replaceAll(" ", "_");
  return el("span", {
    className: `status ${normalized}`,
    text: String(status ?? "unknown").replaceAll("_", " "),
  });
}

function renderMetricCards() {
  const data = state.data;
  const baseline = data.baseline;
  const inventory = data.data_inventory;
  const cards = [
    {
      value: String(data.report_count ?? 0),
      label: "Reports loaded",
    },
    {
      value: String(data.git?.mainline_commit_count ?? 0),
      label: "Mainline pushes",
    },
    {
      value: String(data.git?.all_commit_count ?? 0),
      label: "Commits indexed",
    },
    {
      value: `$${(baseline.totals.annual_ict_spend_usd_min / 1e9).toFixed(1)}B+`,
      label: "Annual ICT spend",
    },
    {
      value: String(baseline.meta.entities_participating),
      label: "Entities in baseline",
    },
    {
      value: `${baseline.meta.expenditure_coverage_pct}%`,
      label: "Expenditure coverage",
    },
    {
      value: String(data.portfolio_count),
      label: "TAP use cases",
    },
    {
      value: String(data.overlap_signal_count),
      label: "Overlap signals",
    },
    {
      value: String(data.social_signal_count ?? 0),
      label: "Social/news signals",
    },
    {
      value: String(inventory.secondary_finding_count ?? 0),
      label: "Landscape findings",
    },
  ];

  const root = document.getElementById("metric-cards");
  root.replaceChildren(
    ...cards.map((card) =>
      el("div", { className: "metric-card" }, [
        el("div", { className: "metric-value", text: card.value }),
        el("div", { className: "metric-label", text: card.label }),
      ])
    )
  );
}

function findingMatchesRelevance(finding, relevance) {
  const value = normalize(finding.relevance);
  return value === relevance || value === "both";
}

function latestFindings(relevance) {
  const scans = [...(state.data.data_inventory.secondary_sources ?? [])].sort((a, b) =>
    String(b.date ?? "").localeCompare(String(a.date ?? ""))
  );
  return scans
    .flatMap((scan) =>
      (scan.findings ?? [])
        .filter((finding) => findingMatchesRelevance(finding, relevance))
        .map((finding) => ({ ...finding, scan_date: scan.date, scan_path: scan.path }))
    )
    .slice(0, 3);
}

function renderHeadlineFindings() {
  const action61 = latestFindings("action_61");
  const action62 = latestFindings("action_62");
  const root = document.getElementById("headline-findings");
  root.replaceChildren(
    renderFindingColumn("Action 61", action61),
    renderFindingColumn("Action 62", action62)
  );
}

function renderFindingColumn(title, findings) {
  return el("section", { className: "panel compact-panel" }, [
    el("h2", { text: title }),
    el(
      "div",
      { className: "stack" },
      findings.map((finding) =>
        el("article", { className: "finding-item" }, [
          el("p", { className: "eyebrow", text: `${formatDate(finding.scan_date)} · ${finding.topic}` }),
          el("h3", { text: finding.source?.title ?? "Source" }),
          el("p", { text: finding.summary }),
          el("p", { className: "meta", text: `Confidence: ${finding.confidence ?? "unknown"}` }),
        ])
      )
    ),
  ]);
}

function renderBaseline() {
  const baseline = state.data.baseline;
  const root = document.getElementById("baseline-detail");
  root.replaceChildren(
    el("div", { className: "two-column" }, [
      el("div", {}, [
        el("h3", { text: "Action 61 Baseline" }),
        el("ul", { className: "plain-list" }, [
          el("li", {
            text: `Core-service overlap: ${baseline.findings.overlap_in_core_services ? "yes" : "no"}`,
          }),
          el("li", {
            text: `Interoperability challenges: ${baseline.findings.interoperability_challenges ? "yes" : "no"}`,
          }),
          el("li", { text: baseline.findings.shared_service_adoption }),
        ]),
      ]),
      el("div", {}, [
        el("h3", { text: "Priority Categories" }),
        el(
          "ul",
          { className: "tag-list" },
          baseline.categories
            .filter((category) => category.action_61_priority)
            .map((category) => el("li", { text: category.label }))
        ),
      ]),
    ])
  );
}

function renderTapAndPhases() {
  const tapRoot = document.getElementById("tap-portfolio");
  tapRoot.replaceChildren(
    el("table", {}, [
      el("thead", {}, [
        el("tr", {}, [
          el("th", { text: "Use case" }),
          el("th", { text: "Status" }),
          el("th", { text: "Maturity" }),
        ]),
      ]),
      el(
        "tbody",
        {},
        state.data.tap.portfolio.map((useCase) =>
          el("tr", {}, [
            el("td", { text: useCase.name }),
            el("td", {}, [statusBadge(useCase.status)]),
            el("td", { text: useCase.maturity }),
          ])
        )
      ),
    ])
  );

  const phaseRoot = document.getElementById("phase-tracker");
  phaseRoot.replaceChildren(
    ...state.data.tracker.actions.map((action) =>
      el("article", { className: "phase-block" }, [
        el("h3", { text: action.title }),
        el("table", {}, [
          el("thead", {}, [
            el("tr", {}, [
              el("th", { text: "Phase" }),
              el("th", { text: "Status" }),
              el("th", { text: "Notes" }),
            ]),
          ]),
          el(
            "tbody",
            {},
            action.phases.map((phase) =>
              el("tr", {}, [
                el("td", { text: phase.name }),
                el("td", {}, [statusBadge(phase.status)]),
                el("td", { text: phase.notes ?? phase.gate ?? "" }),
              ])
            )
          ),
        ]),
      ])
    )
  );
}

function filteredReports() {
  const query = normalize(state.query);
  return (state.data.reports ?? []).filter((report) => {
    if (state.category !== "all" && report.category !== state.category) return false;
    if (!query) return true;
    return [report.title, report.path, report.summary, report.content, report.category]
      .map(normalize)
      .some((value) => value.includes(query));
  });
}

function renderReportControls() {
  const categories = Object.keys(state.data.report_category_counts ?? {}).sort();
  const select = document.getElementById("report-category");
  select.replaceChildren(
    el("option", { value: "all", text: "All report types" }),
    ...categories.map((category) =>
      el("option", { value: category, text: `${category} (${state.data.report_category_counts[category]})` })
    )
  );
  select.value = state.category;
}

function renderReportLibrary() {
  renderReportControls();
  const reports = filteredReports();
  const selected =
    reports.find((report) => report.id === state.selectedReportId) ??
    reports[0] ??
    null;
  state.selectedReportId = selected?.id ?? null;

  document.getElementById("report-count").textContent =
    `${reports.length} of ${state.data.report_count} report(s)`;

  const listRoot = document.getElementById("report-list");
  listRoot.replaceChildren(
    ...reports.map((report) =>
      el(
        "button",
        {
          className: `report-row ${report.id === state.selectedReportId ? "selected" : ""}`,
          type: "button",
          "data-id": report.id,
        },
        [
          el("span", { className: "report-title", text: report.title }),
          el("span", {
            className: "report-meta",
            text: `${formatDate(report.date)} · ${report.category} · ${formatBytes(report.bytes)} · ${report.source_refs?.join(", ") ?? "main"}`,
          }),
          el("span", { className: "report-path", text: report.path }),
        ]
      )
    )
  );

  for (const button of listRoot.querySelectorAll("button[data-id]")) {
    button.addEventListener("click", () => {
      state.selectedReportId = button.dataset.id;
      renderReportLibrary();
    });
  }

  renderSelectedReport(selected);
}

function renderSelectedReport(report) {
  const root = document.getElementById("report-viewer");
  if (!report) {
    root.replaceChildren(el("p", { className: "meta", text: "No matching report." }));
    return;
  }
  const contentNode =
    report.extension === "html"
      ? el("pre", { className: "report-pre", text: report.content })
      : el("pre", { className: "report-pre", text: report.content });

  root.replaceChildren(
    el("div", { className: "viewer-header" }, [
      el("div", {}, [
        el("p", { className: "eyebrow", text: `${formatDate(report.date)} · ${report.category}` }),
        el("h3", { text: report.title }),
        el("p", {
          className: "meta",
          text: `${report.path} · ${report.source_refs?.join(", ") ?? "main"} · ${report.line_count} lines · ${formatBytes(report.bytes)}`,
        }),
      ]),
      el("div", { className: "viewer-actions" }, [
        el("a", { href: report.dashboard_path, target: "_blank", rel: "noreferrer", text: "Open raw" }),
        el("a", { href: report.github_url, target: "_blank", rel: "noreferrer", text: "GitHub" }),
      ]),
    ]),
    contentNode
  );
}

function renderPushTimeline() {
  const root = document.getElementById("push-timeline");
  const commits = state.data.git?.mainline_commits ?? [];
  root.replaceChildren(
    ...commits.map((commit) =>
      el("article", { className: "timeline-item" }, [
        el("div", { className: "timeline-marker" }),
        el("div", { className: "timeline-body" }, [
          el("p", { className: "eyebrow", text: formatDateTime(commit.committed_at) }),
          el("h3", {}, [
            el("a", {
              href: commit.url,
              target: "_blank",
              rel: "noreferrer",
              text: commit.subject,
            }),
          ]),
          el("p", {
            className: "meta",
            text: `${commit.short_sha} · ${commit.author} · ${commit.changed_file_count} file(s), ${commit.report_file_count} report file(s), ${commit.data_file_count} data file(s)`,
          }),
          commit.changed_files?.length
            ? el("details", {}, [
                el("summary", { text: "Changed files" }),
                el(
                  "ul",
                  { className: "file-list" },
                  commit.changed_files.map((file) => el("li", { text: file }))
                ),
              ])
            : null,
        ]),
      ])
    )
  );
}

function renderDataInventory() {
  const inventory = state.data.data_inventory;
  const root = document.getElementById("data-inventory");
  const latestSecondary = [...(inventory.secondary_sources ?? [])].sort((a, b) =>
    String(b.date ?? "").localeCompare(String(a.date ?? ""))
  );
  const socialScans = [...(inventory.social_scans ?? [])].sort((a, b) =>
    String(b.date ?? "").localeCompare(String(a.date ?? ""))
  );

  root.replaceChildren(
    el("section", { className: "panel compact-panel" }, [
      el("h2", { text: "Landscape Scans" }),
      el(
        "div",
        { className: "stack" },
        latestSecondary.map((scan) =>
          el("article", { className: "inventory-item" }, [
            el("h3", { text: scan.path }),
            el("p", { className: "meta", text: `${formatDate(scan.date)} · ${scan.finding_count} finding(s)` }),
          ])
        )
      ),
    ]),
    el("section", { className: "panel compact-panel" }, [
      el("h2", { text: "Social Monitor Files" }),
      el(
        "div",
        { className: "stack" },
        socialScans.map((scan) =>
          el("article", { className: "inventory-item" }, [
            el("h3", { text: scan.path }),
            el("p", { className: "meta", text: `${formatDate(scan.date)} · ${scan.signal_count} signal(s)` }),
          ])
        )
      ),
    ]),
    el("section", { className: "panel compact-panel" }, [
      el("h2", { text: "Academic Files" }),
      el(
        "div",
        { className: "stack" },
        (inventory.academic_files ?? []).map((file) =>
          el("article", { className: "inventory-item" }, [
            el("h3", { text: file.path }),
            el("p", { className: "meta", text: `${file.reference_count} reference/result item(s)` }),
          ])
        )
      ),
    ])
  );
}

function renderOverlapAndSignals() {
  const overlapRoot = document.getElementById("overlap-list");
  overlapRoot.replaceChildren(
    ...(state.data.overlap?.signals ?? []).map((signal) =>
      el("article", { className: "signal-item" }, [
        el("p", { className: "eyebrow", text: `${signal.id ?? "signal"} · ${signal.topic ?? ""}` }),
        el("p", { text: signal.summary ?? "" }),
        el("p", { className: "meta", text: `Confidence: ${signal.confidence ?? "unknown"}` }),
      ])
    )
  );

  const socialRoot = document.getElementById("social-signal-list");
  socialRoot.replaceChildren(
    ...(state.data.social_signals ?? []).map((signal) =>
      el("article", { className: "signal-item" }, [
        el("p", { className: "eyebrow", text: `${signal.platform ?? "source"} · ${signal.agency ?? ""}` }),
        el("h3", { text: signal.title ?? signal.topic ?? "Signal" }),
        el("p", { text: signal.summary ?? "" }),
      ])
    )
  );
}

function bindControls() {
  document.getElementById("report-search").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderReportLibrary();
  });
  document.getElementById("report-category").addEventListener("change", (event) => {
    state.category = event.target.value;
    renderReportLibrary();
  });
}

async function loadDashboard() {
  const response = await fetch("data.json");
  state.data = await response.json();

  document.getElementById("generated-at").textContent =
    `Generated ${formatDateTime(state.data.generated_at)} · ${state.data.disclaimer}`;
  document.getElementById("history-note").textContent = state.data.git?.history_note ?? "";

  bindControls();
  renderMetricCards();
  renderHeadlineFindings();
  renderBaseline();
  renderTapAndPhases();
  renderReportLibrary();
  renderPushTimeline();
  renderDataInventory();
  renderOverlapAndSignals();
}

loadDashboard().catch((error) => {
  console.error(error);
  document.getElementById("app-error").textContent = String(error?.message ?? error);
});
