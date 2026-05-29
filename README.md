# QianDuoDuo Milestone Prompts

This README is a quick execution guide for starting each remaining milestone from Milestone 2 onward.
The canonical source remains `docs/milestones.md`; keep this file in sync when milestone scope changes.

Before starting any milestone, read:

```text
AGENTS.md
docs/product-architecture-spec.md
docs/engineering-standards.md
docs/milestones.md
docs/tech-decisions.md
apps/api/prisma/schema.prisma
packages/shared/src
```

Do not begin a later milestone until the current milestone passes its verification commands.
When behavior, architecture, dependencies, money/date/search behavior, or security behavior changes,
update the relevant docs and `docs/tech-decisions.md`.

## Milestone 2A - Entries CRUD, Money, Soft Delete

### Start Prompt

```text
Build Milestone 2A for QianDuoDuo.

Implement entry CRUD and soft delete.

Entry fields:

* `type`: Expense or Income
* `occurred_at`
* `original_amount`
* `original_currency`
* `fx_rate`
* `base_amount`
* `base_currency`
* `category_id`
* `member_id`
* `merchant_id`
* `project_id`
* `note`
* `created_at`
* `updated_at`
* `version`
* `deleted_at`

Rules:

* Default `occurred_at` is now.
* Date-only UI defaults time to 12:00 local time.
* Currency defaults to ledger base currency.
* If original currency equals base currency, FX rate defaults to 1.0.
* Money never uses floating point.
* Persist base amount and base currency.
* Soft-deleted entries are hidden from normal list endpoints.
* Clone creates a new entry with copied fields and new ID.

Frontend:

* Entry form with validation.
* Amount keypad supporting simple arithmetic `+ - * /`.
* Reject exponent `e` and invalid characters.
* Recent-used chips for category, merchant, and project.
* Entry list with basic filters and sorting.

Tests:

* API unit tests for amount validation.
* API unit tests for base amount calculation.
* API integration tests for entry CRUD.
* API integration tests for soft delete hiding entries.
* Web unit tests for entry form validation.
* Web unit tests for recent-used behavior.
* E2E: login -> create ledger -> create category -> create entry -> edit entry -> soft delete.

Acceptance requirements:

* Daily manual bookkeeping is usable.
* Soft-deleted entries do not appear in normal lists.
* Money handling is deterministic and tested.
* E2E setup works.

Do not proceed to Milestone 2B until all checks pass.
```

### Verification Commands

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

## Milestone 2B - Purge, Search, Saved Views, Advanced Entry UX

### Start Prompt

```text
Build Milestone 2B for QianDuoDuo.

Implement purge, search, saved views, and improved entry filtering.

Purge requirements:

* Admin-only.
* Requires exact confirmation text.
* Provides dry-run preview.
* Logs audit event before and after purge.
* Purges only soft-deleted entries.
* Does not silently remove pinned attachments.

Search requirements:

* Search note, merchant, and project.
* Use PostgreSQL full-text search where appropriate.
* Use `pg_trgm` for merchant fuzzy search.
* Document Chinese search limitations and fallback behavior.

Saved views:

* Ledger-isolated.
* Store named filter/sort configuration.
* Validate saved view JSON shape.
* No executable code allowed.

Tests:

* API unit tests for purge flow.
* API unit tests for search query builder.
* API integration tests for purge deleting rows.
* API integration tests for audit log after purge.
* API integration tests for search results.
* Web unit tests for saved view create/apply.
* E2E: login -> create entry -> search -> soft delete -> purge.

Acceptance requirements:

* Search works for note, merchant, and project.
* Purge requires confirmation and is audited.
* Saved views can be created and applied.
* Tests pass.

Do not proceed to Milestone 3 until all checks pass.
```

### Verification Commands

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

## Milestone 3 - Reports

### Start Prompt

```text
Build Milestone 3 for QianDuoDuo.

Implement reports.

Reports:

* Spending trend by week/month/year.
* Category share for selected time range.
* Project totals for selected time range.
* Expense-only default.
* Income inclusion optional through filters.
* Currency mode toggle.

Currency behavior:

* Base mode aggregates persisted base amounts.
* Original mode groups by original currency.
* Do not sum different original currencies together.
* Category share in original mode must select one currency or show separate datasets.

Backend:

* Add report endpoints returning normalized datasets.
* Add unit-tested aggregation logic.
* Add integration tests with seeded data.

Frontend:

* Add report pages.
* Use ECharts or Chart.js.
* Charts must render with supplied datasets.
* Empty states must be clear.

Acceptance requirements:

* Reports match seeded expected sums.
* Base/original modes are correct.
* Tests pass.

Do not proceed to Milestone 4 until all checks pass.
```

