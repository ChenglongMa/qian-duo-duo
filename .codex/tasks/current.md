# Current Codex Task

## Last Completed Milestone

Milestone 1: Auth and Master Data.

Completed on 2026-05-29 after passing the Milestone 1 gate.

## Next Active Milestone

Milestone 2A: Entries CRUD, Money, Soft Delete.

Do not begin Milestone 2A until explicitly requested.

## Completed Goal

Implement secure single-admin authentication and CRUD foundations for ledgers, categories,
members, projects, and merchants. Add category YAML import/export, category version snapshots,
rollback, rule version placeholder tables, Prisma migrations, seed, and audit log foundation.

## Start With

- `.codex/prompts/implement-next-milestone.md`
- `.codex/workflows/milestone-workflow.md`
- `.codex/checklists/milestone-gate.md`

## Explicitly Out of Scope

- Entry management.
- Money and FX handling.
- Entry soft delete/purge.
- Import staging pipeline.
- Offline sync.
- Attachment storage.
- LLM integration.

## Verified Completion Criteria

Milestone 1 is complete only after:

- Admin auth, password policy, Argon2id hashing, session cookies, CSRF, and login rate limiting exist.
- Prisma schema, migration, and seed exist.
- Ledger, category, member, project, and merchant master data endpoints exist.
- Category YAML import/export and rollback work with snapshots.
- Audit log foundation exists.
- Backend and frontend tests cover the milestone behaviors.
- Docs and CI are updated.
- Milestone 1 gate passes.

## Milestone 1 Gate Run

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
