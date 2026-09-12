---
title: "Registration Turnstile Captcha Protection, onSuccess Forensic Analysis, and Monorepo CI Deployment Unblock"
type: context
status: draft
created: "2026-09-12"
tags: [context, auth, registration, turnstile, captcha, gotrue, ci-deployment, railway]
feature: "auth-registration-captcha-parity-and-deployment-unblock"
---

# Registration Turnstile Captcha Protection, onSuccess Forensic Analysis, and Monorepo CI Deployment Unblock

## 1. Overview & Objective

### 1.1 Problem Statement
When students submit their registration details on `https://app.sentinelph.tech/auth/register`, they encounter the following error banner:
```
captcha protection: request disallowed (no captcha_token found)
```
Even though Cloudflare Turnstile resolves to a green checkmark (`Verify you are human` [green check]), the registration submission is disallowed by the server with HTTP 400.

### 1.2 Side-by-Side Forensic Evidence (`/auth/login` vs `/auth/register`)

We executed empirical live probes against production endpoints (`https://api.sentinelph.tech`):

| Metric / Check | Live `POST /auth/login` | Live `POST /auth/register` | Codebase Target (`master`) |
| :--- | :--- | :--- | :--- |
| **Probe Payload** | `{ email, password, captchaToken: "test-fake-token" }` | `{ email, password, firstName, lastName, terms: true, captchaToken: "test-fake-token" }` | Both accept `captchaToken` |
| **HTTP Status** | `400 Bad Request` | `400 Bad Request` | `200 OK` (with valid token) |
| **Response Body** | `{"error":"captcha protection: request disallowed (invalid-input-response)"}` | `{"error":"captcha protection: request disallowed (no captcha_token found)"}` | `(invalid-input-response)` for dummy token |
| **Rate Limit Header** | `x-ratelimit-limit: 5` | `x-ratelimit-limit: 3` | `x-ratelimit-limit: 10` |
| **Supabase GoTrue Layer** | Receives `captcha_token` via `options`, contacts Cloudflare, Cloudflare rejects dummy token | Does **NOT** receive `captcha_token` at all; rejects request immediately | Forwards `body.captchaToken` inside `options` |
| **Deployed Container Code** | Commit `750ffb6f` (`options: { captchaToken }` present) | Commit `750ffb6f` (`options: { captchaToken }` **MISSING**) | Commit `aaeffd01` / `bf67626d` |

### 1.3 Root Cause Triad

1. **Why the Error is `(no captcha_token found)` instead of `(invalid-input-response)`:**
   - In production on Railway (`api.sentinelph.tech`), the active container is executing historical commit `750ffb6f`.
   - In `750ffb6f`, `AuthService.login` already included `options: credentials.captchaToken ? { captchaToken: credentials.captchaToken } : undefined`. Therefore, `/auth/login` has always forwarded the Turnstile token to Supabase GoTrue.
   - However, in `750ffb6f`, `AuthService.register` called `supabaseAnon.auth.signUp(...)` with **only** `first_name`, `last_name`, and `role`, completely omitting `captchaToken`.
   - When GoTrue has Turnstile protection enabled, any signup request lacking `gotrue_meta_security: { captcha_token }` is rejected with `captcha protection: request disallowed (no captcha_token found)`.

2. **Why the Widget is "Green" while the Error is Displayed (The `onSuccess` & Reset Cycle):**
   - In `useRegisterForm`:
     ```ts
     onError: (error: SignUpError) => {
         setAuthError(error.message);
         setCaptchaToken(null);
         form.setValue('captchaToken', undefined);
         turnstileRef.current?.reset();
     }
     ```
   - When the backend rejects the registration, `onError` sets the red banner to `captcha protection: request disallowed (no captcha_token found)` and calls `turnstileRef.current?.reset()`.
   - Cloudflare Turnstile resets in the browser. In managed/interactive mode, Cloudflare re-evaluates the client (performing PAT attestation via `https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/pat/...`).
   - Cloudflare solves the challenge and triggers `onSuccess(newToken)`.
   - `onSuccess` updates state:
     ```ts
     const onCaptchaSuccess = useCallback((token: string) => {
         setCaptchaToken(token);
         form.setValue('captchaToken', token);
     }, [form]);
     ```
   - **Crucial UI Defect:** `onCaptchaSuccess` **does not clear** `authError`.
   - Consequently, the UI displays the fresh green checkmark alongside the stale error banner from the previous failed attempt!

3. **Why Production Railway Container Has Not Updated:**
   - GitHub Actions CI on `master` failed at check run `103316595765` ("Selective Lint, Test & Build").
   - The failure was caused by a Vitest timeout in `app/sentinel-web/src/features/exams/builder/_components/question-builder-form.test.tsx:49`:
     ```
     Error: Hook timed out in 10000ms.
     ```
   - Railway has GitHub check verification / "Wait for CI" enabled, preventing Railway from auto-deploying the updated `sentinel-api` container where `AuthService.register` forwards `captchaToken`.

---

## 2. Requirements & User Stories

