---
title: "Phase 4: Monorepo Test Suite Validation and Deployment Alignment"
type: phase
parent: "0002-task-registration-captcha-and-confirmation-code-redirect"
phase: "04"
status: completed
created: "2026-09-11"
tags: [task, phase, verification, deployment, testing]
---

# Phase 4: Monorepo Test Suite Validation and Deployment Alignment

## Objective

Run the full selective and monorepo test suites across `@sentinel/shared`, `@sentinel/hooks`, `sentinel-api`, and `sentinel-web` to verify that all schemas, mutations, routes, and UI components compile and pass without regressions. Provide deployment verification instructions for merging and deploying to Railway.

## Dependencies & Prerequisites

- Phases 1, 2, and 3 completed.

## Impacted Files & Components

- Monorepo test suites and typecheck across `packages/shared`, `packages/hooks`, `app/sentinel-api`, and `app/sentinel-web`.

## Implementation Tasks

- [x] **Task 4.1 — Run Shared & Hooks Test Suites:**
  - `node packages/shared/node_modules/vitest/vitest.mjs run packages/shared/src/schema/auth/` (PASS: 14/14 tests)
  - `tsc -p packages/shared/tsconfig.json` (PASS: Clean build)
  - `node packages/shared/node_modules/vitest/vitest.mjs run packages/hooks/src/query/auth/` (PASS: 5/5 tests)
  - `tsc -p packages/hooks/tsconfig.json` (PASS: Clean build)
- [x] **Task 4.2 — Run API Typecheck & Verification:**
  - `node node_modules/typescript/bin/tsc -p app/sentinel-api/tsconfig.json --noEmit` (PASS: Code 0, no type errors)
- [x] **Task 4.3 — Run Web Tests & Route Verification:**
  - `node packages/shared/node_modules/vitest/vitest.mjs run --config app/sentinel-web/vitest.config.ts app/sentinel-web/src/app/auth/` (PASS: 26/26 tests across 8 test suites)
  - `NODE_OPTIONS="--max-old-space-size=4096" node node_modules/typescript/bin/tsc -p app/sentinel-web/tsconfig.json --noEmit` (PASS: 0 auth/proxy errors)
- [x] **Task 4.4 — Railway Backend Deployment Verification:**
  - Ready for merge into `master` or direct deployment to Railway so `https://api.sentinelph.tech` receives the updated `auth.service.ts` forwarding `options: { captchaToken }`.

## Verification & Testing

- All auth test suites green (45/45 tests passing across monorepo packages).
- Type checking across `@sentinel/shared`, `@sentinel/hooks`, `sentinel-api`, and web auth modules passes with 0 errors.

## Risks & Rollback

- **Risk:** Railway deployment out of sync with GitHub.
- **Mitigation:** Verify deployment logs in Railway dashboard verifying commit hash matches `origin/master`.
