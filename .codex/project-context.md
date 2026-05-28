# QDD Project Context

QianDuoDuo (QDD) is a private, self-hosted household expense tracker for 2-3 household members. It runs on a home server, is Dockerized, works as a PWA, supports offline entry workflows by later milestone, and can optionally be exposed through a secure reverse proxy.

QDD is not a SaaS product. V1 has exactly one admin account. Household members are bookkeeping dimensions, not users.

## Primary Capabilities

- Multiple isolated ledgers.
- Income and expense entries only.
- Per-ledger base currency.
- Multi-currency entries with manually entered FX and persisted converted base amounts.
- Ledger-isolated categories, members, projects, merchants, rules, saved views, import presets, duplicate detection settings, and attachments.
- Category YAML import/export with version snapshots and rollback.
- Soft delete, purge, audit log, backup, and restore.
- CSV/JSON import through staging, preview, approval, and audit logging.
- Optional parsing pipeline and optional LLM enhancement with strict opt-in and redaction.

## Architecture Direction

- pnpm workspace monorepo.
- `apps/api`: NestJS REST API.
- `apps/web`: Vue 3 + Vite PWA.
- `packages/shared`: Zod schemas and shared types.
- PostgreSQL through Prisma.
- Redis and BullMQ for cache, queues, and background jobs.
- Docker Compose for local, test, and production profiles.

## Non-Negotiable Invariants

- Ledger isolation is enforced server-side.
- Money never uses floating point.
- `base_amount` and `base_currency` are persisted on entry create/update.
- All syncable records support UUIDs, `version`, `updated_at`, and `deleted_at`.
- Imports stage records and require explicit approval.
- Destructive operations require explicit confirmation and audit logging.
- LLM calls are impossible unless enabled by policy and explicitly triggered by the user.

## Active Milestone

Milestone 2A is the next implementation target. It implements entry CRUD, money and FX validation,
date-only entry behavior, member/category/merchant/project selection, clone entry, list/filter/sort,
soft delete, audit logging for entries, recent-used chips, amount keypad validation, and Playwright
E2E setup.
