# Free Card Creation Flow Implementation Plan

## Context

Implement the approved FREE-card lifecycle in `docs/specs/2026-09-02-free-card-creation-flow.md`. The first shippable vertical slice must prove that an authenticated account can create a real draft with a real FREE plan/template, retrieve it through an owner-only endpoint, publish it, and access it publicly only while active and unexpired. Existing payment/BASIC/VIP behavior remains untouched.

## Key Decisions

- The backend resolves the active `FREE` plan and active non-premium template; card write payloads never accept `planId`.
- The two-card limit is account-scoped and enforced inside a PostgreSQL `Serializable` transaction with bounded retry for Prisma `P2034` conflicts.
- Draft and publish use separate Zod schemas: drafts allow incomplete category content; publish validates the stored aggregate strictly.
- `publishedAt` and `expiredAt` are set only on first successful publish. Re-publishing ACTIVE cards does not extend expiry; EXPIRED cards cannot publish in this phase.
- Public reads filter ACTIVE and unexpired cards. Owner reads use authenticated `accountId` and `cardId`.
- Initial save is explicit; autosave begins only after create returns a `cardId`.
- No new form, query, or state dependency is added. Existing React state and `ApiClient` are tightened first; component extraction is limited to boundaries that materially reduce builder rerenders.

## Assumptions

- VERIFIED: PostgreSQL is the Prisma provider (`be/prisma/schema.prisma`).
- VERIFIED: `Card.slug` is already globally unique and child relations cascade from Card.
- VERIFIED: JWT `TokenPayload` already contains `accountId`; `authGuard` exposes the decoded token as `req.user`. Card controllers will read `req.user.accountId` and will not re-run `findFirst({ userId })` in services.
- VERIFIED: seed templates are identified by slug while `Card.templateId` references a CUID; API/UI need an explicit template resolution contract.
- VERIFIED: current frontend and backend production builds pass; backend tests pass. Frontend Vitest currently hangs, so fixing test teardown/open handles is part of the verification gate.
- UNVERIFIED until migration execution: the local database accepts the new nullable `publishedAt` migration without legacy-data repair.

## Approach

### 1. Tracer bullet: real draft lifecycle

1. Add failing backend tests for draft creation with backend-selected FREE plan, real template resolution, two-card limit, and tenant ownership.
2. Add `publishedAt DateTime?` and the migration; keep legacy ACTIVE expiry data unchanged.
3. Replace permissive card payload arrays with typed `PhotoSchema` and `EventSchema`; introduce `DraftCardSchema` that omits `planId` and accepts `templateSlug`.
4. Extend authenticated request context so card controllers receive `accountId`; pass it explicitly through every owner service method.
5. Split `CardService.upsertCard` into focused create/update operations while retaining a shared typed aggregate persistence helper only where the transaction invariant is identical.
6. Resolve FREE plan and template server-side; enforce active/non-premium/category rules and two-card account limit in the create transaction.
7. Add owner `GET /cards/:id` before the public parameterized route and return the persisted aggregate.
8. Run backend tests and build. Stop if account identity cannot be resolved deterministically from the auth token/session.

### 2. Publish, public visibility, expiry, and deletion

1. Add failing tests for DRAFT invisibility, ACTIVE visibility, expiry, first-publish timestamps, non-extension on repeat publish, EXPIRED rejection, cross-tenant rejection, and permanent deletion.
2. Add strict per-category publish schemas that validate the stored Card aggregate rather than trusting a new client copy.
3. Implement account-scoped publish and delete service methods.
4. Filter public slug reads to ACTIVE/unexpired. Mark an expired ACTIVE card EXPIRED without making public reads depend on that mutation succeeding.
5. Add slug-availability endpoint with normalized query schema; retain the database unique constraint as final protection.
6. Add nullable `createIdempotencyKey` to Card with `@@unique([accountId, createIdempotencyKey])`. `POST /cards` requires `Idempotency-Key`; a repeated key for the same account returns the original Card. Publish is naturally idempotent: repeated publish of ACTIVE returns the unchanged expiry and does not extend it.
7. Run backend tests and build.

### 3. Frontend API contract and editor safety

