---
title: "Phase 3: Registration Redirect Integration and Middleware Proxy Rules"
type: phase
parent: "0002-task-registration-captcha-and-confirmation-code-redirect"
phase: "03"
status: completed
created: "2026-09-11"
tags: [task, phase, frontend, proxy, routing, redirect]
---

# Phase 3: Registration Redirect Integration and Middleware Proxy Rules

## Objective

Connect the registration form directly to the newly created `/auth/confirm-code` route and update `app/sentinel-web/src/proxy.ts` so that students visiting or redirected to `/auth/confirm-code` are not prematurely bounced into `/onboarding` or blocked by RBAC rules.

## Dependencies & Prerequisites

- Phase 2 completed (`/auth/confirm-code` page ready).

## Impacted Files & Components

- [MODIFY] `app/sentinel-web/src/app/auth/register/_hooks/use-register-form/index.ts`: On `signUp` mutation success, unconditionally navigate to `/auth/confirm-code?email=${encodeURIComponent(email)}`.
- [MODIFY] `app/sentinel-web/src/proxy.ts`: Ensure `/auth/confirm-code` is categorized as an auth route and exempted from immediate redirection to `/onboarding`.
- [NEW] `app/sentinel-web/src/app/auth/register/_hooks/use-register-form/index.test.tsx`: Unit tests verifying redirect and token handling.

## Implementation Tasks

- [x] **Task 3.1 — Update `useRegisterForm` Redirection:**
  - Remove direct `router.push('/onboarding')` from `onSuccess`.
  - Replace with `router.push('/auth/confirm-code?email=' + encodeURIComponent(emailToVerify))`.
  - Fixed mutation destructuring to `const { mutate: signUp, isPending: isLoading } = useSignUpMutation(...)`.
- [x] **Task 3.2 — Streamline `RegisterPage` UI & Backward Compatibility:**
  - Verified `RegisterPage` details view and redirection behavior.
  - Added unit test suite `use-register-form/index.test.tsx` verifying route redirection and captcha token propagation.
- [x] **Task 3.3 — Update Middleware Proxy Rules (`proxy.ts`):**
  - Added `const isConfirmCode = pathname.startsWith('/auth/confirm-code');` exemption to `proxy.ts`.
  - Verified unconfirmed students or users with active sessions are permitted on `/auth/confirm-code` without premature bounce to `/onboarding`.

## Verification & Testing

- Manual/Simulated navigation test: Register -> check URL updates to `/auth/confirm-code?email=...`.
- Refresh browser on `/auth/confirm-code?email=...`: verify page remains intact with email displayed.
- Test `proxy.ts` route matching against `/auth/confirm-code`.

## Risks & Rollback

- **Risk:** Existing registered users clicking the link with a stale session might get redirected.
- **Mitigation:** Allow `/auth/confirm-code` as an explicit exemption in `proxy.ts` matching `/auth/callback` and `/auth/update-password`.
