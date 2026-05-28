# QianDuoDuo Product / Architecture Spec

## 1. Product Overview

QianDuoDuo, abbreviated as QDD, is a private, self-hosted household expense tracker for 2–3 household members. It runs on an Intel NUC with Ubuntu 24.04, is Dockerized, works as a Progressive Web App, supports offline entry creation/editing, and can optionally be exposed to WAN through a secure reverse proxy.

QDD is not a SaaS product. It is designed for one private household deployment.

## 2. Product Goals

QDD must support:

1. Household bookkeeping across multiple ledgers.
2. Income and expense tracking only.
3. Per-ledger base currency.
4. Multi-currency entries with persisted exchange-rate conversion.
5. Ledger-isolated categories, merchants, projects, members, rules, saved views, import presets, and duplicate detection settings.
6. Category editing through both UI and YAML import/export.
7. Soft delete, purge, audit logging, backup, and restore.
8. Offline-capable PWA behavior using IndexedDB and change-log sync.
9. Attachments for receipts and statements with storage cap management.
10. Import pipeline with preview, staging, approval, and duplicate detection.
11. Optional parsing pipeline for text/PDF/OCR-derived records.
12. Optional LLM enhancement with explicit opt-in and redaction controls.

## 3. Non-goals for V1

The following are out of scope unless explicitly added later:

1. Public user registration.
2. SaaS multi-tenancy.
3. Double-entry accounting.
4. Transfers between accounts.
5. Bank API integration.
6. Automatic online FX rate fetching.
7. Native iOS or Android apps.
8. Shared category references across ledgers.
9. Real-time collaborative editing.
10. Full accounting-grade reconciliation.
11. Public attachment sharing.
12. Mandatory cloud services.

## 4. User and Permission Model

V1 supports exactly one authentication account: the admin account.

Household members such as Family, Husband, Wife, Kids, and Pets are bookkeeping dimensions, not login identities.

Audit actor for V1 is always the admin account.

Future multi-user login may be added later, but all V1 database design should avoid blocking that extension. Tables that record actor information should use an `actor_id` or `actor_label` field rather than hardcoding assumptions into business logic.

## 5. Deployment Model

Target runtime:

* Hardware: Intel NUC or similar home server
* OS: Ubuntu 24.04
* Runtime: Docker Compose
* Network:

  * LAN-first by default
  * Optional WAN access through Caddy or Nginx reverse proxy
  * HTTPS required for WAN access

Primary services:

* Web frontend
* API backend
* PostgreSQL
* Redis
* Worker process for BullMQ jobs
* Reverse proxy for production
* Backup service or scheduled backup job

## 6. Technology Stack

Recommended stack:

* Monorepo: pnpm workspaces
* Frontend: Vue 3, Vite, TypeScript, PWA
* Frontend local DB: IndexedDB through Dexie
* Backend: NestJS, TypeScript
* Database: PostgreSQL
* Database access: Prisma
* Cache and queue: Redis and BullMQ
* Validation: Zod shared schemas
* Testing:

  * Backend unit tests
  * Backend integration tests against PostgreSQL and Redis
  * Frontend unit tests with Vitest and Testing Library
  * E2E tests with Playwright
* API style: REST
* API documentation: OpenAPI / Swagger in development only

Prisma should be used for schema, migrations, and generated DB client. Raw SQL migrations are allowed where needed for PostgreSQL extensions and indexes such as `pg_trgm`, full-text search, or specialized indexes.

## 7. Repository Structure

Required monorepo structure:

```text
qdd/
  apps/
    api/
    web/
  packages/
    shared/
  docs/
    architecture.md
    security.md
    sync.md
    parsing-pipeline.md
    tech-decisions.md
    product-architecture-spec.md
    engineering-standards.md
    milestones.md
  infra/
    caddy/
    nginx/
    backup/
  docker-compose.yml
  docker-compose.override.yml
  docker-compose.prod.yml
  docker-compose.test.yml
  pnpm-workspace.yaml
  package.json
  .env.example
```

## 8. Core Domain Model

### 8.1 Ledger

A ledger represents an isolated bookkeeping space.

Required fields:

* `id`
* `name`
* `base_currency`
* `timezone`
* `created_at`
* `updated_at`
* `version`
* `deleted_at`

Rules:

* Base currency is per-ledger.
* Ledger deletion should be soft delete unless a later admin-only hard-delete workflow is explicitly added.
* All ledger-owned entities must include `ledger_id`.

### 8.2 Entry

An entry is either an expense or income.

Allowed types:

* `Expense`
* `Income`

Transfers are not supported.

Required fields:

* `id`
* `ledger_id`
* `type`
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

* `occurred_at` stores full datetime.
* Default `occurred_at` is now.
* UI may allow date-only input.
* Date-only input resolves to `12:00` local time unless the user explicitly sets a time.
* `base_amount` is calculated and persisted when the entry is created or updated.
* Historical base amounts are not recalculated when FX assumptions change.

### 8.3 Money and FX

