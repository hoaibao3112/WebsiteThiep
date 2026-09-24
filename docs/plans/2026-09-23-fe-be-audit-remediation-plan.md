# FE/BE Audit Remediation Plan

## Outcome

Make the current account-level billing implementation safe to release, then remove the highest-risk FE/BE contract, tenant, state-management, accessibility, and strict-TypeScript gaps found in the repository-wide audit.

This plan is grounded in the current `main` at `11518f9`, the approved account-level payment spec, 202 TypeScript/Prisma/migration files (about 37k source/test lines), current tests/builds, and the billing commits `0eb3e9f` and `b92313e`.

## Current Ship Verdict

**NOT READY**

Release blockers:

1. Account entitlement is not actually authoritative for current/future Cards. `CardService`, `GuestService`, and `ExportService` still use `Card.plan` or omit the entitlement check.
2. The production migration makes `accounts.currentPlanId` NOT NULL, but Prisma keeps it optional and new Account creation omits it. First-time registration can fail against a migrated database.
3. Orders in `AWAITING_REVIEW` are never expired by tenant flows. After 48 hours they cannot be approved or replaced and can remain blocked by the partial unique index.
4. Approval reads entitlement through global Prisma from inside a Serializable transaction, so the decision is not transaction-bound and can race with another approval.
5. FE and BE DTOs disagree for `/auth/me`, effective entitlement, and admin pagination. TypeScript cannot detect these network-contract mismatches.
6. Pricing is still hard-coded and a logged-out paid-plan choice is lost during login.
7. A restored `PENDING` order has no `paymentInfo`, leaving the payment panel blank after reload.
8. Frontend tests currently fail: 4 failures in `edit-card-page.test.tsx`.

## Verified Baseline

- `be`: `npm.cmd test` — **73/73 passed**.
- `be`: `npx.cmd tsc --noEmit` — **passed**.
- `be`: `npm.cmd run build` — **inconclusive** because Prisma Client generation hit a Windows `EPERM` DLL rename lock; TypeScript itself passed.
- `fe`: `npx.cmd tsc --noEmit` — **passed**.
- `fe`: `npm.cmd run build` — **passed**; editor routes ship about 310–314 kB first-load JS.
- `fe`: `npm.cmd test` — **failed**, 4 failures / 70 tests; the editor suite times out, leaks overlapping `act()` work, and renders duplicate alerts.
- GitNexus graph tooling is unavailable in this session. Impact analysis therefore used repository-wide `rg`, direct call-site inspection, Git history, tests, typechecks, and production builds.

## Prioritized Findings

### P0 — Release blockers

1. **Paid Account creates FREE Cards and existing Cards keep stale enforcement.**
   - `be/src/services/card.service.ts:43-75` selects VIP only for platform ADMIN and FREE for everyone else.
   - `be/src/services/card.service.ts:246-297` validates edits against `existing.plan`.
   - `be/src/services/card.service.ts:351-378` calculates publication expiry from `card.plan`.
   - Result: approving BASIC/VIP does not reliably unlock future Cards, DRAFT Cards, premium templates, music, or paid lifecycle.

2. **Guest and export permissions do not follow Account entitlement.**
   - `be/src/services/guest.service.ts:10-17` requires `card.plan.code === VIP`.
   - `be/src/services/export.service.ts:8-24` checks ownership but never checks a paid capability.
   - Result: an upgraded Account may remain locked out, while a stale VIP Card can retain access after Account downgrade.

3. **New Account creation conflicts with the migrated database.**
   - `be/prisma/migrations/20260923100000_account_manual_payments/migration.sql:80-90` enforces a NOT NULL FK.
   - `be/prisma/schema.prisma:34-37` still declares `currentPlanId` and relation optional.
   - `be/src/services/auth.service.ts:401-415` creates an Account without a FREE Plan.
   - Result: first login/registration after migration can fail at Account creation.

4. **Manual-payment expiry state machine can deadlock an Account/Plan pair.**
   - `be/src/services/order.service.ts:82-90` expires only `PENDING`.
   - `be/src/services/order.service.ts:260-266` also expires only `PENDING`.
   - The partial index includes both `PENDING` and `AWAITING_REVIEW`.
   - Result: an expired `AWAITING_REVIEW` order cannot be approved, is not transitioned to `EXPIRED`, and can block replacement creation.

