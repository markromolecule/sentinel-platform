---
title: "Architectural Decision Record: Student Email Verification OTP via Supabase and Cloudflare Turnstile Login Protection"
type: decision
status: proposed
created: "2026-09-11"
tags: [adr, auth, security, email-verification, turnstile, supabase]
---

# ADR: Student Email Verification OTP via Supabase and Cloudflare Turnstile Login Protection

## Context

Sentinel's student registration flow currently uses `supabaseAdmin.auth.admin.createUser` with `email_confirm: true`. This bypasses email verification entirely, allowing users to register accounts with nonexistent, mistyped, or fake email addresses. Furthermore, while Cloudflare Turnstile bot detection has been configured in the Supabase project dashboard with a Turnstile secret key, the web login form does not render the Turnstile widget or forward a `captchaToken`, leaving authentication endpoints open to automated credential-stuffing and brute-force attempts.

Additionally, long degree program and department names in the student onboarding dropdowns cause unconstrained flex expansion, distorting the onboarding card layout across mobile and desktop viewports.

## Options Considered

### Option 1: Direct Client-Side Supabase Auth Flow
- **Description:** Shift registration and login entirely to the Next.js browser client calling `supabase.auth.signUp({ email, password })`, `supabase.auth.verifyOtp({ email, token, type: 'signup' })`, and `supabase.auth.signInWithPassword({ email, password, options: { captchaToken } })` directly against Supabase.
- **Pros:** Minimal backend code changes in `sentinel-api`.
- **Cons:** Bypasses Sentinel API's centralized rate limiting (`@hono/rate-limiter`), bypasses administrative audit logging (`LogsService.createLog`), and weakens centralized security policy controls.

### Option 2 (Recommended): Sentinel API Proxy Orchestration with Native Supabase Auth & Turnstile
- **Description:** Maintain Sentinel API as the secure gateway:
  1. `sentinel-api` updates `/auth/register` to register the student via Supabase without `email_confirm: true` (or via `supabaseAnon.auth.signUp`), initiating Supabase's native 6-digit email OTP.
  2. Add `/auth/verify-otp` endpoint in `sentinel-api` calling `supabaseAnon.auth.verifyOtp({ email, token, type: 'signup' })`, returning the authenticated session upon successful OTP confirmation.
  3. Update `/auth/login` to accept an optional/required `captchaToken` in `LoginSchema`, forwarded via `options: { captchaToken }` to `supabaseAnon.auth.signInWithPassword`.
  4. Web client embeds the Cloudflare Turnstile widget on `/auth/login` using `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`.
- **Pros:** Retains centralized audit logs, keeps IP-based rate limiting intact, leverages native Supabase 6-digit OTP delivery and Supabase-managed Turnstile verification with zero extra third-party infrastructure.
- **Cons:** Requires updating `@sentinel/shared/schema` (`LoginSchema`, `RegisterSchema`), adding an OTP verification mutation in `@sentinel/hooks`, and adding an OTP verification UI step in `sentinel-web`.

### Option 3: Custom Sentinel API OTP Engine with External Mailer
- **Description:** Generate custom 6-digit codes in PostgreSQL or Redis, send emails via Nodemailer/Resend/SendGrid, and manually set `email_confirmed_at` via Supabase Admin upon code match.
- **Pros:** Complete control over email delivery templates and retry logic.
- **Cons:** Adds unnecessary external mailer dependencies and architectural complexity, duplicating functionality already built into Supabase Auth.

## Decision

Adopt **Option 2: Sentinel API Proxy Orchestration with Native Supabase Auth & Turnstile**.
- Use native Supabase 6-digit OTP verification for student account creation.
- Route verification through Sentinel API proxy to preserve audit logging and rate limiting.
- Render Cloudflare Turnstile on the web login interface and forward `captchaToken` through to Supabase.
- Fix onboarding dropdown distortion by applying CSS `min-w-0` bounding and text trimming / truncation on select triggers.

## Consequences

- **Security Posture:** Guarantees all registered student email addresses exist and are verified before onboarding. Authenticated logins are shielded by Cloudflare Turnstile bot detection.
- **Compatibility:** Backward compatible with existing active users; only new signups undergo OTP verification.
- **User Experience:** Students receive a clear 6-digit OTP code directly in their inbox with resend cooldown timers, preventing spam and confusion. Onboarding UI remains responsive and visually consistent on all screen sizes.

## Validation and Review Date

- **Automated Validation:** Schema unit tests for Gmail / domain regex; API endpoint tests for `/auth/register`, `/auth/verify-otp`, and `/auth/login` with `captchaToken`.
- **Manual QA:** End-to-end signup with real Gmail, OTP entry, Turnstile challenge validation on login, and responsive UI test on 320px, 768px, and 1280px viewports.
- **Review Date:** 2026-10-11
