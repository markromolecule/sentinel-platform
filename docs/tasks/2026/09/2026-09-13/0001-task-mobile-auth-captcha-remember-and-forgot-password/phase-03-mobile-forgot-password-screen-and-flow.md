---
title: "Phase 3: Mobile Forgot Password Screen & Mutation Flow"
type: phase
parent: "0001-task-mobile-auth-captcha-remember-and-forgot-password"
phase: "3"
status: planned
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

- [ ] Task 3.1 — Create stylesheet `app/sentinel-mobile/app/(auth)/style/forgot-password.ts` maintaining design tokens from `login.ts`.
- [ ] Task 3.2 — Create `app/sentinel-mobile/app/(auth)/forgot-password.tsx` with React Hook Form, zodResolver, and `useForgotPasswordMutation`.
- [ ] Task 3.3 — Implement confirmation screen state after successful submission with clear instructions and return-to-login button.
- [ ] Task 3.4 — Update "Forgot password?" link in `app/sentinel-mobile/app/(auth)/login.tsx` to navigate to `/(auth)/forgot-password`.

## Verification & Testing

- Verify form validation prevents submission with empty or invalid email.
- Verify successful submission transitions to the confirmation state.
- Verify back button navigates back to `login.tsx`.

## Risks & Rollback

- Isolated to new route `/(auth)/forgot-password`. No impact on existing routes.
