---
description: Bootstrap QianDuoDuo Milestone 0 using the repository standards, latest stable packages, official docs, tests, Docker, and CI.
argument-hint: "[optional focus]"
---

# Milestone 0 Bootstrap

Build Milestone 0 for QianDuoDuo.

First read:
- AGENTS.md
- docs/product-architecture-spec.md
- docs/engineering-standards.md
- docs/milestones.md
- docs/tech-decisions.md
- .codex/project-context.md
- .codex/checklists/milestone-gate.md

Create a pnpm monorepo with:
- apps/api
- apps/web
- packages/shared
- docs

Use:
- NestJS with TypeScript for API
- Vue 3 + Vite + TypeScript for web
- pnpm workspaces
- PostgreSQL and Redis in Docker Compose
- ESLint and Prettier
- Vitest or Jest as appropriate
- GitHub Actions CI

Before selecting package versions or using framework APIs:
- Check latest stable package versions with pnpm info <pkg> version.
- Check current official docs for NestJS, Vue, Vite, pnpm, Prisma, ESLint, Prettier, Vitest/Jest, Docker, and GitHub Actions as applicable.
- Use current recommended APIs and config formats.
- Do not use deprecated scaffolding or outdated examples.
- Document selected versions and docs checked in docs/tech-decisions.md.

Add:
- API health controller at /health
- Web root component test
- Shared package exporting at least one simple health DTO/schema
- .env.example
- docker-compose.yml
- docker-compose.override.yml
- docs skeleton files required by docs/product-architecture-spec.md

Acceptance requirements:
- pnpm install works.
- pnpm lint passes.
- pnpm test passes.
- pnpm build passes.
- docker compose config passes.
- docker compose up starts Postgres, Redis, API, and Web.
- API /health returns a typed successful response.
- Web root component renders in test.

Do not implement authentication or domain CRUD yet.
Do not proceed to Milestone 1 until the Milestone 0 gate passes.
Document dependency choices and trade-offs in docs/tech-decisions.md.
