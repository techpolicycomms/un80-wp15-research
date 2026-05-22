# Automation prefill URLs (one-click import)

Open each URL to load a draft in the [Cursor Automations](https://cursor.com/automations) UI. Then:

1. Confirm repo: `techpolicycomms/un80-wp15-research` @ `main`
2. Enable **Open pull request**, **Memories**, **Notion MCP** (webhook + compiler)
3. Save — copy webhook URL + API key for Automation 2 (store in `.env`, not in repo)

Machine-readable definitions: [workflows.json](./workflows.json)

---

## 1. UN80 Weekly Landscape Monitor

- **Schedule:** `0 6 * * 1` (Mon 06:00 UTC)
- **Prompt:** [landscape-monitor.prompt.md](./landscape-monitor.prompt.md)

**Import:** [Open prefill → Landscape Monitor](https://cursor.com/automations/new?prefill=eyJuYW1lIjoiVU44MCBXZWVrbHkgTGFuZHNjYXBlIE1vbml0b3IiLCJkZXNjcmlwdGlvbiI6IldlZWtseSBwdWJsaWMgc2Vjb25kYXJ5IHNvdXJjZSBzY2FuIGZvciBVTjgwIFdQMTUgQWN0aW9uIDYxLzYyIiwid29ya2Zsb3ciOnsiYXV0aG9yVGV4dCI6IkxvYWQgYC5jdXJzb3Ivc2tpbGxzL3VuODAtbGFuZHNjYXBlLW1vbml0b3IvU0tJTEwubWRgLiBTY2FuIHB1YmxpYyBzb3VyY2VzOyB1cGRhdGUgZGF0YS9zZWNvbmRhcnktc291cmNlcy87IG9wZW4gUFIgaWYgbWF0ZXJpYWwgY2hhbmdlcy4iLCJnaXRDb25maWciOnsiYnJhbmNoIjoibWFpbiIsInJlcG9zaXRvcnkiOiJ0ZWNocG9saWN5Y29tbXMvdW44MC13cDE1LXJlc2VhcmNoIn0sIm1lbW9yeUVuYWJsZWQiOnRydWUsInRyaWdnZXJzIjpbeyJjcm9uVHJpZ2dlciI6eyJjcm9uRXhwcmVzc2lvbiI6IjAgNiAqICogMSJ9fV19fQ)

---

## 2. UN80 Webhook Source Ingest

- **Trigger:** Webhook (URL generated after save)
- **Prompt:** [webhook-ingest.prompt.md](./webhook-ingest.prompt.md)
- **Notion:** Sources inbox → `c3ac8601-780a-4ae4-bc0c-2d1b04f198f5`

**Import:** [Open prefill → Webhook Ingest](https://cursor.com/automations/new?prefill=eyJuYW1lIjoiVU44MCBXZWJob29rIFNvdXJjZSBJbmdlc3QiLCJkZXNjcmlwdGlvbiI6IldlYmhvb2sgaW5nZXN0IGZvciBjdXJhdGVkIHB1YmxpYyBzb3VyY2VzIiwid29ya2Zsb3ciOnsiYXV0aG9yVGV4dCI6IkhhbmRsZSB3ZWJob29rIEpTT04gcGVyIGF1dG9tYXRpb25zL3dlYmhvb2staW5nZXN0LnByb21wdC5tZCBpbiByZXBvLiBWYWxpZGF0ZSwgaW5nZXN0IFlBTUwsIG9wZW4gUFIsIHVwZGF0ZSBTb3Rpb24gU291cmNlcyBpbmJveCAoZGF0YSBzb3VyY2UgYzNhYzg2MDEtNzgwYS00YWU0LWJjMGMtMmQxYjA0ZjE5OGY1KS4iLCJnaXRDb25maWciOnsiYnJhbmNoIjoibWFpbiIsInJlcG9zaXRvcnkiOiJ0ZWNocG9saWN5Y29tbXMvdW44MC13cDE1LXJlc2VhcmNoIn0sIm1lbW9yeUVuYWJsZWQiOnRydWUsInRyaWdnZXJzIjpbeyJ3ZWJob29rVHJpZ2dlciI6e319XX19)

---

## 3. UN80 Monthly Briefing Compiler

- **Schedule:** `0 8 1 * *` (1st of month 08:00 UTC)
- **Also:** webhook for `manual_refresh` events
- **Prompt:** [briefing-compiler.prompt.md](./briefing-compiler.prompt.md)
- **Notion:** Briefings → `59dc0672-d74e-4e7b-bbfa-9d39ffe402e2`

**Import:** [Open prefill → Briefing Compiler](https://cursor.com/automations/new?prefill=eyJuYW1lIjoiVU44MCBNb250aGx5IEJyaWVmaW5nIENvbXBpbGVyIiwiZGVzY3JpcHRpb24iOiJNb250aGx5IE1lbWJlciBTdGF0ZSBicmllZmluZyBkcmFmdCArIE5vdGlvbiBzeW5jIiwid29ya2Zsb3ciOnsiYXV0aG9yVGV4dCI6IkNvbXBpbGUgYnJpZWZpbmcgcGVyIGF1dG9tYXRpb25zL2JyaWVmaW5nLWNvbXBpbGVyLnByb21wdC5tZC4gTm90aW9uIEJyaWVmaW5ncyBEQiBkYXRhIHNvdXJjZTogNTlkYzA2NzItZDc0ZS00ZTdiLWJiZmEtOWQzOWZmZTQwMmUyLiBIdWIgcGFnZTogMzY4MDUzODMtNDkxZi04MTNmLWEyMjctZjcwOWMxODc1ODRhLiIsImdpdENvbmZpZyI6eyJicmFuY2giOiJtYWluIiwicmVwb3NpdG9yeSI6InRlY2hwb2xpY3ljb21tcy91bjgwLXdwMTUtcmVhcmNoIn0sIm1lbW9yeUVuYWJsZWQiOnRydWUsInRyaWdnZXJzIjpbeyJjcm9uVHJpZ2dlciI6eyJjcm9uRXhwcmVzc2lvbiI6IjAgOCAxICogKiJ9fSx7IndlYmhvb2tUcmlnZ2VyIjp7fX1dfX0)

---

## Checklist

- [ ] All three automations saved
- [ ] Webhook URL + API key in local `.env`
- [ ] Notion MCP connected in Cursor
- [ ] Test: `./scripts/trigger-webhook-example.sh`
