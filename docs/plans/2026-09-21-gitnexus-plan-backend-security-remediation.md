# Backend Security and Reliability Remediation Plan

> Evidence mode: source-derived fallback. GitNexus graph/PDG was unavailable in this session. Source, tests, Git history, and executable checks were used against commit `f5b190303b53ec0e9f739419d8169824513199e8`.

## 1. Objective and scope

Implement the approved design in `docs/specs/2026-09-21-backend-security-reliability-remediation.md` across the existing Express backend and the minimum frontend contract surface. Fix every confirmed audit finding: credentialed CORS/token exposure, disabled CSRF, anonymous local uploads, card activation drift, lifetime-card visibility, tenant authorization inconsistencies, spoofable/fail-open rate limiting, RSVP partial failure, wish lifecycle leakage, webhook concurrency, unsafe errors/types, and worker lifecycle gaps.

Do not migrate frameworks, redesign UI, or build generic auth/storage/queue platforms.

## 2. Verified baseline

- `[verified]` Backend is Express/TypeScript with Prisma/PostgreSQL, Redis and BullMQ (`be/src/server.ts`, `be/package.json`).
- `[verified]` `csrfGuard` is currently a no-op following commit `23cb0da` (`be/src/middlewares/csrf.middleware.ts:8`).
- `[verified]` CORS trusts all `*.vercel.app` origins with credentials (`be/src/server.ts:36-55`).
- `[verified]` Auth responses and `/auth/me` return JWTs, while the frontend copies them into memory, session storage, local storage, a JS cookie, and Bearer headers (`be/src/controllers/auth.controller.ts`, `fe/src/lib/api.ts`).
- `[verified]` Media upload uses optional auth and synchronous local-disk writes (`be/src/routes/api.router.ts:49-55`, `be/src/services/media.service.ts:57-101`).
- `[verified]` Order/free activation and webhook activation bypass the card publish validator (`be/src/services/order.service.ts:12-42,116-223`).
- `[verified]` Public card lookup excludes `expiredAt = null` although the schema defines null as lifetime (`be/src/services/card.service.ts:133-141`, `be/prisma/schema.prisma:94`).
- `[verified]` Order/export authorization uses `userId` instead of the JWT `accountId` (`be/src/services/order.service.ts:17`, `be/src/services/export.service.ts:8-23`).
- `[verified]` Current backend tests pass: 8 files, 42 tests. `npx tsc --noEmit` passes.
- `[verified]` Full backend build is presently blocked on Windows by an `EPERM` rename of Prisma's query-engine DLL; this is an environment/process lock, not a TypeScript diagnostic.

## 3. Key decisions

1. Keep Express and repair the existing seams; no Next.js API migration.
2. Browser auth is cookie-only. Remove all JavaScript-readable JWT handling rather than attempting to secure local storage.
3. CORS uses exact origins only. Preview deployments require explicit ephemeral configuration and are not trusted by suffix.
4. CSRF token is returned in `X-CSRF-Token`, held in frontend memory, and rehydrated via `/auth/me`; JWT is never returned.
5. Introduce one `activateCard` domain function reused by publish, free activation, and paid webhook activation.
6. Use `accountId` as the authorization boundary; retain `userId` only for attribution.
7. Use Cloudinary's signed REST upload through native `fetch`; add no SDK unless native multipart signing proves insufficient during implementation.
8. Keep RSVP notification best-effort after persistence. Do not add a transactional outbox for non-critical Telegram delivery.
9. Use a conditional order transition inside the payment transaction as the concurrency arbiter.
10. Refactor only touched `any`/error paths; a repo-wide style rewrite is out of scope.

## 4. Implementation sequence

### Phase 0 — Capture contracts and make tests fail for the right reasons

Create focused test utilities without changing production behavior:

