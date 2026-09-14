---
title: "Phase 1: API Mobile Registration Captcha Bypass Support"
type: phase
parent: "0002-task-mobile-auth-register-otp"
phase: "1"
status: completed
created: "2026-09-13"
tags: [task, phase, api, auth, register, mobile, captcha, supabase]
---

# Phase 1: API Mobile Registration Captcha Bypass Support

## Objective

Ensure `sentinel-api`'s registration endpoint (`POST /auth/register`) correctly recognizes mobile clients via `x-sentinel-client: mobile` (or when `captchaToken` is absent) and registers the user via `supabaseAdmin.auth.signUp(...)`, preventing Cloudflare Turnstile rejection while preserving rate limits and audit logs.

## Dependencies & Prerequisites

- Verified pattern from `AuthService.login` in Task `0001-task-mobile-auth-captcha-remember-and-forgot-password`.
- `app/sentinel-api/src/modules/identity/auth/auth.service.ts`

## Impacted Files & Components

- `app/sentinel-api/src/modules/identity/auth/controller/register.controller.ts`: Pass `c.req.header('x-sentinel-client')` to `AuthService.register`.
- `app/sentinel-api/src/modules/identity/auth/auth.service.ts`: Update `AuthService.register(body: ApiRegisterSchemaType, clientType?: string)` to choose `supabaseAdmin` when `clientType === 'mobile'` or `!hasCaptchaToken`.
- `app/sentinel-api/src/modules/identity/auth/auth.service.test.ts`: Add test coverage for mobile client registration without captchaToken.

## Implementation Tasks

- [x] Task 1.1: Modify `register.controller.ts` to extract `c.req.header('x-sentinel-client')` and pass it to `AuthService.register(body, clientType)`.
- [x] Task 1.2: Update `AuthService.register` in `auth.service.ts` to evaluate `isMobileClient = clientType === 'mobile'` and select `supabaseAdmin` when mobile or `!hasCaptchaToken`.
- [x] Task 1.3: Update unit tests in `auth.service.test.ts` to verify that `supabaseAdmin.auth.signUp` is invoked when `clientType === 'mobile'`.

## Verification & Testing

- Command: `pnpm --filter sentinel-api test src/modules/identity/auth/auth.service.test.ts`
  - Output: `✓ src/modules/identity/auth/auth.service.test.ts (6 tests) 4ms`
  - Result: PASS (6/6 tests passed)
- Files modified:
  - `app/sentinel-api/src/modules/identity/auth/controller/register.controller.ts`
  - `app/sentinel-api/src/modules/identity/auth/auth.service.ts`
  - `app/sentinel-api/src/modules/identity/auth/auth.service.test.ts`

## Risks & Rollback

- **Risk:** Web signups inadvertently bypassing Turnstile if `clientType` is spoofed.
- **Mitigation:** Web client explicitly sends `captchaToken` and does not set `x-sentinel-client: mobile`. Web requests with `captchaToken` continue using `supabaseAnon.auth.signUp`.
