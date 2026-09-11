---
title: "Phase 3: Monorepo CI Unblocking & Automated Verification"
type: phase
parent: "0003-task-registration-captcha-parity-and-deployment-unblock"
phase: "3"
status: completed
created: "2026-09-11"
tags: [task, phase, ci, tests, sentinel-core]
---

# Phase 3: Monorepo CI Unblocking & Automated Verification

## Objective

Fix the failing test assertion in `sentinel-core` that caused the GitHub Actions `CI & Selective Monorepo Verification` workflow on `master` to fail, thereby preventing Railway deployment synchronization.

## Dependencies & Prerequisites

- GitHub Actions workflow `.github/workflows/ci.yml`.
- `app/sentinel-core/src/hooks/use-core-admin-capabilities.test.ts`.

## Impacted Files & Components

- `app/sentinel-core/src/hooks/use-core-admin-capabilities.test.ts`: Updated expected navigation item title from `Identity & Access` to `IAM`.

## Implementation Tasks

- [x] Task 3.1 — Update line 79 in `use-core-admin-capabilities.test.ts` to `expect(itemTitles).toContain('IAM')`.
- [x] Task 3.2 — Run `pnpm --dir app/sentinel-core test src/hooks/use-core-admin-capabilities.test.ts` to confirm 5/5 tests pass.
- [x] Task 3.3 — Execute targeted test runs across `@sentinel/shared`, `@sentinel/hooks`, `sentinel-web`, and `sentinel-core`.

## Verification & Testing

```bash
pnpm --dir packages/shared test && \
pnpm --dir packages/hooks test src/query/auth/use-sign-up-mutation.test.ts && \
pnpm --dir app/sentinel-web test src/app/auth/register src/app/auth/confirm-code && \
pnpm --dir app/sentinel-core test src/hooks/use-core-admin-capabilities.test.ts
```
*Result:* 104 test files passed (446 total tests across affected packages).

## Risks & Rollback

- **Risk:** None; test assertion was simply out of sync with recent navigation UI renaming.
- **Rollback:** Revert assertion string.
