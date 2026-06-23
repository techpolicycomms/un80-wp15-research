import { test } from "node:test";
import assert from "node:assert/strict";
import { providerStatus, MODELS } from "./config.mjs";

test("placeholder/short keys count as absent", () => {
  const s = providerStatus({ OPENAI_API_KEY: "n/a", ANTHROPIC_API_KEY: "sk-ant-".padEnd(40, "x") });
  assert.equal(s.openai, false);
  assert.equal(s.anthropic, true);
  assert.equal(s.gemini, false);
});

test("models default when env unset", () => {
  assert.equal(MODELS({}).anthropic, "claude-opus-4-8");
  assert.equal(MODELS({ DEEPSEEK_MODEL: "deepseek-reasoner" }).deepseek, "deepseek-reasoner");
});