1. Add failing `ApiClient` tests for non-2xx JSON, malformed/non-JSON responses, network errors, and typed field errors.
2. Make `ApiClient` expose a stable discriminated result and never let callers interpret `success: false` as success.
3. Add failing editor tests proving load errors render retry/back and never use `DEMO_CARD`; save errors retain fields and show an error status.
4. Remove runtime demo fallback and switch editor to the owner `GET /cards/:id` endpoint.
5. Remove fake upload routes (`/upload/image`, `/upload/music`) in editor and use supported media endpoints/contracts only.
6. Ensure object URLs are revoked on replacement, deletion, successful upload, and unmount.
7. Fix the existing frontend test hang before proceeding; record the open handle/timer cause in the implementation notes.

### 4. New-card save, autosave, and publish UX

1. Add frontend tests for explicit first draft save, returned `cardId`, debounced PUT autosave, retry after save failure, disabled actions during requests/uploads, and publish-only success navigation/confetti.
2. Replace `planId`/template-ID payload assumptions with `templateSlug` and typed draft payload construction.
3. Introduce explicit save state: `idle | dirty | saving | saved | error`; keep all form state on errors.
4. After first successful POST, update the editor URL to `/dashboard/cards/{cardId}/edit` without losing state; enable debounced autosave there.
5. Add separate `Lưu bản nháp` and `Xuất bản` actions. Publish first flushes pending draft changes, then calls publish; it never displays success from a failed response.
6. Add navigation protection for dirty/failed-save state and an accessible status region.
7. Add slug availability debounce and field-level feedback while keeping submit-time backend validation authoritative.

### 5. Step validation and accessibility

1. Add client-side Zod step schemas matching (but not replacing) backend validation.
2. Gate Next/Publish on the relevant required fields; associate errors using `aria-invalid`, `aria-describedby`, and `role="alert"`; focus the first invalid field.
3. Add `aria-current="step"`, accessible names for icon buttons, `role="status"` for save/publish messages, 44px mobile hit areas, and reduced-motion behavior for confetti/animated scrolling.
4. Remove real banking defaults and expose actual newborn gender/birth-date inputs rather than hard-coded values.

### 6. Performance changes with measurable boundaries

1. Extract category-specific form sections and the preview into memoized components; keep payload construction in typed pure functions covered by unit tests.
2. Debounce the preview model so typing does not rebuild the full invitation tree on every keystroke; retain immediate field feedback in the form.
3. Dynamically load only the active category view if the production bundle report confirms a reduction without causing preview flicker.
4. Change image compression to return a Blob/File and upload that compressed object; remove Base64 fallback.
5. Upload galleries with a concurrency limit of three and preserve per-file success/error state.
6. Use stable image aspect ratios/thumbnails in editor surfaces and migrate eligible local/remote render paths to `next/image` where host configuration supports them.
7. Compare the production route bundle output and record before/after values; do not claim runtime Core Web Vitals without browser measurement.

## Files to Modify

### Database and backend

- `be/prisma/schema.prisma`: add nullable `publishedAt`, nullable `createIdempotencyKey`, and the account-scoped unique constraint.
- `be/prisma/migrations/<timestamp>_free_card_lifecycle/migration.sql`: additive migration only.
- `be/src/middlewares/auth.middleware.ts`: expose deterministic account context.
- `be/src/lib/validators/card/*.ts`: typed draft/publish/event/photo/query schemas.
- `be/src/controllers/card.controller.ts`: explicit create/update/read/publish/delete/slug handlers and safe errors.
- `be/src/services/card.service.ts`: account-scoped lifecycle rules, serializable create, strict publish and public filtering.
- `be/src/routes/api.router.ts`: order static card routes before `/:id` and add missing endpoints.
- `be/tests/card/*.test.ts`: service/controller/schema lifecycle and tenancy regressions.

### Frontend

- `fe/src/lib/api.ts`: discriminated response/error contract.
- `fe/src/lib/image-upload.ts`: Blob compression and supported upload contract.
- `fe/src/types/card.types.ts`: draft, persisted card, field-error and save-state types.
- `fe/src/app/(dashboard)/dashboard/cards/new/page.tsx`: explicit draft/publish, step validation, real IDs, accessibility and integration with extracted modules.
- `fe/src/app/(dashboard)/dashboard/cards/[cardId]/edit/page.tsx`: owner read, no demo fallback, safe save/autosave and upload cleanup.
- `fe/src/components/card-builder/*`: only extracted category steps, preview shell, status and pure payload helpers needed to reduce rerenders.
- `fe/tests/unit/lib/api-client.test.ts`, `fe/tests/unit/card-logic.test.ts`, `fe/tests/components/edit-card-page.test.tsx`, plus focused new-builder tests.

