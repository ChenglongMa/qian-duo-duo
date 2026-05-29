# QianDuoDuo Engineering Standards

## 1. Engineering Approach

Build production-quality foundations incrementally.

Do not optimize prematurely, but avoid shortcuts that would make later milestones unsafe or require major rewrites.

Prefer:

* Explicit schemas
* Typed DTOs
* Database migrations
* Deterministic tests
* Clear error codes
* Documented trade-offs
* Small deliverable increments

When a requirement is ambiguous, make the safest reasonable assumption, document it in `docs/tech-decisions.md`, and continue implementation.

## 2. Milestone Gating Rule

Do not start a new milestone until the current milestone passes:

```bash
pnpm lint
pnpm test
pnpm build
```

From the milestone where E2E is introduced:

```bash
pnpm e2e
```

If a test fails:

1. Stop feature work.
2. Fix the failing test or implementation.
3. Re-run the full milestone gate.
4. Only continue after all checks pass.

## 3. Dependency Policy

Use the latest stable dependency versions at the time of implementation.

Before selecting major dependencies, check:

```bash
pnpm info <pkg> version
```

Use official documentation for framework best practices.

Rules:

* Do not use deprecated APIs.
* Do not hardcode a stale Node.js version in project docs.
* Target current Node.js LTS.
* Lock selected versions in `pnpm-lock.yaml`.
* Docker images may use a current LTS major tag or a build ARG.
* Document chosen runtime and major library choices in `docs/tech-decisions.md`.

## 4. Package Management

Use pnpm workspaces.

