# Security and Privacy Checklist

Use this checklist for authentication, sessions, uploads, destructive actions, LLM features, and deployment.

## Authentication

- V1 has one admin login account.
- Passwords are hashed with Argon2id unless a documented alternative is approved.
- Strong password policy is enforced.
- Common passwords are denied.
- Login failure messages are generic.
- Login is rate limited by IP and account identifier.

## Sessions and CSRF

- Sessions use secure HTTP-only cookies.
- Production cookies are `Secure`.
- `SameSite=Lax` or stricter is set.
- Session secrets come from environment variables.
- Cookie-based auth has CSRF protection.
- Server-side session invalidation exists where practical.

## Secrets and Logs

- No secrets in source control.
- No plaintext passwords.
- Logs exclude passwords, tokens, session IDs, API keys, raw prompts, and uploaded file contents.
- Error responses avoid stack trace leaks.
- Request IDs are attached to logs and error responses.

## Uploads and Attachments

- File size, extension, MIME type, and parsing safety are validated.
- Path traversal is prevented.
- Stored paths are server-controlled.
- Pinned attachments are never deleted by cleanup.

## Destructive Actions

- Purge, restore, and high-risk cleanup require explicit confirmation.
- Exact confirmation text is required for high-risk actions.
- Audit events are written before and after destructive workflows where required.

## LLM

- LLM features are disabled by default.
- Policy and explicit user trigger are both required.
- Provider API keys stay server-side.
- Redaction happens before data leaves the server.
- Attachments or images are never sent externally without explicit confirmation.
- Usage records are stored.
- Prompts and responses are not stored unless debug mode is enabled.

## Production

- Swagger `/docs` is disabled in production.
- HTTPS is required for WAN access.
- Reverse proxy sets security headers.
- Containers run as non-root where practical.
- Environment variables come from `.env` or deployment secrets.

