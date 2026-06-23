"""
UN80 WP15 Research Hub — Streamlit dashboard
Action 61 (ICT consolidation) + Action 62 (Technology Accelerator Platform).

Reads the repo's existing public data model in `data/` plus an optional
sanitized TAP claim ledger. Designed to deploy on Streamlit Community Cloud
by connecting this GitHub repo (entrypoint: streamlit_app.py).

PUBLIC SECONDARY DATA ONLY — DRAFT working documents, not agreed UN positions.
No primary interview data or raw survey records are read or displayed.
"""
from __future__ import annotations
import json
import glob
from pathlib import Path

import streamlit as st

try:
    import yaml
except ImportError:  # graceful message on first deploy before requirements install
    st.error("PyYAML not installed — add `pyyaml` to requirements.txt")
    st.stop()

import pandas as pd

# ---------------------------------------------------------------- ITU theme
ITU_BLUE = "#069AD7"
ITU_NAVY = "#1B365D"
ITU_GOLD = "#FFC72C"
STATUS_COLORS = {
    "safe_to_cite": "#2E7D32", "complete": "#2E7D32", "endorsed": "#2E7D32",
    "cite_with_caveat": "#F9A825", "in_progress": "#F9A825",
    "do_not_cite": "#C62828", "pending": "#9E9E9E",
}
ROOT = Path(__file__).parent
DATA = ROOT / "data"

st.set_page_config(page_title="UN80 WP15 Research Hub", page_icon="🌐", layout="wide")


# ---------------------------------------------------------------- loaders
@st.cache_data(show_spinner=False)
def load_yaml(rel: str):
    p = ROOT / rel
    if not p.exists():
        return None
    with open(p, encoding="utf-8") as f:
        return yaml.safe_load(f)


@st.cache_data(show_spinner=False)
def load_json(rel: str):
    p = ROOT / rel
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding="utf-8"))


@st.cache_data(show_spinner=False)
def load_jsonl(rel: str):
    p = ROOT / rel
    if not p.exists():
        return []
    rows = []
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))
    return rows


def chip(text: str, status: str) -> str:
    color = STATUS_COLORS.get(status, "#607D8B")
    return (f"<span style='background:{color};color:white;padding:2px 8px;"
            f"border-radius:10px;font-size:0.8em'>{text}</span>")


# ---------------------------------------------------------------- header
st.markdown(
    f"<h1 style='color:{ITU_NAVY};margin-bottom:0'>UN80 WP15 Research Hub</h1>"
    f"<p style='color:{ITU_BLUE};font-weight:600;margin-top:4px'>"
    f"Action 61 — ICT consolidation · Action 62 — Technology Accelerator Platform</p>"
    f"<p style='color:#888;font-size:0.85em'>Public secondary data only · DRAFT working "
    f"documents · not agreed UN positions</p>",
    unsafe_allow_html=True,
)

tabs = st.tabs([
    "Overview", "Action 61 · ICT", "Action 62 · TAP",
    "Evidence & claims", "Source monitor", "Social signals",
])

# ---------------------------------------------------------------- Overview
with tabs[0]:
    baseline = load_json("data/ict-spend-baseline.json") or {}
    tap = load_yaml("data/tap-use-cases.yaml") or {}
    tracker = load_yaml("data/action-tracker.yaml") or {}
    entities = load_yaml("data/entities.yaml") or {}

    c1, c2, c3, c4 = st.columns(4)
    spend = (baseline.get("totals", {}) or {}).get("annual_ict_spend_usd_min")
    c1.metric("Annual UN ICT spend (min)", f"${spend/1e9:.0f}B" if spend else "—")
    c2.metric("Entities in baseline", (entities.get("meta", {}) or {}).get("count", "—"))
    c3.metric("Expenditure coverage", f"{(entities.get('meta', {}) or {}).get('expenditure_coverage_pct','—')}%")
    c4.metric("TAP portfolio use cases", len((tap.get("portfolio") or [])))

    st.subheader("Action phase tracker")
    for action in (tracker.get("actions") or []):
        st.markdown(f"**{action.get('id','').upper()} — {action.get('title','')}**")
        cols = st.columns(len(action.get("phases") or []) or 1)
        for col, ph in zip(cols, action.get("phases") or []):
            col.markdown(chip(ph.get("status", ""), ph.get("status", "")), unsafe_allow_html=True)
            col.caption(f"**{ph.get('name','')}**  \n{ph.get('notes', ph.get('gate',''))}")

