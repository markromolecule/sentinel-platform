---
title: "Phase 4: Automated Tests, Live Probe Verification, and Audit"
type: phase
parent: "0001-task-mobile-auth-captcha-remember-and-forgot-password"
phase: "4"
status: completed
created: "2026-09-13"
tags: [task, phase, verification, testing, audit]
---

# Phase 4: Automated Tests, Live Probe Verification, and Audit

## Objective

Execute automated test suites across all affected packages (`@sentinel/shared`, `@sentinel/hooks`, `sentinel-api`, `sentinel-mobile`), verify that live mobile login succeeds without `(no captcha_token found)`, and conduct an end-to-end audit of all three requirements.

## Dependencies & Prerequisites

- Completion of Phase 1, Phase 2, and Phase 3.

## Impacted Files & Components

- Test suites in `sentinel-api`, `sentinel-mobile`, `packages/shared`, and `packages/hooks`.

## Implementation Tasks

- [x] Task 4.1 — Run unit tests for `REMEMBERED_EMAIL_KEYS` in `packages/shared`.
- [x] Task 4.2 — Run unit tests for `AuthService.login` in `sentinel-api`.
- [x] Task 4.3 — Execute live probe against `AuthService.login` with `clientType: 'mobile'` without `captchaToken` to verify Turnstile bypass and valid Supabase auth processing.
- [x] Task 4.4 — Verify typecheck across affected packages (`tsc --noEmit`).
- [x] Task 4.5 — Validate mobile app bundle compilation via Expo (`npx expo export --platform ios`).

## Verification & Testing

1. **`packages/shared` Unit Tests:**
   - Command: `pnpm --filter @sentinel/shared test`
   - Result: PASS (33/33 test files, 225/225 tests passed including `src/constants/auth.test.ts`).
2. **`sentinel-api` Unit Tests:**
   - Command: `pnpm --filter sentinel-api test src/modules/identity/auth/auth.service.test.ts`
   - Result: PASS (1/1 test file, 3/3 tests passed covering web Turnstile routing, mobile admin fallback, and error handling).
3. **Live Supabase Turnstile Bypass Probe:**
   - Command: `pnpm --filter sentinel-api exec tsx --env-file=...` probing live Supabase endpoints:
     - `supabaseAnon` without captcha token: `captcha protection: request disallowed (no captcha_token found)` (reproduced original error).
     - `AuthService.login` with `clientType: 'mobile'`: `Invalid login credentials` (proves GoTrue Turnstile captcha requirement was successfully bypassed, reaching real Supabase auth).
4. **`sentinel-mobile` Unit Tests:**
   - Command: `pnpm --filter sentinel-mobile test`
   - Result: PASS (44/44 test files, 285/285 tests passed including `lib/auth/remember-me.test.ts`, `lib/auth/forgot-password.test.ts`, and `components/auth/auth-components.test.tsx`).
5. **Expo Health & Bundle Verification:**
   - `pnpm --filter sentinel-mobile exec npx expo-doctor` &mdash; 21/21 checks passed.
   - `pnpm --filter sentinel-mobile exec npx expo export --platform ios` &mdash; Bundled 2,715 modules successfully into Hermes bytecode (`_expo/static/js/ios/...hbc`, 9.6MB) with 0 errors.

## Risks & Rollback

- All changes verified across tests and live probes; zero regressions.

