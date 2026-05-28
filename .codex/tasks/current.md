# Current Codex Task

## Active Milestone

Milestone 0: Bootstrap, Infrastructure, and CI.

## Goal

Create the monorepo foundation, Docker development environment, shared package, basic API/web apps, health checks, linting, formatting, CI, and initial docs skeleton.

## Start With

- `.codex/prompts/milestone-00-bootstrap.md`
- `.codex/workflows/milestone-workflow.md`
- `.codex/checklists/milestone-gate.md`

## Explicitly Out of Scope

- Authentication.
- Domain CRUD.
- Entry management.
- Import pipeline.
- Offline sync.
- LLM integration.

## Completion Criteria

Milestone 0 is complete only after:

- Required monorepo structure exists.
- API health endpoint works.
- Web root component renders and is tested.
- Shared package exports a typed health schema/DTO.
- Docker Compose starts Postgres, Redis, API, worker placeholder, and web.
- CI runs install, lint, test, and build.
- Docs skeleton is present.
- No secrets are committed.
- Milestone 0 gate passes.