5. **Serializable approval is not fully inside one transaction client.**
   - `be/src/services/manual-payment-review.service.ts:204-331` opens `tx`.
   - `be/src/services/manual-payment-review.service.ts:247` calls `AccountEntitlementService.getEffectivePlan`, which uses global `prisma` at `be/src/services/account-entitlement.service.ts:41`.
   - Result: the re-read can observe a different snapshot and opportunistic downgrade writes can happen outside the approval transaction.

6. **Bank configuration failure leaves a real active Order behind.**
   - `be/src/services/order.service.ts:129-145` creates the Order before config validation at `188-193`.
   - `be/src/config/env.ts:28-33` only warns in production.
   - Result: the first request returns 503 but persists an active Order; replay can return `qrUrl: null`.

7. **Critical FE/BE contracts disagree.**
   - `/auth/me` returns flat `accountId`, `accountMemberRole`, `effectivePlan` at `be/src/services/auth.service.ts:350-365`; FE expects nested `user.account` at `fe/src/context/AuthContext.tsx:18-22`.
   - FE expects `isPaid` and `daysRemaining` at `fe/src/types/billing.types.ts:32-39`; BE `EffectivePlanDTO` does not provide them.
   - FE reads `totalPages` at `fe/src/app/(dashboard)/dashboard/admin/payments/page.tsx:71-79`; BE list returns only `items` and `total` at `be/src/services/manual-payment-review.service.ts:95-124`.

8. **Payment recovery after reload is incomplete.**
   - Billing restores `activeOrder` at `fe/src/app/(dashboard)/dashboard/billing/page.tsx:62-66` but not `paymentInfo`.
   - The PENDING payment UI requires both at `388`.
   - Result: reload can render an empty order panel with no QR or bank details.

9. **Critical UI requests can fail silently.**
   - `ApiClient` returns `{ success: false }` instead of throwing for HTTP failures.
   - Billing initial loading only handles success branches at `fe/src/app/(dashboard)/dashboard/billing/page.tsx:57-72`; its `catch` does not cover normal 4xx/5xx results.
   - Admin list behaves the same at `fe/src/app/(dashboard)/dashboard/admin/payments/page.tsx:59-83`.
   - Billing then defaults an unresolved role to OWNER at `fe/src/app/(dashboard)/dashboard/billing/page.tsx:182-183`, a workaround introduced in `b92313e`.

10. **Pricing is not backend-authoritative and login loses the chosen paid Plan.**
    - `fe/src/app/(public)/pricing/page.tsx:218-358` renders translated/hard-coded prices rather than `/plans`.
    - `fe/src/config/plans.ts:11-105` duplicates prices and capabilities.
    - `fe/src/app/(public)/pricing/page.tsx:38-43` opens login without retaining `/dashboard/billing?plan=...`.

### P1 — Fix in the same remediation release

1. Catch the partial-index `P2002` race in `OrderService.createOrder`; return the winning active Order for a different idempotency key instead of a raw 500.
2. Add `accountId` to admin detail/approve/reject mutation contracts and predicates. The cross-account queue remains the sole documented ADMIN-only unscoped read boundary.
3. Make review-queue response pagination explicit: `page`, `pageSize`, and `totalPages`, with stable ordering and bounded page size.
4. Replace the dynamic import in `AuthService.getMe` (`be/src/services/auth.service.ts:341-345`) with a static import.
5. Stop swallowing entitlement resolution errors in `/auth/me`; an Account without a valid Plan is a configuration/data-integrity error, not a nullable success.
6. Replace raw `Error` 500s in Guest/Card/Export not-found paths with typed `HttpError` responses.
7. Make `ensureDefaultAccount` deterministic. Do not select an arbitrary first membership when a user belongs to multiple Accounts; either retain the token's current Account or add an explicit account-switch contract.
8. Replace hand-written admin overlays at `fe/src/app/(dashboard)/dashboard/admin/payments/page.tsx:415`, `526`, and `586` with an accessible Shadcn/Radix Dialog: focus trap, Escape close, labelled title/description, focus restoration, and scroll lock.
9. Add `role="alert"` / `aria-live` to async payment/admin feedback and announce copy results and state transitions.
10. Make polling failures visible and recoverable; retain the last known status, display connection loss, and avoid silently swallowing repeated failures.
11. Respect `prefers-reduced-motion` for confetti and decorative pricing/card motion.
12. Fix the editor test lifecycle and underlying render instability; no overlapping `act()`, no duplicate mounted pages, deterministic cleanup, and no 15-second timeout dependency.