### 2.1 User Stories
- *As a registering student,* I want my solved Cloudflare Turnstile token to be forwarded to Supabase GoTrue, so that my registration succeeds without CAPTCHA rejections.
- *As a registering student,* when my Turnstile widget successfully solves or re-solves, I want any prior CAPTCHA-related error messages to be automatically dismissed, so that I am not confused by contradictory status indicators.
- *As an engineering team,* I want CI builds on `master` to complete reliably without flaky Vitest hook timeouts, so that Railway automatically deploys backend fixes.

### 2.2 Functional Requirements

#### Module A: Backend Deployment & Token Relay
- [ ] **FR-01 (CI Unblock):** Increase `hookTimeout` in `question-builder-form.test.tsx` (or optimize the dynamic import) so `pnpm turbo run test` passes reliably on 2-vCPU GitHub Actions runners.
- [ ] **FR-02 (Railway Deployment Sync):** Trigger and verify successful CI on `master`, ensuring Railway deploys the updated `sentinel-api` container containing:
  - `limit: 10, windowSeconds: 900` on `/auth/register`.
  - `options: { captchaToken: body.captchaToken.trim() }` inside `AuthService.register`.
- [ ] **FR-03 (Live Endpoint Verification):** Confirm via cURL that `POST https://api.sentinelph.tech/auth/register` with dummy token returns `HTTP 400: (invalid-input-response)` rather than `(no captcha_token found)`.

#### Module B: Client-side `onSuccess` & UX Synchronization
- [ ] **FR-04 (`onCaptchaSuccess` Error Clearing):** In `useRegisterForm` and `useLoginForm`, when `onCaptchaSuccess` fires, check if `authError` is a CAPTCHA-related error (e.g. contains `captcha`), and if so, automatically clear `authError` via `setAuthError(null)`.
- [ ] **FR-05 (Turnstile `onError` Alignment):** Ensure `onCaptchaError` provides a clear retry instruction and does not trigger infinite reload loops.

---

## 3. Technical & Architectural Context

### 3.1 Comparison of Turnstile Implementation (`Login` vs `Register`)

| Aspect | `useLoginForm` (`/auth/login`) | `useRegisterForm` (`/auth/register`) |
| :--- | :--- | :--- |
| **Component Turnstile Props** | `onSuccess`, `onExpire` (no `onError`) | `onSuccess`, `onError`, `onExpire` |
| **Submit Button Disabled State** | `disabled={isLoading}` | `disabled={isLoading \|\| (siteKey && !captchaToken)}` |
| **Form Hook Default** | `captchaToken` not in defaults | `captchaToken: undefined` in defaults |
| **Token Resolution in onSubmit** | `captchaToken \|\| data.captchaToken \|\| form.getValues('captchaToken')` | `captchaToken \|\| data.captchaToken \|\| form.getValues('captchaToken')` |
| **Backend Service Forwarding** | `options: credentials.captchaToken ? { captchaToken } : undefined` (deployed) | `options: { captchaToken }` (present in git, blocked from deployment by CI) |

### 3.2 Private Access Token (PAT) Attestation (cURL in User Prompt)
The cURL in the user prompt:
`GET https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/pat/...` returning HTTP 401 is standard RFC 9505 Privacy Pass challenge flow. Cloudflare uses this to request a cryptographic Blind RSA Private Access Token from supported platforms. If the client does not support PAT, Cloudflare gracefully falls back to managed challenge and yields the final response token, turning the widget green. The client-side widget was fully successful; the failure occurred strictly because the backend failed to relay the token to Supabase.

---

## 4. UI/UX & Interaction Guidelines

1. **Stale Error Banner Elimination:**
   - If a user triggers a CAPTCHA error, the widget resets.
   - When the widget turns green and invokes `onCaptchaSuccess`, `authError` must immediately clear:
     ```ts
     const onCaptchaSuccess = useCallback((token: string) => {
         setCaptchaToken(token);
         form.setValue('captchaToken', token);
         setAuthError((prev) => (prev?.toLowerCase().includes('captcha') ? null : prev));
     }, [form]);
     ```
2. **Submit Button State:**
   - While Turnstile is verifying, the "Create account" button remains disabled (`!captchaToken`).
   - Once verified, the button becomes enabled immediately.

---

## 5. Scope & Boundaries

- **In Scope:**
  - Fix the CI test hook timeout in `question-builder-form.test.tsx` to unblock GitHub Actions and Railway deployment.
  - Enhance `onCaptchaSuccess` in `useRegisterForm` to automatically dismiss stale CAPTCHA error banners when a fresh token is acquired.
  - Verify live Railway API deployment via probe cURL and end-to-end registration flow.
- **Out of Scope:**
  - Modifying Supabase GoTrue server-side CAPTCHA configuration.
  - Changes to the `/auth/confirm-code` verification page logic.

---

## 6. Decisions Ledger & Scenario Coverage

| ID | Decision | Justification |
| :--- | :--- | :--- |
| **DEC-01** | Dismiss stale CAPTCHA error on `onCaptchaSuccess` | Eliminates user confusion where green checkmark coexists with previous failure banner. |
| **DEC-02** | Increase Vitest hook timeout to 30,000ms for heavy exam builder tests | Prevents intermittent runner exhaustion in CI environments. |
| **DEC-03** | Enforce deployment verification probe | Guarantees production container matches git before declaring issue resolved. |
