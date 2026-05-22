#!/usr/bin/env bash
# Example: trigger webhook ingest automation (after configuring .env)
set -euo pipefail

if [[ ! -f .env ]]; then
  echo "Copy .env.example to .env and set WEBHOOK_URL + WEBHOOK_API_KEY"
  exit 1
fi

source .env

if [[ -z "${WEBHOOK_URL:-}" || -z "${WEBHOOK_API_KEY:-}" ]]; then
  echo "WEBHOOK_URL and WEBHOOK_API_KEY must be set in .env"
  exit 1
fi

curl -sS -X POST "$WEBHOOK_URL" \
  -H "Authorization: Bearer $WEBHOOK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "source_submission",
    "payload": {
      "title": "Example public source — ICC shared services",
      "url": "https://www.unicc.org/",
      "topic": "shared_ict_services",
      "relevance": "action_61",
      "summary": "Test ingest from trigger-webhook-example.sh",
      "submitted_by": "local-dev"
    }
  }'

echo ""
echo "Webhook triggered."