### P2 — Technical debt after correctness is restored

1. Remove all source-level `any`/`as any` violations found by the audit, starting with auth controllers, wedding profile DTOs, card editor data, and global drag payloads.
2. Split the 4,000+ line home page and 2,300+ line edit page into bounded feature components/hooks only after behavior tests exist.
3. Lazy-load editor-only libraries and panels; target a meaningful reduction from the current 310–314 kB first-load editor bundles.
4. Replace layout-shifting raw images with `next/image` or explicit dimensions where appropriate.
5. Normalize route-level loading to skeletons that reserve final layout space rather than full-page spinners.
6. Resolve the Vitest CommonJS/ESM config warning and make `npm run lint` valid for the installed Next.js version.

## Implementation Sequence

### Phase 0 — Freeze contracts with failing tests

1. Add backend contract tests for:
   - new user -> Account with FREE Plan;
   - effective entitlement DTO;
   - `/auth/me` shape;
   - billing summary including recoverable PENDING payment details;
   - admin pagination;
   - expired `AWAITING_REVIEW` transition;
   - same-Plan create races and approval races.
2. Add MSW and FE contract tests for pricing -> login -> selected Plan -> billing, billing reload, API failure, MEMBER denial, and admin pagination/conflict behavior.
3. Convert the current source-string concurrency test into behavioral tests against service boundaries. Source inspection may remain as a narrow migration/architecture contract, not as proof of concurrency correctness.
4. Keep each new test red until the matching phase is implemented.

**Tracer bullet:** register a new user, verify FREE Account, create BASIC order, reload PENDING instructions, submit, ADMIN approves, and create a new Card that immediately receives BASIC entitlement. Do not expand cleanup work until this vertical slice passes.

### Phase 1 — Repair the Account/Plan data invariant

1. Treat the existing migration as immutable if it has run in any shared environment. Add a forward migration rather than rewriting applied history.
2. Align `schema.prisma` with the database: required `currentPlanId/currentPlan`, correct `planStartedAt` nullability/default, relation name, and indexes.
3. In `ensureDefaultAccount`, resolve the active FREE Plan first and create Account + OWNER membership + `currentPlanId` in one transaction.
4. Fail startup/deployment when FREE/BASIC/VIP catalog rows are missing or duplicated; do not choose an arbitrary row.
5. Add a migration/schema contract test and an integration fixture for FREE/BASIC/VIP legacy backfill.

**STOP:** if the production migration has not run consistently across environments, inventory migration state before applying a forward fix.

### Phase 2 — Make Account entitlement the only authorization source

1. Refactor `AccountEntitlementService` to accept a typed Prisma client/transaction client and separate pure calculation from persistence.
2. Remove the platform-ADMIN-as-VIP shortcut from `CardService`.
3. Update Card create, edit, publish, list/detail compatibility mapping, photo limit, premium template, music, Telegram, watermark, and expiry decisions to use effective Account entitlement.
4. Update `GuestService` and `ExportService` to use the same Account entitlement check while every tenant query continues to include `accountId`.
5. On approval, update Card compatibility `planId` for all Cards in the Account, while status changes remain explicit: ACTIVE loses expiry, eligible EXPIRED reactivates, DRAFT/ARCHIVED keep status.
6. Add tests for paid future Cards, legacy Card-plan mismatch, expired BASIC -> FREE, tenant isolation, and data retained above downgraded limits.

### Phase 3 — Make the order/review state machine atomic

