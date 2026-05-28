# QianDuoDuo Security

This document records security behavior and decisions for QDD.

Canonical baseline:

- `docs/product-architecture-spec.md`
- `docs/engineering-standards.md`
- `docs/milestones.md`
- `docs/tech-decisions.md`

## Current State

Security implementation has not started. Milestone 0 should only create safe foundations and must not commit secrets.

## V1 Security Model

- One admin login account.
- Household members are not login identities.
- Audit actor is the admin account.
- Future schema design should avoid blocking multi-user login.

## Required Controls

- Argon2id password hashing unless a documented alternative is approved.
- Strong password policy and common password denial.
- Secure HTTP-only cookie sessions.
- CSRF protection for cookie-based authentication.
- Login rate limiting by IP and account identifier.
- Generic login failure messages.
- Request IDs in logs and error responses.
- Swagger `/docs` disabled in production.
- HTTPS required for WAN access.
- Upload validation for size, extension, MIME type, and path safety.
- Destructive actions require explicit confirmation and audit logging.
- LLM features are disabled by default and require explicit user action.

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

