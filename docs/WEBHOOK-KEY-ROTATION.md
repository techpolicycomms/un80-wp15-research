# Webhook API key rotation

Your webhook API key was exposed during local setup troubleshooting. Rotate it once:

1. Open https://cursor.com/automations/132e3dc9-f9c7-4b80-97e0-8ad28449282a
2. Webhook trigger → **Regenerate API key**
3. Update `~/Projects/un80-wp15-research/.env`:

```bash
WEBHOOK_URL=https://api2.cursor.sh/automations/webhook/132e3dc9-f9c7-4b80-97e0-8ad28449282a
WEBHOOK_API_KEY=crsr_NEW_TOKEN_ONLY
```

4. Test: `./scripts/trigger-webhook-example.sh`

**Important:** Paste only the `crsr_...` token — not `Authorization: Bearer`.
