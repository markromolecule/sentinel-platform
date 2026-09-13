---
title: "Phase 3: Mobile Confirm Code Screen, Hook, and Styling"
type: phase
parent: "0002-task-mobile-auth-register-otp"
phase: "3"
status: completed
created: "2026-09-13"
tags: [task, phase, mobile, auth, otp, confirm-code, screen, hook, onboarding]
---

# Phase 3: Mobile Confirm Code Screen, Hook, and Styling

## Objective

Build the native `app/(auth)/confirm-code.tsx` screen, custom hook `useConfirmCodeForm`, and StyleSheet `confirm-code.ts`, implementing 6-digit OTP verification via `useVerifyOtpMutation`, 60-second resend cooldown timer, and strict redirection to `/(onboarding)` upon successful verification.

## Dependencies & Prerequisites

- Phase 2: `AuthOtpInput` component available.
- `@sentinel/hooks`: `useVerifyOtpMutation` and `useAuth`.

## Impacted Files & Components

- `app/sentinel-mobile/app/(auth)/style/confirm-code.ts`: **[NEW]** Styling tokens matching mobile auth system.
- `app/sentinel-mobile/app/(auth)/hooks/use-confirm-code-form.ts`: **[NEW]** Form state, cooldown timer, auto-submit on 6th digit, and verify/resend mutations.
- `app/sentinel-mobile/app/(auth)/confirm-code.tsx`: **[NEW]** Native screen implementation.
- `app/sentinel-mobile/lib/auth/confirm-code.test.ts`: **[NEW]** Vitest unit tests for the hook and business logic.

## Implementation Tasks

- [x] Task 3.1: Create `app/(auth)/style/confirm-code.ts` with layout, typography, iconCircle, emailHighlight, resendTimer, and button styles.
- [x] Task 3.2: Create `useConfirmCodeForm` hook:
  - Read `email` from `useLocalSearchParams<{ email?: string }>()`.
  - Maintain `token` (up to 6 digits).
  - Cooldown timer state initialized to 60s with interval decrement.
  - Integrate `useVerifyOtpMutation`:
    - On success: execute `router.replace('/(onboarding)')` strictly as specified.
    - On error: set `verifyError` string, reset token, and allow re-entry.
  - Auto-trigger verification via `useEffect` as soon as `token.length === 6` and not already verifying.
  - Implement `handleResend`: call `supabase.auth.resend({ type: 'signup', email })`, reset cooldown to 60s, show success message.
- [x] Task 3.3: Implement `app/(auth)/confirm-code.tsx`:
  - Render `AuthHeader` (variant="white", `showBack={true}`, `onBackPress={handleBackToRegister}`).
  - Render Mail badge (`Ionicons name="mail-open-outline"`, size 36).
  - Render title "Check your inbox" and subtitle with bolded student email.
  - Render `AuthOtpInput`.
  - Render `AuthErrorAlert` and success confirmation message banner.
  - Render `AuthButton` ("Verify & Continue") with loading state.
  - Render "Change email address" link returning to `/(auth)/register`.
  - Render "Resend code" with countdown timer ("Resend code in Xs").
  - Render support footer contacting `support@sentinelph.tech`.
- [x] Task 3.4: Write comprehensive unit tests in `lib/auth/confirm-code.test.ts` covering token changes, auto-submit, cooldown countdown, and onboarding routing.

## Verification & Testing

- Run `pnpm --filter sentinel-mobile test lib/auth/confirm-code.test.ts`
- Verify that `router.replace('/(onboarding)')` is called upon verification success.

## Risks & Rollback

- **Risk:** User closing the app during verification or navigating without email parameter.
- **Mitigation:** Fallback UI prompting the user to return to sign up if email param is missing.
