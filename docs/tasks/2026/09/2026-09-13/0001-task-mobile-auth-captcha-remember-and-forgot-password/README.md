---
title: "Task: Mobile Authentication Captcha Resolution, Remember Me Persistence, and Forgot Password Screen"
type: task
status: completed
created: "2026-09-13"
tags: [task, mobile, auth, captcha, turnstile, remember-me, forgot-password, supabase]
---

# Task: Mobile Authentication Captcha Resolution, Remember Me Persistence, and Forgot Password Screen

## Outcome

Enable seamless, unblocked login for students on `sentinel-mobile` by handling captcha bypass through `sentinel-api`'s service role client, persist remembered email across mobile sessions via `AsyncStorage`, and provide a native mobile password recovery screen.

## Pre-planning record

### Actors and goals

- **Student (`sentinel-mobile`):**
  - Successfully log in with email and password without encountering `captcha protection: request disallowed (no captcha_token found)`.
  - Check "Remember me" so subsequent app sessions automatically recall their email address.
  - Tap "Forgot password?", enter their email address, and receive a password reset link redirecting to the password updater.

### Domain language

- **Supabase GoTrue Captcha Protection:** Project-wide bot protection requiring `captcha_token` for anonymous authentication endpoints (`supabaseAnon`).
- **Service Role Auth Bypass:** Server-side authentication via `supabaseAdmin` utilizing `SUPABASE_SERVICE_ROLE_KEY` that authenticates users without requiring Cloudflare Turnstile token validation while preserving backend rate limiting.
- **Remember Me (`sentinel_remembered_email_mobile`):** Device-local persistence of the student's email address in `@react-native-async-storage/async-storage`.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- |
| **SC-01** | Student logs in from mobile | App launched, credentials entered | Request has `x-sentinel-client: mobile`, backend authenticates via `supabaseAdmin`, returns session, navigates to `/(tabs)/classroom` | Invalid password returns clear 400 error | Covered |
| **SC-02** | Student enables "Remember me" and signs in | Login screen with switch toggled ON | Email stored under `sentinel_remembered_email_mobile` in `AsyncStorage`; pre-fills on next launch | Storage write failure logged gracefully | Covered |
| **SC-03** | Student disables "Remember me" and signs in | Login screen with switch toggled OFF | Key `sentinel_remembered_email_mobile` removed from `AsyncStorage` | N/A | Covered |
| **SC-04** | Student navigates to "Forgot password?" | Login screen | Tapping link pushes route `/(auth)/forgot-password` with email input and submit button | N/A | Covered |
| **SC-05** | Student submits password reset | Forgot password screen, valid email entered | Triggers `useForgotPasswordMutation`, shows confirmation UI ("Check your email"), provides "Back to Sign In" | API/network error displays in red banner | Covered |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
| --- | --- | --- | --- | --- | --- |
| **D1** | How should mobile handle captcha during login? | Option A: Backend `supabaseAdmin` fallback when `captchaToken` is absent or client is mobile | Empirically verified: `supabaseAdmin.auth.signInWithPassword` cleanly authenticates without Turnstile. Retains Hono rate-limiting and audit logging. | Option B: Cloudflare Turnstile WebView in mobile app (rejected due to mobile UX friction, WebView bot detection risks). | [[docs/context/September/13/mobile-auth-captcha-remember-forgot-password]] |
| **D2** | What should "Remember Me" persist? | Email address only in `AsyncStorage` (`sentinel_remembered_email_mobile`) | Follows OWASP recommendations and matches parity with web/core/support. | Persisting plaintext passwords (insecure). | [[docs/context/September/13/mobile-auth-captcha-remember-forgot-password]] |
| **D3** | Where should mobile password recovery direct? | Native email input screen dispatching Supabase reset email to web updater | Reuses existing `@sentinel/hooks` mutation and production web password reset page (`/auth/update-password`). | Building custom mobile in-app password reset OTP code system (out of scope). | [[docs/context/September/13/mobile-auth-captcha-remember-forgot-password]] |

### Unknowns and blockers

None. All technical mechanisms have been empirically validated against live Supabase credentials and repository code.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| **AC-01** | SC-01, D1 | Mobile login succeeds without `(no captcha_token found)` error | `app/sentinel-api/src/modules/identity/auth/auth.service.ts` + `app/sentinel-mobile/lib/api-client.ts` | Vitest / live curl probe | Covered |
| **AC-02** | SC-02, SC-03, D2 | "Remember me" switch persists email when checked and clears when unchecked | `app/sentinel-mobile/app/(auth)/login.tsx` + `@sentinel/shared` | Vitest / manual test | Covered |
| **AC-03** | SC-04, SC-05, D3 | "Forgot password?" navigates to working recovery screen and dispatches reset email | `app/sentinel-mobile/app/(auth)/forgot-password.tsx` | Vitest: `forgot-password.test.tsx` (PASS: 5/5) | Covered |

## Scope

- Modify `sentinel-api` `AuthService.login` to support mobile authentication via `supabaseAdmin` when `captchaToken` is omitted.
- Add `x-sentinel-client: mobile` header in `sentinel-mobile/lib/api-client.ts` and `useLoginMutation`.
- Add `REMEMBERED_EMAIL_KEYS.MOBILE` to `packages/shared/src/constants/auth.ts`.
- Implement `AsyncStorage` email persistence and auto-fill in `app/sentinel-mobile/app/(auth)/login.tsx`.
- Create `app/sentinel-mobile/app/(auth)/forgot-password.tsx` with form, validation, and confirmation state.
- Wire navigation between `login.tsx` and `forgot-password.tsx`.

## Non-goals

- In-app password update UI on mobile (password updates occur through the existing web reset link).
- Disabling Supabase project-wide Turnstile bot protection for web.

## Phases

- [x] `phase-01-api-mobile-auth-service-and-client-headers.md` — Phase 1: Backend AuthService and Client Header Support
- [x] `phase-02-mobile-remember-me-storage-persistence.md` — Phase 2: Mobile Remember Me Persistence with AsyncStorage
- [x] `phase-03-mobile-forgot-password-screen-and-flow.md` — Phase 3: Mobile Forgot Password Screen & Mutation Flow
- [x] `phase-04-verification-and-parity-audit.md` — Phase 4: Automated Tests, Live Probe Verification, and Audit

## Verification

- **Phase 1:** `pnpm --filter sentinel-api test src/modules/identity/auth/auth.service.test.ts` (PASS: 3/3 passed).
- **Phase 2:** `pnpm --filter @sentinel/shared test src/constants/auth.test.ts` (PASS: 1/1 passed) & `pnpm --filter sentinel-mobile test lib/auth/remember-me.test.ts` (PASS: 4/4 passed).
- **Phase 3:** `pnpm --filter sentinel-mobile test lib/auth/forgot-password.test.ts` (PASS: 5/5 passed); total mobile test suite: `44 passed (44)`, `285 passed (285)`. Typecheck `tsc --noEmit` passed with 0 errors.
- **Phase 4:** Live probe confirmed Turnstile bypass on mobile; Expo doctor 21/21 checks passed; `npx expo export --platform ios` bundled 2,715 modules into Hermes bytecode (`.hbc`, 9.6MB) with 0 errors.
