---
title: "Fix Registration Cloudflare Turnstile Captcha and Implement Confirmation Code Page Redirect"
type: task
status: completed
created: "2026-09-11"
tags: [task, auth, registration, turnstile, captcha, confirmation-code, otp, email-verification]
---

# Fix Registration Cloudflare Turnstile Captcha and Implement Confirmation Code Page Redirect

## Outcome

1. Eliminate the `captcha protection: request disallowed (no captcha_token found)` error on student registration by ensuring Cloudflare Turnstile tokens are validated by the shared schema, forwarded through `@sentinel/hooks`, and relayed to Supabase GoTrue Auth inside `options: { captchaToken }` by `sentinel-api`.
2. Establish a dedicated, refresh-resilient confirmation code page at `/auth/confirm-code?email=<encoded_email>` in `sentinel-web`.
3. Unconditionally redirect registration submissions from `/auth/register` to `/auth/confirm-code`, enforcing 6-digit email OTP verification before any user can transition to `/onboarding`.

## Pre-planning record

### Actors and goals

- **New Student:** Enters registration details on `https://app.sentinelph.tech/auth/register`, solves the Cloudflare Turnstile check, receives a 6-digit OTP in their inbox, and is guided to `/auth/confirm-code` to verify their email before proceeding to the onboarding profile setup.
- **Institution Registrar / Security Admin:** Guarantees that automated bot accounts are stopped by Cloudflare Turnstile and that only authentic, confirmed email addresses enter the student portal.
- **Backend API Gateway (`sentinel-api`):** Proxies registration and verification requests to Supabase while preserving rate limiting and administrative audit logging.

### Domain language

- **Cloudflare Turnstile:** Privacy-preserving CAPTCHA alternative generating a client-side verification token.
- **Supabase GoTrue Bot Protection:** Server-side Turnstile verification mechanism requiring `gotrue_meta_security: { captcha_token }` on auth endpoints.
- **Confirmation Code Page:** Dedicated web route (`/auth/confirm-code`) where the student enters the 6-digit OTP code received via email.
- **Onboarding Page (`/onboarding`):** Protected multi-step profile completion wizard accessible only after email verification.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Student submits valid registration form with solved Turnstile | Form filled, Turnstile passed | Account created in Supabase with `email_confirmed_at: null`; browser redirects to `/auth/confirm-code?email=...` | If Turnstile token missing/invalid, display actionable error and reset widget | Planned |
| SC-02 | Student visits `/auth/confirm-code?email=student%40gmail.com` | Email passed via query param | Form pre-populates email target and focuses 6-digit input | If query param missing, show fallback input or link to `/auth/register` | Planned |
| SC-03 | Student enters valid 6-digit OTP code | OTP matches Supabase record | Session established in Supabase client; user redirected to `/onboarding` | If code expired/invalid, display error alert; offer resend | Planned |
| SC-04 | Student reloads `/auth/confirm-code` while waiting for email | Page refreshed | Email remains preserved from query param; OTP input remains ready | Seamless reload without data loss | Planned |
| SC-05 | Student clicks "Resend code" | 60s cooldown elapsed | Fresh OTP dispatched; 60s cooldown restarted; success toast displayed | Button disabled during cooldown | Planned |
| SC-06 | Student clicks "Change email address" | On confirmation page | Navigates back to `/auth/register` with clean state | Standard client navigation | Planned |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | Where should confirmation code entry live? | Dedicated route `/auth/confirm-code?email=...` | Bulletproof against browser reloads, switching tabs/apps, and bookmarking | In-memory component state inside `/auth/register` | `docs/context/September/11/registration-captcha-and-confirmation-code-redirect.md` |
| DEC-02 | When should students transition to `/onboarding`? | Strictly after successful OTP verification on `/auth/confirm-code` | Prevents unverified accounts from entering onboarding wizard even if an initial session token was returned | Direct redirect to `/onboarding` from `/auth/register` | `docs/context/September/11/registration-captcha-and-confirmation-code-redirect.md` |
| DEC-03 | How should Turnstile token be passed to Supabase? | Relay through `sentinel-api` via `options: { captchaToken }` | Preserves centralized audit logging and rate limiting | Client directly invoking Supabase Auth | `docs/decisions/2026-09-11-auth-email-verification-otp-and-cloudflare-turnstile.md` |

