# Codex Instructions for QianDuoDuo

## Canonical Sources

Before changing implementation, read these files:

- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md` when it exists
- Existing schema, migrations, and shared schemas when they exist

If instructions conflict, prefer the product and engineering docs, then update this file in the same change set.

## Product Boundary

QianDuoDuo (QDD) is a private, self-hosted household expense tracker for one household. It is not a SaaS product.

V1 supports:

- One admin login account only.
- Household members as bookkeeping dimensions, not login identities.
- Income and expense tracking only.
- Multiple ledgers with ledger-isolated data.
- Per-ledger base currency and persisted FX conversion.
- Offline-capable PWA behavior introduced by milestone.
- Audit logging, soft delete, purge, backup, and restore.
- Optional LLM features only when explicitly enabled and triggered.

V1 does not support public registration, SaaS multi-tenancy, transfers, bank API integration, automatic FX fetching, native mobile apps, or real-time collaboration.

## Target Stack

- Monorepo: pnpm workspaces
- Frontend: Vue 3, Vite, TypeScript, PWA, Dexie
- Backend: NestJS, TypeScript
- Database: PostgreSQL through Prisma
- Queue/cache: Redis and BullMQ
- Shared validation: Zod in `packages/shared`
- API style: REST JSON with OpenAPI/Swagger in development only
- Testing: backend unit/integration, frontend unit, Playwright E2E from Milestone 2 onward
- Runtime: Docker Compose on Ubuntu 24.04, LAN-first with optional secure reverse proxy

Required package names:

- `@qdd/api`
- `@qdd/web`
- `@qdd/shared`

Required top-level structure:

```text
apps/api
apps/web
packages/shared
docs
infra
docker-compose.yml
docker-compose.override.yml
docker-compose.prod.yml
docker-compose.test.yml
pnpm-workspace.yaml
package.json
.env.example
```

## Development Workflow

1. Check `git status --short` before edits.
2. Identify the active milestone from `docs/milestones.md` and existing code.
3. Keep changes within the active milestone unless the user explicitly asks otherwise.
4. Implement schemas, DTOs, service logic, tests, docs, and Docker/CI changes together when required.
5. Update `docs/tech-decisions.md` for dependency choices, architecture trade-offs, money/date/search behavior, and deviations.
6. Run the milestone gate before moving on.

When a requirement is ambiguous, make the safest reasonable assumption, document it in `docs/tech-decisions.md`, and continue.

## Dependency and Documentation Freshness

When writing code, use the latest stable package versions available at the time of implementation unless a compatibility constraint is documented.

Before adding or upgrading a dependency:

```bash
pnpm info <pkg> version
```

Before using framework APIs, configuration formats, plugins, or generated scaffolds, check the latest official documentation for the selected major version. Prefer current recommended APIs and project templates over older blog posts, examples, or deprecated patterns.

Rules:

- Do not use deprecated APIs, legacy configuration formats, or stale scaffolding patterns.
- Do not pin old major versions unless required by a documented compatibility reason.
- Do not hardcode a stale Node.js version; target current Node.js LTS and document the selected version.
- If official docs and an existing local pattern conflict, prefer a compatible migration path and document the decision.
- Record selected dependency versions, official docs checked, compatibility constraints, and important trade-offs in `docs/tech-decisions.md`.
- If a package's latest stable version introduces breaking changes, adapt the code to the current API instead of copying older examples.

## Milestone Gate

Do not begin a later milestone until the current milestone passes:

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

From Milestone 2 onward, also run:

```bash
pnpm e2e
```

If a gate fails, stop feature work, fix the failure, and rerun the full gate.

## Engineering Standards

- Use strict TypeScript everywhere.
- Avoid `any`; if unavoidable, explain why in a short comment.
- Define shared Zod schemas in `packages/shared`.
- Derive or align API DTOs with shared schemas.
- Do not duplicate DTO definitions across apps.
- Validate request bodies, query params, route params, file metadata, and YAML imports.
- Use consistent typed error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable safe message.",
    "details": {},
    "requestId": "..."
  }
}
```

- Controllers stay thin; business logic belongs in services.
- All endpoints enforce authentication by default once auth exists.
- Ledger isolation is always enforced server-side.
- Important actions write audit events.
- Background jobs should be idempotent where practical.

## Domain Invariants

- All business entities use UUID primary keys.
- Offline-created syncable records must support client-generated UUIDs.
- Ledger-owned records include `ledger_id`.
- Syncable records include `version`, `updated_at`, and `deleted_at`.
- Soft-deletable records use `deleted_at`.
- Money must never use floating point.
- Store amounts as `NUMERIC(18, 4)` unless a documented equivalent is selected.
- Store FX rates as high precision, at least `NUMERIC(18, 8)`.
- Persist calculated `base_amount` and copied `base_currency`.
- Date-only entry input resolves to 12:00 local time unless a time is explicitly set.
- Imports must stage and preview records; never silently create final entries.
- Category YAML uses stable keys, not internal database IDs.
- Rollbacks must not orphan historical entries.

## Security Baseline

- Argon2id for password hashing unless a documented alternative is approved.
- Secure HTTP-only cookie sessions.
- CSRF protection for cookie-based auth.
- Rate limit login by IP and account identifier.
- Never log passwords, tokens, session IDs, API keys, secrets, or raw sensitive LLM prompts.
- Disable Swagger `/docs` in production.
- Validate upload size, type, extension, and path safety.
- Destructive actions require explicit confirmation and audit logging.
- LLM features are disabled by default and must require policy plus explicit user action.

## Current Starting State

The repository currently contains only documentation and Codex framework files. The next implementation milestone is Milestone 0: bootstrap the monorepo, Docker development environment, shared package, basic API/web apps, health checks, linting, formatting, CI, and initial docs.
