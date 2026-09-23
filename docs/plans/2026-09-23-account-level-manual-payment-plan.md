# Account-Level Manual Payment Implementation Plan

## Context

Implement the approved design in `docs/specs/2026-09-23-account-level-manual-payment.md`. The current repository already has Plan/Order/PaymentTransaction tables, VietQR generation, order idempotency and pricing/billing pages, but orders target one Card, billing sends a demo card ID, SePay is an automatic activation source, and entitlement checks read `card.plan`. The target flow is account-wide BASIC/VIP entitlement, manual ADMIN approval, 48-hour orders, backend-authoritative pricing, and soft downgrade to FREE without deleting data.

## Key Decisions

- `Account.currentPlanId`, `planStartedAt` and `planExpiresAt` are the entitlement source of truth; `Card.planId` remains a compatibility field only.
- `Card.expiredAt` remains a publication lifecycle field for FREE cards. Paid approval removes expiry from ACTIVE cards and reactivates EXPIRED cards, while DRAFT/ARCHIVED states remain unchanged.
- `AccountEntitlementService` is the single shared boundary for effective Plan calculation and feature checks. It prevents Card/Guest/Export from drifting into separate rules.
- Orders are account-level and accept only `planCode`; the backend resolves active Plan and price. `cardId` becomes nullable for legacy rows.
- Manual review is the only activation path. The SePay webhook route is removed after deployment verification so entitlement cannot be changed from two sources.
- Authenticated OWNER endpoints handle create/submit/status. A separately guarded platform ADMIN boundary handles the cross-account review queue; selected-order reads and all mutations re-scope by both `orderId` and `accountId` and write reviewer audit data.
- Expiration is evaluated on reads/writes rather than adding a scheduler. Effective BASIC entitlement becomes FREE immediately at `planExpiresAt`, and stale Order rows are transitioned opportunistically.
- No new runtime dependency is needed. Add MSW only as a frontend dev dependency because project testing directives require API-boundary integration tests.

## Verified Baseline

- VERIFIED: Prisma uses PostgreSQL and already models `Account`, `Plan`, `Order`, `PaymentTransaction`, `AccountMemberRole`, and `PaymentGateway.MANUAL` in `be/prisma/schema.prisma`.
- VERIFIED: `Order.cardId` is currently required and `OrderStatus` lacks `AWAITING_REVIEW`/`REJECTED`.
- VERIFIED: `OrderService.createOrder` currently requires `cardId` and `planId`, recalculates amount from Plan, creates a 30-minute order, and the SePay webhook updates one Card (`be/src/services/order.service.ts`).
- VERIFIED: `/orders`, polling status and `/webhooks/sepay` are registered in `be/src/routes/api.router.ts`.
- VERIFIED: `authGuard` verifies account membership but does not expose `AccountMemberRole`; `adminGuard` already checks platform `User.role` (`be/src/middlewares/auth.middleware.ts`).
- VERIFIED: Card and Guest entitlement checks read `card.plan`; Export currently has no Plan gate (`be/src/services/card.service.ts`, `guest.service.ts`, `export.service.ts`).
- VERIFIED: billing sends `cardId: "demo-card-id"`, passes Plan code as `planId`, and falls back to fake payment data when order creation fails (`fe/src/app/(dashboard)/dashboard/billing/page.tsx`).
- VERIFIED: frontend sources conflict: `fe/src/config/plans.ts` and seed use VIP 399.000đ while pricing/i18n display 249.000đ.
- VERIFIED: backend uses Vitest; frontend uses Vitest/RTL but does not currently include MSW.
- UNVERIFIED until migration dry-run: production data has an active FREE Plan and every Account can be backfilled deterministically from legacy Card rows.
- UNVERIFIED until product smoke test: reactivating all legacy EXPIRED cards on first paid approval matches actual production data expectations; stop if EXPIRED is used for a reason other than plan expiry.

## Approach

### 1. Tracer bullet: account entitlement with one BASIC approval

