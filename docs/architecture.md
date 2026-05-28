# QianDuoDuo Architecture

This document is the living architecture record for QianDuoDuo (QDD).

Canonical source documents:

- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md`

## Current State

Milestone 0 bootstraps the application foundation:

- `packages/shared` exports the first Zod contract for API health responses.
- `apps/api` is a NestJS service with a typed `/health` endpoint.
- `apps/web` is a Vue 3 + Vite application with a tested root component.
- Docker Compose defines PostgreSQL, Redis, API, worker placeholder, and web services.
- GitHub Actions runs install, lint, test, and build.

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

Milestone 0 includes only a worker placeholder. BullMQ queues, Prisma schema, migrations,
authentication, and domain data are introduced by later milestones.

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
