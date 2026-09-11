---
title: "Phase 3 — Registration OTP UI Experience and Cloudflare Turnstile Login Integration"
type: phase
parent: "0001-task-student-onboarding-ui-responsiveness-gmail-otp-and"
phase: "03"
status: completed
created: "2026-09-11"
tags: [task, phase, ui, turnstile, captcha, otp-flow]
---

# Phase 3 — Registration OTP UI Experience and Cloudflare Turnstile Login Integration

## Objective

Deliver the frontend user experience for 2-step registration with in-place 6-digit OTP code entry, and integrate Cloudflare Turnstile CAPTCHA bot protection into the web login form.

## Dependencies & Prerequisites

- Phase 2 schemas, API routes (`/auth/verify-otp`), and hooks completed.
- Cloudflare Turnstile Site Key configured in `app/sentinel-web/.env` (`NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`).

## Impacted Files & Components

- [MODIFY] `app/sentinel-web/src/app/auth/register/_hooks/use-register-form/index.ts`: Manage 2-step registration state (`details` vs `otp`), resend cooldown timer, and verify OTP trigger.
- [NEW] `app/sentinel-web/src/app/auth/register/_components/register-otp-form.tsx`: Dedicated 6-digit OTP input component with digit auto-focusing and resend link.
- [MODIFY] `app/sentinel-web/src/app/auth/register/page.tsx`: Render registration step 1 (personal info + Gmail) or step 2 (OTP code entry).
- [NEW] `packages/ui/src/components/ui/turnstile.tsx`: Turnstile widget wrapper handling script loading, challenge tokens, and expiry/reset events.
- [MODIFY] `app/sentinel-web/src/app/auth/login/_components/login-form.tsx`: Render Turnstile widget above submit button.
- [MODIFY] `app/sentinel-web/src/app/auth/login/_hooks/use-login-form/index.ts`: Store `captchaToken` in state and forward to `login(...)`.

## Implementation Tasks

- [x] **Task 3.1 — Registration 2-Step Form Flow:**
  - In `use-register-form/index.ts`:
    - Track state: `step: 'details' | 'verify'`.
    - Track registered email and cooldown timer (60 seconds).
    - When `signUp` succeeds with `requiresVerification: true` (or `session: null`), transition to `'verify'`.
    - Provide `onVerifyOtp(code: string)` calling `useVerifyOtpMutation`.
    - Provide `onResendOtp()` calling `signUp` again with cooldown reset.
    - Provide `onBackToDetails()` allowing the student to fix a mistyped email address.
- [x] **Task 3.2 — Register OTP Code Input Component:**
  - Build `RegisterOtpForm`:
    - Display message: `"We sent a 6-digit verification code to [student@gmail.com]"`.
    - 6-slot OTP input or formatted single input with character restrictions.
    - Submit button: `"Verify & Continue"`.
    - Resend timer: `"Resend code in 45s"` / `"Resend Code"`.
    - `"Change email"` link returning to step 1.
- [x] **Task 3.3 — Cloudflare Turnstile Component:**
  - Create reusable Turnstile component in `packages/ui/src/components/ui/turnstile.tsx`:
    - Supports `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`.
    - Automatically executes in managed mode.
    - Emits `onVerify(token: string)`, `onError()`, `onExpire()`.
    - Supports dark theme matching Sentinel's aesthetic (`theme="dark"`).
    - Exposes imperative `reset()` method via `forwardRef`.
- [x] **Task 3.4 — Login Form Turnstile Integration:**
  - In `LoginForm` (`app/sentinel-web/src/app/auth/login/_components/login-form.tsx`):
    - Render `<Turnstile onVerify={(token) => form.setValue('captchaToken', token)} ... />`.
    - Pass `captchaToken` into `useLoginForm` submit handler.
    - Reset Turnstile widget on failed login attempts to prevent token reuse.

## Verification & Testing

- **Registration Flow QA:**
  1. Fill form with valid Gmail: `teststudent@gmail.com` + password.
  2. Click Register -> Expect smooth transition to Step 2 (OTP prompt).
  3. Verify Supabase dispatches email with 6-digit code.
  4. Submit valid code -> Expect redirect to `/onboarding`.
  5. Test resend cooldown timer (disabled for 60 seconds, re-enables properly).
- **Login Turnstile QA:**
  1. Navigate to `/auth/login`.
  2. Verify Turnstile widget renders without console errors.
  3. Verify token is generated upon challenge pass.
  4. Submit credentials -> Verify Supabase accepts login with valid captcha token.
  5. Test failed password -> Verify Turnstile resets and allows re-attempt.

## Risks & Rollback

- **Risk:** Cloudflare script blocked by client adblockers (e.g. Brave shields, uBlock Origin).
- **Mitigation:** Display clear diagnostic alert if Turnstile fails to load: `"Security check failed to load. Please disable ad-blockers for this domain and refresh."`
