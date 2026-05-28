# QianDuoDuo Milestones, Prompts, Definition of Done, and Verification Scripts

## Common Milestone Rules

Before starting any milestone, read:

* `docs/product-architecture-spec.md`
* `docs/engineering-standards.md`
* Existing `docs/tech-decisions.md`
* Existing database schema and migrations
* Existing shared schemas in `packages/shared`

Do not start a new milestone until the current milestone passes all required gates.

Common gate:

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

From Milestone 2 onward:

```bash
pnpm e2e
```

When changing behavior, update tests first or in the same change set.

---

# Milestone 0 — Bootstrap, Infrastructure, and CI

## Goal

Create the monorepo foundation, Docker development environment, shared package, basic API/web apps, health checks, linting, formatting, and CI.

## Scope

Implement:

* pnpm workspace
* Root TypeScript config
* Shared ESLint and Prettier setup
* `apps/api` NestJS app
* `apps/web` Vue 3 + Vite app
* `packages/shared` package
* Docker Compose for PostgreSQL, Redis, API, worker placeholder, and web
* `.env.example`
* Basic health endpoint
* Basic root web page
* GitHub Actions or equivalent CI
* Initial docs skeleton

Do not implement authentication or domain CRUD yet.

## Milestone 0 Prompt

Build Milestone 0 for QianDuoDuo.

Create a pnpm monorepo with:

* `apps/api`
* `apps/web`
* `packages/shared`
* `docs`

Use:

* NestJS with TypeScript for API
* Vue 3 + Vite + TypeScript for web
* pnpm workspaces
* PostgreSQL and Redis in Docker Compose
* ESLint and Prettier
* Vitest or Jest as appropriate
* GitHub Actions CI

Add:

* API health controller at `/health`
* Web root component test
* Shared package exporting at least one simple health DTO/schema
* `.env.example`
* `docker-compose.yml`
* `docker-compose.override.yml`
* docs skeleton:

  * `docs/architecture.md`
  * `docs/security.md`
  * `docs/sync.md`
  * `docs/parsing-pipeline.md`
  * `docs/tech-decisions.md`

Acceptance requirements:

* `pnpm install` works.
* `pnpm lint` passes.
* `pnpm test` passes.
* `pnpm build` passes.
* `docker compose up` starts Postgres, Redis, API, and Web.
* API `/health` returns a typed successful response.
* Web root component renders in test.

Do not proceed to Milestone 1 until all checks pass.

## Definition of Done

* Monorepo exists with required apps/packages.
* Root scripts exist.
* API health endpoint works.
* Web app renders.
* Docker Compose starts.
* CI runs lint, tests, and build.
* Initial docs exist.
* No secrets committed.

## Verification Script

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
docker compose config
docker compose up -d --build
curl -f http://localhost:3000/health
docker compose down
```

---

# Milestone 1 — Auth and Master Data

## Goal

Implement secure single-admin authentication and CRUD for master data: ledgers, categories, members, projects, merchants. Add category YAML import/export, category versioning, rollback, and audit log foundation.

## Scope

Implement:

* Admin login
* Password policy
* Argon2id hashing
* Secure HTTP-only cookie session
* CSRF protection
* Login rate limiting
* Ledger CRUD
* Category tree CRUD
* Category YAML import/export
* Category version snapshots
* Category rollback
* Member presets per ledger
* Project presets per ledger
* Merchant dictionary
* Rule versioning tables only
* Audit log table and service
* Prisma schema and migrations
* Seed script for local dev

## Security Requirements

* Single admin account.
* Strong password policy.
* Deny common passwords.
* Login rate limit by IP and account.
* Generic login failure message.
* Cookie session uses `HttpOnly`, production `Secure`, and `SameSite`.
* CSRF protection for unsafe methods.
* `/docs` enabled only in development.

## Category YAML Rules

YAML uses stable category keys, not database IDs.

Import flow:

1. Validate YAML.
2. Detect duplicate keys.
3. Detect invalid nesting.
4. Produce clear validation errors.
5. Commit creates new category version snapshot.
6. Rollback restores prior version without breaking historical references.

## Milestone 1 Prompt

Build Milestone 1 for QianDuoDuo.

Implement secure single-admin authentication and master data CRUD.

Use Prisma migrations for:

* Admin account/session data
* Ledgers
* Categories
* Category versions/snapshots
* Members
* Projects
* Merchants
* Rule versioning placeholder tables
* Audit log

Use Zod schemas in `packages/shared` for all request and response DTOs.

Implement endpoints for:

* Login
* Logout
* Current session
* Ledger CRUD
* Category CRUD
* Category YAML validate/import/export
* Category rollback
* Copy categories from another ledger
* Member CRUD or preset management
* Project CRUD or preset management
* Merchant CRUD

Add audit events for:

* Login failures beyond threshold
* Ledger changes
* Category changes
* YAML import/export
* Category rollback

Add tests:

* Auth service unit tests
* Password policy unit tests
* Login rate limiter unit tests
* Ledger CRUD integration tests
* Category CRUD integration tests
* YAML import validation integration tests
* Category rollback integration tests
* Login form frontend unit test
* Category tree frontend unit test

Acceptance requirements:

* Invalid YAML fails with clear error codes.
* Category rollback restores prior snapshot safely.
* CRUD endpoints validate input and return typed responses.
* Auth uses secure session cookies and CSRF.
* All tests pass.

Do not proceed to Milestone 2 until all checks pass.

## Definition of Done

* Admin auth implemented.
* Passwords hashed with Argon2id.
* Strong password policy tested.
* Login rate limit tested.
* Cookie session implemented.
* CSRF protection implemented.
* Ledger CRUD works.
* Category tree CRUD works.
* Category YAML import/export works.
* Category rollback works.
* Member/project/merchant master data works.
* Audit log foundation works.
* Rule versioning tables exist.
* Prisma migrations and seed script exist.
* Docs updated:

  * `docs/security.md`
  * `docs/architecture.md`
  * `docs/tech-decisions.md`

## Verification Script

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm lint
pnpm test
pnpm build
docker compose up -d --build
curl -f http://localhost:3000/health
docker compose down
```

