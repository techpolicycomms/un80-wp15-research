/** WP15 keyword tiers for relevance scoring */

export const KEYWORD_TIERS = {
  action_61_high: [
    "ict consolidation",
    "shared services",
    "shared service",
    "unicc",
    "cloud",
    "cybersecurity",
    "cyber security",
    "interoperability",
    "office 365",
    "microsoft 365",
    "network infrastructure",
    "data centre",
    "data center",
  ],
  action_62_high: [
    "technology accelerator",
    "tap ",
    "digital id",
    "digital identity",
    "verifiable credential",
    "innovation accelerator",
    "expertise on demand",
    "digital public good",
    "dpg",
  ],
  both_medium: [
    "digital transformation",
    "artificial intelligence",
    " ai ",
    "machine learning",
    "generative ai",
    "innovation",
    "digital cooperation",
    "emerging technology",
    "digital identity",
    "blockchain",
  ],
  general_low: [
    "technology",
    "digital",
    "information and communications",
    "software",
    "platform",
  ],
  // Short tokens — matched with word boundaries only (avoids "ict" in unrelated words)
  general_low_boundary: ["ict", "tap", "dpg", " ai "],
};

export function allKeywords() {
  return [
    ...KEYWORD_TIERS.action_61_high,
    ...KEYWORD_TIERS.action_62_high,
    ...KEYWORD_TIERS.both_medium,
    ...KEYWORD_TIERS.general_low,
    ...KEYWORD_TIERS.general_low_boundary.map((w) => w.trim()),
  ];
}

function matchesKeyword(lower, word, tier) {
  const w = word.toLowerCase().trim();
  if (tier === "general_low_boundary") {
    const pattern = new RegExp(`\\b${w.replace(/\s+/g, "")}\\b`, "i");
    return pattern.test(lower);
  }
  return lower.includes(w);
}

export function matchKeywords(text) {
  const lower = ` ${text.toLowerCase()} `;
  const matched = [];
  for (const [tier, words] of Object.entries(KEYWORD_TIERS)) {
    for (const word of words) {
      if (matchesKeyword(lower, word, tier)) {
        matched.push({ keyword: word.trim(), tier });
      }
    }
  }
  return matched;
}

export function scoreSignal(matched) {
  if (matched.some((m) => m.tier === "action_61_high")) return { priority: "high", relevance: "action_61" };
  if (matched.some((m) => m.tier === "action_62_high")) return { priority: "high", relevance: "action_62" };
  if (matched.some((m) => m.tier === "both_medium")) return { priority: "medium", relevance: "both" };
  if (matched.some((m) => m.tier === "general_low" || m.tier === "general_low_boundary"))
    return { priority: "low", relevance: "both" };
  return { priority: null, relevance: null };
}