- Add `be/tests/auth/auth-security.test.ts` for exact CORS, no-token responses, CSRF cookie/header behavior, Bearer behavior, and `/auth/me`.
- Add `be/tests/media/media-upload.test.ts` for anonymous rejection, tenant folder propagation, size/type rejection, provider failure, and successful URL response.
- Add `be/tests/card/card-public-lifecycle.test.ts` for lifetime, active, draft, expired, guest lookup and wish visibility.
- Add `be/tests/order/order-service.test.ts` and `sepay-webhook.test.ts` for inactive/free plan rules, tenant ownership, validation-before-activation, duplicate and concurrent webhook deliveries.
- Add `be/tests/rsvp/rsvp-notification-failure.test.ts` and `be/tests/infrastructure/redis-worker.test.ts`.
- Add/update frontend tests around `fe/src/lib/api.ts` and `AuthContext.tsx` proving no browser token persistence and correct CSRF forwarding.

Run each focused suite before implementation and record the expected failing assertion. Preserve the existing 42-test baseline.

### Phase 1 — Close credential theft and restore browser security

Files:

- `be/src/config/env.ts` (new): Zod-validate `NODE_ENV`, exact `ALLOWED_ORIGINS`, JWT, database, Redis, SePay/bank, Cloudinary and app URL settings. Reject `*` in credentialed production CORS.
- `be/src/server.ts`: consume validated config; remove Vercel suffix trust; set a reviewed `trust proxy` value for Render; add request/correlation ID; install safe error handler.
- `be/src/middlewares/csrf.middleware.ts`: implement cookie-vs-header constant-time validation for unsafe cookie-authenticated requests. Skip only true Bearer-only requests and explicit webhook routes authenticated by provider secret.
- `be/src/controllers/auth.controller.ts`: keep setting HttpOnly auth cookie and readable CSRF cookie; expose CSRF only in response header; remove JWT/CSRF fields from JSON; `/auth/me` returns user only and supplies/rotates CSRF header.
- `be/src/services/auth.service.ts`: keep the token internal to controller cookie-setting; verify `(userId, accountId)` membership for protected session resolution.
- `be/src/middlewares/auth.middleware.ts`: expose a required typed auth context and distinguish cookie from Bearer authentication for CSRF.
- `fe/src/lib/api.ts`: delete `memoryAuthToken`, token parsing, auth storage/cookie synchronization and automatic Bearer injection. Keep one in-memory CSRF value learned from response headers and attach it to unsafe requests. Always use `credentials: "include"`.
- `fe/src/context/AuthContext.tsx`: remove `token` state/type; clear only frontend CSRF state on logout; refresh via cookie `/auth/me`.
- `fe/src/middleware.ts`: update stale comments that claim session-storage bearer support.

Compatibility gate: search the frontend for consumers of `useAuth().token`, `auth_token`, `Authorization`, and `setApiClientTokens({ authToken` and eliminate every browser dependency before backend stops returning JWTs.

Acceptance tests:

- Unknown and arbitrary Vercel origins receive no CORS permission.
- Exact configured origin works with credentials.
- Login/register/Google/me JSON contains no token.
- Cookie POST without or with mismatched CSRF is `403`; matching header succeeds.
- Bearer-only API request remains usable without CSRF.

### Phase 2 — Unify publication and activation semantics

Files:

- `be/src/services/card.service.ts`: extract transaction-compatible `activateCard(tx, context, cardId, targetPlan)` or equivalent. It must validate stored publish data, active plan/template compatibility, status transitions, `publishedAt`, and expiry/renewal.
- `be/src/services/order.service.ts`: accept typed auth context, query card by `{ id, accountId }`, query only active target plans, and route free activation through the shared function. Paid webhook calls the same function inside its transaction.
- `be/src/controllers/order.controller.ts`: pass `req.user.accountId`; map invalid/inactive plans and conflicts to stable status codes.
- `be/src/services/card.service.ts`: change public eligibility to `ACTIVE AND (expiredAt IS NULL OR expiredAt > now)`; include `accountId` when resolving a personalized guest.
- `be/src/services/wish.service.ts`: resolve an eligible public card before submit/list; allow only active/non-expired cards; include `accountId` in wish filters.
- `be/src/services/rsvp.service.ts`: include the resolved card `accountId` in guest lookup.

