# Backend Production Hardening Implementation Plan

## Context

Implement the approved design in `docs/specs/2026-08-31-backend-production-hardening.md` against the existing Express backend. The first release creates one default account per user and does not add account switching, invitations, or membership-management UI. The work must preserve existing card, guest, RSVP, wish, and payment data while closing the webhook, JWT, CSRF, order-enumeration, Redis, worker, and typing defects found in review.

## Approach

### 1. Establish the test harness and executable security contracts

Files:

- Modify `be/package.json` and `be/package-lock.json` to add Vitest scripts and the minimum test dependencies.
- Add `be/vitest.config.ts` and `be/tests/setup.ts`.
- Add focused test utilities under `be/tests/helpers/` for typed Prisma and request/response doubles; do not introduce a general application framework.

Start with failing tests for the first vertical slice: an authenticated account creates an idempotent order, polls it with a secret token, and an authenticated SePay webhook activates only that account's card. Run each new test before production changes and record that it fails for the intended missing behavior.

### 2. Add account tenancy with an additive, rerunnable migration

Files:

- Modify `be/prisma/schema.prisma`.
- Add `be/prisma/migrations/<timestamp>_add_account_tenancy/migration.sql`.
- Add a bounded verification script in `be/prisma/scripts/verify-account-backfill.ts` if SQL assertions cannot express all ownership checks clearly.
- Update `be/prisma/seed.ts`.

Schema changes:

- Add `Account`, `AccountMember`, and an account membership role enum.
- Add `accountId` and relations to `Card`, `CardEvent`, `CardPhoto`, `Guest`, `RsvpResponse`, `Wish`, `Order`, and `PaymentTransaction`.
- Add `Order.idempotencyKey`, `Order.pollingTokenHash`, and `@@unique([accountId, idempotencyKey])`.
- Add composite tenant indexes matching current filters. Keep `Plan` and `Template` global.

Migration phases in one reviewed SQL migration:

1. Create account tables and nullable tenant columns.
2. Create exactly one deterministic account and owner membership for every existing user using conflict-safe inserts.
3. Backfill `Card.accountId` from `Card.userId`, `Order.accountId` from `Order.userId`, then child account IDs from their parent relations.
4. Assert no tenant-owned row remains null or has inconsistent parent ownership; abort the migration if any assertion fails.
5. Apply foreign keys, required constraints, indexes, and tenant uniqueness.
6. Backfill legacy orders with unique non-null idempotency and polling hashes that cannot be used as live client tokens; existing legacy polling remains disabled rather than weakened.

Rollback is application-level only: preserve the additive schema and deploy the last schema-compatible backend. Do not create a destructive down migration.

Tests:

- Migration verification rejects orphaned/mismatched tenant rows.
- Service tests prove account A cannot read or mutate account B data, even if it supplies a valid row ID.

### 3. Introduce typed tenant context and enforce it at service boundaries

Files:

- Add `be/src/types/tenant.ts`.
- Modify `be/src/services/auth.service.ts` and `be/src/middlewares/auth.middleware.ts`.
- Modify tenant services: `card.service.ts`, `order.service.ts`, `rsvp.service.ts`, `wish.service.ts`, `guest-import.service.ts`, and `export.service.ts`.
- Modify their controllers to pass `{ userId, accountId }` rather than standalone IDs.

Behavior:

- JWT contains `userId`, `accountId`, email, and platform role.
- Authentication validates the membership referenced by the token before protected tenant work. A missing/revoked membership returns `401/403`, never falls back to another account.
- Every tenant-owned Prisma read, update, delete, aggregate, and child write contains a verified `accountId`. Public RSVP/wish/card flows resolve the card first and derive `accountId`; input schemas never accept client-supplied account IDs.
- Update/delete operations use composite filters or `updateMany` plus affected-row checks where Prisma cannot express a compound unique selector.

Tests:

- Cross-account IDs fail for card update/publish/export, guest import/list, RSVP stats, orders, and polling.
- Public RSVP and wishes store the account derived from the card.
- Revoked or mismatched membership is rejected.

### 4. Make browser authentication HTTPOnly-only and CSRF-safe

Files:

