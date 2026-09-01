# Backend Production Hardening

## Context

The current Express/TypeScript backend builds successfully, but its payment, authentication, tenant-isolation, queue, and validation boundaries are not ready for production. The approved scope is to harden the existing backend without combining this work with a framework migration to Next.js App Router.

## Goals

- Introduce explicit account-based multi-tenancy and ensure every tenant-owned database operation is scoped by `accountId`.
- Prevent forged or replayed payment webhooks from activating cards.
- Make order creation idempotent and polling unguessable.
- Keep browser authentication in an HTTPOnly cookie without exposing the JWT to JavaScript, and protect cookie-authenticated mutations from CSRF.
- Keep background workers isolated from the HTTP process.
- Replace unsafe `any` usage in the touched paths with strict types and Zod validation.
- Add automated regression coverage for the security and business invariants above.

## Non-goals

- Migrating Express routes to Next.js App Router.
- Replacing Prisma, PostgreSQL, Redis, BullMQ, JWT, or the current payment provider.
- Introducing organizations with billing hierarchies, invitations, or account switching UI beyond the minimum account membership model required for isolation.
- Refactoring unrelated frontend or backend features.

## Data model

Add an `Account` model and an `AccountMember` join model. Membership has an account-scoped role. A user may belong to multiple accounts in the data model, but the first release uses one active account per authenticated session.

Tenant-owned rows receive a required `accountId`. Direct tenant roots are `Card` and `Order`; dependent records such as events, photos, guests, RSVP responses, wishes, and payment transactions also carry `accountId` so isolation does not rely solely on relation traversal. Composite indexes and uniqueness constraints include `accountId` where uniqueness is tenant-local.

Existing users are backfilled deterministically: create one account for each user, create an owner membership, and copy that account ID to rows owned through the user's cards and orders. Migration runs in phases so required columns are added only after backfill validation.

Global catalog data (`Plan` and `Template`) remains unscoped because it is shared across accounts.

## Tenant context and authorization

The JWT contains `userId`, `accountId`, email, and role claims. Authentication verifies that the referenced membership still exists before privileged tenant operations. Controllers pass a typed tenant context to services; services and transactions include `accountId` directly in every tenant query and mutation.

Public card reads remain intentionally public, but their child lookups are scoped by the resolved card's `accountId`. Public RSVP and wish writes derive `accountId` from the target card on the server; clients cannot choose it.

## Authentication and CSRF

The JWT remains in the `auth_token` HTTPOnly, Secure cookie and is removed from every JSON response. Bearer authentication may remain for non-browser/mobile clients, but browser code must not receive or persist the token.

Cookie-authenticated state-changing requests use a double-submit CSRF token. Login/registration responses set a readable CSRF cookie; the frontend sends the same value in `X-CSRF-Token`. Middleware compares the values with a timing-safe comparison. Bearer-authenticated requests are not subject to this cookie-specific CSRF check. CORS remains allowlisted and never uses wildcard origins with credentials.

## Order creation and polling

`POST /orders` requires an `Idempotency-Key` header validated as a bounded opaque string. The database stores a unique `(accountId, idempotencyKey)` pair. Repeated requests return the existing order only when their card and plan match; reuse with a different payload returns a conflict.

Order codes use cryptographically secure randomness and retry boundedly on unique collisions. Each order also gets a high-entropy polling token; only its hash is stored. `GET /orders/:orderCode/status` requires the raw polling token and resolves the order using both values. Responses expose only the fields required by the payment UI.

Plan price is always loaded from the database and copied into the order by the backend. Free-plan activation and paid-plan order creation remain account-scoped.

## Payment webhook

Webhook configuration is fail-closed: production startup fails when `SEPAY_WEBHOOK_SECRET`, expected receiving account, or required bank configuration is missing. Every webhook request must authenticate before payload parsing or database access.

Processing validates:

- provider/API-key authentication;
- incoming transfer direction;
- expected receiving account and gateway;
- a pending, non-expired order;
- received amount against the server-stored order amount;
- provider transaction uniqueness.

Payment transaction creation, order transition, and card activation occur in one Prisma transaction. Concurrent duplicate deliveries are handled by the database unique constraint and return an idempotent success only after confirming the stored transaction represents the same provider event. Logs contain identifiers and outcomes but not secrets or full raw financial payloads.

## Redis, queues, and shutdown

Production must not silently replace Redis with process-local memory for OTP or rate limiting. Memory fallback is allowed only in an explicit development/test mode. Authentication-sensitive operations fail closed when shared rate-limit or OTP state is unavailable.

Mail and RSVP workers run from dedicated entrypoints rather than being imported by the HTTP server. Worker payloads include `accountId`, and processing restores typed tenant context before tenant database access. Workers and queues expose close functions used during graceful shutdown. Failed jobs retain bounded retry/backoff settings and terminal failures enter a DLQ where applicable.

## Validation and errors

Card photos and events receive explicit Zod schemas; touched controllers catch `unknown`, not `any`. A centralized error mapper converts Zod, Prisma, authentication, authorization, conflict, and internal errors into stable HTTP responses. Production responses never return raw exception messages or stacks.

## Testing strategy

Add Vitest and focused integration-style service/controller tests with Prisma, Redis, BullMQ, and external delivery boundaries mocked only where unavoidable. Tests must cover:

- tenant A cannot read or mutate tenant B data;
- public writes derive their account from the card;
- missing or invalid webhook configuration/authentication is rejected;
- wrong transfer direction/account, insufficient amount, expired or non-pending order is rejected;
- duplicate webhook delivery activates exactly once;
- repeated order creation with the same idempotency key returns one order;
- conflicting idempotency-key reuse returns `409`;
- order polling requires a valid high-entropy token;
- auth responses never contain a JWT;
- cookie mutation without a valid CSRF token is rejected;
- Redis outage fails closed for OTP/auth-sensitive limits;
- worker startup and shutdown are independent of the HTTP server.

Each behavior change follows red-green-refactor: first add a failing regression test, verify the expected failure, implement the minimum change, and rerun the focused and full suites.

## Rollout and compatibility

The database migration is additive and backfilled before constraints become required. Deployment order is migration/backfill, compatible backend deployment, verification, then cleanup of transitional nullable fields if any. The frontend must be updated in the same release to send CSRF, idempotency, and polling tokens and to stop reading JWTs from responses.

Rollback must preserve newly created account and payment data. Application rollback is allowed only to a version compatible with the expanded schema; destructive down migrations are not part of this rollout.

## Success criteria

- TypeScript build and Prisma validation pass without new `any` escapes in touched code.
- All new Vitest suites pass and demonstrate the intended red-green regression behavior.
- Every tenant-owned Prisma operation in the modified surface contains or derives a verified `accountId`.
- Forged, malformed, expired, replayed, or misdirected payment events cannot activate a card.
- Browser clients cannot read JWTs and cannot perform cookie-authenticated mutations without CSRF proof.
- HTTP startup does not start BullMQ workers, and all processes shut down their resources cleanly.

## Assumptions

- Each existing user currently represents one logical customer account, allowing deterministic one-account-per-user backfill.
- `Plan` and `Template` are platform-wide catalogs.
- SePay uses the existing `Authorization: Apikey ...` contract and provides the validated payload fields currently modeled by Zod.
- The frontend can be changed together with the backend API contract.