Tests:

- Invalid draft cannot become active via free order or paid webhook.
- Inactive plan cannot be selected or purchased.
- First activation sets `publishedAt`; repeat activation does not reset it.
- Renewal extends from the later of now/current expiry exactly once.
- `expiredAt = null` card is public; draft/expired/archived card is not.
- Wishes/guest personalization cannot be read or written outside eligible public card/account scope.

### Phase 3 — Make tenant authorization consistent

Files:

- Add `be/src/types/auth-context.ts` for `{ userId, accountId, role, authMethod }`.
- Update `OrderService.createOrder`, `ExportService.exportRsvpToExcel`, their controllers and tests to use `accountId` ownership.
- Audit every Prisma call in `card`, `guest`, `rsvp`, `wish`, `order`, `export`, and media metadata paths. Tenant roots use explicit `accountId`; public child queries use the account derived from the eligible card.
- Keep `Plan`, `Template`, email-unique `User`, provider-unique payment event lookups and order-code/poll-token public lookup documented as global selectors; validate the resolved tenant before mutation.

Tests must prove an account member can operate on account-owned resources regardless of original `Card.userId`, and account A cannot read/export/order against account B IDs.

### Phase 4 — Replace anonymous local uploads with tenant-bound durable media

Files:

- `be/src/routes/api.router.ts`: replace `optionalAuthGuard` with `authGuard` for `/media/upload`.
- `be/src/config/env.ts`: add required Cloudinary cloud name, API key, API secret and enablement rules.
- `be/src/services/media.service.ts`: retain magic-byte/type/size validation, replace `fs.writeFileSync` and local paths with signed Cloudinary REST multipart upload using `fetch`; prefix public ID/folder with a non-secret stable tenant identifier.
- `be/src/controllers/media.controller.ts`: require/pass `accountId`; map provider timeout/rate-limit/validation failures separately and never return provider internals.
- `be/src/server.ts`: remove `/uploads` static serving after confirming no persisted production card URLs depend on it.
- `render.yaml`: declare Cloudinary variables.
- `fe/src/lib/image-upload.ts`: preserve endpoint shape and surface provider errors; do not fall back to Base64/local blob URLs as persisted values.

Migration/safety check: before removing static serving, query or inspect production data for `/uploads/` URLs. If any exist, stop and write a one-off migration/upload script plus verification report; do not break existing cards.

### Phase 5 — Harden Redis, rate limits, and process ownership

Files:

- `be/src/lib/redis.ts`: replace method monkey-patching with a typed adapter/factory. Memory implementation is allowed only when an explicit test/development mode is selected.
- `be/src/lib/rate-limiter.ts`: accept typed error policy. OTP/login/register fail closed on Redis unavailability; low-risk public submission limits may return `503` rather than run unbounded.
- Auth/RSVP/wish controllers: use `req.ip` only after `trust proxy` is configured; never read raw `X-Forwarded-For`.
- `be/src/queues/workers/mail.worker.ts` and `rsvp-notification.worker.ts`: export worker constructors/close functions; avoid side-effect startup on import.
- Add `be/src/worker.ts`: load validated environment, start mail + RSVP workers, handle signals, close workers/queues/Redis/Prisma with a bounded deadline.
- `be/src/server.ts`: remove mail-worker import and close only resources owned by the HTTP process.
- `be/package.json`: add production worker build/start script.
- `render.yaml`: add a separate worker service using the worker entrypoint.

Tests:

- Forged `X-Forwarded-For` does not create a new rate-limit identity.
- Redis outage blocks OTP/login-sensitive state consistently.
- Importing the HTTP app creates no BullMQ worker.
- HTTP and worker shutdown close each owned resource once.

