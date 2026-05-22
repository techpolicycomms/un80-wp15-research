#!/usr/bin/env bash
# Quick operational health check for UN80 WP15 Research Hub
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== UN80 WP15 ops check ==="
echo ""

echo "→ Node validation + dashboard build"
npm run validate
npm run build:dashboard
echo ""

echo "→ Key files"
for f in data/ict-spend-baseline.json data/action-tracker.yaml data/tap-use-cases.yaml; do
  test -f "$f" && echo "  OK  $f" || echo "  MISSING  $f"
done
echo ""

echo "→ Secondary source scans"
count=$(find data/secondary-sources -name '*.yaml' 2>/dev/null | wc -l | tr -d ' ')
echo "  $count scan file(s) in data/secondary-sources/"
echo ""

echo "→ Webhook config (local only)"
if [[ -f .env ]] && grep -q 'WEBHOOK_URL=.' .env 2>/dev/null; then
  echo "  OK  .env has WEBHOOK_URL set"
else
  echo "  —   .env not configured (copy .env.example for webhook testing)"
fi
echo ""

echo "→ Live links"
echo "  Dashboard:  https://techpolicycomms.github.io/un80-wp15-research/"
echo "  GitHub:     https://github.com/techpolicycomms/un80-wp15-research"
echo "  Notion hub: https://www.notion.so/36805383491f813fa227f709c187584a"
echo ""
echo "→ Cursor automations (verify Active in UI)"
echo "  Landscape:  https://cursor.com/automations/9267c6a1-fd79-4d72-81ca-6415647ab198"
echo "  Webhook:    https://cursor.com/automations/132e3dc9-f9c7-4b80-97e0-8ad28449282a"
echo "  Briefing:   https://cursor.com/automations/50fd2872-5154-49ee-a71f-31c3ffc0a058"
echo ""
echo "Done."
