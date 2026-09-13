---
title: "Phase 2: Mobile Remember Me Persistence with AsyncStorage"
type: phase
parent: "0001-task-mobile-auth-captcha-remember-and-forgot-password"
phase: "2"
status: completed
created: "2026-09-13"
tags: [task, phase, mobile, auth, storage, remember-me]
---

# Phase 2: Mobile Remember Me Persistence with AsyncStorage

## Objective

Standardize the "Remember Me" email persistence behavior in `sentinel-mobile` using `@react-native-async-storage/async-storage`, bringing it into strict alignment with `sentinel-web`, `sentinel-core`, and `sentinel-support`.

## Dependencies & Prerequisites

- `@react-native-async-storage/async-storage` installed in `app/sentinel-mobile`.

## Impacted Files & Components

- `packages/shared/src/constants/auth.ts` (MODIFY): Added `MOBILE: 'sentinel_remembered_email_mobile'` to `REMEMBERED_EMAIL_KEYS`.
- `packages/shared/src/constants/auth.test.ts` (NEW): Unit tests verifying all platform storage keys in `REMEMBERED_EMAIL_KEYS`.
- `app/sentinel-mobile/lib/auth/remember-me.ts` (NEW): Modular storage helper encapsulating `getRememberedEmail`, `setRememberedEmail`, and `clearRememberedEmail`.
- `app/sentinel-mobile/lib/auth/remember-me.test.ts` (NEW): Unit tests verifying retrieval, saving, and deletion from `AsyncStorage`.
- `app/sentinel-mobile/app/(auth)/login.tsx` (MODIFY):
  - On mount (`useEffect`), loads saved email via `getRememberedEmail()`, sets `email` and sets `remember: true`.
  - On submit (`onSubmit`), invokes `setRememberedEmail(data.email)` if `remember` is true, or `clearRememberedEmail()` if false.

## Implementation Tasks

- [x] Task 2.1 — Add `MOBILE: 'sentinel_remembered_email_mobile'` to `REMEMBERED_EMAIL_KEYS` in `packages/shared/src/constants/auth.ts`.
- [x] Task 2.2 — Import `getRememberedEmail`, `setRememberedEmail`, and `clearRememberedEmail` in `app/sentinel-mobile/app/(auth)/login.tsx`.
- [x] Task 2.3 — Implement mount `useEffect` to retrieve remembered email and initialize form state (`email` and `remember`).
- [x] Task 2.4 — Wire submit handler to save or remove `REMEMBERED_EMAIL_KEYS.MOBILE` based on switch state.

## Verification & Testing

- `pnpm --filter @sentinel/shared test src/constants/auth.test.ts` (PASS: 1/1 passed).
- `pnpm --filter sentinel-mobile test lib/auth/remember-me.test.ts` (PASS: 4/4 passed).
- `pnpm --filter sentinel-mobile test` (PASS: 42/42 files, 269/269 tests passed).

## Risks & Rollback

- Zero risk: Only stores email address in device-local `AsyncStorage`, never raw passwords or tokens.
