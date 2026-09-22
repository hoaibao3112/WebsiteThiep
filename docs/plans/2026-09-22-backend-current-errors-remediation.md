# Backend Current Errors Remediation

## Context

The 2026-09-21 security remediation is largely present and the current backend baseline is green: 62 Vitest tests pass, `tsc --noEmit` exits 0, and `prisma validate` succeeds. This delta fixes the remaining verified runtime and boundary defects without migrating the Express API or reopening completed remediation work.

## Approach

1. Add a browser-facing CORS regression around the payment polling contract, then allow `X-Polling-Token` in the existing exact-origin CORS configuration. This is the tracer bullet because the frontend already sends that header and the browser preflight currently rejects it.
2. Add controller/service regressions for expected business failures, then replace generic `Error` values on touched card/order paths with `HttpError` status/code contracts. Preserve the centralized generic-500 fallback for unexpected failures.
3. Add tenancy regressions for the remaining tenant-owned mutations/child reads in touched card/order paths. Carry the resolved `accountId` into updates and nested relation filters; keep `Plan`, `Template`, provider transaction IDs, order codes, and poll tokens documented as global selectors.
4. Replace `catch (error: any)` with `unknown` only in the touched card/order controllers. Do not perform a repository-wide controller rewrite in this patch.

## Key decisions

- Keep the existing Express/Prisma structure. Framework migration is unrelated to the confirmed bugs.
- Treat public root resolution by globally unique card/order identifiers as a lookup step; every subsequent tenant-owned child query or mutation must use the resolved `accountId`.
- Accept two sequential card reads on the public slug path: the first resolves the globally unique slug to `{ id, accountId }`, and the second rechecks public eligibility while loading account-scoped children. A one-query correlated tenant filter would require raw SQL, RLS, or a schema/view change outside this bugfix.
- Use the existing `HttpError` and `errorHandler` instead of adding another exception hierarchy.
- Preserve response payload shapes consumed by the frontend.
- Do not fix the Vite CommonJS/ESM warning in this patch; it is a future compatibility warning, not a current backend runtime failure.

## Files to modify

### CORS payment polling

- `be/src/server.ts`: expose the Express app/configuration without changing runtime startup semantics as needed for a real preflight test, and add `X-Polling-Token` to allowed request headers.
- `be/tests/auth/security.test.ts` or a focused infrastructure test: assert an allowed-origin OPTIONS request with `X-Polling-Token` succeeds and returns the header in `Access-Control-Allow-Headers`.

### Typed business errors

- `be/src/services/card.service.ts`: map not-found, invalid state, entitlement/limit, and idempotency conflicts on touched flows to explicit `HttpError` values.
- `be/src/services/order.service.ts`: map missing card/plan, free-plan misuse, idempotency conflict, and missing payment configuration to explicit `HttpError` values.
- `be/src/controllers/card.controller.ts`, `be/src/controllers/order.controller.ts`: use `unknown` catches and delegate non-Zod failures to the centralized handler.
- Tests under `be/tests/card/`, `be/tests/order/`, and `be/tests/infrastructure/`: assert stable 4xx status/code behavior and retain sanitized unexpected 500 behavior.

### Tenant isolation

- `be/src/services/card.service.ts`: include the resolved `accountId` in view-count mutation and tenant-owned nested relation filters.
- `be/src/services/order.service.ts`: include the resolved `accountId` in tenant-owned mutation/read paths after global webhook/order lookup.
- Focused service tests: assert account A identifiers cannot mutate account B data and the emitted Prisma filters contain `accountId`.

## Out of scope

- Express-to-Next.js migration: too broad and unrelated to the reproduced defects.
- Repository-wide removal of every existing `any`: deferred to a dedicated typed-controller cleanup.
- Prisma schema redesign with composite foreign keys: requires a data audit and migration plan; this patch enforces application queries only.
- Vitest/Vite ESM conversion: warning-only and potentially touches package/module loading globally.
- Frontend visual or behavioral changes: the frontend already sends the intended polling header.

## Risks and mitigations

- Changing error classes can alter status codes. Mitigation: preserve messages/payload shape and add controller/error-middleware regressions for each mapped class.
- Adding tenant filters can make corrupted cross-account rows invisible. This is desired fail-closed behavior; no automatic data repair is attempted.
- Importing the HTTP app in tests must not open a listening socket. If current startup coupling blocks the preflight test, extract only an app factory and keep `server.ts` as the sole listener entrypoint.
- Prisma compound/global selectors cannot always include `accountId`. Resolve the global row first, then require its `accountId` for every tenant mutation; stop if a mutation cannot be scoped this way.

## Assumptions

- Verified: frontend billing sends `X-Polling-Token` (`fe/src/app/(dashboard)/dashboard/billing/page.tsx`).
- Verified: backend CORS currently omits that header (`be/src/server.ts`).
- Verified: `HttpError` and a safe centralized error handler already exist.
- Verified: baseline is 19 test files / 62 tests passing; TypeScript and Prisma validation pass.
- Assumed: `Plan` and `Template` are global catalogs, consistent with the approved 2026-09-21 design.

## STOP conditions

- Stop if a required change needs a database migration or production-data rewrite; produce a separate migration plan.
- Stop if frontend behavior requires changing response contracts rather than only enabling the existing header.
- Stop if a public/global selector cannot be followed by an account-scoped tenant mutation.

## Verification

1. `npm.cmd test -- --reporter=verbose` from `be/` — all old and new tests pass; the new CORS, error-status, and tenancy regressions are listed.
2. `npx.cmd tsc --noEmit` from `be/` — exit 0 with no TypeScript diagnostics.
3. `npx.cmd prisma validate` from `be/` — schema remains valid.
4. `npm.cmd run build` from `be/` — Prisma generation and TypeScript build exit 0.
5. `git diff --check` from repository root — no whitespace errors.

## Plan review

| Dimension | Score | Rationale |
| --- | ---: | --- |
| Completeness | 5/5 | Covers confirmed behavior, failure mapping, tenancy, edge cases, and explicit stop conditions. |
| Feasibility | 5/5 | Reuses existing CORS, `HttpError`, middleware, Prisma, and Vitest patterns; no new dependency. |
| Scope | 5/5 | Limits work to current runtime/security defects and explicitly defers migration and warning-only cleanup. |
| Testability | 5/5 | Requires failing regressions first and names exact verification commands/results. |
| Risk | 5/5 | Identifies API-status, tenant-data, startup-coupling, and selector risks with mitigations. |
| Assumptions | 5/5 | Load-bearing claims were verified in source and invalidation conditions are explicit. |

Review date: 2026-09-22. No unresolved blocker remains.

## Execution notes

- Implemented with test-first regressions for payment CORS preflight, typed business errors, account-scoped public card reads/mutations, public-eligibility race protection, serialization retry exhaustion, and concurrent idempotency-key creation.
- Final backend suite: 19 files / 72 tests passed.
- `npx.cmd tsc --noEmit`, `npx.cmd prisma validate`, and `git diff --check` passed.
- `npm.cmd run build` reached `prisma generate` but was blocked twice by the pre-existing Windows query-engine DLL lock (`EPERM` rename under `be/node_modules/.prisma/client`). TypeScript compilation was verified separately; no process was terminated automatically.