Money rules:

* Never use floating point for money.
* Store amounts as `NUMERIC(18, 4)` unless an integer minor-unit strategy is implemented consistently.
* Store `fx_rate` as `NUMERIC(18, 8)` or higher precision.
* If `original_currency` equals ledger `base_currency`, `fx_rate` defaults to `1.0`.
* If currencies differ, V1 uses manually entered FX rate.
* Rounding behavior must be documented in `docs/tech-decisions.md`.
* `base_currency` is copied from the ledger at entry creation/update time and persisted.

### 8.4 Category

Categories are ledger-isolated.

Required fields:

* `id`
* `ledger_id`
* `stable_key`
* `parent_id`
* `name`
* `sort_order`
* `status`
* `created_at`
* `updated_at`
* `version`
* `deleted_at`

Rules:

* `stable_key` is unique within a ledger.
* Database IDs are internal UUIDs.
* YAML files use stable keys, not internal database IDs.
* Categories should be archived/inactivated rather than physically deleted if referenced by entries.
* Category rollback must not break historical entries.
* Category import from another ledger means copy categories into the target ledger, not shared references.

### 8.5 Category Versioning

Each committed category import/update creates a new category version snapshot.

Required behavior:

* Validate first.
* Show import preview.
* Commit only after explicit user confirmation.
* Store snapshot metadata.
* Support rollback to a prior snapshot.
* Log audit events for import, export, commit, and rollback.

Rollback behavior:

* Must restore category tree shape and metadata as safely as possible.
* Must not orphan entries.
* If rollback would remove a category referenced by entries, mark it inactive instead of deleting it, or require explicit remapping.

### 8.6 Members

Default member presets per ledger:

* Family
* Husband
* Wife
* Kids
* Pets

Members are editable bookkeeping dimensions.

### 8.7 Projects

Default project presets per ledger:

* Renovation
* Pets
* Travel
* Car

Projects are editable bookkeeping dimensions.

### 8.8 Merchants

Merchants are ledger-isolated dictionary records.

Required behavior:

* Merchant names are searchable.
* Merchant similarity is used for duplicate detection.
* Merchant matching may use `pg_trgm`.

### 8.9 Rules

Rules are ledger-isolated and versioned.

Rule types:

* Merchant rule
* Category rule

Merchant rule:

* keyword or regex pattern maps input text to `merchant_id`

Category rule:

* merchant or text condition maps to `category_id`

Ordering:

1. Higher explicit priority wins.
2. Regex rules run before keyword rules.
3. For same priority and type, longer pattern wins.
4. For exact ties, deterministic order is required.
5. Only active rule versions are evaluated.
6. Rules never cross ledger boundaries.

Rules must support:

* Validation
* Version snapshots
* Rollback
* Audit logging
* Explainable match result

### 8.10 Saved Views

Saved views are ledger-isolated.

They store:

* Name
* Filter configuration
* Sort configuration
* Created/updated metadata

Saved views must not store executable code.

### 8.11 Duplicate Detection Settings

Each ledger has configurable duplicate detection settings.

Defaults:

* Amount tolerance: `±0`
* Time window: `±5 minutes`
* Merchant: same or similar

Duplicate detection must return:

* Candidate entry
* Score
* Reasons
* Matched fields
* Confidence impact

### 8.12 Attachments

Attachments are stored server-side on the local filesystem for V1.

Required fields:

* `id`
* `ledger_id`
* `entry_id`
* `staged_entry_id`
* `original_filename`
* `stored_path`
* `mime_type`
* `size_bytes`
* `sha256`
* `thumbnail_path`
* `is_pinned`
* `created_at`
* `updated_at`
* `deleted_at`

Rules:

* Validate file extension, MIME type, size, and parsing safety.
* Prevent path traversal.
* Generate thumbnail where supported.
* Attachments may link to entries or staged entries.
* Pinned attachments are never deleted by automatic cleanup.
* Storage cap is configurable through `MAX_STORAGE_BYTES`.
* Cleanup deletes oldest unpinned attachments first.
* If pinned attachments alone exceed the cap, cleanup must not delete pinned files. The system reports over-cap status and may block or warn on new uploads based on configuration.

## 9. Search

Search must cover:

* Entry note
* Merchant
* Project

Implementation:

* Use PostgreSQL full-text search for English-like note/project content where useful.
* Use `pg_trgm` for merchant fuzzy matching and duplicate detection.
* For Chinese text in V1, support `ILIKE` and trigram-style fallback where practical.
* Full Chinese tokenization is out of scope for V1 unless explicitly added later.

Search behavior must be documented in `docs/tech-decisions.md`.

## 10. Reports

Reports must include:

1. Spending trend by week, month, and year.
2. Category share for selected time range.
3. Project totals for selected time range.
4. Currency mode toggle.

Currency behavior:

* Base mode aggregates all records using persisted `base_amount` and `base_currency`.
* Original mode groups totals by `original_currency`.
* Original mode must not sum across different currencies.
* Category share in original mode must either require a selected currency or display separate datasets per currency.

