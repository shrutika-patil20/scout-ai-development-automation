---
subject: "<the actual email subject line>"
thread_started: YYYY-MM-DD
last_message: YYYY-MM-DD
status: open | waiting | waiting-internal | closed | archived
participants:
  from: "<your name <email>>"
  to:
    - "<name <email>>"
  cc:
    - "<name <email>>"
related:
  - "ADR-NNNN: <title>"
  - "TD-NNN: <title>"
  - "docs/<other-doc>.md"
tags:
  - <tag>
  - <tag>
---

# <Short thread title — NOT the email subject>

## Summary

_1–3 sentences. The "what was this about" for future-you. Be concrete: "Sponsor pushed back on SLA wording; we proposed 99.5% instead of 99.9% and they accepted 2026-03-11."_

## Action Items

- [ ] <Action item> — owner, due date
- [x] <Completed action item>

## Thread

> **Note:** list messages oldest → newest. Use `>` quoting for verbatim-pasted content; paraphrase where paste isn't necessary.

---

### <YYYY-MM-DD HH:MM>  |  From: <sender>  |  To: <recipients>

<Paste or paraphrase the email body. Keep it readable — redact signatures and legal footers.>

**Attachments referenced:**
- `attachments/<file>.pdf` — <one-line description>

---

### <YYYY-MM-DD HH:MM>  |  From: <sender>  |  To: <recipients>

<Next message in the thread…>

---

## Decisions Captured

_List decisions made during this thread. Link to ADRs when they deserve one._

- <Decision> — <date>. See [ADR-NNNN](../../adr/NNNN-<title>.md).

## Open Questions

_Things discussed but not resolved — feed these into `docs/TECH_DEBT.md` or `docs/ROADMAP.md` as appropriate._

- <Question> — <who needs to answer>

## Links

- Original Outlook thread: _(optional — paste the `outlook:` or web link)_
- Related thread: [`YYYY-MM-DD-<topic>/thread.md`](../YYYY-MM-DD-<topic>/thread.md)
- External doc: _(SharePoint / Drive / Notion link)_
