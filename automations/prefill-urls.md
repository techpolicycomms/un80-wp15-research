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

## 4. UN80 Social Monitor

- **Schedule:** `0 7 * * 3` (Wed 07:00 UTC)
- **Prompt:** [social-monitor.prompt.md](./social-monitor.prompt.md)
- **Docs:** [SOCIAL-MONITORING.md](../docs/SOCIAL-MONITORING.md)

**Import:** [Open prefill → Social Monitor](https://cursor.com/automations/new?prefill=eyJuYW1lIjoiVU44MCBTb2NpYWwgTW9uaXRvciIsImRlc2NyaXB0aW9uIjoiV2VkIHB1YmxpYyBzb2NpYWwgc2NhbiDigJQgWCwgRmFjZWJvb2ssIFlvdVR1YmUgZm9yIFVOIGFnZW5jaWVzIG9uIFdQMTUgdG9waWNzIiwid29ya2Zsb3ciOnsiYXV0aG9yVGV4dCI6IkxvYWQgYC5jdXJzb3Ivc2tpbGxzL3VuODAtc29jaWFsLW1vbml0b3IvU0tJTEwubWRgIGFuZCBgZGF0YS91bi1hZ2VuY2llcy1zb2NpYWwueWFtbGAuIFJ1biBucG0gcnVuIGZldGNoOnlvdXR1YmUuIFJldmlldyBwdWJsaWMgWCBhbmQgRmFjZWJvb2sgZnJvbSByZWdpc3RyeS4gV3JpdGUgZGF0YS9zb2NpYWwtbW9uaXRvci9ZWVlZLU1NLURELXNvY2lhbC55YW1sLCB1cGRhdGUgZGF0YS9zb2NpYWwtc2lnbmFscy55YW1sLCBvcGVuIFBSLCB1cGRhdGUgTm90aW9uIFdQMTUgTGl2aW5nIEFuYWx5c2lzIHBhZ2UuIiwiZ2l0Q29uZmlnIjp7ImJyYW5jaCI6Im1haW4iLCJyZXBvc2l0b3J5IjoidGVjaHBvbGljeWNvbW1zL3VuODAtd3AxNS1yZXNlYXJjaCJ9LCJtZW1vcnlFbmFibGVkIjp0cnVlLCJ0cmlnZ2VycyI6W3siY3JvblRyaWdnZXIiOnsiY3JvbkV4cHJlc3Npb24iOiIwIDcgKiAqIDMifX1dfX0)

---

## Checklist

- [ ] **Daily Digest (merged)** saved — [§5 below](#5-un80-daily-digest-merged) — **08:00 CEST**
- [ ] **Disable cron** on old Landscape (§1), Social (§4), Briefing (§3) automations
- [ ] GitHub **SMTP secrets** set — [docs/DAILY-DIGEST.md](../docs/DAILY-DIGEST.md)
- [ ] **Linear MCP** + **Notion MCP** on Daily Digest + Webhook
- [ ] Webhook URL + API key in local `.env`
- [ ] Test email: Actions → **Daily digest email** → Run workflow
- [ ] Test webhook: `./scripts/trigger-webhook-example.sh`

---

## 5. UN80 Daily Digest (merged) — **primary schedule**

- **Schedule:** `0 6 * * *` (**08:00 CEST** / 06:00 UTC)
- **Winter (CET):** change to `0 7 * * *` in Cursor UI
- **Prompt:** [daily-digest.prompt.md](./daily-digest.prompt.md)
- **Docs:** [DAILY-DIGEST.md](../docs/DAILY-DIGEST.md)
- **Email:** GitHub Action → `rahul.jha@itu.int`

**Import:** [Open prefill → Daily Digest (merged)](https://cursor.com/automations/new?prefill=eyJuYW1lIjoiVU44MCBEYWlseSBEaWdlc3QgKG1lcmdlZCkiLCJkZXNjcmlwdGlvbiI6IkRhaWx5IDA4OjAwIENFU1Qg4oCUIGxhbmRzY2FwZSArIHNvY2lhbCArIGRpZ2VzdCArIGVtYWlsIHZpYSBHaXRIdWIgQWN0aW9ucyIsIndvcmtmbG93Ijp7ImF1dGhvclRleHQiOiJSdW4gdGhlIGNvbnNvbGlkYXRlZCBkYWlseSBVTjgwIFdQMTUgZGlnZXN0LlxuXG5Mb2FkIGAuY3Vyc29yL3NraWxscy91bjgwLWRhaWx5LWRpZ2VzdC9TS0lMTC5tZGAgYW5kIGZvbGxvdyBgYXV0b21hdGlvbnMvZGFpbHktZGlnZXN0LnByb21wdC5tZGAuXG5cbkFsd2F5cyB3cml0ZSByZXBvcnRzL1lZWVktTU0tREQtZGFpbHktZGlnZXN0Lm1kIGFuZCBvcGVuIFBSIGRpZ2VzdDogZGFpbHkgV1AxNSDigJQgWVlZWS1NTS1ERC5cblxuRFJBRlQgb25seS4gUHVibGljIHNlY29uZGFyeSBkYXRhLiIsImdpdENvbmNpZ2I6eyJyZXBvc2l0b3J5IjoidGVjaHBvbGljeWNvbW1zL3VuODAtd3AxNS1yZXNlYXJjaCIsImJyYW5jaCI6Im1haW4ifSwibWVtb3J5RW5hYmxlZCI6dHJ1ZSwidHJpZ2dlcnMiOlt7ImNyb25UcmlnZ2VyIjp7ImNyb25FeHByZXNzaW9uIjoiMCA2ICogKiAqIn19XX19)

> Supersedes scheduled runs in §1, §3 (cron), and §4. Keep §2 Webhook.

---

## Legacy automations (disable cron after §5 is live)

## 1. UN80 Weekly Landscape Monitor