---

# Milestone 2A — Entries CRUD, Money, Soft Delete

## Goal

Implement the core bookkeeping MVP: create, edit, list, filter, clone, soft-delete entries with correct money handling.

## Scope

Implement:

* Entry model
* Entry CRUD
* Money validation
* FX rate validation
* Date-only UI behavior
* Member/category/merchant/project selection
* Clone entry
* Basic list/filter/sort
* Soft delete
* Audit log for create/update/delete
* Recent-used chips
* Amount keypad with arithmetic validation
* Playwright E2E setup

Do not implement purge or saved views yet.

## Milestone 2A Prompt

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
* E2E: login → create ledger → create category → create entry → edit entry → soft delete.

Acceptance requirements:

* Daily manual bookkeeping is usable.
* Soft-deleted entries do not appear in normal lists.
* Money handling is deterministic and tested.
* E2E setup works.

Do not proceed to Milestone 2B until all checks pass.

## Definition of Done

* Entry Prisma model and migration exist.
* Entry DTOs in shared package.
* Entry CRUD API works.
* Soft delete works.
* Entry form works.
* Amount validation works.
* Clone entry works.
* Recent-used chips work.
* Audit log records entry create/update/delete.
* E2E infrastructure exists.
* Docs updated for money and datetime decisions.

## Verification Script

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

---

# Milestone 2B — Purge, Search, Saved Views, Advanced Entry UX

## Goal

Complete the bookkeeping MVP with purge, full search, saved views, and improved list/filter UX.

## Scope

Implement:

* Purge deleted entries
* Purge confirmation
* Purge dry-run preview
* Audit log for purge
* Search across note, merchant, project
* PostgreSQL search indexes
* Saved views per ledger
* Sorting by date, amount, created_at, updated_at
* Improved filters

## Milestone 2B Prompt

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
* E2E: login → create entry → search → soft delete → purge.

Acceptance requirements:

* Search works for note, merchant, and project.
* Purge requires confirmation and is audited.
* Saved views can be created and applied.
* Tests pass.

Do not proceed to Milestone 3 until all checks pass.

## Definition of Done

* Purge endpoint exists.
* Purge dry-run exists.
* Purge confirmation implemented.
* Search indexes/migrations exist.
* Saved views implemented.
* Entry list sort/filter/search works.
* Audit logs verified.
* Docs updated for search and purge behavior.

## Verification Script

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

---

# Milestone 3 — Reports

## Goal

Implement basic analytics and charting.

## Scope

Implement:

* Spending trend by week/month/year
* Category share by time range
* Project totals by time range
* Base currency aggregation
* Original currency grouped aggregation
* Backend normalized report datasets
* Frontend charts
* Aggregation interface design for future optimization

## Milestone 3 Prompt

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

## Definition of Done

* Report DTOs exist.
* Report endpoints exist.
* Aggregation logic tested.
* Seeded integration tests pass.
* Chart components render.
* Docs include aggregation design notes.

## Verification Script

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

---

# Milestone 4 — Import / Export with Mapping and Staged Inbox

## Goal

Implement robust import/export with preview, mapping, staged entries, approval, rejection, and audit logging.

## Scope

Implement:

* CSV import
* JSON import
* Column mapping
* Saved mapping presets
* Staged entries
* Confidence and reasons
* Approve/edit/reject workflow
* Export CSV/JSON
* Audit logging for import commit and bulk operations

## Milestone 4 Prompt

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
* E2E: import CSV → preview → approve → entries appear.

Acceptance requirements:

* Users can safely preview and approve imports.
* Import commit is audited.
* Tests pass.

Do not proceed to Milestone 5 until all checks pass.