Build the thinnest real slice first: migrate one Account to have an effective Plan, create one account-level BASIC Order as OWNER, submit it, approve it as ADMIN, and observe entitlement from a Card request.

1. Write failing schema/service tests for account entitlement, OWNER authorization, account-level Order input, manual state transition and backend price resolution.
2. Add the additive Prisma migration and data backfill described below; generate Prisma Client.
3. Implement `AccountEntitlementService.getEffectivePlan(accountId, now?)` and activation math for FREE -> BASIC.
4. Change Order creation to `{ planCode }`, 48-hour expiry, account scope, active-order reuse and manual gateway.
5. Add submit-transfer and a minimal ADMIN approve service/controller route with conditional transition inside one transaction.
6. Change one Card owner read path to expose the effective account Plan and prove the approved BASIC entitlement is visible end-to-end.
7. Run targeted backend tests and build. Stop before expanding consumers if the migration cannot preserve legacy entitlements or an authenticated request cannot determine one account and membership role.

### 2. Database migration and compatibility

1. Update `be/prisma/schema.prisma`:
   - Add Account fields `currentPlanId`, `planStartedAt`, `planExpiresAt`, an explicitly named `onDelete: Restrict` relation to Plan, and an index suitable for expiry cleanup.
   - Add `Plan.currentAccounts` for the named relation.
   - Add `AWAITING_REVIEW` and `REJECTED` to `OrderStatus`.
   - Make `Order.cardId`/`card` nullable.
   - Add `submittedAt`, `reviewedAt`, `reviewedById`, `reviewNote`; name purchaser/reviewer User relations to avoid Prisma relation ambiguity.
   - Add indexes for review queue pagination, such as `[status, submittedAt]`, while retaining `[accountId, status]`.
   - Add a PostgreSQL partial unique index on `(accountId, planId)` where status is `PENDING` or `AWAITING_REVIEW`; Prisma schema cannot express this predicate, so the migration SQL and migration contract test own it.
2. Create `be/prisma/migrations/<timestamp>_account_manual_payments/migration.sql` manually so backfill ordering is controlled:
   - Add nullable columns/enums/relations first.
   - Assert/stop when the FREE Plan is missing.
   - Rank non-expired legacy Card Plans per Account as VIP > BASIC > FREE; for BASIC use the latest `Card.expiredAt`.
   - Backfill every Account, then enforce `currentPlanId NOT NULL` and foreign keys.
   - Preserve all Card and legacy Order data.
3. Add a migration contract test that inspects required columns, relations, statuses and account indexes; add a backfill integration fixture/script for FREE, BASIC and VIP cases.
4. Document rollback order: rollback application first; retain additive Account fields while any account-level Order exists; do not attempt destructive rollback of approved entitlements.

### 3. Centralize effective entitlement

1. Add `be/src/services/account-entitlement.service.ts` with typed methods:
   - Resolve effective Plan by `{ accountId }` and current time.
   - Treat expired BASIC as FREE immediately.
   - Opportunistically persist FREE with a conditional `updateMany` that cannot overwrite a concurrent VIP approval.
   - Calculate BASIC extension from `max(now, planExpiresAt)` and VIP lifetime.
   - Return a stable entitlement DTO rather than leaking full Prisma rows.
2. Update `CardService`:
   - Remove the `User.role === ADMIN` Plan shortcut; Plan capability comes from Account. If production requires an admin preview bypass, stop and make it an explicit separate policy rather than silently mixing role and paid entitlement.
   - Use effective Plan for card limits, templates, photo count, music, Telegram, watermark and VIP opening experience.
   - New FREE publishes retain the 7-day Card expiry; paid publishes use `expiredAt = null`.
   - Map Card responses so the compatibility `plan` field reflects the effective Account Plan during the transition.
3. Update `GuestService.requireVipCard` to validate card ownership by `accountId` and use effective Account Plan.
4. Update `ExportService` to enforce the approved Plan capability through the same entitlement service before generating Excel.
5. Add regression tests for cross-tenant access, expired BASIC -> FREE, paid Card publication, legacy Card plan mismatch, feature locks and data preservation above FREE limits.

