---
description: Fix a failing QianDuoDuo milestone gate before continuing feature work.
argument-hint: "[failing command or failure summary]"
---

# Fix Gate Failure

The QianDuoDuo milestone gate failed.

Read the failing command output, then inspect only the relevant files.

Rules:
- Stop feature work until the gate is fixed.
- Fix the failing test, lint, typecheck, build, or Docker issue.
- Do not weaken tests or remove coverage unless the test is provably wrong.
- Do not skip lint/build/test commands.
- Preserve unrelated user changes.
- Rerun the failed command first, then rerun the full milestone gate.

Report:
- Root cause.
- Fix applied.
- Verification commands and results.