## Definition of Done

* Import mapping DTOs exist.
* Staged entry model exists.
* CSV/JSON import works.
* Staged inbox UI works.
* Approval creates real entries.
* Reject/edit flows work.
* Export works.
* Audit logs import commit.
* Docs updated for import pipeline.

## Verification Script

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

---

# Milestone 5 — Attachments and Storage Cap

## Goal

Support receipt/statement attachments, thumbnails, pinning, storage cap enforcement, and cleanup job.

## Scope

Implement:

* Attachment upload
* Attachment linking to entries/staged entries
* Thumbnail generation
* Attachment preview
* Pin/unpin
* Storage usage indicator
* Configurable storage cap
* Cleanup job deleting oldest unpinned attachments first
* Audit log for cleanup

## Milestone 5 Prompt

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

## Definition of Done

* Attachment model exists.
* Upload endpoint works.
* File validation implemented.
* Thumbnail handling implemented.
* Pin/unpin works.
* Cleanup job works.
* Audit log records cleanup.
* Storage usage UI exists.
* Docs updated for attachment storage.

## Verification Script

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

---

# Milestone 6 — Parsing Pipeline, Rules Engine, Confidence, Duplicate Detection

## Goal

Turn text/PDF/receipt data into staged entries using explainable parsing, rules, confidence scoring, and duplicate detection.

## Scope

Implement:

* File/text ingest
* Text extraction
* Structured parsing
* Merchant rules
* Category rules
* Rule versioning and rollback
* Duplicate detection
* Confidence scoring
* Rule learning from user confirmation
* 1–2 sample adapters/fixtures

## Milestone 6 Prompt

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

* Default amount tolerance ±0.
* Default time window ±5 minutes.
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

## Definition of Done

* Parsing pipeline interfaces exist.
* At least text/PDF-text-layer extraction works.
* Rules engine works.
* Rule versioning and rollback work.
* Duplicate detection works.
* Confidence reasons are stored.
* Staged entries receive parsed results.
* Docs updated for parsing pipeline.

## Verification Script

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

---

# Milestone 7 — Offline Sync with Dexie Change Log and Conflict UI

## Goal

Implement true offline-first entry workflows with Dexie, local change log, push/pull sync, idempotency, and conflict UI.

## Scope

Implement:

* Dexie local schema
* Offline entry create/edit/delete
* Local change log
* Client-generated UUIDs
* Sync push endpoint
* Sync pull endpoint
* Server cursor
* Idempotency keys
* LWW merge
* Conflict list
* Manual conflict resolution
* Attachment thumbnail/recent cache policy

## Milestone 7 Prompt

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
* E2E: create offline entry → reconnect → entry exists on server.
* E2E: conflicting update shows conflict UI.

Acceptance requirements:

* Offline create/edit works.
* Reconnect syncs changes.
* Conflicts are visible.
* Tests pass.

Do not proceed to Milestone 8 until all checks pass.

## Definition of Done

* Dexie schema exists.
* Offline write path works.
* Change log works.
* Push/pull endpoints exist.
* Idempotency implemented.
* Server cursor implemented.
* LWW implemented.
* Conflict UI implemented.
* Sync docs updated.

## Verification Script

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

---

# Milestone 8 — LLM Provider Abstraction and Redaction Mode

## Goal

Add optional LLM enhancement with provider abstraction, local-first mode, redaction, policy gating, and usage tracking.

## Scope

Implement:

* Provider abstraction
* OpenAI-compatible provider interface
* Azure OpenAI adapter placeholder
* Claude adapter placeholder
* Self-hosted endpoint support
* Local-first mode
* Redaction mode
* Usage tracking
* Policy gating
* Mocked provider tests

## Milestone 8 Prompt

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

## Definition of Done

* Provider abstraction exists.
* Provider settings exist.
* Redaction mode implemented.
* Usage records implemented.
* Policy gating tested.
* Docs updated for LLM privacy and provider behavior.

## Verification Script

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

---

# Milestone 9 — Backup, Restore, Audit Hardening, Production Reverse Proxy

## Goal

Make the system operationally ready for home production use.

## Scope

Implement:

* Scheduled daily backups
* Scheduled weekly backups
* Retention policy
* Backup listing
* Backup metadata
* Restore workflow
* Restore confirmation
* Audit hardening
* Production Docker Compose profile
* Caddy or Nginx reverse proxy template
* HTTPS-ready configuration
* Production docs

## Milestone 9 Prompt

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

## Definition of Done

* Backup job implemented.
* Retention policy implemented.
* Backup listing implemented.
* Restore endpoint guarded.
* Restore audit events implemented.
* Production compose profile exists.
* Reverse proxy template exists.
* Security docs updated.
* Operations docs updated.

## Verification Script

```bash
pnpm install
pnpm db:migrate
pnpm lint
pnpm test
pnpm build
pnpm e2e
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

---

# Final Release Verification

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