### 4. Owner billing APIs and order lifecycle

1. Replace order validators in `be/src/lib/validators/order.schema.ts` and the duplicate export in `be/src/schemas/index.ts` with one canonical set:
   - Create `{ planCode: z.enum(["BASIC", "VIP"]) }` and `.strict()` so amount/card/user fields are rejected or stripped according to the established API convention.
   - Submit-transfer params/body.
   - Admin list/detail/approve/reject schemas, including integer `receivedAmount`, normalized optional `bankReference`, and required reject reason.
2. Extend authenticated request context in `be/src/middlewares/auth.middleware.ts` with the current membership role. Add a pure post-auth `ownerGuard`; do not trust a role copied from client state/JWT when the database membership can change.
3. Refactor `be/src/services/order.service.ts` around explicit state transitions:
   - `createOrder(userId, accountId, planCode, idempotencyKey)` verifies OWNER, resolves active Plan, prevents VIP repurchase/downgrade, expires stale rows, reuses an active same-Plan Order, and creates a 48-hour MANUAL Order. Catch the partial-index race and return the winner instead of surfacing a raw database error.
   - Require production `BANK_CODE`, `BANK_ACCOUNT`, and `BANK_ACCOUNT_NAME`; remove hard-coded production fallback.
   - `submitTransfer(accountId, orderId)` performs conditional `PENDING -> AWAITING_REVIEW` and writes `submittedAt`.
   - `getAccountOrder(accountId, orderId)` returns only a safe DTO for reload/polling.
   - Keep legacy polling read only while legacy clients need it; mark it for later removal.
4. Add `be/src/services/billing.service.ts` for active Plan catalog and account billing summary. Marketing translations remain frontend-owned; API is authoritative for code, price, duration and capabilities.
5. Add controller methods/routes:
   - `GET /plans`.
   - `GET /billing/summary` with auth.
   - `POST /orders` with auth + owner + idempotency.
   - `POST /orders/:orderId/submit-transfer` with auth + owner.
   - `GET /orders/:orderId` with auth + owner.
6. Remove the fake frontend-compatible success path: every backend error remains an error with typed code/status.

### 5. ADMIN review boundary and concurrency safety

1. Add `be/src/controllers/admin-payment.controller.ts` and isolate ADMIN review methods from tenant-facing OrderController.
2. Add `be/src/services/manual-payment-review.service.ts` as the focused platform-admin boundary; keep owner Order creation/status in `OrderService`:
   - Paginated list with explicit safe select and stable `submittedAt desc, id desc` ordering.
   - Scoped detail by `{ id, accountId }`.
   - Approve/reject by `{ id, accountId, status: AWAITING_REVIEW, expiredAt: { gt: now } }`.
3. Approve in one Prisma `Serializable` transaction with bounded retry for `P2034`, using a conditional transition count as the Order concurrency gate and re-reading Account entitlement inside every retry:
   - Lock/transition one payable Order.
   - Verify `receivedAmount >= order.amount` and Plan transition rules.
   - Write reviewer/timestamps/note.
   - Create one MANUAL PaymentTransaction with stable dedupe key `MANUAL:<orderId>` unless a normalized bank reference is supplied and unique.
   - Update Account Plan and expiry; reject a BASIC transition if the re-read Account is already VIP so concurrent approvals cannot downgrade it.
   - Set `expiredAt = null` on ACTIVE Cards; reactivate EXPIRED Cards for the same `accountId`; never change DRAFT/ARCHIVED.
4. Reject requires a non-empty reason and conditionally transitions to REJECTED without touching entitlement.
5. Register `/admin/payment-orders` routes behind `adminGuard`, rate limit state-changing actions and add structured audit logs without secrets.
6. Add concurrency tests that launch two approvals and approve-vs-reject; exactly one transition and one PaymentTransaction may succeed.
7. Remove `/webhooks/sepay` route and SePay activation controller/service path only after checking deployment configuration. Remove the webhook CSRF exemption in `be/src/server.ts`; keep legacy enum/data intact.

