# QianDuoDuo Architecture

This document is the living architecture record for QianDuoDuo (QDD).

Canonical source documents:

- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md`

## Current State

Milestone 2A adds daily entry bookkeeping on top of the Milestone 1 authentication and master-data
foundation:

- `packages/shared` exports Zod contracts for health, auth, errors, ledgers, categories, members,
  projects, merchants, category YAML, entries, money strings, and audit DTOs.
- `apps/api` is a NestJS REST service with `/health`, `/auth/*`, `/ledgers`, and ledger-scoped
  master-data and entry routes.
- Prisma owns PostgreSQL schema and migrations for admin accounts, sessions, ledgers, categories,
  category versions, members, projects, merchants, entries, rule version placeholders, and audit
  logs.
- Authentication uses one seeded admin account, Argon2id password hashing, hashed opaque cookie
  sessions, CSRF tokens, and login rate limiting.
- Category YAML import/export uses stable keys. Import and rollback create category version
  snapshots and audit events.
- Entry create/update/list/get/clone/soft-delete routes enforce ledger scope, hide soft-deleted
  rows from normal reads, persist `base_amount` and `base_currency`, and audit create/update/clone
  and delete actions.
- `apps/web` has a tested admin login flow, ledger/category setup, entry form, amount keypad,
  recent-used chips, entry filters, sorting, editing, clone, and soft delete.
- `apps/e2e` runs the critical login-to-soft-delete flow with Playwright.
- GitHub Actions runs install, database migration, seed, lint, test, build, browser install, and
  E2E against PostgreSQL and Redis service containers.

## Target Shape

QDD is a pnpm workspace monorepo:

```text
apps/api
apps/web
packages/shared
infra
docs
```

Target services:

- Web frontend: Vue 3, Vite, TypeScript, PWA.
- API backend: NestJS, TypeScript, REST JSON.
- Shared package: Zod schemas and shared TypeScript types.
- Database: PostgreSQL through Prisma.
- Cache/queue: Redis and BullMQ.
- Worker: background jobs for import, parsing, backup, cleanup, and sync work.
- Reverse proxy: Caddy or Nginx for production WAN exposure.

Milestone 2A includes only entry CRUD and soft delete. BullMQ queues, purge, saved views, advanced
search, offline sync, import staging, attachments, backup, and parsing work are introduced by later
milestones.

## Architectural Invariants

- QDD is self-hosted for one private household.
- V1 has one admin account.
- Household members are bookkeeping dimensions, not login identities.
- Ledger-owned data is isolated by `ledger_id`.
- All syncable records support UUIDs, `version`, `updated_at`, and `deleted_at`.
- Money never uses floating point.
- Imports stage records before final entry creation.
- Important actions produce audit events.

## Update Rule

Update this document whenever architecture, service boundaries, data ownership, deployment topology, or major libraries change.