## 11. Import / Export

Import must never silently create final entries.

Required import flow:

1. Upload file.
2. Select or configure mapping.
3. Validate rows.
4. Create staged entries.
5. Show preview with confidence and reasons.
6. User approves, edits, or rejects.
7. Approved staged entries become real entries.
8. Commit is logged in audit log.

Supported formats:

* CSV
* JSON

Excel may be added if a stable library is selected and documented.

Export formats:

* CSV
* JSON

Export must support ledger, time range, and filters.

## 12. Parsing Pipeline

Pipeline stages:

1. File ingest
2. Text extraction
3. Structured parsing
4. Rule matching
5. Duplicate detection
6. Confidence scoring
7. Staged inbox
8. Optional LLM enhancement

All smart decisions must produce explainable reasons.

OCR is optional and may be added after PDF/text extraction works.

## 13. Offline and Sync

Offline behavior is introduced incrementally.

Before full sync:

* PWA may cache static shell assets.

After sync milestone:

* Entries can be created and edited offline.
* Dexie stores local records.
* Local changes are recorded in a change log.
* Changes push to server on reconnect.
* Server returns applied versions.
* Client pulls deltas from server.

Sync requirements:

* Every syncable record uses UUID.
* Offline-created records use client-generated UUIDs.
* Each syncable record has:

  * `version`
  * `updated_at`
  * `deleted_at`
  * `last_modified_by_client_id`
* Local changes use idempotency keys.
* Push API must be idempotent.
* Push returns per-change result:

  * `applied`
  * `rejected`
  * `conflict`
  * `already_applied`
* Pull API should use a server cursor, not only client timestamps.
* Deletions are tombstoned before hard deletion.
* Purge must account for sync tombstones and offline clients.

Conflict strategy:

* Last-Write-Wins by default.
* Conflict UI lists conflicts.
* User can choose local or server record for specific conflicts.

Attachments offline:

* Cache thumbnails and recent N attachments only.
* Full attachment offline caching is not required for V1.

## 14. Audit Log

Audit log is required for important actions.

Must log:

* Login failures beyond threshold
* Category import/export/rollback
* Rule update/rollback
* Entry soft delete
* Entry purge
* Import commit
* Bulk operations
* Attachment cleanup
* Backup creation
* Restore attempt
* Restore success/failure
* LLM usage if enabled

Audit fields:

* `id`
* `actor_id`
* `actor_label`
* `action`
* `entity_type`
* `entity_id`
* `ledger_id`
* `metadata`
* `created_at`
* `request_id`

Audit logs should be append-only.

## 15. Backup and Restore

Backups:

* PostgreSQL backups via `pg_dump`
* Daily and weekly schedules
* Retention policy
* Backup listing
* Backup metadata

Restore:

* Admin-only
* Requires explicit confirmation
* Requires audit log
* Should provide dry-run or metadata preview where possible
* Must warn that restore is destructive
* Should run with service downtime or maintenance mode if needed

## 16. Security Architecture

Authentication:

* Single admin account for V1
* Strong password policy
* Common password denial
* Argon2id password hashing preferred
* Secure session through HTTP-only cookies

Session requirements:

* `HttpOnly`
* `Secure` in production
* `SameSite=Lax` or `SameSite=Strict`
* Configurable expiration
* Server-side session invalidation preferred

CSRF:

* Required for cookie-based authentication.

Rate limiting:

* Login endpoint rate-limited by IP and account.
* Exponential backoff or temporary lockout after repeated failures.

Production hardening:

* Disable Swagger `/docs` in production.
* Reverse proxy must set security headers.
* HTTPS required for WAN.
* Secrets must come from environment variables.
* Uploads must be validated and size-limited.
* Destructive admin actions require explicit confirmation.

## 17. API Design

API style:

* REST
* JSON
* Typed DTOs
* Zod validation
* OpenAPI in dev

Error format:

```json
{
  "error": {
    "code": "CATEGORY_DUPLICATE_KEY",
    "message": "Category key already exists in this ledger.",
    "details": {},
    "requestId": "..."
  }
}
```

All endpoints must:

* Validate input.
* Return typed output.
* Use consistent errors.
* Avoid leaking stack traces.
* Enforce ledger isolation.

## 18. Accessibility Requirements

Frontend must include:

* Semantic HTML where possible.
* Labels for form inputs.
* Keyboard navigation for critical flows.
* Visible focus states.
* Sufficient contrast.
* Form errors announced accessibly.
* No keyboard traps.
* Buttons must communicate destructive actions clearly.

## 19. Documentation Requirements

Required documentation:

* `docs/architecture.md`
* `docs/security.md`
* `docs/sync.md`
* `docs/parsing-pipeline.md`
* `docs/tech-decisions.md`
* `docs/product-architecture-spec.md`
* `docs/engineering-standards.md`
* `docs/milestones.md`

Docs must be updated when relevant architecture, data model, security, or sync behavior changes.
