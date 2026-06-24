// Curated, schema-shaped version of data/tap-source-synthesis.md.
// Used directly when the Claude stage is unavailable, and as the target
// structure the Claude prompt is asked to refine. Keep in sync with the source .md.

export const fallbackSynthesis = {
  status:
    "Evidence-backed working synthesis. Suitable for working-group review; not yet leadership-validated.",
  leadAnswer: {
    statement:
      "TAP should be framed as a lean, system-level portfolio and execution mechanism that attaches senior UN leadership decisions to distributed entity-level delivery capacity. It should not duplicate existing innovation hubs.",
    points: [
      "UN innovation capacity is real but distributed — WFP, UNICEF, UNDP, UNHCR, ITU, Global Pulse, DPO and others each hold pieces of implementation capacity.",
      "System-level exchange exists, but system-level execution is weak. UNIN connects and curates; DTN coordinates technology actors; UN 2.0/Global Pulse provide capability — none provides a durable, funded, leadership-to-delivery mechanism.",
      "The design gap is not another hub. It is a repeatable way to identify system-level priorities, attach funding/governance, assemble surge teams from existing capacity, and transition solutions to long-term owners.",
      "The funding model is the \"teeth\". Without flexible pooled funding or committed entity contributions, TAP risks becoming another coordination layer.",
    ],
  },
  previousWork: {
    stats: [
      { label: "Innovation-related records collected", value: 114 },
      { label: "From official recruitment sources", value: 85 },
      { label: "From UN Talent aggregator / manual discovery", value: 29 },
      { label: "Explicit core innovation roles", value: 32 },
    ],
    jobFamilies: [
      "Programme delivery",
      "Digital transformation",
      "AI / data",
      "Partnerships / ecosystem",
      "Research / policy",
      "Operations",
      "Innovation strategy",
    ],
  },
  // Innovation-jobs scan intelligence. Only figures documented in the source are
  // used; per-agency and geography breakdowns await the raw dataset and are NOT invented.
  innovationJobs: {
    total: 114,
    bySource: [
      { label: "Official recruitment sources", value: 85, note: "Authoritative capability signal" },
      { label: "UN Talent aggregator / manual discovery", value: 29, note: "Discovery only — not authoritative evidence" },
    ],
    byRole: [
      { label: "Explicit core innovation roles", value: 32, note: "Labelled 'innovation'" },
      { label: "Embedded in other functions", value: 82, note: "Programme, digital, data, policy, partnership, operations" },
    ],
    jobFamilies: [
      "Programme delivery",
      "Digital transformation",
      "AI / data",
      "Partnerships / ecosystem",
      "Research / policy",
      "Operations",
      "Innovation strategy",
    ],
    takeaway:
      "Only 28% of innovation-related roles are explicitly labelled 'innovation' — the other 72% are embedded across programme, digital, data, policy, partnership and operations functions. Capacity is real but distributed, which is the core evidence for TAP orchestrating existing entity capacity rather than building a new central hub.",
    pending: "Per-agency, role-family and geography distributions await re-running the innovation-jobs collector on the raw dataset (not yet in this repo).",
  },
  newFiles: [
    "UNIN interview (internal, not published)",
    "WP15 interview (internal) (internal, not published)",
    "TAP working draft (internal)",
    "TAP weekly update (internal)",
    "TAP executive deck (internal)",
    "un80 inititave workstream 3 changing structures and realigning programmes.pdf",
    "ungp-innovation-scaling-report.pdf",
  ],
  rq: [
    {
      id: "RQ-001",
      question: "Who are the key actors and stakeholders in the UN innovation ecosystem?",
      answer:
        "Map the ecosystem by function, not by logo: entity-level implementation capacity (WFP, UNICEF, UNDP, UNHCR, ITU, DPO); system-level exchange and knowledge (UNIN, UN 2.0, capacity-building); coordination/decision channels (DTN, HLCM/CEB, UN80 Steering Committee); flexible delivery enablers (Global Pulse, UNICC, Digital ID/Data Commons, pooled funds); and adoption owners who can commit to transition and reuse.",
      evidence: ["WP15 interview (internal)", "WP15 interview (internal)", "innovation-jobs dataset", "TAP working draft (internal)"],
      claims: ["RQ-001"],
    },
    {
      id: "RQ-002",
      question: "How is innovation currently delivered across entity and cross-entity levels?",
      answer:
        "Innovation is delivered through a mixed architecture — entity accelerators and labs, digital/data teams, programme-led pilots, funds, communities of practice, and ad hoc inter-agency coalitions. No single UN model dominates, which supports TAP as an orchestrator and execution-enabler rather than a centralized replacement.",
      evidence: ["WFP/UNICEF patterns in jobs dataset", "WP15 interview (internal)", "UNGP Scaling the Summit", "WP15 interview (internal)"],
      claims: ["RQ-002"],
    },
    {
      id: "RQ-003",
      question: "What processes, roles, and barriers characterize the ecosystem?",
      answer:
        "The process moves idea/demand signal → pilot/prototype → internal validation → attempted scale. Support breaks at ownership, technical delivery, flexible funding, procurement/legal, cross-entity resource sharing, and adoption/transition. Funding is the named problem but is often a proxy for missing execution resources.",
      evidence: ["WP15 interview (internal)", "UNGP scaling report", "TAP Business Needs Survey slide", "WP15 interview (internal)"],
      claims: ["RQ-003"],
    },
    {
      id: "RQ-004",
      question: "Where is the ecosystem strongest, and where are the gaps?",
      answer:
        "Strongest at entity-level innovation and distributed technical/programmatic expertise. The critical gap is system-level implementation capacity: a mechanism that lets senior leadership decide priorities and then mobilize entity-level capacity for system-level use cases.",
      evidence: ["WP15 interview (internal) (Data Commons, entity teams)", "WP15 interview (internal) (UNIN not an implementer)", "2024 UN 2.0 Assessment slide"],
      claims: ["RQ-004"],
    },
    {
      id: "RQ-005",
      question: "How do innovations travel through hubs, and where does support break?",
      answer:
        "Grassroots ideas and entity innovations move through WFP, Global Pulse, UNICEF, UNIN and others, but often fail to cross into multi-entity adoption. Support breaks when there is no mandate, no common owner, no pooled funding, no technical \"doing\" team, or no sustainable service-provider/cost-recovery route.",
      evidence: ["WP15 interview (internal) (Global Pulse cohorts, Data Commons)", "WP15 interview (internal) (Digital ID)", "UNGP scaling journey"],
      claims: ["RQ-005"],
    },
    {
      id: "RQ-006",
      question: "What operating models exist, and what do they teach TAP?",
      answer:
        "Learn from at least five: WFP Innovation Accelerator (structured path to scale); UNICEF Venture Fund (staged non-dilutive funding, open-source, real-time data); Global Pulse accelerator (system-wide cohort/support); Digital ID/Data Commons (small technical ownership + cross-entity mandate); CRAF'd/MPTF (pooled financing, steering committee, secretariat, administrative agent, results reporting).",
      evidence: ["Local interviews + working draft", "WFP Innovation page", "UNICEF Venture Fund page", "CRAF'd MPTF page"],
      claims: ["RQ-006"],
    },
    {
      id: "RQ-007",
      question: "What external accelerator best practices should be adapted?",
      answer:
        "Adapt the substantive practices, not cosmetic rituals: stage gates and stop/go decisions; fast sprints for uncertainty reduction; adoption-owner checks before scale funding; structured technical support and a partner bench; portfolio-level measurement (not idea-count); and a clear transition route into operations, cost recovery, or service-provider ownership.",
      evidence: ["Executive deck", "Working draft external-benchmark slide", "OECD/OPSI and NHS adoption logic", "WFP/UNICEF examples"],
      claims: ["RQ-007"],
    },
    {
      id: "RQ-008",
      question: "What criteria define TAP-worthy digital/technology innovation?",
      answer:
        "A TAP-worthy use case clears four filters: new or newly adapted to context; technology-enabled (digital, data, AI, platform, shared component); system-wide potential (value crosses entities, countries, or shared functions); and a real adoption pathway (named owner, transition route, measurable benefit). Excludes generic helpdesk, routine data entry, ordinary comms, and one-entity IT maintenance.",
      evidence: ["Executive deck RQ-004", "Working draft definition slide", "UN80 report paragraphs 76-79"],
      claims: ["RQ-008"],
    },
    {
      id: "RQ-009",
      question: "What pain points block delivery and scale?",
      answer:
        "Fragmentation, funding constraints, policy/legal/governance constraints, limited technical capacity, weak adoption ownership, earmarked funding, time scarcity, and culture/leadership gaps. The TAP Business Needs Survey supports these categories, but the raw survey still needs validation.",
      evidence: ["TAP survey slide in working draft", "WP15 interview (internal)", "UNGP scaling report"],
      claims: ["RQ-009"],
    },
    {
      id: "RQ-010",
      question: "What support is needed at different maturity levels?",
      answer:
        "Support changes by maturity — Discovery/demand: surveys, communities, accelerator pipelines, horizon scanning. Seed/pilot: sprint funding, technical assessment, project management, data/security/legal checks. Implementation: surge task force, owner commitments, de-block procurement/legal. Scale: fund adoption and interoperability, connect adopters. Transition: hand over to a shared service provider, implementing entity, cost-recovery mechanism, or pooled-fund window.",
      evidence: ["Working draft portfolio cycle", "WP15 interview (internal)", "UNICEF Venture Fund stage logic", "WFP path-to-scale logic"],
      claims: ["RQ-010"],
    },
    {
      id: "RQ-011",
      question: "What should inform demand signals, prioritization, and metrics?",
      answer:
        "Don't rely only on a Microsoft Forms-style survey. Triangulate: business-needs survey, existing accelerator/case pipelines, official innovation/digital job postings, pooled-funding and donor-priority signals, CIO/DTN/UNIN/UN 2.0 community inputs, and use-case progress data (Data Commons, Beneficiary ID, Translation, Expertise-on-Demand). Prioritize by system value, urgency, adoption readiness, reuse potential, technical feasibility, risk, and owner availability.",
      evidence: ["WP15 interview (internal) (WFP demand signal)", "jobs dataset", "TAP survey", "working draft"],
      claims: ["RQ-011"],
    },
    {
      id: "RQ-012",
      question: "Who is TAP's client?",
      answer:
        "TAP's client is the accountable problem/adoption owner, not simply the innovator. Innovators are partners. The client must be able to commit to adoption, funding or cost recovery, a legal/policy path, and transition. For system-level assets this may be a coalition or shared-service owner.",
      evidence: ["Executive deck RQ-011", "WP15 interview (internal) (business ownership)", "WP15 interview (internal) (leadership-to-ground link)"],
      claims: ["RQ-012"],
    },
    {
      id: "RQ-013",
      question: "What operating, governance, and funding model should TAP use?",
      answer:
        "A hybrid model: a lean TAP Coordination Unit (portfolio, delivery tracking, fundraising, evidence); time-bound Surge Task Forces drawn from entity experts; the UN Innovation Ecosystem as the source of knowledge, demand, solutions, owners; a Steering Committee for quarterly portfolio/funding/stage decisions; and pooled funding rather than slow case-by-case fundraising. Governance must separate problem selection, technical validation, funding allocation, delivery oversight, and adoption commitment.",
      evidence: ["TAP working draft (internal) slides 22-28", "WP15 interview (internal) (pooled funding)", "CRAF'd governance model"],
      claims: ["RQ-013"],
    },
    {
      id: "RQ-014",
      question: "What investment posture and KPIs should TAP use?",
      answer:
        "A catalytic, stage-based public-value venture posture: small fast seed/sprint tickets; larger scale-up funding after evidence and owner commitment; a sustainable transition route. KPIs track portfolio flow and adoption (seed/scale-up counts, time from demand to funded setup, entities contributing to surge teams, named owners and completed transitions, reuse, value vs. business case, and integrity/risk indicators) — not idea volume.",
      evidence: ["Executive deck RQ-013/RQ-014", "Working draft KPI slide", "UNICEF/WFP examples"],
      claims: ["RQ-014"],
    },
    {
      id: "RQ-015",
      question: "What pathway and risks should guide TAP setup?",
      answer:
        "Move from UN80 temporary governance into a standing joint programme or MPTF-style mechanism: mandate/sponsor route → demand and portfolio thesis → first proposals and owner commitments → delivery via surge teams and pooled capacity → transition to owners → institutionalize as a standing UN 2.0 acceleration capability. Key risks: coordination-only failure, duplication, funding capture, ownership failure, evidence weakness, unclear post-UN80 governance, and security/legal risk on AI/data use cases.",
      evidence: ["UN80 report paragraphs 76-79", "WP15 interview (internal)", "WP15 interview (internal)", "working draft", "UNGP scaling report"],
      claims: ["RQ-015"],
    },
  ],
  evidenceQuality: {
    strongNow: [
      "Direction of travel: TAP as a lean system-level accelerator/joint programme — anchored in the UN80 report and working draft.",
      "Distributed capacity — supported by the innovation-jobs dataset, interviews, and the UNGP report.",
      "System-level execution gap — strongly supported by the the UNIN interviewee and WP15 interview (internal)s.",
      "Need for pooled funding and governance — supported by the Global Pulse/OSG interviewee, CRAF'd/MPTF, and the working-draft funding slides.",
    ],
    useWithCaveats: [
      "TAP Business Needs Survey percentages — cite as internal WIP until the raw survey and methodology are checked.",
      "Gartner benchmark — cite only if the underlying source/table can be shown.",
      "UN Talent aggregator roles — use for discovery, not authoritative evidence.",
      "UN 2.0 Assessment data — useful, but confirm the raw assessment and sharing status.",
    ],
  },
  agentLoop: {
    agents: [
      { name: "Source Watcher", does: "Watches the TAP folder, UN80 docs, MPTF Gateway, IATI, WFP, UNICEF, Global Pulse, OECD OPSI, CEB/HLCM/DTN. Emits a changed-source registry." },
      { name: "Document Extractor", does: "Converts PPTX/PDF/DOCX/XLSX/HTML to text; emits extracts, metadata, keyword snippets, duplicate detection." },
      { name: "Innovation Jobs", does: "Re-runs and extends the innovation-jobs collector across WHO/FAO/Taleo, Inspira, UNFPA, UNOPS, UNICC; emits role distributions by agency/source/family/geography." },
      { name: "Funding & Governance", does: "Pulls MPTF Gateway fund/project/contribution data and IATI activities; tags pooled funds by governance model, contributors, administrative agent, disbursement." },
      { name: "Case Study", does: "Tracks WFP, UNICEF, Global Pulse, CRAF'd, Digital ID/Data Commons, NHS, OECD OPSI; extracts stage gates, support package, ticket size, owner, scale metrics, transition." },
      { name: "Demand Signal", does: "Compares TAP survey, accelerator pipelines, UNIN/UN 2.0 community signals, jobs data, funding flows; emits recurring themes and survey-only vs. validated." },
      { name: "Claim Auditor", does: "Maintains the claim ledger: claim text, source IDs, evidence type, confidence, validation status, stale date, deck slide, next check; emits safe / caveat / do-not-cite." },
      { name: "Synthesis / Deck", does: "Produces slide-ready bullets and a weekly research delta; never invents final claims — only promotes when the Claim Auditor has enough evidence." },
    ],
    cadence: [
      { day: "Monday AM (Geneva)", task: "Run watchers and extraction." },
      { day: "Monday midday", task: "Refresh jobs / funding / case data." },
      { day: "Tuesday", task: "Claim auditor updates evidence statuses." },
      { day: "Wednesday", task: "Synthesis agent prepares deck deltas and interview-question updates." },
      { day: "Friday", task: "Human review with Rahul / working team; promote only reviewed claims." },
    ],
  },
  sources: [
    { name: "MPTF Gateway", useFor: "Pooled fund structures, contributors, participating organizations, project financials, CRAF'd governance.", url: "https://mptf.undp.org/" },
    { name: "Complex Risk Analytics Fund (CRAF'd)", useFor: "Concrete pooled-fund benchmark: steering committee, secretariat, administrative agent, funding windows.", url: "https://mptf.undp.org/fund/cra00" },
    { name: "IATI API Gateway", useFor: "Development/humanitarian activity data, donor-recipient flows, sectors, implementing orgs, duplication/coordination evidence.", url: "https://developer.iatistandard.org/" },
    { name: "WFP Innovation Accelerator", useFor: "Path-to-scale model, funding/mentorship/hands-on support, operational access.", url: "https://innovation.wfp.org/" },
    { name: "UNICEF Venture Fund", useFor: "Staged non-dilutive funding, open-source requirements, real-time data, growth funding.", url: "https://www.unicefventurefund.org/" },
    { name: "UN Global Pulse", useFor: "SG innovation-lab positioning, Global Pulse accelerator/hubs, flexible innovation capacity.", url: "https://www.unglobalpulse.org/" },
    { name: "OECD OPSI", useFor: "Public-sector innovation benchmark cases and external case-study coding.", url: "https://oecd-opsi.org/case_type/opsi/" },
  ],
  nextActions: [
    "Validate the raw TAP Business Needs Survey before using percentages as final evidence.",
    "Turn the ecosystem map into a database with actor type, level, decision rights, implementation capacity, funding model, and evidence source.",
    "Update the interview guide for WFP around demand-signal design, private-sector partnership, and path-to-scale governance.",
    "Interview Max / Digital ID as a system-level delivery case with a technical owner + institutional mandate.",
    "Interview DPO / a smaller entity to avoid over-designing for mature agencies only.",
    "Run the secondary-data agent loop weekly and maintain a claim ledger before every deck update.",
  ],
};