1. Create one shared expiry helper that conditionally transitions both `PENDING` and `AWAITING_REVIEW` to `EXPIRED` when `expiredAt <= now`.
2. Invoke it from create, billing summary, owner read, and admin queue/detail before selecting actionable orders.
3. Validate required bank config before inserting an Order and fail production startup when it is missing.
4. Handle all relevant `P2002` targets: idempotency key, order code, and the partial active Account/Plan index. Re-read and return the winner where safe.
5. Run approval entirely through the transaction client. Re-read the Account Plan inside each Serializable retry and never perform opportunistic downgrade via global Prisma.
6. Add `{ orderId, accountId }` to admin detail and mutations; include both in conditional updates. Keep only the paginated ADMIN queue as an explicit cross-tenant exception.
7. Normalize bank references before dedupe and translate duplicate-reference conflicts to a typed 409.
8. Add behavioral concurrency tests: approve/approve, approve/reject, BASIC/VIP concurrent approvals, underpayment rollback, and expired-review replacement.

### Phase 4 — Establish one DTO contract per endpoint

1. Make `/auth/me` follow the approved flat contract: `accountId`, `accountMemberRole`, and `effectivePlan`; update `AuthUser` to match exactly.
2. Define one effective entitlement DTO including derived `isPaid` and `daysRemaining`, or remove those FE fields. Do not keep fields present on only one side.
3. Unify create/get/summary order views so a PENDING Order always includes safe `paymentInfo` needed for recovery; never return secrets or polling hashes.
4. Return full pagination metadata from the admin list.
5. Validate Plan `features` from Prisma JSON into a safe `string[] | null` DTO.
6. Add response-schema contract tests at controller boundaries so future TS-only changes cannot drift over HTTP.

### Phase 5 — Repair pricing and owner billing UX

1. Load `/plans` on the public pricing page; merge only localized marketing copy by Plan code. Remove prices/capabilities as authoritative values from `plans.ts` and stale i18n strings.
2. Add stable loading, retryable error, and unavailable-plan states.
3. For logged-out paid selection, route through the existing login redirect contract with `/dashboard/billing?plan=BASIC|VIP` encoded so the choice survives authentication.
4. In billing, treat either failed initial request as an error state; never default an unknown role to OWNER.
5. Restore PENDING QR/bank details after reload using the unified order view.
6. Keep one stable polling loop, clean it up on terminal states/unmount, expose connection failures, and refresh auth entitlement once on PAID.
7. Handle Clipboard API rejection and announce copy/status feedback via live regions.

### Phase 6 — Repair ADMIN review UX and accessibility

1. Consume the corrected pagination contract and test next/previous bounds.
2. Fetch scoped detail before opening review actions; submit both `orderId` and `accountId`.
3. Use Shadcn/Radix Dialog for approve, reject, and detail surfaces with labelled fields, initial focus, focus trap, Escape, focus restoration, and mobile overflow handling.
4. Keep action buttons disabled while pending. On 409, close stale action state only after refetching and showing the actual terminal Order state.
5. Add `role="status"` for success and `role="alert"` for failures; retain messages long enough to read.

### Phase 7 — Restore test reliability and strict typing

1. Fix editor tests by using a single render lifecycle, automatic cleanup once, awaited user events, and deterministic mocks. Investigate render cost rather than raising the timeout.
2. Add missing billing/admin/pricing/auth tests required above; run with MSW at the HTTP boundary.
3. Replace `catch (error: any)` with `unknown` plus `HttpError`/Zod narrowing.
4. Add a typed `WeddingProfile` schema/DTO and eliminate `any` from profile, editor, RSVP, template, and drag payload code.
5. Add a CI guard such as ESLint `@typescript-eslint/no-explicit-any` after the existing violations are removed.

### Phase 8 — Performance and maintainability

1. Capture bundle analysis before refactoring.
2. Dynamically import editor-only panels, preview renderers, confetti, and optional heavy utilities where user interaction gates them.
3. Extract cohesive editor/home sections with behavior tests; avoid a visual rewrite in the payment remediation release.
4. Re-run mobile/desktop UI audit for pricing, billing, admin dialogs, card editor, and the RSVP modal.

## Verification Matrix

### Automated

1. `npm.cmd test` in `be/` — all tests pass, including behavioral billing/entitlement/concurrency suites.
2. `npx.cmd tsc --noEmit` in `be/` — exit 0.
3. `npm.cmd run build` in `be/` — exit 0 after stopping any process locking Prisma's Windows engine DLL.
4. Apply migrations to an isolated production-like Postgres snapshot — every Account has a valid current Plan; new Account creation succeeds.
5. `npm.cmd test` in `fe/` — zero failures, zero overlapping `act()` warnings.
6. `npx.cmd tsc --noEmit` and `npm.cmd run build` in `fe/` — exit 0.
7. `rg -n '\\bany\\b|as any|@ts-ignore|@ts-expect-error' fe/src be/src` — empty or every remaining generated/vendor exception explicitly documented.
8. `rg -n 'existing\\.plan|card\\.plan|include: \\{ plan' be/src/services` — every remaining match is serialization/compatibility, not authorization.
9. `git diff --check` — clean.

