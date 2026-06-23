/* UN80 / TAP synthesis dossier — renders data/tap-synthesis.json into 8 sections.
   Static, no dependencies. Cite-status drives the evidence register. */

const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const CITE_LABEL = { safe: "Safe to cite", caveat: "Cite with caveat", "do-not-cite": "Do not cite yet" };

function showError(msg) {
  const box = $("#app-error");
  box.hidden = false;
  box.textContent = msg;
}

async function loadJson(path) {
  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) throw new Error(`${path} → HTTP ${r.status}`);
  return r.json();
}

async function loadLedger(path) {
  try {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) return new Map();
    const lines = (await r.text()).split("\n").filter((l) => l.trim());
    return new Map(lines.map((l) => JSON.parse(l)).map((c) => [c.claimId, c]));
  } catch {
    return new Map();
  }
}

function chip(status) {
  const c = el("span", `chip chip-${status}`);
  c.append(el("i"), document.createTextNode(CITE_LABEL[status] || status));
  return c;
}

/* ---- Section renderers ---- */

function renderLead(d) {
  $("#status-line").textContent = d.status || "Working synthesis.";
  $("#lead-statement").textContent = d.leadAnswer?.statement || "";
  const ul = $("#lead-points");
  (d.leadAnswer?.points || []).forEach((p) => ul.append(el("li", null, p)));
}

function renderStatus(d) {
  const row = $("#prev-stats");
  (d.previousWork?.stats || []).forEach((s) => {
    const card = el("div", "stat");
    card.append(el("div", "stat-num", String(s.value)), el("div", "stat-label", s.label));
    row.append(card);
  });
  const tags = $("#job-families");
  (d.previousWork?.jobFamilies || []).forEach((f) => tags.append(el("span", "tag", f)));
}

function renderNewFiles(d) {
  const ul = $("#file-list");
  (d.newFiles || []).forEach((f) => ul.append(el("li", null, f)));
}

function renderResearch(d, ledger) {
  const list = $("#rq-list");
  const counts = { all: 0, safe: 0, caveat: 0, "do-not-cite": 0 };

  (d.rq || []).forEach((q) => {
    counts.all += 1;
    counts[q.citeStatus] = (counts[q.citeStatus] || 0) + 1;

    const li = el("li", "rq");
    li.dataset.status = q.citeStatus;

    const head = el("button", "rq-head");
    head.setAttribute("aria-expanded", "false");
    head.append(el("span", "rq-id", q.id), el("span", "rq-q", q.question), chip(q.citeStatus));

    const body = el("div", "rq-body");
    body.hidden = true;
    body.append(el("p", "rq-answer", q.answer));

    const meta = el("div", "rq-meta");
    const claim = ledger.get((q.claims || [])[0]);
    if (claim) {
      const cl = el("div", "rq-claim");
      cl.append(el("b", null, "Audited claim: "), document.createTextNode(claim.text));
      if (claim.geminiConfidence != null) {
        cl.append(el("span", "conf", `  ·  Gemini confidence ${Math.round(claim.geminiConfidence * 100)}%`));
      }
      meta.append(cl);
    }
    if ((q.evidence || []).length) {
      const ev = el("div", "rq-evidence");
      q.evidence.forEach((e) => ev.append(el("span", "ev", e)));
      meta.append(ev);
    }
    body.append(meta);

    head.addEventListener("click", () => {
      const open = body.hidden;
      body.hidden = !open;
      head.setAttribute("aria-expanded", String(open));
    });

    li.append(head, body);
    list.append(li);
  });

  // Ledger bar proportions + filter counts
  $("#seg-safe").style.flexGrow = counts.safe || 0.001;
  $("#seg-caveat").style.flexGrow = counts.caveat || 0.001;
  $("#seg-dnc").style.flexGrow = counts["do-not-cite"] || 0.001;
  $("#ct-all").textContent = counts.all;
  $("#ct-safe").textContent = counts.safe;
  $("#ct-caveat").textContent = counts.caveat;
  $("#ct-dnc").textContent = counts["do-not-cite"];

  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      const f = btn.dataset.filter;
      document.querySelectorAll(".rq").forEach((rq) => {
        rq.hidden = f !== "all" && rq.dataset.status !== f;
      });
    });
  });
}

function renderEvidence(d) {
  const strong = $("#eq-strong");
  const caveat = $("#eq-caveat");
  (d.evidenceQuality?.strongNow || []).forEach((x) => strong.append(el("li", null, x)));
  (d.evidenceQuality?.useWithCaveats || []).forEach((x) => caveat.append(el("li", null, x)));
}

function renderAgents(d) {
  const flow = $("#agent-flow");
  (d.agentLoop?.agents || []).forEach((a) => {
    const li = el("li", "agent");
    const txt = el("div");
    txt.append(el("div", "agent-name", a.name), el("div", "agent-does", a.does));
    li.append(txt);
    flow.append(li);
  });
  const cad = $("#cadence");
  (d.agentLoop?.cadence || []).forEach((c) => {
    const box = el("div", "cad");
    box.append(el("div", "cad-day", c.day), el("div", "cad-task", c.task));
    cad.append(box);
  });
}

function renderSources(d) {
  const grid = $("#source-grid");
  (d.sources || []).forEach((s) => {
    const card = el("div", "source");
    card.append(el("div", "source-name", s.name), el("div", "source-use", s.useFor));
    if (s.url) {
      const a = el("a", "source-link", s.url);
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      card.append(a);
    }
    grid.append(card);
  });
}

function renderActions(d) {
  const ul = $("#action-list");
  (d.nextActions || []).forEach((a) => ul.append(el("li", null, a)));
}

function renderProvenance(d) {
  const p = d.provenance || {};
  const body = $("#prov-body");
  const stages = p.stages || {};
  const models = p.models || {};
  const order = ["claude", "deepseek", "gemini"];
  order.forEach((k) => {
    const st = stages[k] || "skipped";
    const pill = el("div", "prov-pill");
    pill.append(
      document.createTextNode(`${models[k] || k}`),
      el("span", `st st-${st}`, st)
    );
    body.append(pill);
  });
  if (p.generatedAt) {
    const when = el("div", "prov-pill");
    when.append(document.createTextNode("generated"), el("span", "st", p.generatedAt.slice(0, 16).replace("T", " ")));
    body.append(when);
  }
  // Rail status line
  const ran = (p.stages && Object.entries(p.stages).filter(([, v]) => v === "live").map(([k]) => k)) || [];
  $("#rail-status").textContent = ran.length
    ? `Live: ${ran.join(", ")}${p.generatedAt ? ` · ${p.generatedAt.slice(0, 10)}` : ""}`
    : "Curated baseline";
}

/* ---- Scroll-spy for the rail ---- */
function initScrollSpy() {
  const links = [...document.querySelectorAll(".rail-nav a")];
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove("is-active"));
          map.get(e.target.id)?.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("main .section").forEach((s) => obs.observe(s));
}

/* ---- Boot ---- */
async function main() {
  let data;
  try {
    data = await loadJson("tap-synthesis.json");
  } catch (e) {
    showError(
      `Could not load the synthesis data (${e.message}). Run "npm run orchestrate" then "npm run build:dashboard".`
    );
    return;
  }
  const ledger = await loadLedger("claim-ledger.jsonl");

  renderLead(data);
  renderStatus(data);
  renderNewFiles(data);
  renderResearch(data, ledger);
  renderEvidence(data);
  renderAgents(data);
  renderSources(data);
  renderActions(data);
  renderProvenance(data);
  initScrollSpy();
}

main();
