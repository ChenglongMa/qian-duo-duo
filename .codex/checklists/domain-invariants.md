# Domain Invariants Checklist

Use this checklist for domain model, API, import, sync, and reporting changes.

## Ledger Isolation

- Every ledger-owned table has `ledger_id`.
- API endpoints never trust client-provided ownership.
- Queries scope by authenticated admin and selected ledger.
- Rules, categories, merchants, projects, members, saved views, imports, duplicate settings, and attachments never cross ledgers.

## Money and FX

- No floating point arithmetic for money.
- Amounts use `NUMERIC(18, 4)` or a documented equivalent.
- FX rates use at least `NUMERIC(18, 8)` precision.
- `base_amount` is calculated and persisted at create/update time.
- `base_currency` is copied from the ledger and persisted.
- Historical base amounts are not recalculated when FX assumptions change.

## Entries

- Type is only `Expense` or `Income`.
- Transfers are not implemented.
- Date-only UI resolves to 12:00 local time.
- Soft-deleted entries are hidden from normal list endpoints.
- Clone creates a new entry ID.

## Categories

- Categories are ledger-isolated.
- YAML uses `stable_key`, not database IDs.
- `stable_key` is unique within a ledger.
- Referenced categories are archived/inactivated rather than physically deleted.
- Rollback does not orphan historical entries.

## Imports

- Uploads validate before staging.
- Imports preview before commit.
- Final entries are never created silently.
- Row-specific validation errors are returned.
- Commit writes audit events.

## Sync

- Offline-created records use client-generated UUIDs.
- Changes use idempotency keys.
- Push is idempotent.
- Pull uses a server cursor.
- Conflict responses distinguish `applied`, `rejected`, `conflict`, and `already_applied`.

