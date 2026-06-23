import { readFileSync } from "node:fs";

export function loadEnv(path = ".env") {
  let raw = "";
  try { raw = readFileSync(path, "utf8"); } catch { return { ...process.env }; }
  const env = { ...process.env };
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const present = (v) => typeof v === "string" && v.trim().length > 8;

export function providerStatus(env) {
  return {
    anthropic: present(env.ANTHROPIC_API_KEY) || present(env.CLAUDE_API_KEY),
    gemini: present(env.GEMINI_API_KEY) || present(env.GOOGLE_API_KEY),
    deepseek: present(env.DEEPSEEK_API_KEY),
    openai: present(env.OPENAI_API_KEY),
  };
}

export function MODELS(env) {
  return {
    anthropic: env.ANTHROPIC_MODEL || "claude-opus-4-8",
    deepseek: env.DEEPSEEK_MODEL || "deepseek-chat",
    gemini: env.GEMINI_MODEL || "gemini-2.5-pro",
  };
}
