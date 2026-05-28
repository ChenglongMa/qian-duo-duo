# QianDuoDuo Parsing Pipeline

This document records the import and parsing pipeline architecture for QDD.

Canonical baseline:

- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md`

## Current State

The parsing pipeline is not implemented yet. CSV/JSON import with staging is planned for Milestone 4. Text/PDF parsing, rules, confidence scoring, and duplicate detection are planned for Milestone 6.

## Target Pipeline

1. File ingest.
2. Text extraction.
3. Structured parsing.
4. Rule matching.
5. Duplicate detection.
6. Confidence scoring.
7. Staged inbox.
8. Optional LLM enhancement.

## Required Principles

- Imports never silently create final entries.
- Validation happens before staging.
- Users preview staged records before approval.
- Smart decisions return explainable reasons.
- Rule evaluation is ledger-isolated.
- Rule ordering is deterministic.
- LLM enhancement is optional, disabled by default, redacted, and explicitly triggered.

## Update Rule

Update this document whenever import mapping, staging, text extraction, parsing, rules, duplicate detection, confidence scoring, or LLM enhancement changes.