### 6. Auth/account summary contract

1. Change `AuthService.getMe` and `AuthController.getMe` to accept the authenticated `accountId`, read membership by `{ accountId, userId }`, and include:
   - `accountId`.
   - `accountMemberRole`.
   - Effective Plan summary and expiry.
2. Extend `fe/src/context/AuthContext.tsx` `AuthUser` with this typed account summary; refresh it after a PAID state.
3. Add backend auth contract tests and frontend context tests so MEMBER/OWNER and FREE/BASIC/VIP UI gates cannot drift.

### 7. Pricing and billing frontend

1. Add shared frontend types for `PlanCatalogItem`, `BillingSummary`, `PaymentOrder` and status unions; do not use `any`.
2. Update `fe/src/config/plans.ts` and `fe/src/config/i18n.ts`:
   - Keep localized names/marketing copy/features keyed by Plan code.
   - Remove numeric prices as an authoritative source; merge display copy with API catalog.
   - Remove the stale VIP 249.000đ strings.
3. Update `fe/src/app/(public)/pricing/page.tsx`:
   - Load active Plan catalog with loading/error handling.
   - Preserve selected Plan through login and route to `/dashboard/billing?plan=BASIC|VIP`.
   - Keep FREE navigation unchanged.
4. Refactor `fe/src/app/(dashboard)/dashboard/billing/page.tsx` into a small state-driven flow and focused components only where reused/independently testable:
   - Fetch billing summary and selected query Plan.
   - Hide purchase actions for MEMBER with a clear OWNER message.
   - Create/reuse Order; never send cardId, planId or amount.
   - Remove all mock/fallback payment data.
   - Render `PENDING`, `AWAITING_REVIEW`, `PAID`, `REJECTED`, `EXPIRED` and recoverable network states.
   - Submit transfer, poll authenticated Order, restore an unfinished Order after reload and refresh AuthContext on PAID.
   - Clean up intervals on state change/unmount and pause polling when terminal.
5. Add MSW-backed component/integration tests for pricing selection, login continuation, order creation, reload restoration, failed API, submit-transfer and eventual PAID.

### 8. ADMIN payment UI

1. Add `fe/src/components/auth/AdminRouteGuard.tsx` using `AuthContext.user.role`; backend remains authoritative.
2. Add `fe/src/app/(dashboard)/dashboard/admin/payments/page.tsx`:
   - Paginated/filterable review queue.
   - Loading, empty, error and stale-data refresh states.
   - Detail surface with account/buyer/Plan/amount/order code/timestamps.
   - Approve dialog requiring received amount and optional reference/note.
   - Reject dialog requiring reason.
   - Disable actions during requests; on 409 refetch and display the actual terminal state.
3. Add accessible labels, focus management, keyboard dismissal, live status/error regions and mobile-safe layout.
4. Add RTL/MSW tests for USER denial, queue filters, validation, approve/reject, double-submit prevention and concurrency conflict UI.

### 9. Expiry behavior and compatibility cleanup

1. Add an Order expiry helper invoked by create, account read and ADMIN queue read; tenant paths always filter `accountId`, while the platform queue runs only inside the explicit admin boundary.
2. Ensure account entitlement lookup conditionally persists FREE only when the same expired BASIC revision is still current.
3. Verify paid-expired accounts keep existing public Cards accessible with watermark while premium edits are blocked.
4. Verify new Card publishes after downgrade use FREE 7-day lifecycle.
5. Keep legacy `Card.planId`, legacy PaymentGateway values and old Orders readable. Do not drop compatibility columns in this release.

## Files to Modify

### Documentation and migration

- `docs/specs/2026-09-23-account-level-manual-payment.md`: approved behavior source.
- `be/prisma/schema.prisma`: Account entitlement, manual review state/audit, nullable legacy Card target and relation names.
- `be/prisma/migrations/<timestamp>_account_manual_payments/migration.sql`: additive schema changes and entitlement backfill.
- `be/prisma/seed.ts`: ensure Plan catalog update values are applied, not only supplied on create; VIP remains 399.000đ.