- Add `be/src/lib/csrf.ts` and `be/src/middlewares/csrf.middleware.ts`.
- Modify `be/src/controllers/auth.controller.ts`, `be/src/services/auth.service.ts`, `be/src/routes/api.router.ts`, and `be/src/server.ts`.
- Modify `fe/src/lib/api-client.ts` (or the actual shared client file found during implementation) and `fe/src/context/AuthContext.tsx`.
- Update relevant frontend API-client/auth tests.

Behavior:

- Auth services return a typed internal auth result, but controllers omit the JWT from JSON and set it only in `auth_token`.
- Successful login/register/Google auth sets a random readable CSRF cookie. Logout clears both cookies.
- For POST/PUT/PATCH/DELETE requests authenticated by cookie, middleware requires `X-CSRF-Token` to match the CSRF cookie using constant-time comparison. Bearer-authenticated clients remain supported without the cookie CSRF check.
- The frontend API client automatically reads the CSRF cookie and adds the header on mutations; auth context types no longer declare `token`.
- Production rejects wildcard credentialed CORS configuration during startup.

Tests:

- Auth JSON never contains a token.
- Cookie mutation without/mismatching CSRF returns `403`; matching token succeeds.
- Bearer mutation follows bearer authentication without requiring the cookie token.
- Logout clears both cookies.

### 5. Harden order creation and private polling

Files:

- Add `be/src/lib/order-security.ts` for cryptographic code/token generation and hashing.
- Modify `be/src/lib/validators/order.schema.ts`, `be/src/controllers/order.controller.ts`, `be/src/services/order.service.ts`, and `be/src/routes/api.router.ts`.
- Modify `fe/src/app/(dashboard)/dashboard/billing/page.tsx` and its tests.

Behavior:

- Validate `Idempotency-Key` as 16-128 visible characters at the controller boundary.
- Store `(accountId, idempotencyKey)` uniquely. Same key plus same card/plan returns the prior result; different payload returns `409`.
- Generate order codes with `crypto.randomInt`/`randomBytes` and retry only unique-code collisions a bounded number of times.
- Generate a 256-bit polling token, return it once, and store only a SHA-256 hash.
- Poll using both order code and polling token. Use timing-safe hash comparison or query by the hash; never accept a legacy order code alone.
- Continue loading price from `Plan` on the backend and scope free-plan activation by account.
- Frontend creates one idempotency key per user submission, retains it across transport retries, stores the returned polling token only in component/session state, and includes it in polls.

Tests:

- Concurrent/successive duplicate requests create one order.
- Reusing a key with a different card or plan returns `409`.
- Forced code collision retries and eventually fails cleanly at the bound.
- Missing/wrong polling token returns `404` without revealing order existence.

### 6. Fail-close and serialize SePay processing

Files:

- Add `be/src/config/env.ts` with a Zod environment schema.
- Modify `be/src/controllers/order.controller.ts`, `be/src/services/order.service.ts`, `be/src/lib/validators/order.schema.ts`, and `be/src/server.ts`.
- Add payment-focused tests under `be/tests/order/`.

Behavior:

- Validate required production values at startup: JWT secret, SePay secret, bank code/account/name, database, and Redis configuration. Test/development may use explicit fixtures, not hidden production defaults.
- Webhook authentication is mandatory and compared safely before processing JSON business data.
- Validate incoming transfer direction, expected account, supported gateway, positive amount, parsable transaction time, pending status, and non-expired order.
- Within one database transaction, create `PaymentTransaction` with `accountId`, conditionally transition only the matching pending order, and activate only the matching tenant card.
- Treat the provider transaction unique constraint as the concurrency arbiter. A duplicate is successful only if the existing transaction matches the same order/event; otherwise return conflict and perform no side effects.
- Respect SePay delivery semantics: accepted/duplicate events return HTTP `200` with `{ success: true }`; permanent authenticated business rejects are recorded and acknowledged without activation to avoid futile retries; authentication failures and transient internal/database failures return non-2xx so SePay retries.
- Log identifiers/status through Pino, not full payloads, secrets, bank account details, or raw error messages.

Tests:

