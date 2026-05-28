# Claude Code Framework

This directory adapts the existing QDD AI development framework for Claude Code without duplicating source documents.

## Single Source of Truth

Canonical project instructions live in:

- `AGENTS.md`
- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md`
- `.codex/`

Claude-specific files should point to those sources instead of copying their contents.

## Symlink Layout

The repository root uses:

```text
CLAUDE.md -> AGENTS.md
```

Claude project skills use symlinks to the existing Codex prompts:

```text
.claude/skills/milestone-00-bootstrap/SKILL.md -> ../../../.codex/prompts/milestone-00-bootstrap.md
.claude/skills/implement-next-milestone/SKILL.md -> ../../../.codex/prompts/implement-next-milestone.md
.claude/skills/fix-gate-failure/SKILL.md -> ../../../.codex/prompts/fix-gate-failure.md
.claude/skills/review-change/SKILL.md -> ../../../.codex/prompts/review-change.md
```

Update the source prompt in `.codex/prompts/` when a workflow changes. Do not edit only the symlink target through `.claude/skills/` without realizing it changes the shared prompt.

## Available Claude Skills

From Claude Code, use:

- `/milestone-00-bootstrap`
- `/implement-next-milestone`
- `/fix-gate-failure`
- `/review-change`

Claude Code still supports legacy `.claude/commands/`, but the current official docs say custom commands have been merged into skills and that skills are recommended because they support additional files, automatic relevance-based loading, and richer invocation controls. This project therefore uses `.claude/skills/`.

## Local-Only Notes

Use `CLAUDE.local.md` for personal project notes. It is ignored by git.

Use `.claude/settings.local.json` for machine-specific Claude Code settings. It is ignored by git.

## Official Docs Checked

- Claude Code memory and `CLAUDE.md`: https://code.claude.com/docs/en/memory
- Claude Code skills: https://code.claude.com/docs/en/skills
- Claude Code settings and permissions: https://code.claude.com/docs/en/settings