### Backend implementation

- `be/src/services/account-entitlement.service.ts` (new): effective Plan and activation rules.
- `be/src/services/billing.service.ts` (new): safe Plan catalog and billing summary.
- `be/src/services/order.service.ts`: account-level owner create/status/submit and removal of automatic activation.
- `be/src/services/manual-payment-review.service.ts` (new): ADMIN list/detail/approve/reject, audit and concurrency control.
- `be/src/services/card.service.ts`: Account Plan enforcement and Card publication compatibility.
- `be/src/services/guest.service.ts`: Account VIP enforcement.
- `be/src/services/export.service.ts`: effective Plan export enforcement.
- `be/src/lib/validators/order.schema.ts`, `be/src/schemas/index.ts`: canonical strict payment schemas.
- `be/src/middlewares/auth.middleware.ts`: membership role context and OWNER guard.
- `be/src/controllers/order.controller.ts`: OWNER order endpoints.
- `be/src/controllers/admin-payment.controller.ts` (new): ADMIN review endpoints.
- `be/src/controllers/billing.controller.ts` (new): catalog/summary endpoints.
- `be/src/services/auth.service.ts`, `be/src/controllers/auth.controller.ts`: authenticated Account/Plan summary.
- `be/src/routes/api.router.ts`: new billing/admin routes; remove SePay webhook activation.
- `be/src/server.ts`: remove obsolete webhook CSRF exemption after route removal.
- `be/src/config/env.ts`: require bank QR variables in production and retire SePay secret from this flow.
- `be/.env.example` (new; README references it but it is absent): document non-secret BANK_CODE/BANK_ACCOUNT/BANK_ACCOUNT_NAME placeholders and remaining required variables.

### Backend tests

- `be/tests/billing/account-entitlement.test.ts` (new): expiry, activation, renewal and soft downgrade.
- `be/tests/billing/manual-payment-review.test.ts` (new): approve/reject/concurrency/audit.
- `be/tests/billing/billing-routes.test.ts` (new): OWNER/MEMBER/ADMIN and tenant boundaries.
- `be/tests/order/order-schema.test.ts`, `order-service.test.ts`: account-level request/idempotency/48-hour lifecycle.
- `be/tests/order/webhook-concurrency-contract.test.ts`: replace webhook activation contract with manual transition concurrency coverage or remove after equivalent coverage exists.
- `be/tests/card/card-service.test.ts`, `be/tests/guest/guest-service.test.ts`, new export test: effective Account Plan consumers.
- `be/tests/tenancy/prisma-schema.test.ts`: new account/order indexes and relations.
- `be/tests/auth/auth-middleware.test.ts`: OWNER role context and admin separation.

### Frontend implementation

- `fe/src/types/billing.types.ts` (new): strict Plan/Order/Billing DTOs.
- `fe/src/config/plans.ts`, `fe/src/config/i18n.ts`: localized copy keyed by backend catalog; remove authoritative/stale numeric prices.
- `fe/src/context/AuthContext.tsx`: Account membership and effective Plan summary.
- `fe/src/app/(public)/pricing/page.tsx`: API-driven catalog and selected Plan continuation.
- `fe/src/app/(dashboard)/dashboard/billing/page.tsx`: real manual-transfer state machine without demo fallback.
- `fe/src/app/(dashboard)/dashboard/admin/payments/page.tsx` (new): ADMIN review queue.
- `fe/src/components/auth/AdminRouteGuard.tsx` (new): frontend route gating.

### Frontend tests and setup

- `fe/package.json`, `fe/package-lock.json`: add MSW as a dev dependency.
- `fe/tests/setup.ts`, `fe/tests/mocks/server.ts`, focused handlers: MSW lifecycle for integration tests.
- `fe/tests/components/pricing-payment-flow.test.tsx` (new).
- `fe/tests/components/billing-page.test.tsx` (new).
- `fe/tests/components/admin-payments-page.test.tsx` (new).
- `fe/tests/unit/auth-guard.test.ts`: ADMIN/OWNER/MEMBER UI gating.

