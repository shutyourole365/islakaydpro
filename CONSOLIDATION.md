# Repository Consolidation Audit

**Date:** 2026-04-14
**Branch:** `claude/combine-islakayd-repos-e9GjL`
**Canonical repo:** `shutyourole365/islakaydpro`

## Background

Eight Islakayd-related repositories existed under the `shutyourole365`
GitHub account. This document records the audit that consolidated them into
this single canonical repository.

## Repositories audited

| # | Repository | Status | Notes |
|---|---|---|---|
| 1 | `shutyourole365/islakaydpro` | **Canonical (this repo)** | TypeScript, 574 passing tests, 12 Supabase migrations, 7 CI workflows, cleanup applied in #45 |
| 2 | `shutyourole365/islakayd` | Empty | No commits |
| 3 | `shutyourole365/islakayd.` | Empty | No commits (note trailing dot in name) |
| 4 | `shutyourole365/islakaydpro-63438` | Empty | No commits |
| 5 | `shutyourole365/islakaydpro-a8811` | Empty | No commits |
| 6 | `shutyourole365/islakad` | Older snapshot | 8 migrations (subset of canonical), no CodeQL/db-index workflows, missing price-change tracking in `src/services/database.ts` |
| 7 | `shutyourole365/islakaydpro-47bca` | Older snapshot | Same content as `islakad` with a few CI workflows added; still an older subset of canonical |
| 8 | `shutyourole365/islakaydpro-a7afe` | Near-duplicate | Same 12 migrations & 7 workflows as canonical, but contains the "sci-fi bloat" components that were deliberately removed in canonical PR #45 (quantum, AR/VR, blockchain, drones, etc.) |

## Consolidation outcome

**No code changes were merged from the source repos.** After a file-by-file
audit, every file in the six non-empty source repos fell into one of these
buckets:

- **Identical** to the canonical version (most `src/**`, config files).
- **Older/stale** — canonical already has the newer version (migrations,
  workflows, `src/services/database.ts` price-change logic).
- **Intentionally removed** in canonical PR #45 (cleanup: remove bloat
  components, redundant docs, and sci-fi features) — restoring them would
  undo that curation.

### Specifically verified

- **Supabase migrations:** canonical has all 12; older snapshots have only
  the first 8. No migration exists in any source that is missing here.
- **GitHub workflows:** canonical has 7 (`build-android`, `build-ios`,
  `ci`, `codeql`, `db-index-check`, `dependency-review`, `sql-check`). No
  workflow exists in any source that is missing here.
- **`src/services/database.ts`:** canonical includes price-change
  detection + notification logic that the older snapshots lack.
- **Removed bloat (`src/components/`):** the directories `ar/`, `arvr/`,
  `blockchain/`, `bundles/`, `contracts/`, `delivery/`, `gamification/`,
  `holographic/`, `iot/`, `loyalty/`, `neural/`, `quantum/`, `rewards/`,
  `scanner/`, `tickets/`, `timeline/`, `tutorials/`, `warranty/`,
  `weather/`, etc., are absent from canonical **on purpose** (PR #45).

## Recommended follow-up

The six non-empty source repos can be archived (or deleted) safely. No
unique history or code will be lost. The two empty repos can be deleted
outright.

Archive commands (run manually; this task runner's GitHub tools are
restricted to the canonical repo):

```bash
# Archive each source repo (keeps it read-only on GitHub)
for repo in islakayd islakayd. islakad islakaydpro-47bca \
            islakaydpro-63438 islakaydpro-a8811 islakaydpro-a7afe; do
  gh repo archive "shutyourole365/$repo" --yes
done
```

To delete instead of archive, substitute `gh repo delete <repo> --yes`.
