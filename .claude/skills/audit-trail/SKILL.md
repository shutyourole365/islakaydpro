---
name: audit-trail
description: >-
  Use to record and review a clear, human-readable log of important North
  interactions — recommendations made, messages generated, actions approved or
  performed, record changes, invoice follow-ups, task changes, and workflow
  triggers. Each entry captures timestamp, user, action type, related record, a
  plain-language summary, and the outcome, so a business owner can see what
  North recommended or did. Trigger on requests like "what did North do",
  "show me the audit log", "log this action", "what changed on <record>",
  "history of <customer/invoice/task>", or "what did you recommend last week".
  Also invoke automatically to append an entry whenever North takes or proposes
  a loggable action.
---

# Audit Trail

Keep a trustworthy, plain-English record of what North recommended and did, so
the owner always knows what happened without reading raw system logs. Two jobs:
**write** entries when loggable things happen, and **read back** the trail when
the owner asks.

## What counts as a loggable event

Log these:

- **Recommendation** — North suggested an action, campaign, price, reply, etc.
- **Generated message** — North drafted an email/SMS/post/reply (log that it
  was generated and to whom; see redaction rules for the body).
- **Approved action** — the owner approved something North proposed.
- **Performed action** — North executed something (sent, scheduled, updated).
- **Record change** — a create/update/delete on a business record
  (customer, listing, booking, etc.).
- **Invoice follow-up** — reminder sent, status changed, payment chased.
- **Task change** — task created, reassigned, status changed, completed.
- **Workflow trigger** — an automation/rule fired (and what it did).

Do **not** create noise: skip pure reads, navigation, and trivial UI events.
One meaningful event = one entry. If North recommends *and then* performs, log
two linked entries (recommendation → outcome).

## Entry schema

Every entry has exactly these fields:

| Field | Meaning | Example |
|---|---|---|
| `timestamp` | When it happened, ISO 8601 with timezone | `2026-06-29T14:32:00+10:00` |
| `user` | Who initiated / approved (or `North` if autonomous) | `bungara@…` / `North` |
| `action_type` | One of the categories above | `invoice_follow_up` |
| `related_record` | Type + id/reference of the affected record | `Invoice #INV-1042` |
| `summary` | One plain-language sentence of what happened | "Sent 2nd reminder for overdue invoice." |
| `outcome` | Result / status / next step | `sent` · `awaiting approval` · `failed: …` |

Optional helpers when useful: `entry_id`, `linked_entry` (to tie a
recommendation to its performed action), `channel`, `actor_type`
(`human` / `north`).

### Canonical action_type values
`recommendation`, `message_generated`, `action_approved`,
`action_performed`, `record_change`, `invoice_follow_up`, `task_change`,
`workflow_trigger`.

## Writing an entry

1. **Classify** the event into one `action_type`. If it spans two (recommend +
   perform), write two entries and set `linked_entry`.
2. **Identify the record** precisely (`<Type> #<id>` or a stable reference).
3. **Summarize in one sentence**, in the owner's language — what changed and
   why, not how the system did it.
4. **State the outcome** plainly: `sent`, `updated`, `created`, `scheduled`,
   `approved`, `declined`, `awaiting approval`, or `failed: <reason>`.
5. **Apply redaction rules** (below) before saving.
6. **Append, never overwrite.** The trail is immutable history. Corrections are
   *new* entries that reference the original (`linked_entry`), not edits.

### Entry format (storage + display)

Store as a structured record (one JSON object per entry) so it can be filtered
and exported. Display to the owner as a clean line or card:

```
2026-06-29 14:32 (+10:00) · invoice_follow_up · Invoice #INV-1042 · by North
  Sent 2nd payment reminder to the customer for an overdue invoice.
  → Outcome: sent (reply pending)
```

JSON shape:

```json
{
  "entry_id": "ae-2026-0629-0007",
  "timestamp": "2026-06-29T14:32:00+10:00",
  "user": "North",
  "action_type": "invoice_follow_up",
  "related_record": "Invoice #INV-1042",
  "summary": "Sent 2nd payment reminder for an overdue invoice.",
  "outcome": "sent",
  "linked_entry": "ae-2026-0629-0006"
}
```

## Redaction — log the fact, not the secrets

Record that something happened and enough to understand it, **without** copying
sensitive data into the trail.

- **Never log:** passwords, API keys/tokens, full card/bank numbers, full
  government IDs, verification codes, or raw auth credentials. If one appears,
  store `[redacted]`.
- **Minimize personal data:** reference people by record id or first
  name + last initial, not full contact details. Don't paste full message
  bodies — log a one-line summary, the recipient reference, and the channel.
  (If a full copy is genuinely needed, link to the source record instead of
  duplicating it.)
- **Amounts & status are fine** (e.g. invoice total, overdue days) — they're
  what the owner needs to understand the action.
- **When unsure, summarize instead of quoting.** The test: "Does the owner need
  this exact value to understand what happened?" If no, omit or redact.

## Reading back the trail

When the owner asks what North did or recommended:

1. **Scope the query** — by date range, record, `action_type`, or user. Default
   to the most recent relevant activity if they're vague.
2. **Return newest-first**, grouped sensibly (by day, or by record for a
   "history of X" request).
3. **Summarize the shape** first ("12 actions in the last 7 days: 4 invoice
   follow-ups, 3 messages generated, 5 record changes"), then list entries.
4. **Surface what needs attention** — failed outcomes, items `awaiting
   approval`, and recommendations not yet acted on.
5. **Offer the obvious next step** (approve a pending item, retry a failure,
   export the log).

### Useful views
- **Per record:** full timeline for one customer/invoice/task.
- **Pending approvals:** everything with `outcome: awaiting approval`.
- **Recommendations vs. actions:** what North suggested and whether it was
  done (follow `linked_entry`).
- **Failures:** everything `failed:` for quick recovery.

## Guardrails

- The trail is **append-only and factual** — never edit or delete history;
  correct with a new linked entry.
- **One entry per meaningful event** — don't flood the log with trivia.
- Always include all six core fields; if one is genuinely unknown, write
  `unknown` rather than leaving it blank.
- Default to **less sensitive data**, not more — the trail should be safe to
  show the owner at a glance.
- Keep summaries in the **owner's plain language**, not system jargon.
