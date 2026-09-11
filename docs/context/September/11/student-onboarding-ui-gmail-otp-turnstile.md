---
title: "Student Onboarding Responsiveness, Gmail Verification OTP, and Cloudflare Turnstile Login"
type: context
status: ready
created: "2026-09-11"
tags: [context, auth, onboarding, email-verification, supabase-otp, turnstile, security, responsiveness]
feature: "student-onboarding-auth-verification-turnstile"
---

# Student Onboarding Responsiveness, Gmail Verification OTP, and Cloudflare Turnstile Login Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  1. **Onboarding UI Distortion:** When a student selects an option from the academic dropdowns (Institution, Department, Course) in `app/sentinel-web/src/app/(protected)/onboarding`, the long text strings (e.g. lengthy degree names like "Bachelor of Science in Information Technology (BSIT)") cause the Select component and its parent grid layout to widen and distort horizontally across various screen sizes.
  2. **Fake / Invalid Email Signups:** Student registration currently creates users via Supabase Admin API with `email_confirm: true`, immediately auto-confirming and creating sessions without any email validation or verification. Students are able to register accounts using fake, invalid, or mistyped email addresses.
  3. **Bot / Abuse Vulnerability on Login:** The authentication login endpoint lacks CAPTCHA / bot protection. While Cloudflare Turnstile has been configured in the Supabase project dashboard with a secret key, the frontend login form does not render the Turnstile widget nor pass the verification token (`captchaToken`) to the login mutation and Supabase Auth client.

- **Business / User Value:**
  - **Visual Stability:** Ensures a clean, predictable, and responsive onboarding experience across mobile, tablet, and desktop viewports without broken card boundaries.
  - **Identity Authenticity:** Guarantees that every registered student owns an authentic, verifiable email address before gaining portal access, eliminating fake accounts and delivery failures.
  - **Security & Bot Deterrence:** Defends the login endpoint against credential stuffing and brute-force attacks via seamless Cloudflare Turnstile verification.

- **Success Criteria:**
  - Onboarding dropdowns smoothly trim / truncate long selected options with an ellipsis while retaining full readability in dropdown lists, keeping card width consistent across all viewports (`<375px`, `sm`, `md`, `lg`, `xl`).
  - Student registration strictly rejects invalid email addresses, validates allowed domains (Gmail and/or institutional), and requires entering a 6-digit OTP code sent via Supabase email before creating an active session.
  - Cloudflare Turnstile widget renders on the login form and supplies a valid `captchaToken` to `supabaseAnon.auth.signInWithPassword(...)` via Sentinel API proxy.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a student onboarding onto Sentinel,* I want the dropdowns to display neatly without stretching or breaking the screen layout, so that I can easily complete my profile on any device.
- *As a system administrator / registrar,* I want new student accounts to verify ownership of their real Gmail / institutional email through a one-time passcode (OTP), so that only verified, legitimate students enter the whitelist onboarding flow.
- *As a security engineer,* I want automated bots and credential stuffers blocked by Cloudflare Turnstile during login, so that student and instructor accounts remain protected.

### Functional Requirements

#### Module A: Onboarding Dropdown & Layout Responsiveness

- [ ] **FR-01 (CSS Grid Track Bounding):** Add `min-w-0` to the left-hand column container in `app/sentinel-web/src/app/(protected)/onboarding/_components/onboarding-form.tsx` to prevent flex/grid blowout from unwrapped text.
- [ ] **FR-02 (Select Value Trimming & Tooltip):** In `academic-info-fields.tsx` (and `SelectTrigger` / `SelectValue` in `@sentinel/ui`), ensure selected values truncate with ellipsis (`truncate`, `max-w-full`, `overflow-hidden`) while maintaining title tooltips or clean abbreviations for readability.
- [ ] **FR-03 (Mobile & Tablet Viewport Audit):** Audit padding, font scaling, and sticky sidebar behavior on screens from 320px to 1280px+.