### Verification Commands

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

## Milestone 4 - Import / Export with Mapping and Staged Inbox

### Start Prompt

```text
Build Milestone 4 for QianDuoDuo.

Implement import/export with staging.

Import flow:

1. Upload CSV or JSON.
2. Select or configure mapping.
3. Validate rows.
4. Create staged entries.
5. Show preview.
6. User approves, edits, or rejects staged records.
7. Approved records become entries.
8. Commit writes audit log.

Requirements:

* No silent direct import into entries.
* Mapping presets are ledger-isolated.
* Validation errors are row-specific.
* Confidence score includes explainable reasons.
* Duplicate candidates may be shown if available.
* Export supports ledger, time range, filters, CSV, and JSON.

Tests:

* API integration tests for mapping.
* API integration tests for staging.
* API integration tests for approve commit.
* API integration tests for export.
* Web unit tests for mapping UI.
* Web unit tests for staged inbox approval.
* E2E: import CSV -> preview -> approve -> entries appear.

Acceptance requirements:

* Users can safely preview and approve imports.
* Import commit is audited.
* Tests pass.

Do not proceed to Milestone 5 until all checks pass.
```

### Verification Commands

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

## Milestone 5 - Attachments and Storage Cap

### Start Prompt

```text
Build Milestone 5 for QianDuoDuo.

Implement attachments and storage cap management.

Requirements:

* Store files on local filesystem.
* Metadata stored in PostgreSQL.
* Validate upload size, extension, MIME type.
* Prevent path traversal.
* Generate thumbnails where supported.
* Link attachments to entries or staged entries.
* Users can pin/unpin attachments.
* Pinned attachments are never deleted by cleanup.
* Cleanup deletes oldest unpinned attachments first.
* If pinned attachments alone exceed the cap, report over-cap status and do not delete pinned files.
* Storage cap configured by `MAX_STORAGE_BYTES`.

Tests:

* API integration tests for upload.
* API integration tests for link to entry.
* API integration tests for pin/unpin.
* API integration tests for cleanup under cap.
* Unit tests for cleanup selection algorithm.
* Web unit tests for upload/preview/pin behavior.

Acceptance requirements:

* Upload and preview work.
* Cleanup respects pins.
* Storage usage is visible.
* Tests pass.

Do not proceed to Milestone 6 until all checks pass.
```

### Verification Commands

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

## Milestone 6 - Parsing Pipeline, Rules Engine, Confidence, Duplicate Detection

### Start Prompt

```text
Build Milestone 6 for QianDuoDuo.

Implement parsing pipeline, rules engine, and duplicate detection.

Pipeline stages:

1. File ingest.
2. Text extraction.
3. Structured parsing for datetime, amount, merchant, currency.
4. Rule matching.
5. Duplicate detection.
6. Confidence scoring.
7. Staged inbox.

Rules:

* Ledger-isolated.
* Versioned.
* Rollback supported.
* Merchant rule maps keyword/regex to merchant.
* Category rule maps merchant/text to category.
* Ordering:

  1. Higher explicit priority wins.
  2. Regex before keyword.
  3. Longer pattern first for same type/priority.
  4. Deterministic tie-break.
* Every match returns explanation.

Duplicate detection:

* Default amount tolerance +/-0.
* Default time window +/-5 minutes.
* Merchant same or similar.
* Use configurable per-ledger thresholds.
* Return candidate, score, and reasons.

Tests:

* Unit tests for rule ordering.
* Unit tests for regex/keyword matching.
* Unit tests for duplicate scoring.
* Unit tests for confidence scoring.
* Integration tests ingesting sample fixtures into staged entries.
* Integration tests for rule rollback.

Acceptance requirements:

* Sample fixtures produce staged entries.
* Rule matching is explainable.
* Duplicate candidates are explainable.
* Tests pass.

Do not proceed to Milestone 7 until all checks pass.
```

### Verification Commands

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

## Milestone 7 - Offline Sync with Dexie Change Log and Conflict UI

### Start Prompt

