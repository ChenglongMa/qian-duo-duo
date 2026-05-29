# QianDuoDuo Security

This document records security behavior and decisions for QDD.

Canonical baseline:

- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md`

## Current State

Milestone 2A keeps the Milestone 1 security model and adds authenticated entry bookkeeping:

- A single admin account is created by `pnpm db:seed`.
- Admin passwords are hashed with Argon2id and must pass the password policy.
- Session cookies are opaque, HTTP-only, `SameSite=Lax`, and `Secure` in production.
- Session token hashes are HMAC-SHA256 values keyed by `SESSION_SECRET`; raw session tokens are
  only sent in cookies.
- Unsafe authenticated methods require an `x-csrf-token` header matching the current session CSRF
  token hash.
- Login attempts are rate-limited in process by IP plus account identifier.
- Generic login errors avoid account enumeration.
- Standard API errors include `error.code`, safe message, details, and request ID.
- Audit logging exists for login failure thresholds, ledger changes, category changes, YAML
  import/export, category rollback, and entry create/update/clone/soft-delete actions.
- Entry routes are authenticated by default, require CSRF for unsafe methods, and enforce
  server-side ledger scope for entries and referenced category/member/merchant/project records.
- Development CORS allows the configured web origin with credentials so the Vue dev server can use
  HTTP-only cookie sessions.
- Swagger `/docs` is enabled only when `NODE_ENV !== production`.
- Production Compose requires `SESSION_SECRET`.

## V1 Security Model

- One admin login account.
- Household members are not login identities.
- Audit actor is the admin account.
- Future schema design should avoid blocking multi-user login.

## Required Controls

- Argon2id password hashing unless a documented alternative is approved.
- Strong password policy and common password denial.
- Secure HTTP-only cookie sessions. Implemented for Milestone 1.
- CSRF protection for cookie-based authentication. Implemented for unsafe authenticated routes.
- Login rate limiting by IP and account identifier. Implemented in process for Milestone 1.
- Generic login failure messages.
- Request IDs in logs and error responses.
- Swagger `/docs` disabled in production.
- HTTPS required for WAN access.
- Upload validation for size, extension, MIME type, and path safety.
- Destructive actions require explicit confirmation and audit logging.
- LLM features are disabled by default and require explicit user action.

## Current Limitations

- Login rate limiting is in-memory in Milestone 1. It protects a single API process and should move
  to Redis before multi-process deployment or WAN hardening.
- Login itself is public and does not require a prior CSRF token because no authenticated cookie
  exists yet. All authenticated unsafe routes require CSRF.

## Sensitive Data

Never log:

- Passwords.
- Session tokens.
- API keys.
- Secrets.
- Raw sensitive LLM prompts.
- Full uploaded file contents.

## Update Rule

Update this document whenever authentication, authorization, sessions, uploads, destructive actions, LLM handling, deployment security, or audit behavior changes.
