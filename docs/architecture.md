# QianDuoDuo Architecture

This document is the living architecture record for QianDuoDuo (QDD).

Canonical source documents:

- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md`

## Current State

The repository is ready for Milestone 0 implementation. Application code has not been bootstrapped yet.

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