## Error Handling and Recovery

- Missing/inactive Plan or missing FREE backfill Plan: stop migration/deployment; never substitute an arbitrary Plan.
- Missing bank environment variables: return typed `PAYMENT_NOT_CONFIGURED`; never emit a QR with hard-coded production account data.
- Duplicate click/retry: idempotency key or active-order reuse returns the existing safe Order.
- Underpayment: ADMIN approve returns 422/409 according to the existing error convention and leaves AWAITING_REVIEW unchanged.
- Concurrent review of the same or different Plan Orders: serializable transaction + bounded retry re-evaluates current Account Plan; a losing request returns 409 with no second PaymentTransaction or entitlement downgrade.
- Transaction failure: conditional Order transition, PaymentTransaction, Account update and Card lifecycle updates all rollback.
- Polling/network failure: UI retains known state, announces loss of connection and offers retry; it never infers PAID.
- Rejected/expired Order: user can create a new Order; old audit record is immutable.
- Migration rollback: deploy old code first. Because new account-level approvals cannot be represented safely by old Card-only logic, do not drop new columns or roll back data after live approvals without a reconciliation script.

## Risk and Rollout

1. Capture pre-migration counts: Accounts, Accounts by highest effective legacy Plan, active Orders and Cards by status/Plan.
2. Run migration in staging with representative FREE/BASIC/VIP and mixed-Card accounts; compare backfill counts and expiry dates.
3. Deploy backend with dual response compatibility (`card.plan` mapped from Account) before frontend.
4. Smoke-test the tracer bullet with a test bank transfer and manual ADMIN approval.
5. Deploy pricing/billing/admin frontend.
6. Confirm no production integration still calls `/api/webhooks/sepay`, then remove/disable it. If it is in use, stop and coordinate cutover; do not leave both activation paths live.
7. Monitor typed error codes, review conflicts, expired-order transitions and entitlement fallback events.
8. Retain Card compatibility columns for at least one release; removal requires a separate reviewed plan.

Highest risks and mitigations:

- Wrong migration upgrades/downgrades a whole Account: dry-run ranking query, count comparison, additive columns and stop conditions.
- Concurrent ADMIN actions grant twice: conditional transition inside the same transaction plus PaymentTransaction dedupe.
- Existing Card features silently read stale Card Plan: central service plus grep-backed call-site migration and regression tests.
- Soft downgrade breaks public Cards: preserve publication semantics explicitly and smoke-test ACTIVE/EXPIRED/DRAFT/ARCHIVED cases.
- Global admin queue crosses tenants: isolate it behind the platform-admin boundary, safe selects, audit logs and account-scoped mutations; no tenant-facing service may reuse the unscoped list method.

## Verification

Run with fresh output before claiming completion:

1. `npm.cmd test -- tests/billing tests/order tests/card tests/guest tests/auth tests/tenancy` in `be/` — targeted entitlement/payment/tenancy tests pass.
2. `npm.cmd test` in `be/` — all backend tests pass with zero failures.
3. `npm.cmd run build` in `be/` — Prisma generation and strict TypeScript compilation exit 0.
4. Apply the migration to an isolated database snapshot — every Account has `currentPlanId`; ranked legacy entitlements and BASIC expiries match hand-checked fixtures; no Card/Order rows are deleted.
5. `rg -n "card\.plan|include: \{ plan|include: \{.*plan" be/src` — every remaining match is documented compatibility/serialization, not an entitlement decision.
6. `rg -n "249\.000|demo-card-id|/webhooks/sepay" fe/src be/src` — no stale VIP price, demo payment target or live SePay activation route remains.
7. `npm.cmd test` in `fe/` — all RTL/MSW/unit tests finish and pass.
8. `npx.cmd tsc --noEmit` in `fe/` — strict type checking exits 0.
9. `npm.cmd run build` in `fe/` — Next production build exits 0.
10. Manual OWNER smoke test: choose BASIC on pricing, login continuation, create/reload Order, submit transfer, observe AWAITING_REVIEW.
11. Manual ADMIN smoke test: filter queue, reject with reason, create replacement, approve with received amount/reference, verify exactly one PaymentTransaction and Account BASIC expiry +180 days.
12. Manual entitlement smoke test: all existing Cards receive BASIC features; DRAFT/ARCHIVED state is preserved; legacy EXPIRED reactivates; after simulated expiry Cards remain visible with FREE watermark and premium editing is blocked.
13. Manual concurrency smoke test or integration test: two approve requests race; one returns success and one 409.
14. Run `ui-audit` against pricing, billing and admin payments at mobile/desktop widths; no state loss, double submit, focus trap, overflow or inaccessible error state.
15. `git diff --check` — no whitespace errors.