### Phase 6 — Resolve RSVP partial failure and webhook concurrency

RSVP:

- In `be/src/services/rsvp.service.ts`, treat the committed RSVP as success. Wrap notification enqueue in a structured, best-effort failure boundary after persistence.
- Use resolved guest name/phone in notification data, not untrusted original fields.
- Add a deterministic job ID for personalized RSVP updates where useful to suppress duplicate notifications.

Payment:

- In `OrderService.processSepayWebhook`, move fresh order/plan/card reads inside a serializable transaction.
- Create/dedupe the provider transaction and perform a conditional `updateMany` from `PENDING` to `PAID` scoped by `{ id, accountId, status, expiredAt }`.
- Continue only when the transition count is one. On zero, classify duplicate/already-final/expired explicitly without card mutation.
- Call shared card activation in the same transaction.
- Retry only Prisma serialization/deadlock errors a bounded number of times; acknowledge verified duplicates, return non-2xx for transient internal failures.

Concurrency tests must execute two deliveries with the same provider ID and two distinct provider IDs for one order; each case produces one state transition and at most one expiry extension.

### Phase 7 — Centralize safe errors and remove touched-path type escapes

Files:

- Expand `be/src/lib/http-error.ts` into typed public error codes/classes or add `be/src/middlewares/error.middleware.ts`.
- Replace the inline `err: any` global handler in `server.ts` with `unknown` narrowing and stable production messages.
- Replace controller `catch (error: any)` in touched controllers with `unknown` and central mapping.
- Replace `z.any()` photo definitions with the existing typed photo schema.
- Remove `(redis as any)` by completing the adapter work.
- Replace `console.warn/error` with Pino structured logging in touched services/controllers.

Add tests for Zod `400`, unauthenticated `401`, forbidden `403`, not found `404`, conflict `409`, rate limit `429`/dependency `503`, and generic production `500` without leaked internal messages.

### Phase 8 — Final regression, deployment rehearsal, and cleanup

1. Run focused backend suites after each phase, then the full backend suite.
2. Run frontend unit tests covering API/auth/upload/billing callers.
3. Run strict typechecks and production builds.
4. Run a local two-origin browser smoke test for cookie + CSRF behavior.
5. Rehearse SePay duplicate/concurrent webhook calls against an isolated database.
6. Rehearse Redis unavailable startup/request behavior and worker graceful shutdown.
7. Verify no JWT/OTP/secret/raw payment payload appears in logs.
8. Remove transitional token parsing only after frontend usage search is empty.

## 5. Data/control-flow focus

GitNexus PDG was unavailable; these source-derived flows must be rechecked during implementation:

- Auth: external Origin/cookie -> CORS/auth middleware -> `/auth/me` -> response. The new guards must ensure only exact origins receive credentialed responses and no response contains JWT.
- CSRF: unsafe request -> auth method resolution -> cookie/header comparison -> controller. No protected mutation may bypass this path except provider-authenticated webhook.
- Payment: webhook input -> Zod/provider authentication -> order lookup -> conditional transition -> payment transaction -> card activation. All state mutations must share one database transaction.
- RSVP: public input -> card eligibility/account derivation -> persistence -> best-effort queue. Queue failure must not alter the successful persistence result.
- Media: multipart input -> auth/account -> validation -> Cloudinary network call -> public URL. No disk write or anonymous path remains.

## 6. Files to add or modify

### Backend security and configuration

- Add: `be/src/config/env.ts`, `be/src/types/auth-context.ts`, `be/src/middlewares/error.middleware.ts`.
- Modify: `be/src/server.ts`, auth/csrf middleware, auth controller/service, HTTP errors/logger.

### Domain logic

- Modify: card, order, export, RSVP, wish, guest and media services/controllers/routes.
- Modify: card/order/wish validators where contract checks are missing.

### Infrastructure/deployment

