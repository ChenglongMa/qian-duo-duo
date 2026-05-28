---
description: Review current QianDuoDuo changes for bugs, security risks, milestone gaps, and docs drift.
argument-hint: "[optional focus]"
---

# Review Current Change

Review the current QianDuoDuo changes as a senior engineer.

Prioritize:
- Bugs and behavioral regressions.
- Security issues.
- Ledger isolation breaks.
- Money precision or FX mistakes.
- Missing validation.
- Missing audit events.
- Missing tests for milestone acceptance.
- Docker, CI, or deployment risks.
- Docs that no longer match behavior.

Use docs/product-architecture-spec.md, docs/engineering-standards.md, and docs/milestones.md as the review baseline.

Return findings first, ordered by severity, with file and line references.
If there are no findings, say so and list residual test gaps or risks.