## Acceptance Checklist

- [ ] Account is the entitlement source for all current/future Cards.
- [ ] OWNER can create/submit/reload a 48-hour BASIC/VIP Order without a Card ID.
- [ ] MEMBER cannot purchase; USER cannot review; ADMIN can approve/reject.
- [ ] BASIC is 199.000đ and VIP is 399.000đ everywhere; backend calculates amount.
- [ ] Approval is atomic, idempotent and audited.
- [ ] BASIC renewal, BASIC -> VIP and VIP purchase restrictions match the approved rules.
- [ ] Expired BASIC produces effective FREE without deleting data.
- [ ] SePay cannot independently activate an entitlement.
- [ ] Frontend contains no mock payment fallback or false success state.
- [ ] Migration, all tests, types, builds and UI audit pass.

## STOP Conditions

- Stop if FREE/BASIC/VIP Plan rows are missing or duplicated in the target database; repair catalog data explicitly before backfill.
- Stop if one authenticated session can resolve to more than one active account without an existing account-switch contract; do not guess the first membership.
- Stop if production `EXPIRED` Cards include manually disabled/abusive content; do not bulk-reactivate them without a distinct expiration reason or safer predicate.
- Stop if any production integration still depends on SePay webhook activation; coordinate a cutover instead of running dual writers.
- Stop if the migration ranking query changes Account entitlement counts unexpectedly; inspect sample rows before enforcing NOT NULL.
- Stop if old code must be rolled back after account-level approvals; reconcile Account entitlement back to compatible Card data before rollback.
- Stop before adding subscriptions, coupons, invoices, uploads, notifications or another provider; they are not approved scope.

## Out of Scope

- Automatic bank webhook confirmation, uploaded receipts, refunds, partial-payment workflows and overpayment refunds.
- Recurring billing, pause/cancel subscription, coupon/promotion and invoice/VAT issuance.
- Notification delivery outside polling/reload.
- Deleting `Card.planId` or historical PaymentGateway enum values in this release.
- A generalized payment-provider abstraction or generic workflow engine.
- Redesigning unrelated dashboard/card editor surfaces.

## Review Notes — 2026-09-23

| Dimension | Before | After | Resolution |
| --- | ---: | ---: | --- |
| Completeness | 4/5 | 5/5 | Added active-order partial uniqueness, explicit manual review service, full failure/recovery paths and migration rollback constraints. |
| Feasibility | 5/5 | 5/5 | Verified existing Prisma/Order/VietQR/auth/test surfaces and starts with one vertical BASIC approval tracer bullet. |
| Scope | 5/5 | 5/5 | Keeps manual review only; excludes provider abstraction, receipts, notifications, recurring billing and speculative component extraction. |
| Testability | 5/5 | 5/5 | Includes exact automated commands, migration fixtures, concurrency cases, UI audit and observable acceptance criteria. |
| Risk | 4/5 | 5/5 | Added PostgreSQL partial index, Serializable bounded retries, account re-read, dual-writer cutover gate and legacy Card compatibility rollout. |
| Assumptions | 5/5 | 5/5 | Load-bearing code claims are verified; data-dependent claims are marked unverified with explicit STOP conditions. |

No unresolved planning blockers remain. The platform-admin queue is the only intentional cross-account read boundary; tenant-facing reads/writes and every selected-order mutation remain scoped by `accountId`.
