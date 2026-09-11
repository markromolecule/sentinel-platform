---
title: "Fix Registration Captcha Parity, Rate Limit Lockout, and CI Deployment Unblock"
type: task
status: planned
created: "2026-09-11"
tags: [task, auth, registration, captcha, turnstile, rate-limit, ci-cd, deployment]
---

# Fix Registration Captcha Parity, Rate Limit Lockout, and CI Deployment Unblock

## Outcome

1. Eliminate the `captcha protection: request disallowed (no captcha_token found)` registration failure on `https://app.sentinelph.tech/auth/register` by ensuring Turnstile token resolution parity between `login` and `register`.
2. Relax `/auth/register` IP rate limiting from 3 attempts per hour to 10 attempts per 15 minutes to prevent lockout traps during user registration and verification.
3. Fix the failing `sentinel-core` navigation title test (`Identity & Access` -> `IAM`) that blocked the monorepo GitHub Actions `CI & Selective Monorepo Verification` workflow on `master`.
4. Successfully deploy the updated `sentinel-api` to Railway and `sentinel-web` to Vercel, validating live end-to-end registration flow with Cloudflare Turnstile and redirect to `/auth/confirm-code`.

## Pre-planning record

### Actors and goals

- **Student:** Can reliably complete Cloudflare Turnstile verification and register on `https://app.sentinelph.tech/auth/register` without receiving false `(no captcha_token found)` or 429 rate limit errors.
- **Sentinel API Gateway (`sentinel-api`):** Accepts Turnstile tokens, proxies registration securely to Supabase GoTrue Auth with `gotrue_meta_security: { captcha_token }`, and applies sensible rate limits.
- **CI / Deployment Pipeline:** Passes GitHub Actions checks on `master` so Railway (`api.sentinelph.tech`) and Vercel (`app.sentinelph.tech`) deploy synchronized containers and frontend bundles.

### Domain language

- **Cloudflare Turnstile:** Invisible / interactive CAPTCHA widget generating client-side challenge verification tokens.
- **Supabase GoTrue Bot Protection:** Server-side Turnstile enforcement on `/auth/v1/signup` requiring `gotrue_meta_security: { captcha_token }`.
- **Token Resolution Triple Fallback:** Resilient pattern in `useLoginForm` extracting `captchaToken || data.captchaToken || form.getValues('captchaToken')`.
- **IP Rate Limit Window:** Redis-backed sliding window (`rl:auth:register:<IP>`) controlling registration attempt velocity.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Student submits registration with solved Turnstile | Form filled, Turnstile solved | `POST /auth/register` sends token; GoTrue creates user; redirect to `/auth/confirm-code` | If token expired, reset widget and prompt re-solve | Planned |
| SC-02 | Student encounters validation error and retries | Registration error displayed | User corrects error, re-verifies Turnstile, and retries without triggering 429 lockout | Up to 10 attempts in 15 minutes allowed | Planned |
| SC-03 | React state desyncs during form submission | `captchaToken` state null but RHF has value | `form.getValues('captchaToken')` rescues token and forwards to API | Triple fallback ensures token is never lost | Planned |
| SC-04 | Monorepo CI executes on push to `master` | Git commit pushed | All test suites in `sentinel-core`, `sentinel-web`, `sentinel-api`, `@sentinel/hooks`, and `@sentinel/shared` pass | Railway triggers clean container redeploy | Planned |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | How should `useRegisterForm` resolve the Turnstile token? | Use identical triple fallback from `useLoginForm`: `captchaToken \|\| data.captchaToken \|\| form.getValues('captchaToken')` | Empirical proof that `useLoginForm` never drops tokens across renders and state flushes | Relying solely on local React state `captchaToken` | `app/sentinel-web/src/app/auth/register/_hooks/use-register-form/index.ts` |
| DEC-02 | What rate limit should `/auth/register` enforce? | 10 requests per 15 minutes (`limit: 10, windowSeconds: 15 * 60`) | 3 per hour was locking out legitimate students who re-solved a captcha or corrected a password | Keeping 3/hour or disabling rate limit completely | `app/sentinel-api/src/modules/identity/auth/auth.routes.ts` |
| DEC-03 | Why did Railway serve old code despite PR #607 / #608? | GitHub Actions root CI failed due to `use-core-admin-capabilities.test.ts`, halting deployment flow | Fixing the outdated test assertion in `sentinel-core` restores passing green status | Manually bypassing CI or ignoring tests | `app/sentinel-core/src/hooks/use-core-admin-capabilities.test.ts` |

### Unknowns and blockers

- **Railway Deploy Trigger:** Verify whether Railway automatically builds upon push to `origin/master` once GitHub Actions CI turns green.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-03, DEC-01 | `useRegisterForm` includes `form.getValues('captchaToken')` in `resolvedToken` | `use-register-form/index.ts` | Unit test in `use-register-form/index.test.tsx` | Verified |
| AC-02 | SC-02, DEC-02 | `/auth/register` allows up to 10 requests in 15 minutes before 429 | `auth.routes.ts` | Vitest / Redis inspection | Verified |
| AC-03 | SC-04, DEC-03 | `sentinel-core` tests pass without assertions failures | `use-core-admin-capabilities.test.ts` | `pnpm --dir app/sentinel-core test` | Verified |
| AC-04 | SC-01, SC-04 | Live `api.sentinelph.tech/auth/register` forwards `captchaToken` to GoTrue without `(no captcha_token found)` | Railway redeploy from `master` | Probe curl test against live endpoint | Planned |

## Scope

- Align `resolvedToken` fallback in `useRegisterForm` to match `useLoginForm`.
- Update `registerRateLimit` configuration in `auth.routes.ts`.
- Update navigation title expectation in `sentinel-core/src/hooks/use-core-admin-capabilities.test.ts`.
- Verify full test suite across affected packages.
- Document deployment synchronization and live verification procedure.

## Non-goals

- Altering the Cloudflare Turnstile keys or site registration.
- Changing Supabase Auth configuration or policies.
- Modifying onboarding steps after confirmation code verification.

## Constraints and decisions

- Retain zero downtime during deployment.
- Maintain full TypeScript strictness and test suite green status.

## Phases

- [x] `phase-01-client-token-parity.md` — Phase 1: Client token resolution fallback parity and test alignment
- [x] `phase-02-api-rate-limit-and-route-safety.md` — Phase 2: Registration rate limit relaxation and route resilience
- [x] `phase-03-monorepo-ci-unblocking.md` — Phase 3: Fix `sentinel-core` CI blocker and run all targeted unit tests
- [ ] `phase-04-deployment-and-live-verification.md` — Phase 4: Git branch push, PR merge, and live production smoke test

## Verification

| Check | Target | Expected Outcome | AC |
|---|---|---|---|
| Vitest Web Test | `app/sentinel-web` | Register & confirm-code tests pass (17 tests) | AC-01 |
| Vitest Core Test | `app/sentinel-core` | `use-core-admin-capabilities.test.ts` passes (5 tests) | AC-03 |
| Vitest Shared & Hooks | `packages/shared`, `packages/hooks` | Register schema (224 tests) and sign-up mutation (200 tests) pass | AC-01 |
| Live API Probe | `https://api.sentinelph.tech` | `/auth/register` forwards token to Supabase | AC-04 |
