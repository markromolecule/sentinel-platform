---
title: "Mobile Registration: Email Verification OTP Screen and Flow"
type: context
status: ready
created: "2026-09-13"
tags: [context, mobile, auth, otp, register, verification, supabase, theme]
feature: "mobile-auth-register-otp"
---

# Mobile Registration: Email Verification OTP Screen and Flow Context Specification

## 1. Overview & Objective

### 1.1 Problem Statement

When a student registers for an account on the Sentinel mobile application (`sentinel-mobile` at `app/(auth)/register.tsx`), `useRegisterForm` executes `signUpMutation.mutate(...)`. Under standard Supabase GoTrue authentication configuration with email verification enabled:

1. **Missing Mobile OTP Screen:** There is currently no screen or route for OTP verification on mobile. On registration success, `useRegisterForm` simply executes `router.replace('/(auth)/login')`. The student receives a 6-digit confirmation code via email, but has nowhere in the mobile app to enter and verify this code.
2. **Web Discrepancy & Parity Gap:** On `sentinel-web`, submitting registration immediately redirects to `/auth/confirm-code?email=...` (or displays `RegisterOtpForm`), offering a focused 6-digit input, resend countdown timer, error/success feedback, and automated session initialization.
3. **Turnstile Captcha Blocker on Registration:** In `sentinel-api`, `AuthService.register` currently calls `supabaseAnon.auth.signUp(...)`. When Cloudflare Turnstile bot protection is enforced project-wide in Supabase GoTrue, mobile requests without `captchaToken` risk failing with `captcha protection: request disallowed (no captcha_token found)`—the exact issue previously encountered on login and resolved in task `0001-task-mobile-auth-captcha-remember-and-forgot-password`.

### 1.2 Business & User Value

- **Unblocked Student Onboarding:** Students who register on iOS/Android can immediately enter their 6-digit verification code, establish a persistent authenticated session, and smoothly transition to onboarding and their classroom.
- **Visual & Interaction Parity:** Delivers a modern, premium mobile experience matching Sentinel's aesthetic: curved `#323d8f` `AuthHeader`, 6 individual rounded PIN cells with active state highlighting, haptic feedback, and clear resend controls.
- **Parity with Sentinel Web:** Mirrors the exact messaging, cooldown constraints (60s), error recovery paths, and support options provided on `sentinel-web` `/auth/confirm-code`.

### 1.3 Success Criteria

1. Submitting the registration form on `sentinel-mobile` redirects the user to dedicated route `app/(auth)/confirm-code.tsx`, carrying `{ email }` as a parameter.
2. The OTP screen renders 6 discrete rounded digit cells matching the mobile design system (`#323d8f` active border, `#f4f4f5` background, `#e4e4e7` border), supporting auto-focus, numeric keypad, digit deletion, and clipboard paste.
3. Once all 6 digits are entered, the app automatically triggers `useVerifyOtpMutation` (with a manual "Verify & Continue" button also available).
4. On successful verification, the Supabase session is established and the user is immediately and strictly redirected to `/(onboarding)` via `router.replace('/(onboarding)')`, clearing the auth back stack.
5. "Resend code" dispatches a fresh OTP via Supabase client, enforces a 60-second cooldown timer, and displays an informative success toast/banner.
6. A "Change email address" link allows the student to return to `/(auth)/register` to correct a mistyped email address.
7. Backend `AuthService.register` accepts `x-sentinel-client: mobile` or absent `captchaToken` and invokes `supabaseAdmin.auth.signUp(...)` without Turnstile rejection.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- **As a registering student on mobile**, I want to be redirected to a dedicated email verification screen immediately after submitting the signup form, so that I understand my account was created and requires code confirmation.
- **As a student with an email OTP code**, I want to enter or paste the 6-digit code into clear, individual digit cells that automatically advance, so that verification is seamless and frictionless.
- **As a student entering the 6th digit**, I want the app to automatically verify the code without requiring an extra button tap, while keeping the button available as a manual fallback.
- **As a student whose code expired or was not delivered**, I want to tap "Resend code" after a 60-second cooldown, so that a fresh code is dispatched to my inbox.
- **As a student who entered an incorrect email during registration**, I want to tap "Change email address" to return to the registration screen and adjust my email address.

