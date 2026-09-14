---
title: "Phase 4: Registration Navigation Wiring, Tests, and Validation"
type: phase
parent: "0002-task-mobile-auth-register-otp"
phase: "4"
status: completed
created: "2026-09-13"
tags: [task, phase, mobile, auth, navigation, verification, audit]
---

# Phase 4: Registration Navigation Wiring, Tests, and Validation

## Objective

Wire navigation from `RegisterScreen` (`register.tsx` and `useRegisterForm`) to the new `/(auth)/confirm-code` route passing the registered email, and execute full monorepo verification including unit test suites, TypeScript type checks, and Expo iOS Hermes bundling audits.

## Dependencies & Prerequisites

- Phase 1: API registration bypass ready.
- Phase 2: `AuthOtpInput` ready.
- Phase 3: `confirm-code.tsx` ready.

## Impacted Files & Components

- `app/sentinel-mobile/app/(auth)/hooks/use-register-form.ts`: Update `onSuccess` in `signUpMutation` to route to `/(auth)/confirm-code?email=...`.
- `app/sentinel-mobile/app/(auth)/register.tsx`: Ensure clean navigation coordinate with form.
- `app/sentinel-mobile/app/(auth)/_layout.tsx`: Ensure `confirm-code` is registered in stack.
- `app/sentinel-mobile/lib/auth/register-flow.test.ts`: **[NEW]** Test verifying registration dispatches and navigates to confirm-code.

## Implementation Tasks

- [x] Task 4.1: Update `app/(auth)/hooks/use-register-form.ts`:
  - On `signUpMutation.onSuccess`:
    - Read registered email: `const email = form.getValues('email') || (data.user as any)?.email;`
    - Navigate to `/(auth)/confirm-code`: `router.push({ pathname: '/(auth)/confirm-code', params: { email } });`
- [x] Task 4.2: Update or add unit tests for `useRegisterForm` verifying the new redirect path to `confirm-code`.
- [x] Task 4.3: Run full automated verification across packages:
  - `pnpm --filter sentinel-api test src/modules/identity/auth/auth.service.test.ts`
  - `pnpm --filter sentinel-mobile test`
  - `pnpm --filter sentinel-mobile exec tsc --noEmit`
- [x] Task 4.4: Run Expo Hermes export dry-run: `npx expo export --platform ios` to verify 0 bundling regressions.

## Verification & Testing

- Automated test passing on `sentinel-api` and `sentinel-mobile`.
- TypeScript clean compilation with 0 diagnostics.
- Expo export passing with all modules compiled into Hermes bytecode.

## Risks & Rollback

- **Risk:** Deep link or navigation transition error if route name does not match file path.
- **Mitigation:** Expo Router file-based routing ensures `app/(auth)/confirm-code.tsx` automatically resolves to `/(auth)/confirm-code`.