- Modify: Redis/BullMQ modules, queue/worker files, `be/package.json`, `render.yaml`.
- Add: `be/src/worker.ts`.

### Frontend contract

- Modify: `fe/src/lib/api.ts`, `fe/src/context/AuthContext.tsx`, `fe/src/middleware.ts`, `fe/src/lib/image-upload.ts`, and any token consumers found by the compatibility gate.

### Tests

- Add focused auth, media, lifecycle, tenancy, order/webhook, RSVP, Redis/worker suites under `be/tests/`.
- Add/update frontend API/auth/upload tests under the existing `fe` test convention.

## 7. Rollout and rollback

1. Provision exact `ALLOWED_ORIGINS`, Redis, SePay/bank and Cloudinary settings in staging.
2. Verify whether legacy `/uploads/` URLs exist; migrate them before removal if necessary.
3. Deploy worker service and verify queue connectivity without moving traffic.
4. Deploy backend with exact CORS, cookie-only responses and CSRF support immediately followed by the compatible frontend. Use a short maintenance window if atomic deployment is unavailable.
5. Smoke-test login, Google login, refresh, logout, card save/publish, upload, RSVP, wishes, order payment polling and webhook.
6. Monitor 401/403/429/5xx rates, queue failures and payment reconciliation logs.

Rollback:

- Roll back frontend/backend together to the last schema-compatible pair.
- Keep additive data/schema changes; do not delete account/payment records.
- Do not restore wildcard Vercel CORS, JS-readable JWTs, no-op CSRF or anonymous disk uploads as a rollback. If those contracts block traffic, stop traffic and fix configuration.

## 8. Risks and mitigations

- Cross-site cookie restrictions may differ by browser. Mitigation: validate supported production domains in real browsers; if third-party cookies are blocked, stop and move API/frontend onto same-site custom subdomains rather than reintroducing JS tokens.
- Existing preview deployments will lose automatic API access. Mitigation: explicit short-lived origin configuration for reviewed previews only.
- Legacy `/uploads/` URLs may break when static serving is removed. Mitigation: mandatory inventory and migration gate.
- Payment concurrency tests can be false confidence with simplistic mocks. Mitigation: include an integration test against PostgreSQL transactions before release.
- Redis fail-closed can reduce availability. Mitigation: health/readiness checks and alerting; security-sensitive state must remain shared and consistent.
- Frontend/backend auth contract requires coordinated release. Mitigation: staging rehearsal and paired rollback.

## 9. Test matrix

- `[AUTH]` exact allowed/disallowed origins; cookie flags; no JWT in login/register/Google/me; login refresh/logout.
- `[CSRF]` missing, mismatched, valid, rotated token; cookie auth vs Bearer-only; webhook exclusion.
- `[TENANT]` account A/B card, export, order, guest, stats and child lookup isolation; legitimate account member access.
- `[CARD]` valid/invalid publish; free/paid activation; lifetime/expired status; repeat publish/renewal.
- `[PAYMENT]` wrong secret/account/direction/gateway/amount; expired/cancelled; same-ID duplicate; different-ID concurrency; idempotent order create/poll token.
- `[MEDIA]` anonymous; invalid bytes/extension/size; provider timeout/error; tenant prefix; legacy URL gate.
- `[REDIS]` outage in OTP/login/public limits; no production memory fallback.
- `[QUEUE]` RSVP enqueue failure after commit; worker retry/DLQ; process import and shutdown.
- `[ERROR]` safe status/code/message mapping and no internal leakage.
- `[FRONTEND]` no token storage/Bearer injection; CSRF header capture/forwarding; auth state refresh; upload/order callers remain compatible.

## 10. Verification commands and expected results

From `be/`:

1. `npm.cmd test` — all existing and new backend tests pass with no open handles.
2. `npx.cmd tsc --noEmit` — exit 0 with no new `any` escapes in touched paths.
3. `npx.cmd prisma validate` — schema validates.
4. `npm.cmd run build` — Prisma generate and TypeScript build exit 0 after releasing any Windows Prisma DLL lock.