### Functional Requirements

- [ ] Register new screen route `app/(auth)/confirm-code.tsx` in `app/(auth)/_layout.tsx`.
- [ ] Create `app/(auth)/hooks/use-confirm-code-form.ts` managing token state, cooldown timer, verify mutation, and resend mutation.
- [ ] Create `app/(auth)/style/confirm-code.ts` defining styling tokens consistent with `login.ts` and `forgot-password.ts`.
- [ ] Implement `components/auth/auth-otp-input.tsx` rendering 6 discrete rounded cells driven by an accessible numeric input supporting paste and auto-focus.
- [ ] Update `app/(auth)/hooks/use-register-form.ts` to navigate to `/(auth)/confirm-code?email=...` on `signUpMutation` success.
- [ ] Configure automatic code verification when `token.length === 6`, with manual "Verify & Continue" `AuthButton` active.
- [ ] Integrate `useVerifyOtpMutation` from `@sentinel/hooks` dispatching to `sentinel-api` `POST /auth/verify-otp`.
- [ ] **Post-OTP Redirection to Onboarding:** Upon successful OTP verification (`useVerifyOtpMutation.onSuccess`), immediately and strictly redirect the student to `/(onboarding)` via `router.replace('/(onboarding)')`, preventing back-navigation to the OTP screen.
- [ ] Implement resend logic with a 60-second countdown timer, disabling the resend trigger while active or in-flight.
- [ ] Render error messages via `AuthErrorAlert` and success notices via green confirmation alerts.
- [ ] Render "Change email address" action returning to `/(auth)/register`.
- [ ] Render support link pointing to `mailto:support@sentinelph.tech`.
- [ ] Update `sentinel-api` `AuthService.register` and `register.controller.ts` to support `x-sentinel-client: mobile` bypassing Turnstile captcha.

### Edge Cases & Failure Modes

- **Invalid / Expired Verification Code:** API returns HTTP 400 with message like `Token has expired or is invalid`. Display in `AuthErrorAlert`, clear the OTP digits, and return focus to the first cell.
- **Missing / Empty Email Parameter:** If the user opens `/(auth)/confirm-code` without an email parameter, render an informative empty state with a button to "Return to Sign Up".
- **Rapid Digit Typing / Rapid Paste:** Ensure paste handler extracts first 6 numeric characters, strips non-digit characters, updates the state cleanly, and triggers verification.
- **Rate Limiting (HTTP 429):** Display friendly throttle notice: "Too many attempts. Please wait a moment before trying again."
- **Network Failure:** Display retry banner while retaining the entered 6 digits so the student does not have to retype.

---

## 3. Technical & Architectural Context

### 3.1 Affected Layers & Components

| Layer / File | Responsibility & Changes |
| :--- | :--- |
| `app/sentinel-mobile/app/(auth)/confirm-code.tsx` | **[NEW]** Native screen rendering `AuthHeader`, email target, 6-digit OTP cells, feedback alerts, verify CTA, resend cooldown, and change email link. |
| `app/sentinel-mobile/app/(auth)/hooks/use-confirm-code-form.ts` | **[NEW]** Custom hook encapsulating token state, cooldown interval, verify mutation, resend dispatch, and navigation. |
| `app/sentinel-mobile/app/(auth)/style/confirm-code.ts` | **[NEW]** StyleSheet tokens matching `login.ts` / `forgot-password.ts`. |
| `app/sentinel-mobile/components/auth/auth-otp-input.tsx` | **[NEW]** 6-box visual PIN input component with active border highlight, auto-focus, and paste handling. |
| `app/sentinel-mobile/components/auth/index.ts` | Export `AuthOtpInput`. |
| `app/sentinel-mobile/app/(auth)/register.tsx` | Ensure `RegisterScreen` coordinates with updated `useRegisterForm`. |
| `app/sentinel-mobile/app/(auth)/hooks/use-register-form.ts` | Change `onSuccess` from `router.replace('/(auth)/login')` to `router.push({ pathname: '/(auth)/confirm-code', params: { email: data.email } })`. |
| `app/sentinel-api/src/modules/identity/auth/auth.service.ts` | Update `AuthService.register(body, clientType)` to use `supabaseAdmin` when `clientType === 'mobile'` or `!hasCaptchaToken`. |
| `app/sentinel-api/src/modules/identity/auth/controller/register.controller.ts` | Pass `c.req.header('x-sentinel-client')` to `AuthService.register`. |

