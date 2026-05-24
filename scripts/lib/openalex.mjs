#!/usr/bin/env node
/**
 * OpenAlex + Unpaywall helpers for academic evidence fetching.
 */
const DEFAULT_UA =
  process.env.OPENALEX_MAILTO
    ? `un80-wp15-research/0.1 (mailto:${process.env.OPENALEX_MAILTO})`
    : "un80-wp15-research/0.1 (mailto:research@techpolicycomms.org)";

export async function fetchOpenAlexJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": DEFAULT_UA, Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`OpenAlex ${res.status}: ${text.slice(0, 200)}`);
  }
  if (text.trimStart().startsWith("<")) {
    throw new Error(`OpenAlex returned HTML for ${url}`);
  }
  return JSON.parse(text);
}

export async function fetchWorkByDoi(doi) {
  const normalized = doi.replace(/^https?:\/\/doi\.org\//i, "");
  return fetchOpenAlexJson(
    `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(normalized)}`
  );
}

export async function searchWorks({ search, minCitations = 50, perPage = 5 }) {
  const params = new URLSearchParams({
    search,
    filter: `cited_by_count:>${minCitations},type:article`,
    sort: "cited_by_count:desc",
    per_page: String(perPage),
  });
  const data = await fetchOpenAlexJson(`https://api.openalex.org/works?${params}`);
  return data.results ?? [];
}

export function isRelevantWork(work, keywords) {
  const haystack = [
    work.display_name ?? "",
    work.abstract_inverted_index ? Object.keys(work.abstract_inverted_index).join(" ") : "",
    work.primary_location?.source?.display_name ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

export function workToReference(work, { relevance, topicTags, footnoteId, rationale }) {
  const src = work.primary_location?.source;
  const doi = work.doi?.replace(/^https:\/\/doi\.org\//i, "") ?? null;
  const authors = (work.authorships ?? [])
    .slice(0, 3)
    .map((a) => a.author?.display_name)
    .filter(Boolean);
  const authorStr =
    authors.length > 3
      ? `${authors.slice(0, 3).join("; ")} et al.`
      : authors.join("; ");

  return {
    footnote_id: footnoteId,
    relevance,
    topic_tags: topicTags,
    title: work.display_name,
    authors: authorStr || "Unknown",
    year: work.publication_year ?? null,
    journal: src?.display_name ?? null,
    cited_by_count: work.cited_by_count ?? 0,
    doi,
    openalex_id: work.id ?? null,
    open_access_url:
      work.best_oa_location?.landing_page_url ??
      work.open_access?.oa_url ??
      (doi ? `https://doi.org/${doi}` : null),
    is_oa: Boolean(work.open_access?.is_oa),
    source_index: "openalex",
    confidence: (work.cited_by_count ?? 0) >= 500 ? "high" : "medium",
    wp15_rationale: rationale ?? "Auto-discovered via OpenAlex; human review required before use in reports.",
    use_when: "Review and assign use_when before citing in a briefing.",
  };
}

export async function enrichWithUnpaywall(ref, email) {
  if (!email || !ref.doi || ref.is_oa) return ref;
  try {
    const res = await fetch(
      `https://api.unpaywall.org/v2/${encodeURIComponent(ref.doi)}?email=${encodeURIComponent(email)}`
    );
    if (!res.ok) return ref;
    const data = await res.json();
    const best = data.best_oa_location;
    if (best?.url) {
      return {
        ...ref,
        open_access_url: best.url,
        is_oa: true,
      };
    }
  } catch {
    /* ignore Unpaywall failures */
  }
  return ref;
}

export function nextFootnoteId(existingRefs) {
  const nums = existingRefs
    .map((r) => r.footnote_id?.match(/\^(\d+)/)?.[1])
    .filter(Boolean)
    .map(Number);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `^${next}`;
}
