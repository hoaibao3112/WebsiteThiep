# Automatic tests and PR review

## Context
The backend workflow only covers selected branches and paths. Both `be` and `fe`
already expose non-watch Vitest commands and have npm lockfiles. Frontend has no CI.

## Approach
1. Run backend checks on every branch push, PR open/update/reopen, and manual dispatch.
2. Add frontend tests and production build with Node 22 and `npm ci`.
3. Cancel superseded runs per workflow/event/ref; keep tokens read-only for tests.
4. Configure Claude automatic PR review, matching the supplied Anthropic stack by
   default; require `ANTHROPIC_API_KEY`, post Vietnamese feedback, skip forks/Dependabot.
5. Document activation, credentials, fork behavior, and required checks.

## Scope and risk
Keep existing application architecture and tests. No deployments, auto-merges, or
production database access. Existing PostgreSQL/Redis CI services remain isolated.
AI review requires a configured provider; never execute fork code with repository
secrets through `pull_request_target`. Missing credentials must be visible.
GitHub workflows observe pushed commits, not local-only commits.

## Verification
- Run `npm test` in `be` and `fe` and backend `npm run test:integration`.
- Run production builds for both packages.
- Validate workflow YAML and GitHub Actions expressions with actionlint if available.
- Inspect the final diff for triggers, permissions, concurrency, and secret exposure.
- Remote activation is verified only after workflows are pushed and GitHub runs them.

## Plan review (2026-09-30)
Completeness: tests and review triggers covered; missing API key fails explicitly.
Feasibility: scripts and lockfiles verified; remote credentials unverified.
Scope: workflow configuration and operating documentation only.
Testability: local commands plus workflow validation and remote smoke-test instructions.
Risk: isolated CI services, least permissions, no deployment changes.
Assumptions: GitHub Actions enabled; provider credentials require repository setup.

## Verification results
- All three workflows pass actionlint; `git diff --check` passes.
- Backend: 209 unit tests and 8 integration-contract tests pass; TypeScript passes.
- Backend full build is blocked locally by EPERM replacing the Prisma Windows DLL
  while an existing backend development process is running. Do not stop user services.
- Frontend production build passes. Initial runs under concurrent build load had
  worker/render timeouts. The affected file passes alone (4 tests); the final full
  run with two workers passes all 107 tests across 20 files in 22.84s. CI now uses
  the same two-worker command. No application/test code changed.
- Claude uses the official GitHub App authentication flow; installation and
  ANTHROPIC_API_KEY setup remain external prerequisites. No remote run claimed.