### 3.2 Visual & Theme Tokens

- **Header:** Curved SVG `AuthHeader` (variant="white") with Sentinel logo and back button.
- **Badge:** Circular icon badge (`Ionicons name="mail-open-outline"`, size 36, color `#323d8f`, container background `rgba(50, 61, 143, 0.1)`).
- **Colors:**
  - Primary Accent: `#323d8f` (`Colors.light.primary`)
  - Background: `#ffffff` (`Colors.light.background`)
  - Cell Inactive Border: `#e4e4e7` (`Colors.light.border`)
  - Cell Active Border: `#323d8f` (`Colors.light.primary`) with 2px width
  - Cell Background: `#f4f4f5` (`Colors.light.input`)
  - Text: `#11181C` (`Colors.light.text`)
  - Error: `#ef4444` (`Colors.light.error`)
- **Typography:**
  - Title: 22px bold (`Typography.weight.bold`, `Colors.light.text`)
  - Subtitle: 14px regular (`Colors.light.icon`), with email bolded
  - Cell Digits: 24px bold monospace (`Fonts.mono` / `SF Pro Rounded`)

---

## 4. Scope & Boundaries

### In Scope

- Creation of `app/(auth)/confirm-code.tsx` and accompanying hook, styles, and 6-cell input component.
- Updating `useRegisterForm` to route to `confirm-code` on registration success.
- 6-digit OTP verification via `useVerifyOtpMutation` and navigation to `/(onboarding)`.
- Resend code mechanism with 60s cooldown timer.
- Backend mobile registration Turnstile bypass via `supabaseAdmin` in `sentinel-api`.
- Comprehensive Vitest unit tests for the new hook, OTP component, and registration routing.

### Out of Scope / Non-Goals

- In-app password recovery OTP screen (mobile password recovery sends a web reset link to `/auth/update-password`, as established in ADR and Task 0001).
- Phone / SMS verification (Sentinel is an email-first institutional platform).
- Modifying core registration fields (first name, last name, email, password remain standard).

---

## 5. Grilling & Decision Ledger