Required root scripts:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r --filter '!@qdd/e2e' test",
    "test:unit": "pnpm -r --filter '!@qdd/e2e' test:unit",
    "test:integration": "pnpm -r --filter '!@qdd/e2e' test:integration",
    "e2e": "pnpm --filter @qdd/e2e test",
    "typecheck": "pnpm -r typecheck",
    "format": "pnpm -r format",
    "db:migrate": "pnpm --filter @qdd/api db:migrate",
    "db:seed": "pnpm --filter @qdd/api db:seed"
  }
}
```

Package names:

* `@qdd/api`
* `@qdd/web`
* `@qdd/shared`

## 5. TypeScript Standards

Rules:

* Strict TypeScript everywhere.
* Avoid `any`.
* If `any` is unavoidable, include a short comment explaining why.
* Shared request/response schemas live in `packages/shared`.
* API DTOs must be derived from or compatible with shared Zod schemas.
* Frontend API clients must use shared response types.
* No duplicated DTO definitions across apps.

Required settings:

* `strict: true`
* `noUncheckedIndexedAccess: true` where practical
* `exactOptionalPropertyTypes: true` where practical
* `noImplicitOverride: true`

## 6. Validation Standards

Use Zod as the primary validation layer.

Server rules:

* Every request body must be validated.
* Query parameters must be validated.
* Route params must be validated.
* File metadata must be validated.
* YAML imports must use strict schema validation.
* Unknown unsafe fields should be rejected unless explicitly allowed.

Client rules:

* Forms should reuse shared schemas or schema-derived validators where practical.
* Form errors must be user-readable.
* Raw server errors should not be shown directly unless already safe.

## 7. API Standards

API style:

* REST
* JSON
* Versionable route structure where appropriate
* OpenAPI in development only

Required API behavior:

* Consistent error shape.
* Request ID attached to logs and error responses.
* Authentication enforced by default.
* Ledger isolation enforced server-side.
* No trust in client-provided ledger ownership.

Error shape:

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

## 8. Security Standards

Authentication:

* V1 has one admin login.
* Use Argon2id for password hashing unless documented otherwise.
* Enforce strong password policy.
* Deny common passwords.
* Never store plaintext passwords.
* Never log passwords, tokens, session IDs, or secrets.

Sessions:

* Prefer secure HTTP-only cookie sessions.
* Cookies must be:

  * `HttpOnly`
  * `Secure` in production
  * `SameSite=Lax` or stricter
* CSRF protection is required for cookie-based auth.
* Session secret must come from environment variable.

Login protection:

* Rate limit by IP.
* Rate limit by account identifier.
* Add exponential backoff or temporary lockout.
* Return safe generic login failure messages.

Production behavior:

* Disable `/docs` Swagger in production.
* Enable security headers in reverse proxy.
* HTTPS required for WAN.
* Use non-root containers where practical.
* Validate upload size, type, and extension.
* Prevent path traversal for file storage.

Destructive actions:

* Require explicit confirmation.
* Write audit log.
* For high-risk actions such as restore or purge, require exact confirmation text.

## 9. Database Standards

Use Prisma for:

* Schema
* Migrations
* Generated database client
* Seed scripts

Rules:

* All schema changes require migrations.
* All business entities use UUID primary keys.
* Offline-created syncable records must support client-generated UUIDs.
* Soft-deletable records use `deleted_at`.
* Syncable records use `version`, `updated_at`, and `deleted_at`.
* Ledger-owned records must include `ledger_id`.
* Foreign keys and indexes must be explicit.
* Use raw SQL migrations for PostgreSQL extensions and special indexes.

Money:

* Do not use floating point.
* Use `NUMERIC(18, 4)` or documented equivalent.
* Use high precision for FX rates.
* Persist calculated base amounts.

## 10. Testing Standards

Required test types:

* Backend unit tests
* Backend integration tests
* Frontend unit tests
* E2E tests from Milestone 2 onward

Backend unit tests should cover:

* Pure services
* Validation
* Security helpers
* Rule ordering
* Cleanup algorithms
* Sync merge logic

Backend integration tests should cover:

* API endpoints
* Database migrations
* PostgreSQL queries
* Redis/BullMQ behavior where relevant

Frontend unit tests should cover:

* Form validation
* Important UI state transitions
* Accessibility-relevant behavior
* Sync reducers where applicable

E2E tests should cover:

* Critical user flows only
* Login
* Ledger/category creation
* Entry creation/search/delete/purge
* Import staging and approval
* Offline sync once implemented

Testcontainers are recommended for PostgreSQL and Redis integration tests. If unavailable, provide `docker-compose.test.yml` fallback.

## 11. CI Standards

CI must run:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

From E2E milestone onward, CI or local gated verification must also run:

```bash
pnpm e2e
```

CI should fail on:

* Type errors
* Lint errors
* Test failures
* Build failures
* Missing lockfile consistency

## 12. Frontend Standards

Frontend stack:

* Vue 3
* Vite
* TypeScript
* Vue Router
* Pinia or equivalent state management
* Dexie for IndexedDB
* PWA plugin

Rules:

* Use typed API clients.
* Use accessible form controls.
* Keep business validation shared where practical.
* Avoid embedding security-sensitive logic only on the client.
* Offline state must be visible to the user.
* Conflict UI must be explicit and explain local/server differences.

## 13. Backend Standards

Backend stack:

* NestJS
* TypeScript
* Prisma
* Zod validation
* Redis
* BullMQ

Rules:

* Controllers should stay thin.
* Business logic belongs in services.
* Database access should be isolated through repositories/services.
* All endpoints must validate input.
* All authenticated endpoints must enforce authorization and ledger scope.
* Important actions must log audit events.
* Background jobs must be idempotent where practical.

## 14. Docker Standards

Required compose files:

* `docker-compose.yml` for base services
* `docker-compose.override.yml` for local dev
* `docker-compose.prod.yml` for production profile
* `docker-compose.test.yml` for integration/E2E if needed

Required services:

* `postgres`
* `redis`
* `api`
* `worker`
* `web`
* `reverse-proxy` in production profile

Rules:

* Use volumes for PostgreSQL data.
* Use volumes for uploaded attachments.
* Use volumes for backups.
* Do not bake secrets into images.
* Environment variables come from `.env`.
* `.env.example` must be complete but contain no real secrets.

## 15. Documentation Standards

Update docs when changing:

* Architecture
* Security behavior
* Sync behavior
* Database model
* Parsing pipeline
* Dependency choices
* Deployment behavior

Minimum docs:

* `docs/architecture.md`
* `docs/security.md`
* `docs/sync.md`
* `docs/parsing-pipeline.md`
* `docs/tech-decisions.md`

`docs/tech-decisions.md` must include:

* Chosen libraries
* Why they were chosen
* Important trade-offs
* Any deviations from the recommended stack
* Links or notes to official docs checked during implementation

## 16. Accessibility Standards

Required:

* Labels for inputs
* Keyboard navigation
* Visible focus states
* Error messages associated with fields
* Destructive buttons clearly labeled
* Color contrast suitable for normal use
* No critical action available only through pointer interaction

## 17. Observability Standards

Required:

* Structured server logs
* Request ID
* Error logging without sensitive data
* Job logs for backup, cleanup, import, parsing, and sync
* Audit log for important business/security actions

Do not log:

* Passwords
* Session tokens
* API keys
* Raw LLM prompts containing sensitive data unless debug mode is explicitly enabled
* Full uploaded file contents

## 18. LLM Standards

LLM functionality is optional and disabled by default.

Rules:

* Never call an LLM unless explicitly enabled by policy and user action.
* Provider API keys are server-side only.
* Redaction happens before data leaves the server.
* Usage records must be stored.
* Attachments or images are never sent to external providers unless explicitly confirmed.
* Prompts and responses should not be stored unless debug logging is enabled.

Supported provider abstraction:

* OpenAI
* Azure OpenAI
* Claude
* Self-hosted OpenAI-compatible endpoint

## 19. Definition of Done Template

Every milestone must satisfy:

* Source code is typed.
* No unjustified `any`.
* New endpoints have Zod validation.
* New DB changes have migrations.
* New behavior has tests.
* Errors use standard error shape.
* Security-relevant behavior is documented.
* `pnpm lint` passes.
* `pnpm test` passes.
* `pnpm build` passes.
* `pnpm e2e` passes once introduced.
* Docker environment starts successfully where applicable.
* Docs are updated.
