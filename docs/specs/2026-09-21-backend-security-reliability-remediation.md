# Backend Security and Reliability Remediation

## Context

The existing Express/TypeScript backend already has account tenancy, server-side plan pricing, idempotency fields, polling-token hashing, and basic BullMQ/Redis support. However, the current browser-auth contract exposes JWTs to JavaScript, trusts every `*.vercel.app` origin, disables CSRF entirely, permits anonymous disk uploads, and has inconsistent activation, tenant, queue, and payment-concurrency behavior. This remediation keeps the current Express backend and Next.js frontend; it does not migrate the API into Next.js.

## Goals

- Prevent cross-origin credential theft and cookie-authenticated CSRF.
- Make card publication/activation a single validated domain operation.
- Enforce `accountId` authorization consistently for tenant-owned operations.
- Make SePay processing atomic under duplicate and concurrent delivery.
- Make uploads authenticated, tenant-bound, durable, and non-blocking.
- Make Redis/queue failure behavior explicit and safe in production.
- Close public lifecycle leaks for cards, wishes, and guests.
- Replace raw internal errors and touched-path `any` escapes with typed errors.
- Add regression tests for every reported failure scenario.

## Non-goals

- Migrating Express to Next.js route handlers.
- Adding account switching, invitations, or a new role-management UI.
- Replacing SePay, PostgreSQL, Prisma, Redis, BullMQ, or JWT.
- Redesigning the card editor or payment page.
- Building a generic storage-provider framework; Cloudinary is the selected production media backend.

## Security design

Browser authentication uses only the backend-owned `auth_token` HttpOnly cookie. Auth endpoints and `/auth/me` never return the JWT in JSON or headers. The frontend removes token state and all local/session-storage synchronization. Bearer verification remains in middleware for explicitly provisioned non-browser clients, but browser login endpoints do not issue a JavaScript-readable bearer token.

Production CORS accepts only exact normalized origins from `ALLOWED_ORIGINS`; wildcard values, suffix matching, reflected unknown origins, and implicit Vercel preview trust are rejected. Development may allow explicit localhost origins through environment configuration, not a production code branch.

Cookie-authenticated POST/PUT/PATCH/DELETE requests use double-submit CSRF. Login/register/Google responses set a readable CSRF cookie on the API origin and expose the same token in `X-CSRF-Token`. The frontend stores that header value in memory for the current page. On refresh, `/auth/me` rotates or re-exposes the CSRF token. Middleware compares cookie and header with constant-time comparison. Bearer-authenticated requests skip cookie CSRF only when no auth cookie is being used.

## Tenant authorization design

Protected controllers pass a typed `{ userId, accountId, role }` context. Tenant services authorize with `accountId`; `userId` is attribution, not the ownership boundary. Global catalogs (`Plan`, `Template`) remain unscoped. Public flows first resolve an eligible card, then derive and reuse its `accountId` for child lookup/write.

The current first-membership JWT model remains for this release. Authentication must verify the token's `(userId, accountId)` membership before protected tenant work; it must not silently select another account.

## Card lifecycle design

All publication and paid/free activation call one domain operation that:

1. Loads the card using `{ id, accountId }`.
2. Loads an active target plan from the global catalog.
3. Validates stored category data with `PublishCardDataSchema`.
4. Validates plan/template compatibility and entitlements.
5. Sets `publishedAt` only on first activation.
6. Computes expiry from the plan while preserving valid renewal semantics.
7. Updates the card inside the caller's transaction.

Public card reads treat `expiredAt = null` as non-expiring and accept only `ACTIVE` cards. Public wishes and personalized guest resolution require the same active/not-expired card eligibility and include the resolved `accountId` in child queries.

## Payment design

Order creation accepts only active, purchasable plans and account-owned cards. Price always comes from the database. Free-plan requests use the shared activation operation and do not provide an alternate publish path.

SePay webhook handling authenticates first, validates the payload and receiving account, and executes the state transition in one serializable transaction. A conditional `PENDING -> PAID` update is the concurrency gate. Exactly one request may create the payment transaction and activate/extend the card. Duplicate provider transaction IDs are acknowledged idempotently only when they match the stored event. A second distinct payment for an already-paid order is recorded as ignored/reconciliation-required without extending the card again.

## Media design

`POST /media/upload` requires authentication. The controller supplies `accountId`, validates file type/size, and uploads to a tenant-prefixed Cloudinary folder using the signed server-side REST API. The API stores no upload bytes on the Render filesystem. Tests mock the outbound HTTP boundary. Production startup fails if media upload is enabled without Cloudinary credentials.

The first release retains the existing endpoint response shape `{ url }`. Deletion/orphan cleanup is bounded to a follow-up only if the current card-save flow cannot provide a stable resource association without expanding this remediation into a media-library feature.

## Redis and queue design

Production never monkey-patches IORedis or silently falls back to process memory. A small typed key-value interface has separate Redis and in-memory implementations; the memory adapter is selectable only in test/development. OTP and authentication rate limiting fail closed when shared Redis is unavailable.

RSVP persistence is authoritative. Notification enqueue failure cannot turn a committed RSVP into an HTTP failure. The service logs a structured failure and returns success; a durable outbox is deferred because Telegram is non-critical and adding a new persistence workflow is unnecessary for the current requirement.

Mail and RSVP workers run in a dedicated worker process. The HTTP process imports queues but no workers. Both entrypoints close owned workers, queues, Prisma, and Redis on shutdown.

## Errors and observability

A centralized error mapper handles Zod, `HttpError`, known Prisma errors, authentication/authorization, conflicts, rate limits, and generic failures. Production returns stable public messages/codes and never raw `err.message` or stack data. Logs use Pino with a request/correlation ID and structured identifiers; secrets, JWTs, OTP values, raw financial payloads, and full bank account details are excluded.

## Compatibility and rollout

The frontend and backend authentication changes ship together. Deploy backend support first only if it temporarily accepts the old CSRF header behavior without returning JWTs; deploy the frontend immediately afterward, then remove transitional token parsing. Exact production origins and Cloudinary/Redis/SePay variables must be configured before traffic is switched.

No destructive database migration is expected. If implementation adds a reconciliation marker or other payment field after source verification, it must be additive and nullable first. Application rollback may target only a version compatible with the existing account/order schema.

## Success criteria

- An arbitrary Vercel deployment cannot make credentialed API requests.
- Browser JavaScript cannot obtain the JWT from API responses or storage.
- Cookie mutations without a matching CSRF proof return `403`.
- Anonymous upload is rejected and production uploads survive server restart.
- Lifetime cards are public while active; expired/draft cards and their wishes are not.
- Every protected tenant operation in scope authorizes with `accountId`.
- Concurrent webhook deliveries activate an order/card exactly once.
- Redis/BullMQ failure does not create misleading success/failure states.
- Backend and frontend typechecks/builds pass, and regression tests cover all listed invariants.

## Assumptions and stop conditions

- The production frontend origins are known and can be listed exactly.
- Cloudinary credentials can be provisioned before enabling production upload. Stop rather than restore local-disk fallback if they are unavailable.
- The browser session is the only currently supported interactive auth flow. Stop and define a separate token issuance contract if a shipped Capacitor/native client depends on login responses returning JWTs.
- `Plan` and `Template` remain global platform catalogs.
- Telegram notification delivery is non-critical; RSVP persistence is the user-visible success boundary.

