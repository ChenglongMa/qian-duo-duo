# QianDuoDuo Architecture

This document is the living architecture record for QianDuoDuo (QDD).

Canonical source documents:

- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md`

## Current State

Milestone 1 adds authentication, Prisma persistence, master-data CRUD, category YAML workflows,
category snapshots, rollback, and audit logging foundations:

- `packages/shared` exports Zod contracts for health, auth, errors, ledgers, categories, members,
  projects, merchants, category YAML, and audit DTOs.
- `apps/api` is a NestJS REST service with `/health`, `/auth/*`, `/ledgers`, and ledger-scoped
  master-data routes.
- Prisma owns PostgreSQL schema and migrations for admin accounts, sessions, ledgers, categories,
  category versions, members, projects, merchants, rule version placeholders, and audit logs.
- Authentication uses one seeded admin account, Argon2id password hashing, hashed opaque cookie
  sessions, CSRF tokens, and login rate limiting.
- Category YAML import/export uses stable keys. Import and rollback create category version
  snapshots and audit events.
- `apps/web` has a tested admin login form and category tree component wired to shared types.
- GitHub Actions runs install, database migration, seed, lint, test, and build against PostgreSQL
  and Redis service containers.

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

Milestone 1 includes only rule version placeholder tables. BullMQ queues, entry management,
offline sync, import staging, attachments, backup, and parsing work are introduced by later
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
