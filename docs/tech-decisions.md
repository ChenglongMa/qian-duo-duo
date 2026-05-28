# QianDuoDuo Technical Decisions

This document records implementation choices, trade-offs, dependency decisions, and documented assumptions.

Canonical baseline:

- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`

## Current Status

No runtime or library versions have been selected yet. Milestone 0 should choose and lock the initial toolchain.

## Decision Log

### 0001: Codex AI Development Framework

Decision: initialize a repository-level Codex framework with `AGENTS.md`, reusable prompts, workflows, checklists, task state, and living docs skeletons.

Context: the repository currently contains product, engineering, and milestone specifications but no execution layer for repeatable AI-assisted development.

Chosen approach: keep the three existing docs as the canonical source of truth and add a lightweight `.codex/` layer that translates them into implementation prompts and gates.

Trade-offs:

- Benefit: future Codex sessions can start with consistent project context and milestone discipline.
- Cost: framework files must be kept in sync when the canonical docs change.
- Risk: stale prompts can mislead implementation if not updated alongside docs.

Verification: created `AGENTS.md`, `.codex/`, and initial living docs skeletons without selecting application dependencies.

### 0002: Dependency Freshness Requirement

Decision: all implementation work must use latest stable package versions and current official documentation unless a compatibility constraint is documented.

Context: QDD will be built incrementally across many milestones. Using stale package versions, deprecated APIs, or outdated scaffolding would create avoidable compatibility problems and future migration work.

Chosen approach: require each implementation task to check current package versions with `pnpm info <pkg> version`, consult latest official docs for selected major versions, use current recommended APIs and configuration formats, and record selected versions plus docs checked in this file.

Trade-offs:

- Benefit: reduces compatibility drift and avoids copying obsolete examples.
- Cost: each dependency or framework change needs a small documentation check before implementation.
- Risk: latest stable packages can introduce breaking changes, so compatibility constraints must be documented when a deliberate older version is selected.

Verification: updated `AGENTS.md`, `.codex/workflows/milestone-workflow.md`, milestone prompts, checklists, and templates to enforce freshness checks.

### 0003: Claude Code Framework Uses Skills and Symlinks

Decision: add Claude Code support without duplicating the existing Codex framework by using symlinked skills for shared instructions and prompts.

Context: QDD should keep a single source of truth for AI development instructions. Maintaining separate Codex and Claude copies would create drift.

Chosen approach: create `CLAUDE.md` as a symlink to `AGENTS.md`, and expose Claude project skills through `.claude/skills/<skill>/SKILL.md` symlinks that point to `.codex/prompts/`. Add only Claude-specific metadata in `.claude/README.md` and `.claude/settings.json`.

Trade-offs:

- Benefit: Codex and Claude share the same project rules and milestone prompts.
- Benefit: updates to `.codex/prompts/` automatically update matching Claude skills.
- Benefit: skills are the current recommended Claude Code mechanism for reusable prompts because they support supporting files, automatic loading, and invocation controls.
- Cost: symlink support depends on filesystem behavior, especially on Windows.
- Risk: editing a symlinked skill path edits the shared source prompt.

Verification: checked current Claude Code official docs for `CLAUDE.md`, skills, legacy command compatibility, and `permissions.deny` settings.

### 0004: Milestone 0 Bootstrap Toolchain

Decision: bootstrap QDD as a pnpm workspace targeting Node.js 24 LTS, with NestJS for the API,
Vue 3 + Vite for the web app, Zod schemas in `@qdd/shared`, Vitest for unit/integration-style
tests, ESLint flat config, Prettier, Docker Compose, and GitHub Actions CI.

Context: Milestone 0 requires the monorepo foundation, basic health endpoint, tested web root,
Docker development services, CI, and a lockfile before any domain or authentication work begins.

Freshness checks performed with `pnpm info <pkg> version`:

- `pnpm` 11.4.0.
- `typescript` 6.0.3.
- `eslint` 10.4.0, `@eslint/js` 10.0.1, `typescript-eslint` 8.60.0,
  `eslint-plugin-vue` 10.9.1, `globals` 17.6.0.
- `prettier` 3.8.3.
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, and `@nestjs/testing` 11.1.24.
- `vue` 3.5.35, `vite` 8.0.14, `@vitejs/plugin-vue` 6.0.7, `vue-tsc` 3.3.2.
- `vitest` 4.1.7, `@testing-library/vue` 8.1.0, `jsdom` 29.1.1.
- `zod` 4.4.3.
- `tsup` 8.5.1.
- `tsx` 4.22.3.
- `supertest` 7.2.2 and `@types/supertest` 7.2.0.
- `reflect-metadata` 0.2.2 and `rxjs` 7.8.2.
- `prisma` and `@prisma/client` 7.8.0 were checked but deliberately deferred until the first
  schema and migration work in Milestone 1.

Compatibility constraint: `@types/node` uses 24.12.4 instead of the latest 25.9.1 because the
runtime target is current LTS Node.js 24. This avoids exposing Node 25-only APIs in type checking.

Compatibility constraint: `@qdd/shared` sets TypeScript `ignoreDeprecations: "6.0"` for the
declaration build because the current `tsup` DTS pipeline triggers TypeScript 6's `baseUrl`
deprecation check internally even though project tsconfigs do not use `baseUrl`.

Official documentation checked during implementation:

- Node.js releases: https://nodejs.org/en/about/previous-releases
- pnpm workspaces: https://pnpm.io/workspaces
- NestJS first steps/modules/controllers/providers/testing: https://docs.nestjs.com/
- Vue TypeScript guide: https://vuejs.org/guide/typescript/overview
- Vite guide: https://vite.dev/guide/
- Vitest guide: https://vitest.dev/guide/
- TypeScript ESLint package and flat config guidance: https://typescript-eslint.io/packages/typescript-eslint/
- Prettier configuration: https://prettier.io/docs/configuration
- Docker Compose service reference: https://docs.docker.com/reference/compose-file/services/
- GitHub Actions Node.js CI guide: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
- Zod v4 package docs: https://zod.dev/packages/zod
- tsup docs: https://tsup.egoist.dev/
- Prisma docs checked for upcoming ORM setup: https://www.prisma.io/docs
- Docker official images checked for PostgreSQL and Redis image tags:
  https://hub.docker.com/_/postgres and https://hub.docker.com/_/redis
- GitHub action version references checked for `actions/checkout@v6`, `actions/setup-node@v6`,
  and `pnpm/action-setup@v6`.

Chosen approach:

- Root scripts match the engineering standards and use recursive pnpm workspace execution.
- pnpm build-script approvals are explicit: `@nestjs/core` and `esbuild` are allowed in
  `pnpm-workspace.yaml` because they are required by the chosen Nest/Vite/Vitest toolchain.
- `@qdd/shared` builds dual ESM/CJS output with `tsup` and exports a strict health schema plus
  `HealthResponse` type.
- The API is a small NestJS app using controllers/services/modules and validates the health
  response against the shared Zod schema before returning it.
- The web app uses Vue SFCs, Vite, `vue-tsc`, and Testing Library for a root render test.
- Docker Compose uses `postgres:18-alpine`, `redis:8.4-alpine`, and Node `24-alpine` app images.
  App containers run as the non-root `node` user after build steps complete.
- PostgreSQL data mounts at `/var/lib/postgresql`, matching the official PostgreSQL 18 image
  layout for major-version-specific data directories.
- PostgreSQL and Redis publish to nonstandard local default ports (`15432` and `16379`) to avoid
  conflicts with a developer machine that already has local database services on `5432` or `6379`.
- Compose `env_file.required: false` allows `docker compose up` without committing a real `.env`.
- GitHub Actions runs `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm test`, and `pnpm build`
  on Node 24.

Trade-offs:

- Prisma, BullMQ, Dexie, Vue Router, Pinia, PWA service worker behavior, and Swagger are not
  installed in Milestone 0 because no database access, queue processing, offline workflow,
  routing/state surface, or API documentation surface is implemented yet.
- Docker development images install the full workspace for simplicity. Later production hardening
  can split runtime images once the API and web deployment shape stabilizes.
- Health is intentionally unauthenticated in Milestone 0. Authentication defaults are introduced
  once Milestone 1 adds the admin session model.

Verification: Milestone 0 gate is run after the lockfile is generated:

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

### 0005: Milestone 1 Auth, Prisma, and Master Data

Decision: implement Milestone 1 with Prisma 7, PostgreSQL migrations, single-admin auth,
Argon2id password hashing, hashed opaque cookie sessions, header CSRF tokens, in-memory login
rate limiting, shared Zod DTOs, category YAML import/export, category version snapshots,
rollback, and audit logging.

Freshness checks performed with `pnpm info <pkg> version`:

- `prisma`, `@prisma/client`, and `@prisma/adapter-pg` 7.8.0.
- `pg` 8.21.0 and `@types/pg` 8.20.0.
- `argon2` 0.44.0.
- `cookie` 1.1.1.
- `yaml` 2.9.0.
- `@nestjs/swagger` 11.4.4.
- `helmet` 8.2.0.
- `dotenv` 17.4.2.
- `@types/express` 5.0.6.
- `zod` 4.4.3 is also declared directly by `@qdd/api` because API infrastructure imports Zod
  types/errors directly.

Official documentation checked during implementation:

- Prisma ORM schema, migrations, generated client, Prisma config, and PostgreSQL driver adapter:
  https://www.prisma.io/docs/orm
- NestJS controllers, providers, guards, exception filters, testing, security, and OpenAPI docs:
  https://docs.nestjs.com/
- node-argon2 usage and Argon2id options: https://github.com/ranisalt/node-argon2
- jshttp cookie parse/serialize docs: https://github.com/jshttp/cookie
- `yaml` parse/stringify docs: https://eemeli.org/yaml/
- Helmet middleware docs: https://helmetjs.github.io/
- GitHub Actions service containers: https://docs.github.com/en/actions/using-containerized-services

Chosen approach:

- Prisma schema uses UUID primary keys, mapped snake_case database columns, `version`,
  `updated_at`, and `deleted_at` on syncable master-data records.
- The first migration creates `pgcrypto` and `pg_trgm`, admin/session tables, ledgers,
  categories, category versions, members, projects, merchants, rule version placeholders, and
  audit logs.
- Prisma 7 uses the `prisma-client` generator with output at `apps/api/src/generated/prisma`.
  Generated files are ignored and regenerated by API build/test/seed scripts.
- Admin sessions store only HMAC-SHA256 hashes of session tokens and CSRF tokens. The HMAC key
  comes from `SESSION_SECRET`, with a development fallback outside production.
- Cookie sessions use `HttpOnly`, `SameSite=Lax`, and production-only `Secure`.
- `GET /auth/session` rotates the CSRF token and returns the raw token to the client.
- Unsafe authenticated endpoints require `x-csrf-token`.
- Login rate limiting is keyed by IP and normalized username and logs an audit event when the
  failure threshold is reached.
- Category YAML format is `version: 1` plus nested `categories`, each using stable `key` values.
- Category import validates parse/schema errors, duplicate stable keys, and maximum nesting before
  committing.
- Category rollback restores a stored snapshot and marks categories absent from the snapshot
  inactive instead of hard deleting them. This keeps the rollback behavior safe for future entries.
- Ledger creation seeds member presets (`Family`, `Husband`, `Wife`, `Kids`, `Pets`) and project
  presets (`Renovation`, `Pets`, `Travel`, `Car`).
- GitHub Actions now starts PostgreSQL and Redis services, applies migrations, seeds the admin
  account, then runs lint, tests, and build.

Trade-offs:

- Login rate limiting is in memory for Milestone 1. Redis-backed distributed rate limiting is a
  later hardening step before multi-process or WAN deployment.
- CSRF is not required for `POST /auth/login` because the user does not yet have an authenticated
  session. Authenticated unsafe routes enforce CSRF.
- Rule evaluation is intentionally not implemented; only versioning placeholder tables are present.
- Frontend Milestone 1 UI is limited to tested login and category-tree surfaces. Full routing,
  persisted app state, and CRUD screens can build on the typed API clients in later milestones.

Verification: Milestone 1 gate is run with PostgreSQL/Redis available:

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

## Template

Use `.codex/templates/tech-decision.md` for new decisions.