- Missing config prevents production startup.
- Missing/wrong API key, wrong direction/account/gateway, insufficient payment, expired order, and already-cancelled order cannot activate a card.
- Two concurrent deliveries produce one payment transaction and one activation/extension.

### 7. Make Redis behavior explicit and separate BullMQ workers

Files:

- Refactor `be/src/lib/redis.ts`, `be/src/lib/rate-limiter.ts`, and `be/src/lib/bullmq.ts` without monkey-patching IORedis.
- Modify `be/src/queues/mail.queue.ts`, `be/src/queues/rsvp-notification.queue.ts`, and worker modules.
- Add `be/src/worker.ts` as the dedicated worker entrypoint.
- Modify `be/src/server.ts`, `be/package.json`, and deployment files (`render.yaml`, and Docker files if present when implementation begins).

Behavior:

- Memory Redis adapter exists only when explicitly selected in development/test. Production OTP and authentication rate limits fail closed on Redis errors; non-security notification enqueue failures are logged and surfaced according to their route contract.
- Remove the mail-worker side-effect import from the HTTP server.
- Worker payloads that touch tenant data include `accountId` and validate their Zod payload before use.
- Export explicit `close()` functions for queues, workers, Redis, and Prisma. HTTP and worker processes handle SIGTERM/SIGINT independently, stop accepting work, drain/close resources, and use a bounded forced-exit timer.
- Add retry/backoff and bounded retention consistently; terminal notification failures enter a DLQ without changing tenant business state.

Tests:

- Redis outage blocks OTP/auth-sensitive operations.
- HTTP module import does not instantiate a worker.
- Worker payload rejects missing account context.
- Shutdown calls each owned resource close method once.

### 8. Remove touched-path `any` and centralize safe errors

Files:

- Add explicit photo/event schemas in `be/src/lib/validators/card/` and update its index.
- Add `be/src/lib/errors.ts` and `be/src/middlewares/error.middleware.ts`.
- Modify touched controllers/services and `be/src/server.ts`.

Behavior:

- Replace `z.any()`, `input as any`, event/photo callback `any`, controller `catch (error: any)`, and Redis casts in the modified surface.
- Use typed domain errors for validation, authentication, authorization, not-found, and conflict outcomes.
- Controllers call `next(error)`; the centralized mapper returns stable status/code/message bodies. Production logs retain diagnostic context while responses hide Prisma/internal messages.

Tests:

- Zod rejects malformed events/photos.
- Prisma/internal errors return a generic `500`; known errors retain stable public codes/statuses.
- TypeScript compilation rejects reintroduction of unsafe shapes through the concrete schemas.

### 9. Full regression, migration rehearsal, and handoff

Commands and expected results:

1. `cd be && npm.cmd test` — all backend Vitest suites pass with zero failures.
2. `cd be && npm.cmd run build` — Prisma generation and strict TypeScript compilation exit 0.
3. `cd be && npx.cmd prisma validate` — schema validates.
4. Apply the migration to a disposable PostgreSQL database seeded with representative legacy users/cards/orders; rerun the migration/backfill verification — first run succeeds, verification reports zero null/mismatched tenants, and the verification is safe to rerun.
5. `cd fe && npm.cmd test` — frontend auth/API/billing tests pass.
6. `cd fe && npm.cmd run build` — Next.js production build exits 0.
7. Search `be/src` for `catch (error: any)`, `as any`, `z.any()`, and tenant Prisma operations without account scoping; the touched production paths have no prohibited escapes and each intentional global/public query is documented.
8. Inspect `git diff --check` and the complete diff; no whitespace errors, secrets, generated build output, or unrelated changes are included.

## Key decisions

- Keep Express for this hardening release; a Next.js App Router migration is separate because combining it with a security/data migration would multiply rollback risk.
- Model membership now but ship one default account per user; this satisfies durable tenant isolation without speculative account-management UI.
- Duplicate tenant keys on child rows to make isolation explicit and auditable instead of relying only on parent joins.
- Use database uniqueness/conditional state transitions for payment concurrency; process-local locks are insufficient across replicas.
- Use the existing JWT, Prisma, Zod, Redis, and BullMQ dependencies. Add only Vitest-related development dependencies because the backend currently has no test runner.
- Disable legacy unauthenticated polling after migration rather than manufacture retrievable secrets for old orders.

