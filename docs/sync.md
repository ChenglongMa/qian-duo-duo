# QianDuoDuo Offline Sync

This document records the offline and sync architecture for QDD.

Canonical baseline:

- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md`

## Current State

Offline sync is not implemented yet. Milestone 0 may add PWA foundations only if needed for bootstrap. True offline entry workflows are introduced in Milestone 7.

## Target Behavior

- Dexie stores local records.
- Offline-created records use client-generated UUIDs.
- Local changes are recorded in a change log.
- Each change has an idempotency key.
- Push API is idempotent.
- Pull API uses a server cursor.
- Server push results distinguish `applied`, `rejected`, `conflict`, and `already_applied`.
- Last-Write-Wins is the default conflict strategy.
- Conflict UI lets the user choose local or server records.

## Syncable Record Baseline

Syncable records include:

- `id`
- `version`
- `updated_at`
- `deleted_at`
- `last_modified_by_client_id`

## Attachment Offline Policy

The target policy is to cache thumbnails and recent attachments only. Full offline attachment caching is not required for V1.

## Update Rule

Update this document whenever PWA caching, Dexie schema, push/pull APIs, conflict behavior, tombstone handling, or offline attachment policy changes.

