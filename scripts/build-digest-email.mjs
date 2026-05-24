#!/usr/bin/env node
/**
 * Build HTML email body from a daily digest markdown file.
 * Used by .github/workflows/daily-digest-email.yml
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const reportsDir = "reports";
const argPath = process.argv[2];

function findDigestPath() {
  if (argPath && existsSync(argPath)) return argPath;
  const files = readdirSync(reportsDir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}-daily-digest\.md$/.test(f))
    .sort()
    .reverse();
  if (!files.length) throw new Error("No daily digest file found in reports/");
  return join(reportsDir, files[0]);
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mdToSimpleHtml(md) {
  let text = md.replace(/^\[\^[^\]]+\]:[^\n]*\n/gm, "");
  const lines = text.split("\n");
  const out = [];
  for (const line of lines) {
    if (line.startsWith("## ")) out.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
    else if (line.startsWith("### ")) out.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
    else if (line.startsWith("- ")) out.push(`<li>${escapeHtml(line.slice(2))}</li>`);
    else if (line.trim() === "---") out.push("<hr/>");
    else if (line.trim()) out.push(`<p>${escapeHtml(line)}</p>`);
  }
  return out.join("\n");
}

const file = findDigestPath();
const date = basename(file).replace("-daily-digest.md", "");
const repo = process.env.GITHUB_REPOSITORY ?? "techpolicycomms/un80-wp15-research";
const sha = process.env.GITHUB_SHA ?? "main";
const branch = process.env.GITHUB_REF_NAME ?? "main";
const fileUrl = `https://github.com/${repo}/blob/${sha}/${file}`;

const md = readFileSync(file, "utf8");
const html = `<!DOCTYPE html>
<html><body style="font-family: system-ui, sans-serif; max-width: 720px;">
<h2>UN80 WP15 Daily Digest — ${escapeHtml(date)}</h2>
<p><strong>Status:</strong> DRAFT — working document, not agreed UN policy.</p>
<p><a href="${escapeHtml(fileUrl)}">View full digest on GitHub</a> (${escapeHtml(branch)})</p>
<hr/>
${mdToSimpleHtml(md)}
<hr/>
<p style="color:#666;font-size:12px;">Automated from ${escapeHtml(repo)}. Human review required before external use.</p>
</body></html>`;

process.stdout.write(JSON.stringify({ date, path: file, html }));
