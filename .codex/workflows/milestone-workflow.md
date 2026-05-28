# Milestone Workflow

Use this workflow for every implementation milestone.

## 1. Orient

Read:

- `AGENTS.md`
- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md`
- Existing schema and migrations
- Existing shared schemas in `packages/shared`

Check:

```bash
git status --short
rg --files
```

Identify the current milestone by comparing completed code and docs against `docs/milestones.md`.

## 2. Scope

Write a short implementation plan for the current milestone:

- Required files and packages.
- Required schemas and DTOs.
- Required tests.
- Required docs updates.
- Gate commands to run.

Do not include work from the next milestone unless it is infrastructure needed for the current one.

## 3. Implement

Build in small vertical slices:

1. Shared schemas and types.
2. Backend contracts and service logic.
3. Database schema and migrations.
4. Frontend UI and typed API client.
5. Tests.
6. Docs and environment examples.
7. Docker and CI updates.

Before choosing dependencies or framework APIs, perform a freshness check:

```bash
pnpm info <pkg> version
```

Then check the latest official documentation for the selected major version and implement the current recommended API shape. Do not use deprecated examples, legacy configuration formats, or stale scaffolds.

Document selected runtime and major library choices in `docs/tech-decisions.md`, including:

- Package versions selected.
- Official docs checked.
- Any compatibility constraints.
- Any deliberate deviation from the latest stable version.

## 4. Verify

Run the milestone gate:

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

From Milestone 2 onward:

```bash
pnpm e2e
```

When Docker files change, also run:

```bash
docker compose config
```

For Milestone 0, verify:

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

## 5. Close

Before finishing:

- Ensure docs changed with behavior.
- Ensure `.env.example` contains required variables and no secrets.
- Ensure no generated secrets or local-only files are committed.
- Update `.codex/tasks/current.md` only when the milestone is truly complete.
- Summarize what changed, what was verified, and any remaining risks.
