---
title: "Phase 3: Mobile Forgot Password Screen & Mutation Flow"
type: phase
parent: "0001-task-mobile-auth-captcha-remember-and-forgot-password"
phase: "3"
status: completed
created: "2026-09-13"
tags: [task, phase, mobile, auth, forgot-password, ui]
---

# Phase 3: Mobile Forgot Password Screen & Mutation Flow

## Objective

Create a native mobile password recovery screen (`app/sentinel-mobile/app/(auth)/forgot-password.tsx`) adhering to Sentinel's mobile design system, allowing students to submit their email address to receive a password reset link, and wire navigation from `login.tsx`.

## Dependencies & Prerequisites

- `ForgotPasswordSchema` in `@sentinel/shared/schema`.
- `useForgotPasswordMutation` in `@sentinel/hooks`.

## Impacted Files & Components

- `app/sentinel-mobile/app/(auth)/login.tsx` (MODIFY): Replace `console.log('Forgot password')` with navigation to `/(auth)/forgot-password`.
- `app/sentinel-mobile/app/(auth)/forgot-password.tsx` (NEW): Password recovery screen containing:
  - Curved header matching `login.tsx` with Sentinel logo.
  - Back button navigating back to `/(auth)/login`.
  - Email input field validated with `ForgotPasswordSchema`.
  - Submit button wired to `useForgotPasswordMutation`.
  - Confirmation view upon success ("Check your email", instructions, and "Back to Sign In" button).
  - Error banner displaying any network or Supabase errors.
- `app/sentinel-mobile/app/(auth)/style/forgot-password.ts` (NEW): Stylesheet for the forgot password screen.

## Implementation Tasks

- [x] Task 3.1 — Create stylesheet `app/sentinel-mobile/app/(auth)/style/forgot-password.ts` maintaining design tokens from `login.ts`.
- [x] Task 3.2 — Create `app/sentinel-mobile/app/(auth)/forgot-password.tsx` with React Hook Form, zodResolver, and `useForgotPasswordMutation`.
- [x] Task 3.3 — Implement confirmation screen state after successful submission with clear instructions and return-to-login button.
- [x] Task 3.4 — Update "Forgot password?" link in `app/sentinel-mobile/app/(auth)/login.tsx` to navigate to `/(auth)/forgot-password`.

## Verification & Testing

- Automated unit test suite: `pnpm --filter sentinel-mobile test` (PASS: 44/44 files, 285/285 tests passing).
- Form validation tests in `app/sentinel-mobile/app/(auth)/forgot-password.test.tsx` verifying:
  - Acceptance of valid email addresses.
  - Rejection of empty emails with `Email is required`.
  - Rejection of malformed emails.
  - Valid export of React screen component.
  - Correct formatting of `redirectTo` URL to web password reset handler.
- TypeScript compiler verification: `pnpm --filter sentinel-mobile exec tsc --noEmit` (0 errors).

## Risks & Rollback

- Isolated to new route `/(auth)/forgot-password`. No impact on existing routes.