### Unknowns and blockers

- **Railway Production Deployment:** The updated `sentinel-api` backend code must be merged to `master` (or deployed via Railway CLI) so production Supabase GoTrue receives `options.captchaToken`.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01, DEC-03 | `POST /auth/register` accepts `captchaToken` and passes it to `supabaseAnon.auth.signUp` | `ApiRegisterSchema`, `useSignUpMutation`, `AuthService.register` | Vitest unit tests | Verified |
| AC-02 | SC-01, DEC-02 | Submitting `/auth/register` redirects to `/auth/confirm-code?email=...` | `useRegisterForm` `onSuccess` handler | Next.js navigation test | Verified |
| AC-03 | SC-02, SC-04 | `/auth/confirm-code` loads email from search params and survives page reloads | `app/sentinel-web/src/app/auth/confirm-code/page.tsx` | React component test | Verified |
| AC-04 | SC-03, DEC-02 | Entering valid 6-digit OTP authenticates session and navigates to `/onboarding` | `useConfirmCodeForm`, `useVerifyOtpMutation` | Vitest hook test | Verified |
| AC-05 | SC-05 | Resend button enforces 60-second cooldown timer | `useConfirmCodeForm` timer hook | Vitest timer test | Verified |
| AC-06 | SC-01, SC-03 | Next.js middleware allows `/auth/confirm-code` without redirecting prematurely | `app/sentinel-web/src/proxy.ts` | Proxy route test | Verified |

## Scope

- Updating `ApiRegisterSchema` to accept `captchaToken: z.string().nullable().optional()`.
- Updating `useSignUpMutation` to forward `captchaToken` in request body.
- Updating `AuthService.register` in `sentinel-api` to forward `captchaToken` in options.
- Building dedicated page at `app/sentinel-web/src/app/auth/confirm-code/page.tsx`.
- Building `confirm-code-form.tsx` and `useConfirmCodeForm` hook.
- Updating `useRegisterForm` to redirect to `/auth/confirm-code?email=...`.
- Updating `proxy.ts` to permit `/auth/confirm-code`.
- Automated test coverage across affected packages.

## Non-goals

- Modifying login Cloudflare Turnstile implementation.
- Altering academic fields or institution whitelist logic in onboarding.
- Using external third-party mailer services instead of Supabase native SMTP/OTP.

## Constraints and decisions

- Follow SOLID principles: keep single responsibilities across hooks, components, and controllers.
- Use Next.js 15 Suspense boundaries for client components reading `useSearchParams()`.
- Preserve Sentinel dark theme visual tokens (`#131315`, border `white/10`).

## Phases

- [x] `phase-01-contracts-and-token-forwarding.md` — Phase 1: Shared schema, hook forwarding, and API service verification
- [x] `phase-02-dedicated-confirmation-page.md` — Phase 2: Dedicated `/auth/confirm-code` route and form components
- [x] `phase-03-registration-redirect-and-proxy.md` — Phase 3: Registration redirect integration and middleware proxy rules
- [x] `phase-04-verification-and-deployment-readiness.md` — Phase 4: Monorepo test suite validation and deployment alignment

## Verification

| Check | Target | Expected Outcome | AC |
|---|---|---|---|
| Vitest Schema Test | `packages/shared` | `register-schema.test.ts` passes with optional/nullable `captchaToken` | AC-01 |
| Vitest Hooks Test | `packages/hooks` | `useSignUpMutation` and `useVerifyOtpMutation` pass | AC-01, AC-04 |
| Web Build & Lint | `app/sentinel-web` | `pnpm --filter sentinel-web build` succeeds without hydration errors | AC-02, AC-03 |
| API Typecheck | `app/sentinel-api` | `pnpm --filter sentinel-api typecheck` passes | AC-01 |
