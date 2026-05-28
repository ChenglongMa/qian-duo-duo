---
description: Determine and implement the next active QianDuoDuo milestone with tests, docs, dependency freshness checks, and milestone gates.
argument-hint: "[optional milestone or focus]"
---

# Implement Next Milestone

You are working in the QianDuoDuo repository.

Read:
- AGENTS.md
- docs/product-architecture-spec.md
- docs/engineering-standards.md
- docs/milestones.md
- docs/tech-decisions.md
- .codex/project-context.md
- .codex/workflows/milestone-workflow.md
- .codex/tasks/current.md

Determine the active milestone from the current repository state and docs/milestones.md.

Implement only that milestone's required scope. Keep changes production-quality but incremental.

Before adding dependencies or writing framework-specific code:
- Check latest stable package versions with pnpm info <pkg> version.
- Consult the latest official docs for the selected major versions.
- Use current recommended APIs, config formats, and scaffolding patterns.
- Avoid deprecated APIs and stale examples.
- Document selected versions, docs checked, and compatibility trade-offs in docs/tech-decisions.md.

For each behavior change:
- Add or update shared Zod schemas where applicable.
- Add typed API DTOs compatible with shared schemas.
- Add tests in the same change set.
- Update docs when architecture, security, data model, sync, parsing, dependencies, or deployment behavior changes.

Before finishing, run the milestone gate from docs/milestones.md and report:
- What changed.
- Which commands passed.
- Which commands failed, if any, with next steps.
- Any documented assumptions.