```text
Build Milestone 7 for QianDuoDuo.

Implement offline sync.

Requirements:

* Dexie mirrors syncable entities required for entry workflows.
* Offline-created records use client-generated UUIDs.
* Local changes are written to a change log.
* Each local change has idempotency key.
* Push endpoint is idempotent.
* Pull endpoint uses server cursor.
* Server returns per-change status:

  * `applied`
  * `rejected`
  * `conflict`
  * `already_applied`
* LWW is default conflict behavior.
* Conflict UI lists conflicts.
* User can choose local or server for specific conflicts.
* Attachments offline cache only thumbnails and recent N items.

Tests:

* Unit tests for change-log reducer.
* Unit tests for merge logic.
* Integration tests for sync push/pull.
* Integration tests with two simulated clients.
* E2E: create offline entry -> reconnect -> entry exists on server.
* E2E: conflicting update shows conflict UI.

Acceptance requirements:

* Offline create/edit works.
* Reconnect syncs changes.
* Conflicts are visible.
* Tests pass.

Do not proceed to Milestone 8 until all checks pass.
```

### Verification Commands

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

## Milestone 8 - LLM Provider Abstraction and Redaction Mode

### Start Prompt

```text
Build Milestone 8 for QianDuoDuo.

Implement optional LLM enhancement.

Requirements:

* LLM disabled by default.
* LLM never called unless policy allows and user explicitly triggers it.
* Provider API keys are server-side only.
* Redaction happens before data leaves server.
* Usage record stores provider, latency, token estimate, status, and purpose.
* Prompts/responses are not stored unless debug mode is enabled.
* Attachments/images are not sent unless explicitly confirmed.
* LLM can assist with:

  * low-confidence category classification
  * merchant classification
  * OCR noise correction

Provider abstraction supports:

* OpenAI
* Azure OpenAI
* Claude
* Self-hosted OpenAI-compatible endpoint

Tests:

* Unit tests with mocked providers.
* Unit tests for redaction.
* Integration tests verifying mode gating.
* Integration tests verifying no call happens when disabled.
* Integration tests verifying usage records.

Acceptance requirements:

* LLM calls are impossible unless enabled and explicitly triggered.
* Redaction works.
* Usage is tracked.
* Tests pass.

Do not proceed to Milestone 9 until all checks pass.
```

### Verification Commands

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

## Milestone 9 - Backup, Restore, Audit Hardening, Production Reverse Proxy

### Start Prompt

```text
Build Milestone 9 for QianDuoDuo.

Implement backup/restore, audit hardening, and production reverse proxy profile.

Backup requirements:

* Use `pg_dump`.
* Daily backups.
* Weekly backups.
* Retention policy.
* Backup metadata.
* Backup listing endpoint.
* Backup job logs.

Restore requirements:

* Admin-only.
* Requires exact confirmation text.
* Writes audit event before and after restore attempt.
* Warns that restore is destructive.
* Mock file IO acceptable in integration tests.
* Safe restore process documented.

Production profile:

* `docker-compose.prod.yml`
* Reverse proxy service using Caddy or Nginx.
* HTTPS-ready config template.
* Security headers.
* Swagger disabled in production.
* Persistent volumes for database, uploads, and backups.

Tests:

* Unit tests for retention selection.
* Unit tests for backup metadata handling.
* Unit tests for audit event creation.
* Integration test for triggering backup job.
* Integration test for restore confirmation requirement.

Acceptance requirements:

* Backups can be created and listed.
* Restore requires explicit confirmation.
* Production compose profile exists.
* Reverse proxy template exists.
* Tests pass.
```

### Verification Commands

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

## Final Release Verification

Run before considering QDD V1 complete:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
pnpm e2e

docker compose config
docker compose -f docker-compose.yml -f docker-compose.prod.yml config

docker compose up -d --build
curl -f http://localhost:3000/health
docker compose down
```

Manual smoke test:

1. Start Docker environment.
2. Create admin account through seed or setup flow.
3. Log in.
4. Create ledger.
5. Create categories.
6. Create entry.
7. Search entry.
8. Soft delete entry.
9. Purge deleted entry with confirmation.
10. Import CSV to staged inbox.
11. Approve staged entry.
12. Upload attachment.
13. Pin attachment.
14. Run cleanup job.
15. Verify pinned attachment remains.
16. Create offline entry.
17. Reconnect and sync.
18. Trigger backup.
19. List backup.
20. Verify audit log contains critical actions.
