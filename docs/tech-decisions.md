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

## Pending Decisions for Milestone 0

- Current Node.js LTS target.
- Exact NestJS, Vue, Vite, Prisma, Zod, ESLint, Prettier, Vitest/Jest, and Playwright versions.
- Test runner split between API, web, and shared package.
- Docker image tags and non-root container approach.
- Initial CI provider configuration.
- Money rounding documentation placeholder before entry implementation.

## Template

Use `.codex/templates/tech-decision.md` for new decisions.
