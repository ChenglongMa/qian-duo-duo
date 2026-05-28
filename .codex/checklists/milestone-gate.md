# Milestone Gate Checklist

Use this checklist before closing any milestone.

## General

- Active milestone scope matches `docs/milestones.md`.
- No next-milestone feature work was added without explicit need.
- `docs/tech-decisions.md` records dependency choices and trade-offs.
- Latest stable package versions were checked with `pnpm info <pkg> version` before selecting dependencies.
- Latest official docs were checked before using framework APIs, configuration, or scaffolding.
- Deprecated APIs, legacy configuration formats, and stale examples were avoided.
- Any deliberate pin to an older major version is justified in `docs/tech-decisions.md`.
- `.env.example` is complete and contains no real secrets.
- No unrelated user changes were reverted.

## Code Quality

- TypeScript is strict.
- No unjustified `any`.
- Shared DTO schemas live in `packages/shared`.
- API DTOs are compatible with shared Zod schemas.
- Validation exists for body, query, params, files, and imports where applicable.
- Errors use the standard error shape.

## Data

- Prisma schema changes have migrations.
- UUID primary keys are used for business entities.
- Ledger-owned records include `ledger_id`.
- Syncable records include `version`, `updated_at`, and `deleted_at`.
- Soft deletion uses `deleted_at`.
- Money avoids floating point.

## Tests

- Unit tests cover pure logic.
- Integration tests cover API/database behavior where applicable.
- Frontend unit tests cover critical UI behavior.
- E2E exists from Milestone 2 onward.
- Changed behavior is tested in the same change set.

## Required Commands

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

When Docker changes:

```bash
docker compose config
```
