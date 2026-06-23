import Anthropic from "@anthropic-ai/sdk";

const log = (m) => process.stderr.write(`[providers] ${m}\n`);

export async function callClaude({ env, model, system, user, schema }) {
  const key = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY;
  if (!key || key.length < 8) { log("Claude skipped (no key)"); return null; }
  try {
    const client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model,
      max_tokens: 32000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content: user }],
    });
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    return JSON.parse(text);
  } catch (e) { log(`Claude failed: ${e.message}`); return null; }
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
    const r = await fetch(url, {
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
