---
title: "Phase 2: Dedicated /auth/confirm-code Route and Form Components"
type: phase
parent: "0002-task-registration-captcha-and-confirmation-code-redirect"
phase: "02"
status: completed
created: "2026-09-11"
tags: [task, phase, frontend, confirmation-code, otp, ui]
---

# Phase 2: Dedicated /auth/confirm-code Route and Form Components

## Objective

Build the dedicated confirmation code page at `/auth/confirm-code` in `app/sentinel-web`. The page extracts the student's email from query parameters (`?email=...`), provides an auto-focused 6-digit numeric OTP input with tracking, manages a 60-second resend cooldown timer, verifies the code via `useVerifyOtpMutation`, establishes the Supabase session, and redirects to `/onboarding`.

## Dependencies & Prerequisites

- Phase 1 completed (contracts verified).
- Existing `useVerifyOtpMutation` hook in `@sentinel/hooks`.

## Impacted Files & Components

- [NEW] `app/sentinel-web/src/app/auth/confirm-code/page.tsx`: Route entry point wrapping client content in a React `Suspense` boundary with `ConfirmCodeSkeleton` for safe `useSearchParams()` consumption in Next.js 15.
- [NEW] `app/sentinel-web/src/app/auth/confirm-code/_components/confirm-code-form.tsx`: UI component rendering email icon, instruction text, status/error banners, 6-digit input, submit button, resend trigger, and back-to-register button.
- [NEW] `app/sentinel-web/src/app/auth/confirm-code/_components/confirm-code-form.test.tsx`: Unit tests for form rendering, interactions, cooldown, and error handling.
- [NEW] `app/sentinel-web/src/app/auth/confirm-code/_hooks/use-confirm-code-form/index.ts`: Hook handling OTP input masking/filtering (numbers only, max 6 digits), timer countdown, `verifyOtp` mutation call, session persistence, and router redirection.
- [NEW] `app/sentinel-web/src/app/auth/confirm-code/_hooks/use-confirm-code-form/index.test.tsx`: Unit tests for hook state, input sanitization, OTP verification, and resend.

## Implementation Tasks

- [x] **Task 2.1 — Build `useConfirmCodeForm` Hook:**
  - Read `email` from query string via `useSearchParams()`.
  - Maintain `token` state (sanitized to 6 digits).
  - Call `useVerifyOtpMutation({ onSuccess: async (data) => { if (data.session) await supabase.auth.setSession(...); router.push('/onboarding'); router.refresh(); } })`.
  - Handle resend OTP with 60-second cooldown timer.
- [x] **Task 2.2 — Build `ConfirmCodeForm` Component:**
  - Render dark-themed card (`#131315`, border `white/10`).
  - Monospace 6-digit input (`font-mono text-2xl tracking-[0.4em] text-center h-14`).
  - Error and success alerts with smooth transitions.
  - "Resend code in Xs" button with spinning loader.
  - "Change email address" link navigating to `/auth/register`.
- [x] **Task 2.3 — Build `ConfirmCodePage` Route:**
  - Created `app/sentinel-web/src/app/auth/confirm-code/page.tsx` with Next.js Suspense boundary.
  - Exported standard metadata (title: "Confirm Your Email | Sentinel").

## Verification & Testing

- `node packages/shared/node_modules/vitest/vitest.mjs run --config app/sentinel-web/vitest.config.ts app/sentinel-web/src/app/auth/confirm-code/_hooks/use-confirm-code-form/index.test.tsx`: PASS (5/5 tests passed).
- `node packages/shared/node_modules/vitest/vitest.mjs run --config app/sentinel-web/vitest.config.ts app/sentinel-web/src/app/auth/confirm-code/_components/confirm-code-form.test.tsx`: PASS (3/3 tests passed).
- Total tests passed: 8/8 tests passed.

## Risks & Rollback

- **Risk:** Next.js de-opts to client rendering if `useSearchParams()` is used without a Suspense boundary.
- **Mitigation:** Wrapped the client form in `<Suspense fallback={<ConfirmCodeSkeleton />}>` at the page level.
