# QDD Codex AI Development Framework

This directory turns the product, engineering, and milestone documents into an execution layer for Codex-driven development.

The framework does not replace the canonical docs. It summarizes them into reusable prompts, workflows, checklists, and templates so each milestone can be implemented with the same discipline.

## Files

- `../AGENTS.md`: repository-level instructions Codex should read before implementation.
- `project-context.md`: compact project context for new AI sessions.
- `tasks/current.md`: active milestone and next recommended task.
- `workflows/milestone-workflow.md`: standard milestone execution process.
- `prompts/`: reusable prompts for implementation, reviews, and gate failures.
- `checklists/`: acceptance checklists for domain, security, frontend, and milestone gates.
- `templates/`: lightweight templates for task briefs and technical decisions.

## How To Use

Start each milestone by asking Codex to read:

```text
AGENTS.md
docs/product-architecture-spec.md
docs/engineering-standards.md
docs/milestones.md
.codex/project-context.md
.codex/tasks/current.md
```

For implementation, use `.codex/prompts/implement-next-milestone.md` or the milestone-specific prompt when one exists.

For Milestone 0, use `.codex/prompts/milestone-00-bootstrap.md`.

## Operating Rules

- Keep docs as the source of truth.
- Keep `.codex/` concise and executable.
- Update checklists and prompts when the engineering standards change.
- Update `tasks/current.md` when a milestone is completed.
- Record architectural choices in `docs/tech-decisions.md`.

