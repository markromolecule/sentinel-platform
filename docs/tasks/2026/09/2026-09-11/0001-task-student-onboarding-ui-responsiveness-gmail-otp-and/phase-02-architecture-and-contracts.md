---
title: "Phase 2 — Registration Schema Validation and Supabase Email OTP Architecture"
type: phase
parent: "0001-task-student-onboarding-ui-responsiveness-gmail-otp-and"
phase: "02"
status: completed
created: "2026-09-11"
tags: [task, phase, auth, contracts, schemas, otp]
---

# Phase 2 — Registration Schema Validation and Supabase Email OTP Architecture

## Objective

Strengthen student registration validation by strictly restricting email domains to `@gmail.com` (and approved institutional domains), eliminating auto-confirm bypass in `sentinel-api`, and building the Supabase 6-digit email OTP verification backend pipeline.

## Dependencies & Prerequisites

- ADR accepted: `docs/decisions/2026-09-11-auth-email-verification-otp-and-cloudflare-turnstile.md` (Option 2: Sentinel API Proxy Orchestration with Native Supabase Auth & Turnstile).
- Phase 1 UI stabilization completed.

## Impacted Files & Components

- [MODIFY] `packages/shared/src/schema/auth/register-schema.ts`: Enforce strict Gmail/institutional domain validation and normalization.
- [NEW] `packages/shared/src/schema/auth/verify-otp-schema.ts`: Define `VerifyOtpSchema` and TypeScript types.
- [NEW] `packages/shared/src/schema/auth/register-schema.test.ts`: Unit tests for domain validation.
- [NEW] `packages/shared/src/schema/auth/verify-otp-schema.test.ts`: Unit tests for 6-digit OTP code validation.
- [MODIFY] `packages/shared/src/schema/index.ts`: Re-export `VerifyOtpSchema` and types.
- [MODIFY] `packages/shared/src/schema/auth/login-schema.ts`: Extend `LoginSchema` with optional `captchaToken?: string`.
- [MODIFY] `app/sentinel-api/src/modules/identity/auth/auth.service.ts`: Update `register()` to trigger Supabase native email confirmation without auto-confirm; implement `verifyOtp()`; update `login()` to pass `captchaToken`.
- [MODIFY] `app/sentinel-api/src/modules/identity/auth/auth.controller.ts`: Expose `/auth/verify-otp` route and handler with audit logging.
- [MODIFY] `app/sentinel-api/src/modules/identity/auth/auth.routes.ts`: Register `/auth/verify-otp` and add rate limiter.
- [NEW] `packages/hooks/src/query/auth/use-verify-otp-mutation.ts`: React Query mutation for submitting 6-digit OTP codes.
- [MODIFY] `packages/hooks/src/query/auth/use-sign-up-mutation.ts`: Add `requiresVerification?: boolean` to `SignUpResponse`.
- [MODIFY] `packages/hooks/src/query/auth/use-login-mutation.ts`: Forward `captchaToken` in request payload.
- [MODIFY] `packages/hooks/src/query/index.ts`: Re-export `useVerifyOtpMutation`.

## Implementation Tasks

- [x] **Task 2.1 — Strict Email Schema Validation:** Updated `RegisterSchema` and `ApiRegisterSchema` in `@sentinel/shared` with lowercase trimming and regex pattern validating `@gmail.com` and accredited institutional `.edu`/`.edu.ph` domains.
- [x] **Task 2.2 — Define Verify OTP Schema:** Created `verify-otp-schema.ts` in `packages/shared/src/schema/auth/` validating 6-digit numeric token and email.
- [x] **Task 2.3 — Add Captcha Token to Login Schema:** Extended `LoginSchema` with `captchaToken: z.string().optional()`.
- [x] **Task 2.4 — Update Sentinel API Auth Service:**
  - In `AuthService.register()`: Replaced `createUser({ email_confirm: true })` with `supabaseAnon.auth.signUp(...)` to trigger native Supabase OTP code dispatch.
  - In `AuthService.verifyOtp()`: Added handler calling `supabaseAnon.auth.verifyOtp(...)`.
  - In `AuthService.login()`: Added forwarding of `credentials.captchaToken` to `supabaseAnon.auth.signInWithPassword`.
- [x] **Task 2.5 — Add Verify OTP Endpoint in Sentinel API:** Added `verifyOtpRoute` and `verifyOtpHandler` in `auth.controller.ts` with audit logging, and applied rate limiting in `auth.routes.ts`.
- [x] **Task 2.6 — Add Client Hook for OTP Verification:** Created `useVerifyOtpMutation` in `packages/hooks/src/query/auth/use-verify-otp-mutation.ts`, synchronized session upon success, and updated `useSignUpMutation` and `useLoginMutation`.

## Verification & Testing

- **Schema Unit Tests (Vitest):**
  `node packages/shared/node_modules/vitest/vitest.mjs run packages/shared/src/schema/auth/register-schema.test.ts packages/shared/src/schema/auth/verify-otp-schema.test.ts` (PASS: 2 test files, 9/9 tests passed)
- **TypeScript Typecheck (`packages/shared`):**
  `./node_modules/.bin/tsc --noEmit -p packages/shared/tsconfig.json` (PASS: Code 0)
- **TypeScript Typecheck (`app/sentinel-api`):**
  `./node_modules/.bin/tsc --noEmit -p app/sentinel-api/tsconfig.json` (PASS: Code 0)
- **TypeScript Typecheck (`packages/hooks`):**
  `./node_modules/.bin/tsc --noEmit -p packages/hooks/tsconfig.json` (PASS: Code 0)

## Risks & Rollback

- Existing active users remain unaffected since `LoginSchema` retains standard email validation and `captchaToken` is optional.
- If necessary, auto-confirm behavior can be restored in `auth.service.ts` by reverting commit.
