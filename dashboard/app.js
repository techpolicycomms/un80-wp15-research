function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
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

function statusBadge(status) {
  const span = el("span", {
    className: `status ${status}`,
    text: status.replace("_", " "),
  });
  return span;
}

async function loadDashboard() {
  const res = await fetch("data.json");
  const data = await res.json();

  el("p", { id: "generated-at", className: "meta", text: "" });
  document.getElementById("generated-at").textContent =
    `Generated ${new Date(data.generated_at).toLocaleString()} · ${data.disclaimer}`;

  const b = data.baseline;
  const cards = [
    {
      value: `$${(b.totals.annual_ict_spend_usd_min / 1e9).toFixed(1)}B+`,
      label: "Annual ICT spend (baseline)",
    },
    {
      value: String(b.meta.entities_participating),
      label: "Entities in baseline",
    },
    {
      value: `${b.meta.expenditure_coverage_pct}%`,
      label: "Expenditure coverage",
    },
    {
      value: String(data.portfolio_count),
      label: "TAP portfolio use cases",
    },
    {
      value: String(data.overlap_signal_count),
      label: "Overlap signals tracked",
    },
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
      el("li", {
        text: `Overlap in core services: ${b.findings.overlap_in_core_services ? "Yes" : "No"}`,
      }),
      el("li", {
        text: `Interoperability challenges: ${b.findings.interoperability_challenges ? "Yes" : "No"}`,
      }),
      el("li", { text: `Shared services: ${b.findings.shared_service_adoption}` }),
    ]),
    el("p", {}, [el("strong", { text: "Consolidation categories:" })]),
    el(
      "ul",
      {},
      b.categories
        .filter((cat) => cat.action_61_priority)
        .map((cat) => el("li", { text: cat.label }))
    )
  );

  const tapRoot = document.getElementById("tap-portfolio");
  const tapTable = el("table", {}, [
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
      data.tap.portfolio.map((p) =>
        el("tr", {}, [
          el("td", { text: p.name }),
          el("td", { text: p.status }),
          el("td", { text: p.maturity }),
        ])
      )
    ),
  ]);
  tapRoot.replaceChildren(tapTable);

  const phaseRoot = document.getElementById("phase-tracker");
  phaseRoot.replaceChildren();
  for (const action of data.tracker.actions) {
    phaseRoot.appendChild(el("h3", { text: action.title }));
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
    signals.length === 0
      ? "No overlap signals yet — populated by weekly landscape automation."
      : `${signals.length} signal(s) on record.`;

  const listRoot = document.getElementById("overlap-list");
  listRoot.replaceChildren(
    ...signals.map((s) => el("li", { text: s.summary ?? s.topic ?? "Signal" }))
  );
}

loadDashboard().catch(console.error);