## Error Handling and Recovery

- Create limit conflict: show that two FREE slots are used and link back to card management; never clear the builder.
- Slug conflict: keep all fields, mark slug invalid, suggest editing it, and focus it.
- Network/save failure: retain dirty state, expose retry, prevent false success and navigation.
- Publish validation failure: stay on builder, move to the earliest failing step/field, preserve draft.
- Upload partial failure: retain successful uploads, identify failed files, and allow per-file retry.
- Migration rollback: nullable column can be dropped before code deployment; after code deployment rollback application first, then drop only if no newer code depends on it.

## Risk and Rollout

- Highest risk is changing public visibility: existing DRAFT links will immediately become unavailable. This is intentional and required by the spec.
- Existing ACTIVE cards with `publishedAt = null` retain `expiredAt`; public access relies on ACTIVE plus future expiry.
- Owner endpoint and card route ordering must be tested to prevent `my-cards` or `slug-availability` being captured as an ID.
- Serializable retries are bounded to avoid infinite request latency; exhausted retries return a retryable conflict.
- Feature ships backend-compatible first, then frontend. Do not deploy the new frontend against a backend missing owner reads/create contract.
- No destructive backfill or deletion occurs. Permanent deletion is user-triggered and confirmation-gated.

## Verification

Run from repository root unless a working directory is shown:

1. `npm.cmd test` in `be/` — all existing and new backend tests pass, including concurrent-limit and tenancy cases.
2. `npm.cmd run build` in `be/` — Prisma generation and strict TypeScript compilation exit 0.
3. Apply migration to the local test/development database using the repository's Prisma workflow — migration succeeds and legacy Card rows remain.
4. `npm.cmd test` in `fe/` — all tests finish without hanging and report zero failures.
5. `npm.cmd run build` in `fe/` — Next production build and type checking exit 0.
6. Manual authenticated smoke test: create first/second draft; third rejected; reload owner editor; publish; open public URL; simulate expiry; delete and create replacement.
7. Manual failure smoke test: disconnect API during save/upload/publish; verify fields survive, error is announced, retry works, and no confetti/navigation occurs.
8. Compare Next build route sizes for `/dashboard/cards/new` and `/dashboard/cards/[cardId]/edit` against the baseline 228 kB/227 kB First Load JS recorded on 2026-09-02.
9. `git diff --check` — no whitespace errors.

## STOP Conditions

- Stop if authenticated requests cannot determine exactly one current `accountId`; do not guess with the first membership.
- Stop if migration inspection reveals existing ACTIVE rows whose expiry semantics cannot be preserved additively.
- Stop if FREE plan or template identity differs across environments and cannot be resolved by stable code/slug.
- Stop before adding a new dependency or generic idempotency subsystem; report why existing platform/repository primitives are insufficient.

## Out of Scope

- Payment verification, subscriptions, BASIC/VIP entitlement, premium templates, renewal and expired-card reactivation.
- A full redesign of the builder or invitation views.
- Redis-backed autosave or queue processing; ordinary debounced PUT is sufficient for two FREE cards.
- Measured production Core Web Vitals; only static/build evidence is available in this task.

## Review Notes — 2026-09-02

| Dimension | Before | After | Resolution |
| --- | ---: | ---: | --- |
| Completeness | 4/5 | 5/5 | Added concrete recovery behavior, partial-upload handling, migration rollback and route-order edge cases. |
| Feasibility | 4/5 | 5/5 | Verified PostgreSQL, JWT account context, schema relations, route contracts and established a backend-first tracer bullet. |
| Scope | 4/5 | 5/5 | Kept payments/VIP, redesign, Redis autosave and speculative abstractions out; allowed only measured builder extraction. |
| Testability | 5/5 | 5/5 | Commands, boundary cases, concurrency cases and manual failure checks are explicit. |
| Risk | 4/5 | 5/5 | Added rollout order, legacy ACTIVE compatibility, serializable retry bounds and public-visibility blast radius. |
| Assumptions | 4/5 | 5/5 | Verified account identity comes from JWT and made migration/database validation a stop condition. |

No unresolved planning blockers remain. Implementation must still honor every STOP condition rather than improvising around failed assumptions.
