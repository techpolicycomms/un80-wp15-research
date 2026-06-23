import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "node:child_process";

const log = (m) => process.stderr.write(`[providers] ${m}\n`);

// Extract a JSON object from free-form model text (strips code fences / preamble).
function extractJson(text) {
  if (!text) return null;
  let t = text;
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1];
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  try { return JSON.parse(t); } catch { return null; }
}

// Run Claude via the local Claude Code CLI (headless). Uses the logged-in
// session's auth (e.g. a Claude subscription) — no Anthropic API credits needed.
// Returns the parsed JSON object, or null on any failure.
export async function callClaudeCLI({ system, user, bin = "claude" }) {
  return new Promise((resolve) => {
    let out = "";
    let err = "";
    let proc;
    try {
      proc = spawn(bin, ["-p", "--output-format", "json"], { stdio: ["pipe", "pipe", "pipe"] });
    } catch (e) {
      log(`Claude CLI spawn failed: ${e.message}`);
      return resolve(null);
    }
    proc.on("error", (e) => { log(`Claude CLI unavailable: ${e.message}`); resolve(null); });
    proc.stdout.on("data", (d) => { out += d; });
    proc.stderr.on("data", (d) => { err += d; });
    proc.on("close", (code) => {
      if (code !== 0) { log(`Claude CLI exit ${code}: ${err.slice(0, 200)}`); return resolve(null); }
      let result;
      try { result = JSON.parse(out).result; } catch { result = out; }
      resolve(extractJson(result));
    });
    proc.stdin.write(`${system}\n\n${user}`);
    proc.stdin.end();
  });
}

export async function callClaude({ env, model, system, user, schema }) {
  const key = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY;
  if (!key || key.length < 8) { log("Claude skipped (no key)"); return null; }
  try {
    const client = new Anthropic({ apiKey: key });
    // Stream: large max_tokens + adaptive thinking can exceed the non-streaming
    // request timeout, so use .stream().finalMessage() per the SDK guidance.
    const stream = client.messages.stream({
      model,
      max_tokens: 32000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content: user }],
    });
    const res = await stream.finalMessage();
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    return JSON.parse(text);
  } catch (e) { log(`Claude failed: ${e.message}`); return null; }
}

async function fetchWithRetry(url, init, { attempts = 4, base = 1500 } = {}) {
  for (let i = 0; i < attempts; i += 1) {
    const r = await fetch(url, init);
    if (r.status !== 429 && r.status !== 503) return r;
    if (i === attempts - 1) return r;
    const wait = base * 2 ** i;
    log(`HTTP ${r.status} — retrying in ${wait}ms (${i + 1}/${attempts - 1})`);
    await new Promise((res) => setTimeout(res, wait));
  }
}

export async function callDeepSeek({ env, model, system, user }) {
  const key = env.DEEPSEEK_API_KEY;
  if (!key || key.length < 8) { log("DeepSeek skipped (no key)"); return null; }
  try {
    const r = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) { log(`DeepSeek HTTP ${r.status}`); return null; }
    const j = await r.json();
    return j.choices?.[0]?.message?.content ?? null;
  } catch (e) { log(`DeepSeek failed: ${e.message}`); return null; }
}

export async function callGemini({ env, model, system, user }) {
  const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (!key || key.length < 8) { log("Gemini skipped (no key)"); return null; }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const r = await fetchWithRetry(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });
    if (!r.ok) { log(`Gemini HTTP ${r.status}`); return null; }
    const j = await r.json();
    return j.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (e) { log(`Gemini failed: ${e.message}`); return null; }
}
