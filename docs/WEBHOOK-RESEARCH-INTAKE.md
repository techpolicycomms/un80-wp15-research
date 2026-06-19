# Webhook research intake

Use the **UN80 Webhook Source Ingest** automation to add curated public sources without waiting for the Monday landscape scan.

**Automation:** https://cursor.com/automations/132e3dc9-f9c7-4b80-97e0-8ad28449282a  
**Setup:** [OPERATIONS.md](./OPERATIONS.md#submitting-a-public-source-webhook)

## When to submit

| Source type | Examples | Typical tier |
|-------------|----------|--------------|
| CEB / HLCM materials | Progress decks, implementation updates | B |
| Standards | W3C, ISO, ITU-T public specs | C |
| Agency publications | UNICC reports, ODET announcements | B |
| Think tank / grey lit | OECD, World Bank (public PDFs) | D |

Do **not** submit paywalled papers without a public abstract URL, internal surveys, or leaked documents.

## Payload example

```json
{
  "event": "source_submission",
  "payload": {
    "title": "HLCM AI services overview — public summary",
    "url": "https://www.unsystem.org/...",
    "topic": "shared_ict_services",
    "relevance": "action_61",
    "summary": "One paragraph on why this matters for WP15 consolidation.",
    "submitted_by": "rahul.jha"
  }
}
```

## What the agent does

1. Validates public reachability
2. Appends to `data/secondary-sources/YYYY-MM-DD-ingest.yaml` with `evidence_tier` and optional `claim_ids`
3. Opens PR `data: ingest source — <title>`
4. Adds Notion Sources inbox row
5. Records URL in Memories to prevent duplicate ingest

## Human review

1. Review PR on GitHub — run `npm run validate`
2. Notion Sources inbox → set **Accepted** or **Rejected**
3. If rejected: add Memory so agents skip the URL
4. If accepted: merge PR; optional rollforward note in `reports/living-analysis.md`

## Bulk intake tip

For meeting prep with multiple links, send one webhook per URL (or batch via script extending `scripts/trigger-webhook-example.sh`). Do not paste confidential attachments — link to public pages only.