# ---------------------------------------------------------------- Action 61
with tabs[1]:
    baseline = load_json("data/ict-spend-baseline.json") or {}
    entities = load_yaml("data/entities.yaml") or {}
    st.subheader("ICT consolidation baseline (Action 61)")
    st.caption(f"Source: {(baseline.get('meta',{}) or {}).get('source','—')} · "
               f"as of {(baseline.get('meta',{}) or {}).get('as_of','—')}")
    cats = baseline.get("categories") or []
    if cats:
        df = pd.DataFrame(cats)
        st.dataframe(df, use_container_width=True, hide_index=True)
    ent = entities.get("entities") or []
    if ent:
        edf = pd.DataFrame(ent)
        if "shared_services_in_use" in edf:
            st.bar_chart(edf.set_index("id")["shared_services_in_use"])
        st.caption(f"Consolidation targets: {', '.join(entities.get('consolidation_targets', []))}")

# ---------------------------------------------------------------- Action 62
with tabs[2]:
    tap = load_yaml("data/tap-use-cases.yaml") or {}
    st.subheader("TAP portfolio (Action 62)")
    survey = tap.get("survey") or {}
    if survey:
        st.caption(f"Demand signal: {survey.get('contributors','—')} contributors · "
                   f"{survey.get('scope','')}")
    port = tap.get("portfolio") or []
    if port:
        pdf = pd.DataFrame(port)
        show = [c for c in ["name", "status", "maturity", "ownership", "strategic_support"] if c in pdf]
        st.dataframe(pdf[show], use_container_width=True, hide_index=True)

# ---------------------------------------------------------------- Evidence & claims
with tabs[3]:
    st.subheader("TAP evidence claim ledger")
    st.caption("Sanitized, public-data-backed claims. Internal interview evidence is "
               "referenced but not reproduced. Verified weekly by the substantiation loop.")
    ledger = load_jsonl("data/tap-claim-ledger.public.jsonl")
    if not ledger:
        st.info("No public claim ledger found at data/tap-claim-ledger.public.jsonl yet.")
    else:
        for c in ledger:
            cols = st.columns([0.12, 0.66, 0.22])
            cols[0].markdown(f"`{c.get('id','')}`")
            cols[1].markdown(c.get("claim", ""))
            cols[2].markdown(chip(c.get("status", ""), c.get("status", "")) +
                             f" <small>{c.get('confidence','')}</small>", unsafe_allow_html=True)
            ev = "; ".join(f"{e.get('source','')} ({e.get('detail','')[:80]})"
                           for e in (c.get("evidence") or []))
            if ev:
                cols[1].caption(ev)

# ---------------------------------------------------------------- Source monitor
with tabs[4]:
    st.subheader("Secondary-source landscape scans")
    scans = sorted(glob.glob(str(DATA / "secondary-sources" / "*-scan.yaml")), reverse=True)
    st.caption(f"{len(scans)} scan files tracked")
    pick = st.selectbox("Scan date", [Path(s).name for s in scans]) if scans else None
    if pick:
        scan = load_yaml(f"data/secondary-sources/{pick}") or {}
        rows = []
        for fnd in (scan.get("findings") or []):
            src = fnd.get("source", {}) or {}
            rows.append({"title": src.get("title"), "relevance": fnd.get("relevance"),
                         "topic": fnd.get("topic"), "confidence": fnd.get("confidence"),
                         "url": src.get("url")})
        if rows:
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True,
                         column_config={"url": st.column_config.LinkColumn()})
    overlap = load_yaml("data/overlap-signals.yaml") or {}
    if overlap:
        with st.expander("Overlap / duplication signals"):
            st.json(overlap)

# ---------------------------------------------------------------- Social signals
with tabs[5]:
    st.subheader("Social & media signals")
    social = load_yaml("data/social-signals.yaml") or {}
    if social:
        st.json(social)
    else:
        st.info("No social-signals.yaml found.")

st.markdown("---")
st.caption("UN80 WP15 Research Hub · ITU Innovation Hub · built with Streamlit · "
           "data: github.com/techpolicycomms/un80-wp15-research")