| ID | Decision Item | Status | Resolved Choice | Rationale & Architectural Contract |
| :--- | :--- | :--- | :--- | :--- |
| **D1** | **Screen Architecture: Dedicated Route vs Inline Step** | **RESOLVED** | **Dedicated Route `app/(auth)/confirm-code.tsx`** | Clean route separation matching `sentinel-web`'s `/auth/confirm-code` and mobile's `forgot-password.tsx`. Supports deep-linking, direct return to verification, and natural back-navigation. Upon successful registration, `useRegisterForm` executes `router.push({ pathname: '/(auth)/confirm-code', params: { email: data.email } })`. |
| **D2** | **OTP Input Pattern: 6 Visual Cells vs Single Input** | **RESOLVED** | **6 Discrete Rounded Digit Cells (Hidden TextInput pattern)** | Premium native mobile aesthetic with 6 individual rounded boxes (`#f4f4f5` background, `#e4e4e7` inactive border, `#323d8f` active border highlight), smooth focus feedback, full iOS/Android numeric keypad support, paste handling, and SMS/clipboard autofill. |
| **D3** | **Submission Behavior on 6th Digit** | **RESOLVED** | **Auto-verify on complete 6 digits + manual button fallback** | Automatically trigger verification when the 6th digit is typed for a frictionless native UX, while also keeping the manual "Verify & Continue" button visible and active. |
| **D4** | **Mobile Registration Captcha Parity** | **RESOLVED** | **Backend Mobile Client Bypass via `supabaseAdmin`** | In `sentinel-api`, when a registration request has `x-sentinel-client: mobile` or lacks `captchaToken`, authenticate via `supabaseAdmin.auth.signUp(...)` to prevent Cloudflare Turnstile rejection (`captcha protection: request disallowed (no captcha_token found)`). Preserves full rate limiting and audit logging. |
| **D5** | **Resend Cooldown Duration** | **RESOLVED** | **60 Seconds Cooldown Timer** | Matches `sentinel-web`'s `/auth/confirm-code` standard 60-second cooldown with live seconds decrement, preventing mail flood abuse while giving students transparent feedback. |
| **D6** | **Post-Verification Navigation Destination** | **RESOLVED** | **Direct Redirection to `/(onboarding)`** | Upon successful OTP verification, `useConfirmCodeForm` immediately invokes `router.replace('/(onboarding)')`. Students are guided straight into profile setup and onboarding steps. The navigation history is replaced so pressing the hardware/gesture back button does not return to the OTP screen. |

---

## 6. Scenario Coverage & Acceptance Matrix

| Scenario ID | Actor Journey | Preconditions | Expected Outcome | Failure / Fallback Mode |
| :--- | :--- | :--- | :--- | :--- |
| **SC-01** | Student submits valid registration form | Valid details on `register.tsx` | Mobile dispatches `signUpMutation`, passes `x-sentinel-client: mobile`, backend registers user, app navigates to `/(auth)/confirm-code?email=student@example.com`. | Error alert displayed on register screen. |
| **SC-02** | Student views OTP verification screen | Navigated to `confirm-code` | Screen shows `AuthHeader`, mail badge, "Check your inbox", email bolded, 6 empty cells, disabled "Verify & Continue" button, and resend cooldown. | If email missing in params, prompt to return to register. |
| **SC-03** | Student enters 6-digit code | OTP screen active | Digits fill cells sequentially with active border highlight. Upon 6th digit entered, auto-submits via `useVerifyOtpMutation`. | Invalid code shows red alert; digits cleared. |
| **SC-04** | Student pastes 6-digit code from clipboard | Copied 6-digit number | All 6 cells populate simultaneously, keyboard remains responsive, auto-verifies. | Non-numeric characters stripped automatically. |
| **SC-05** | Successful OTP verification | Valid 6-digit code entered | Session set in Supabase client, app strictly routes student to `/(onboarding)` via `router.replace('/(onboarding)')`. | If verification fails, error alert is displayed. |
| **SC-06** | Student requests code resend | 60s cooldown elapsed | Tapping "Resend code" dispatches new OTP, resets cooldown to 60s, displays green banner: "A fresh verification code has been dispatched." | Error banner shown if resend fails. |
| **SC-07** | Student taps "Change email address" | On OTP screen | Navigates back to `/(auth)/register`. | N/A |

---

## 7. References & External Context

- Web confirm code reference: `app/sentinel-web/src/app/auth/confirm-code/`
- Web register OTP form: `app/sentinel-web/src/app/auth/register/_components/register-otp-form.tsx`
- Shared schema: `packages/shared/src/schema/auth/verify-otp-schema.ts`
- Query hook: `packages/hooks/src/query/auth/use-verify-otp-mutation.ts`
- Previous task: `docs/tasks/2026/09/2026-09-13/0001-task-mobile-auth-captcha-remember-and-forgot-password/`