### Required scenarios

- New registration creates a FREE Account on a migrated database.
- OWNER chooses BASIC while logged out, logs in, lands on BASIC billing, creates exactly one Order, reloads, and still sees valid transfer instructions.
- MEMBER sees Account summary but cannot create or submit an Order in FE or API.
- PENDING and AWAITING_REVIEW orders expire after 48 hours and can be replaced.
- Two create requests with different idempotency keys produce one active Account/Plan Order and safe responses.
- Two ADMIN actions produce exactly one terminal transition and one PaymentTransaction.
- BASIC approval unlocks all current and future Cards; VIP-only features remain locked unless policy says otherwise.
- Expired BASIC behaves as FREE without deleting Cards, photos, guests, RSVP, or wishes.
- Cross-account Card, Guest, Export, Order, and admin-mutation attempts cannot access or modify another tenant.
- Pricing/billing/admin API failures show recoverable UI; no fake success, blank PENDING drawer, or silent empty queue.
- All dialogs complete by keyboard, trap/restore focus, close with Escape, and expose announced validation/status feedback.

## Rollout and Recovery

1. Deploy schema/Account invariant and backend contract changes before the new FE.
2. Run the tracer bullet in staging with representative legacy FREE/BASIC/VIP Accounts.
3. Compare pre/post counts for Accounts by effective Plan, Cards by status/Plan, active Orders, and PaymentTransactions.
4. Deploy FE after the compatible backend is live.
5. Monitor typed error codes for `PAYMENT_NOT_CONFIGURED`, order conflicts, review conflicts, expiry transitions, and entitlement fallback.
6. Keep `Card.planId` compatibility for at least one release. Roll back application code before any schema rollback; never drop Account entitlement fields while account-level approvals exist.

## Assumptions and STOP Conditions

- **Verified:** manual ADMIN approval is the desired payment model; SePay auto-activation is out of scope.
- **Verified:** backend/database is authoritative for price and capabilities.
- **Verified:** one approval upgrades the whole Account, not one Card.
- **Unverified:** whether migration `20260923100000_account_manual_payments` has already run in every environment. Inspect migration state before editing/adding SQL.
- **Unverified:** whether real users can belong to multiple active Accounts today. If yes, stop and design account switching before relying on `findFirst` membership.
- **Unverified:** whether every legacy `EXPIRED` Card was expired only by Plan lifecycle. If abuse/manual-disable reasons exist, do not bulk-reactivate without an explicit reason field.
- **STOP:** if production still depends on SePay webhook activation or an old client contract, coordinate a cutover; do not run dual entitlement writers.
- **STOP:** if FREE/BASIC/VIP rows are missing/duplicated, repair catalog data before Account backfill or registration rollout.

## Out of Scope

- Subscriptions, recurring billing, coupons, refunds, invoices/VAT, receipt uploads, or automatic bank webhooks.
- Deleting compatibility columns or historical gateway enum values.
- Redesigning wedding templates or the editor's visual language.
- Introducing NestJS, TypeORM, or class-validator.

## Plan Quality Review

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Completeness | 5/5 | Covers data invariant, entitlement consumers, payment states, HTTP contracts, UI recovery, accessibility, rollout and rollback. |
| Feasibility | 5/5 | Uses existing Express/Prisma/Next architecture and begins with a full-stack tracer bullet. |
| Scope | 5/5 | P0/P1 correctness is separated from P2 cleanup; payment-provider expansion and visual redesign are excluded. |
| Testability | 5/5 | Includes exact commands, contract/concurrency cases, tenant checks, UI behaviors and explicit done conditions. |
| Risk | 5/5 | Calls out migration state, multi-account ambiguity, stale review races, cross-tenant admin mutations, and rollout order. |
| Assumptions | 5/5 | Verified and unverified assumptions are separated with concrete STOP conditions. |