From `fe/`:

5. `npm.cmd test` — API/auth/upload tests and full suite pass.
6. `npm.cmd run build` — Next.js production build exits 0.

From repository root:

7. Search for `auth_token`, `localStorage`, `sessionStorage`, response `token`, Vercel suffix trust, `optionalAuthGuard` on media, `writeFileSync`, raw `X-Forwarded-For`, `catch (error: any)`, and worker side-effect imports; only explicitly accepted non-auth storage/usages may remain.
8. `git diff --check` — no whitespace errors.
9. Staging browser/API/payment/Redis/worker rehearsal described in Phase 8 passes.

## 11. Implementation context pack

### Entry points and invariants

- `be/src/server.ts`: CORS, middleware ordering, rate limiting, routes, global errors and HTTP lifecycle.
- `be/src/routes/api.router.ts`: public/protected route classification.
- `be/src/controllers/auth.controller.ts` + `fe/src/lib/api.ts`: coupled browser-auth/CSRF contract.
- `be/src/services/card.service.ts`: lifecycle and public eligibility.
- `be/src/services/order.service.ts`: price, idempotency, webhook and activation.
- `be/src/lib/redis.ts` + queue/worker modules: shared-state and process ownership.

### Existing tests to preserve

- `be/tests/card/*.test.ts`
- `be/tests/guest/*.test.ts`
- `be/tests/order/order-schema.test.ts`
- `be/tests/tenancy/prisma-schema.test.ts`

### Provenance

- HEAD: `f5b190303b53ec0e9f739419d8169824513199e8`
- Worktree was clean before creating this spec and plan.
- GitNexus graph/PDG: unavailable; all cited claims are source-derived.
- Baseline: backend Vitest 8 files/42 tests passed; `tsc --noEmit` passed; full build hit a Windows Prisma DLL `EPERM` lock.

## 12. Assumptions, open questions, and STOP conditions

Assumptions adopted because the user requested immediate planning:

- Use Cloudinary for durable production media.
- Keep the existing first-membership session model; do not add account switching.
- Treat Telegram notification as non-critical after RSVP persistence.
- Coordinate frontend/backend release rather than preserving JS bearer-token compatibility.

STOP and report instead of improvising if:

- A shipped Capacitor/native client requires JWT issuance from current browser login endpoints.
- Production frontend origins cannot be enumerated exactly.
- Cloudinary credentials cannot be provisioned or legacy `/uploads/` data cannot be migrated safely.
- Real SePay semantics differ from the existing `Authorization: Apikey ...` and payload contract.
- PostgreSQL integration testing cannot reproduce conditional concurrent transitions.
- Auth cookie requests fail in supported browsers because frontend and API remain third-party sites; move to same-site custom subdomains rather than returning tokens to JavaScript.

## 13. Definition of done and plan review

Done means every success criterion in the design is covered by an automated regression test or an explicit staging rehearsal; all verification commands pass; production configuration is validated; and none of the insecure rollback patterns remain.

Plan quality self-review (2026-09-21):

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Completeness | 5/5 | Covers security, domain, tenant, storage, queue, errors, rollout and recovery paths. |
| Feasibility | 5/5 | Reuses current Express/Prisma/Zod/BullMQ boundaries; hardest external dependencies have STOP conditions. |
| Scope | 5/5 | Excludes framework migration, UI redesign, account switching, generic storage and non-critical outbox. |
| Testability | 5/5 | Each phase has concrete regressions, commands and expected outcomes. |
| Risk | 5/5 | Coordinated auth rollout, legacy media, browser-cookie, Redis and payment concurrency risks have gates. |
| Assumptions | 5/5 | Adopted assumptions and invalidation conditions are explicit in section 12. |

No unresolved planning blocker remains; implementation must honor STOP conditions.
