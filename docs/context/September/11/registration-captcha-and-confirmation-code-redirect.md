---
title: "Registration Turnstile Captcha Protection and Confirmation Code Page Redirect"
type: context
status: ready
created: "2026-09-11"
tags: [context, auth, registration, turnstile, captcha, confirmation-code, otp, email-verification]
feature: "auth-registration-captcha-and-confirmation-redirect"
---

# Registration Turnstile Captcha Protection and Confirmation Code Page Redirect Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  1. **Captcha Protection Failure (`no captcha_token found`):** Students registering on `https://app.sentinelph.tech/auth/register` encounter `captcha protection: request disallowed (no captcha_token found)`. Even when Cloudflare Turnstile resolves to "Success!", the deployed Sentinel API container on Railway was running from `origin/master` without forwarding `captchaToken` to `supabaseAnon.auth.signUp(...)`, causing Supabase GoTrue bot protection to reject the registration.
  2. **Missing Confirmation Code Page & Premature Onboarding Redirect:** Previously, if `data.session` was returned, the registration hook redirected immediately to `/onboarding`, bypassing confirmation. Furthermore, if `session` was null, it only flipped an in-memory React state (`setStep('verify')`) on `/auth/register` that was wiped on page reload or when navigating away to check email.

- **Business / User Value:**
  - **Unblocked Student Onboarding:** Legitimate students can solve the Cloudflare Turnstile check and create accounts without false rejections.
  - **Reliable Verification Lifecycle:** Moving verification to a dedicated, bookmarkable route (`/auth/confirm-code?email=...`) ensures that page refreshes, tab switches, and mobile email app handoffs preserve the confirmation context.
  - **Strict Security Gate:** Guarantees that every student must verify their email with the 6-digit OTP code before accessing the student onboarding portal.

- **Success Criteria:**
  - Submitting `/auth/register` with valid input and a solved Turnstile challenge completes with HTTP 200 without `captcha protection: request disallowed (no captcha_token found)`.
  - Upon successful registration submission, the browser automatically redirects to `/auth/confirm-code?email=<encoded_email>`.
  - The dedicated confirmation code page loads the email from query parameters, accepts the 6-digit OTP code, and displays a 60-second resend cooldown timer.
  - Submitting a valid 6-digit OTP code authenticates the Supabase session and safely transitions the student to `/onboarding`.
  - Next.js middleware proxy (`app/sentinel-web/src/proxy.ts`) permits access to `/auth/confirm-code` without premature redirects or infinite routing loops.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a new student registering on Sentinel,* I want my Cloudflare Turnstile security check to be verified by the backend, so that my account is created without CAPTCHA errors.
- *As a student completing registration,* I want to be redirected to a dedicated `/auth/confirm-code` page, so that I can switch to my Gmail app, retrieve my 6-digit code, and return to enter it without losing my place.
- *As an institution administrator,* I want every new student to prove email ownership before entering the onboarding wizard, so that invalid or typoed accounts never populate the student roster.

### Functional Requirements

#### Module A: Cloudflare Turnstile CAPTCHA Reliability
- [ ] **FR-01 (Turnstile Token Ingestion & Validation):** Update `packages/shared/src/schema/auth/register-schema.ts` so `ApiRegisterSchema` accepts `captchaToken: z.string().nullable().optional()`.
- [ ] **FR-02 (Hook Payload Forwarding):** Ensure `packages/hooks/src/query/auth/use-sign-up-mutation.ts` extracts `captchaToken` from credentials/options and includes it in the JSON body sent to `POST /auth/register`.
- [ ] **FR-03 (API Supabase Forwarding):** Ensure `app/sentinel-api/src/modules/identity/auth/auth.service.ts` passes `captchaToken` into `options: { captchaToken: body.captchaToken }` when calling `supabaseAnon.auth.signUp(...)`.
- [ ] **FR-04 (Deployment Synchronization):** Deploy updated backend code to Railway (`api.sentinelph.tech`) so production Supabase GoTrue receives the `gotrue_meta_security: { captcha_token }` payload.
- [ ] **FR-05 (Client Error Handling):** On registration failure, notify the user with a descriptive error message and cleanly reset the Turnstile widget via `turnstileRef.current?.reset()`.

#### Module B: Dedicated Confirmation Code Page (`/auth/confirm-code`)
- [ ] **FR-06 (Dedicated Route Creation):** Create `app/sentinel-web/src/app/auth/confirm-code/page.tsx` rendering a dedicated confirmation card matching Sentinel's dark-mode UI design tokens (`#131315`, border `white/10`, monospace 6-digit input).
- [ ] **FR-07 (Registration Redirect):** In `app/sentinel-web/src/app/auth/register/_hooks/use-register-form/index.ts`, upon successful `signUp` mutation, unconditionally redirect to `/auth/confirm-code?email=${encodeURIComponent(email)}` (removing direct redirect to `/onboarding`).
- [ ] **FR-08 (Email Query Parameter Ingestion):** `/auth/confirm-code` extracts `email` from `useSearchParams()`. If missing or invalid, gracefully provide a link back to `/auth/register`.
- [ ] **FR-09 (OTP Verification & Session Initialization):** Submitting the 6-digit code calls `useVerifyOtpMutation` (`POST /auth/verify-otp`). Upon success, update the Supabase client session and redirect to `/onboarding`.
- [ ] **FR-10 (Resend OTP Flow):** Include a resend button with an active 60-second countdown timer that triggers a fresh verification code dispatch.
- [ ] **FR-11 (Change Email Navigation):** Provide a "Change email address" link navigating back to `/auth/register`.

