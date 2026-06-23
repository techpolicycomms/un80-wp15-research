import { test } from "node:test";
import assert from "node:assert/strict";
import { callDeepSeek, callGemini, callClaude } from "./providers.mjs";

test("missing keys return null, never throw", async () => {
  assert.equal(await callDeepSeek({ env: {}, model: "deepseek-chat", system: "s", user: "u" }), null);
  assert.equal(await callGemini({ env: {}, model: "gemini-2.5-pro", system: "s", user: "u" }), null);
  assert.equal(await callClaude({ env: {}, model: "claude-opus-4-8", system: "s", user: "u", schema: {} }), null);
});