#### Module B: Email Validation & Supabase OTP Code Verification

- [ ] **FR-04 (Domain & Syntax Validation in Schema):** Update `RegisterSchema` and `ApiRegisterSchema` in `@sentinel/shared/schema` with strict regex and normalization for email.
- [ ] **FR-05 (Supabase Native Signup without Auto-Confirm):** Update `AuthService.register` in `sentinel-api` to initiate user signup via `supabaseAnon.auth.signUp(...)` with email confirmations active (or admin create without `email_confirm: true`), triggering Supabase's native 6-digit OTP delivery.
- [ ] **FR-06 (OTP Verification Flow):** Implement OTP verification in Sentinel API (`/auth/verify-otp`) or client (`supabase.auth.verifyOtp`), paired with a user-friendly 6-digit code entry interface on the web portal.

#### Module C: Cloudflare Turnstile Login Protection

- [ ] **FR-07 (Frontend Turnstile Widget):** Embed Cloudflare Turnstile widget into `LoginForm` in `sentinel-web` using `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`.
- [ ] **FR-08 (Captcha Token Schema & API Proxy):** Extend `LoginSchema` with optional `captchaToken?: string`.
- [ ] **FR-09 (Supabase Auth Captcha Validation):** Forward `captchaToken` inside `options: { captchaToken }` in `AuthService.login` when calling `supabaseAnon.auth.signInWithPassword`.

### Edge Cases & Failure Modes

- **OTP Code Expiry / Resend:** Provide a 60-second cooldown timer before allowing the student to request a new verification code.
- **Turnstile Network Failure / Adblocker:** Provide clear feedback if Turnstile widget fails to load or token expires before submit.
- **Whitelist Mismatch Post-Verification:** If a student verifies their email but their student number does not match the whitelist during onboarding, they remain authenticated but guided to contact their registrar.

---

## 3. Technical & Architectural Context

- **Affected Layers:**
  - Frontend: `app/sentinel-web/src/app/(protected)/onboarding/`, `app/sentinel-web/src/app/auth/login/`, `app/sentinel-web/src/app/auth/register/`
  - UI Library: `packages/ui/src/components/ui/select.tsx`
  - Shared Schemas & Contracts: `packages/shared/src/schema/auth/register-schema.ts`, `packages/shared/src/schema/auth/login-schema.ts`
  - Hooks: `packages/hooks/src/query/auth/use-sign-up-mutation.ts`, `packages/hooks/src/query/auth/use-login-mutation.ts`
  - Backend API: `app/sentinel-api/src/modules/identity/auth/`
  - Supabase Configuration: Email template token `{{ .Token }}`, Turnstile captcha settings.

---

## 4. Scope & Boundaries

- **In Scope:**
  - Fixing dropdown widening and responsive layout in web student onboarding.
  - Adding strict email validation in shared registration schema.
  - Implementing 6-digit OTP email verification via Supabase for registration.
  - Integrating Cloudflare Turnstile widget and passing token on login.
- **Out of Scope / Non-Goals:**
  - Modifying administrator or support portal authentication flows unless directly sharing auth components.
  - Replacing Supabase with custom third-party email providers (Resend, SendGrid) when Supabase native SMTP/OTP suffices.

---

## 5. Decisions Ledger & Status

| Item | Topic | Status | Decision Summary |
| :--- | :--- | :--- | :--- |
| DEC-01 | UI Layout Widening | Draft | Enforce `min-w-0` on grid items and add `truncate` / trimming on `SelectTrigger`. |
| DEC-02 | Email Restriction | Unresolved | Strict `@gmail.com` vs. Gmail + institutional domains. |
| DEC-03 | OTP Delivery Flow | Unresolved | In-place OTP modal/screen on `/auth/register` vs. `/auth/verify-email`. |
| DEC-04 | Turnstile Integration | Draft | Render widget on web login and forward `captchaToken` to Supabase Auth. |