#### Module C: Middleware & RBAC Proxy Alignment
- [ ] **FR-12 (Proxy Protection Rules):** Update `app/sentinel-web/src/proxy.ts` to recognize `/auth/confirm-code` as an exempted auth page, preventing redirection of unconfirmed students straight to `/onboarding` before they finish entering their code.

### Edge Cases & Failure Modes

| Edge Case | Failure Mode | Mitigation / Recovery |
| :--- | :--- | :--- |
| User refreshes confirmation page | In-memory state lost | Email is retained via URL query param (`?email=...`), input re-focuses cleanly. |
| User opens email link in different browser/tab | Unsynced tab | User enters code on existing confirmation page or logs in normally. |
| Expired or invalid 6-digit OTP | Supabase returns 400 Bad Request | Display clear inline alert ("Invalid or expired code") without clearing the email address. |
| Resend clicked multiple times | Rate limit / spam | 60-second client cooldown enforced; backend rate limit on `/auth/register` and `/auth/verify-otp`. |
| Turnstile token expires (>300s) | Captcha expired error | On expire callback resets token state and prompts user to re-verify widget. |

---

## 3. Technical & Architectural Context

- **Affected Layers:**
  - **Web Frontend (`app/sentinel-web`):**
    - `src/app/auth/register/` (redirects to confirmation code page).
    - `src/app/auth/confirm-code/page.tsx` (new dedicated confirmation page).
    - `src/app/auth/confirm-code/_components/confirm-code-form.tsx` (new form component).
    - `src/app/auth/confirm-code/_hooks/use-confirm-code-form/index.ts` (new verification hook).
    - `src/proxy.ts` (route exemption & proxy rules).
  - **Backend API (`app/sentinel-api`):**
    - `src/modules/identity/auth/auth.service.ts` (forwards `captchaToken` to `supabaseAnon.auth.signUp`).
    - `src/modules/identity/auth/auth.controller.ts` (handles `/auth/register` & `/auth/verify-otp`).
  - **Shared Libraries (`packages/shared`, `packages/hooks`):**
    - `packages/shared/src/schema/auth/register-schema.ts` (`ApiRegisterSchema`).
    - `packages/hooks/src/query/auth/use-sign-up-mutation.ts` (forwards `captchaToken`).
    - `packages/hooks/src/query/auth/use-verify-otp-mutation.ts` (submits OTP).

---

## 4. UI/UX & Interaction Guidelines

- **Confirmation Screen Layout:**
  - Container: Centered `Card` (`max-w-md w-full bg-[#131315] border-white/10 text-white shadow-2xl`).
  - Header: MailCheck icon, "Check your inbox", and highlighted target email.
  - OTP Input: 6-character monospace input (`font-mono text-2xl tracking-[0.4em] text-center h-14`).
  - Action Button: `variant="premium-3d"` "Verify & Continue" with loading spinner during submission.
  - Sub-actions: "Change email address" (left) and "Resend code in Xs" (right).

---

## 5. Scope & Boundaries

- **In Scope:**
  - Fixing `captcha protection: request disallowed (no captcha_token found)` by ensuring `captchaToken` is accepted and forwarded to Supabase.
  - Creating the dedicated `/auth/confirm-code` route and redirecting from registration.
  - Verifying the 6-digit OTP on the dedicated page and navigating to `/onboarding`.
  - Updating `proxy.ts` to allow `/auth/confirm-code`.
  - Adding automated unit tests for schema, hooks, and routing behavior.
- **Out of Scope / Non-Goals:**
  - Changes to login Turnstile widget or flows (already verified).
  - Modifying the multi-step onboarding wizard fields or institution whitelist logic.
  - Custom email transport outside Supabase native SMTP/OTP.

---

## 6. Decisions Ledger & Handoff

| Item | Topic | Decision | Justification |
| :--- | :--- | :--- | :--- |
| DEC-01 | Confirmation URL | Dedicated route `/auth/confirm-code?email=...` | Bulletproof against browser reloads, switching tabs/apps, and bookmarking. |
| DEC-02 | Captcha Forwarding | Forward `captchaToken` via `sentinel-api` proxy | Retains centralized audit logging (`LogsService.createLog`) and IP rate limiting. |
| DEC-03 | Registration Redirection | Unconditional redirect to `/auth/confirm-code` | Enforces OTP verification before any user can reach `/onboarding`. |

**Readiness for Planning:** Approved (`status: ready`). Ready for handoff to `/plan` to scaffold the phased implementation breakdown.
