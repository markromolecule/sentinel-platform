---
title: "Task: Mobile Authentication Captcha Resolution, Remember Me Persistence, and Forgot Password Screen"
type: task
status: planned
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
| **SC-01** | Student logs in from mobile | App launched, credentials entered | Request has `x-sentinel-client: mobile`, backend authenticates via `supabaseAdmin`, returns session, navigates to `/(tabs)/classroom` | Invalid password returns clear 400 error | Planned |
| **SC-02** | Student enables "Remember me" and signs in | Login screen with switch toggled ON | Email stored under `sentinel_remembered_email_mobile` in `AsyncStorage`; pre-fills on next launch | Storage write failure logged gracefully | Planned |
| **SC-03** | Student disables "Remember me" and signs in | Login screen with switch toggled OFF | Key `sentinel_remembered_email_mobile` removed from `AsyncStorage` | N/A | Planned |
| **SC-04** | Student navigates to "Forgot password?" | Login screen | Tapping link pushes route `/(auth)/forgot-password` with email input and submit button | N/A | Planned |
| **SC-05** | Student submits password reset | Forgot password screen, valid email entered | Triggers `useForgotPasswordMutation`, shows confirmation UI ("Check your email"), provides "Back to Sign In" | API/network error displays in red banner | Planned |

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
| **AC-01** | SC-01, D1 | Mobile login succeeds without `(no captcha_token found)` error | `app/sentinel-api/src/modules/identity/auth/auth.service.ts` + `app/sentinel-mobile/lib/api-client.ts` | Vitest / live curl probe | Planned |
| **AC-02** | SC-02, SC-03, D2 | "Remember me" switch persists email when checked and clears when unchecked | `app/sentinel-mobile/app/(auth)/login.tsx` + `@sentinel/shared` | Vitest / manual test | Planned |
| **AC-03** | SC-04, SC-05, D3 | "Forgot password?" navigates to working recovery screen and dispatches reset email | `app/sentinel-mobile/app/(auth)/forgot-password.tsx` | Vitest / component test | Planned |

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
- [ ] `phase-03-mobile-forgot-password-screen-and-flow.md` — Phase 3: Mobile Forgot Password Screen & Mutation Flow
- [ ] `phase-04-verification-and-parity-audit.md` — Phase 4: Automated Tests, Live Probe Verification, and Audit

## Verification

Record the command or inspection, outcome, and the acceptance criterion it supports.