## Risks and mitigations

- **Migration assigns a wrong account:** use relation-derived backfill, SQL assertions, a disposable-database rehearsal, and abort before NOT NULL constraints when inconsistencies exist.
- **Frontend/backend contract rollout mismatch:** deploy schema first, then backend and frontend as one coordinated release; keep the expanded schema backward-compatible but do not keep insecure API fallbacks.
- **Webhook double activation:** unique provider transaction plus conditional pending-order update inside one transaction.
- **CSRF rollout locks out clients:** update the shared frontend API client in the same change and keep bearer clients explicitly supported.
- **Redis outage blocks login/OTP:** intentional fail-closed behavior; health/logging must make the dependency failure visible, while existing authenticated read-only traffic remains unaffected where safe.
- **Account query omitted in a future path:** explicit tenant context types, composite schema constraints, isolation tests for each service, and a final Prisma-call audit.

## Assumptions

- VERIFIED from `prisma/schema.prisma`: current tenant roots are linked to `User` through `Card.userId` and `Order.userId`, enabling deterministic backfill.
- VERIFIED from current routes/services: Plan prices are loaded server-side; `Plan` and `Template` behave as global catalogs.
- VERIFIED from frontend code: billing is the only current order creation/polling caller, and `ApiClient`/`AuthContext` are the shared integration points for cookie/CSRF changes.
- VERIFIED from `be/package.json`: backend has no test script or Vitest dependency today.
- VERIFIED from the official SePay webhook documentation (checked 2026-08-31): API-key delivery uses `Authorization: Apikey <key>`; payloads include `id`, `gateway`, `accountNumber`, `transferType`, and `transferAmount`; `transferType: "in"` denotes incoming funds; providers may deliver the same `id` repeatedly; SePay treats only HTTP 200/201 plus `{ success: true }` within 30 seconds as successful delivery.
- UNVERIFIED until migration rehearsal: production data has no orphaned or contradictory card/order child ownership.
- UNVERIFIED until deployment configuration inspection: production provides all required SePay, bank, Redis, and database variables.

## Out of scope

- Account switching, invitations, teams, membership administration, or per-account billing UI.
- Converting Express endpoints to Next.js route handlers.
- Changing payment providers or adding a generic payment abstraction.
- Adding caching, WebSockets, or unrelated performance refactors.
- Destructive migration rollback.

## STOP conditions

- Stop before applying any migration outside a disposable/local database if a backup/restore path and target environment are not explicitly authorized.
- Stop migration implementation if existing rows cannot be mapped deterministically to one account through their current user/card/order relations; report the conflicting row classes.
- Stop webhook implementation if the deployed SePay authentication or payload contract differs from the current `Apikey` header/schema; obtain the authoritative provider contract rather than guessing.
- Stop coordinated rollout if the frontend cannot ship the CSRF/idempotency/polling-token contract with the backend.

## Review notes — 2026-08-31

| Dimension | Before | After | Resolution |
|---|---:|---:|---|
| Completeness | 4/5 | 5/5 | Added explicit migration phases, recovery posture, payment error/retry behavior, worker shutdown, and coordinated frontend rollout. |
| Feasibility | 4/5 | 5/5 | Identified the order/payment vertical slice, verified current call sites/dependencies, and verified the SePay API-key, payload, retry, and dedupe contract against official documentation. |
| Scope | 4/5 | 5/5 | Limited tenancy to one default account per user; excluded organization UI, framework migration, generic payment abstractions, and unrelated refactors. |
| Testability | 4/5 | 5/5 | Added red-green scenarios per phase plus exact backend, Prisma, frontend, migration, and diff verification commands. |
| Risk | 4/5 | 5/5 | Added migration assertions/rehearsal, database concurrency controls, coordinated rollout, fail-closed dependencies, rollback limits, and STOP conditions. |
| Assumptions | 4/5 | 5/5 | Marked locally verified claims, external-contract verification, unverified production-data/config assumptions, and the conditions that require stopping rather than improvising. |

No unresolved planning blockers remain. Applying a migration to a non-disposable database still requires explicit environment authorization and a verified backup/restore path.
