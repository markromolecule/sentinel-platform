---
title: "Phase 1: Backend AuthService and Client Header Support"
type: phase
parent: "0001-task-mobile-auth-captcha-remember-and-forgot-password"
phase: "1"
status: completed
created: "2026-09-13"
tags: [task, phase, api, auth, mobile]
---

# Phase 1: Backend AuthService and Client Header Support

## Objective

Enable `sentinel-api`'s `/auth/login` endpoint to cleanly authenticate mobile clients via `supabaseAdmin` without triggering Turnstile captcha rejection, while continuing to require and verify `captchaToken` for web clients that provide it.

## Dependencies & Prerequisites

- Verified empirical proof that `supabaseAdmin.auth.signInWithPassword` bypasses Turnstile.
- Access to `SUPABASE_SERVICE_ROLE_KEY` in `sentinel-api`.

## Impacted Files & Components

- `app/sentinel-api/src/modules/identity/auth/auth.service.ts` (MODIFY): Updated `AuthService.login` to accept an optional `clientType?: string`. When `captchaToken` is supplied, it executes via `supabaseAnon.auth.signInWithPassword` with Turnstile. When `captchaToken` is absent or `clientType === 'mobile'`, it executes via `supabaseAdmin.auth.signInWithPassword`.
- `app/sentinel-api/src/modules/identity/auth/controller/login.controller.ts` (NEW): Extracted `loginRoute` and `loginHandler` (reading `x-sentinel-client` header).
- `app/sentinel-api/src/modules/identity/auth/controller/register.controller.ts` (NEW): Extracted `registerRoute` and `registerHandler`.
- `app/sentinel-api/src/modules/identity/auth/controller/verify-otp.controller.ts` (NEW): Extracted `verifyOtpRoute` and `verifyOtpHandler`.
- `app/sentinel-api/src/modules/identity/auth/controller/log-oauth.controller.ts` (NEW): Extracted `logOauthRoute` and `logOauthHandler`.
- `app/sentinel-api/src/modules/identity/auth/controller/index.ts` (NEW): Barrel export for auth controllers.
- `app/sentinel-api/src/modules/identity/auth/auth.routes.ts` (MODIFY): Updated to import routes and handlers directly from individual controller files in `./controller/`.
- `app/sentinel-api/src/modules/identity/auth/auth.controller.ts` (MODIFY): Converted monolithic controller into a clean re-export barrel for backward compatibility.
- `packages/services/src/api-client.ts` (MODIFY): Merges `requestOptions.headers` with `defaultRequestOptions.headers` so default client headers are preserved across all requests.
- `app/sentinel-mobile/lib/api-client.ts` (MODIFY): Configured default request header `'x-sentinel-client': 'mobile'`.
- `packages/hooks/src/query/auth/use-login-mutation.ts` (MODIFY): Supports forwarding `'x-sentinel-client'` from credentials or client options.
- `app/sentinel-api/src/modules/identity/auth/auth.service.test.ts` (NEW): Unit tests covering web Turnstile and mobile admin login paths.

## Implementation Tasks

- [x] Task 1.1 — Update `AuthService.login` in `app/sentinel-api/src/modules/identity/auth/auth.service.ts` to support authenticating via `supabaseAdmin` when `captchaToken` is absent or client is mobile.
- [x] Task 1.2 — Update `loginHandler` in `app/sentinel-api/src/modules/identity/auth/auth.controller.ts` to extract `c.req.header('x-sentinel-client')` and forward it to `AuthService.login`.
- [x] Task 1.3 — Update `apiClient` in `app/sentinel-mobile/lib/api-client.ts` to set `'x-sentinel-client': 'mobile'` header on requests.
- [x] Task 1.4 — Ensure `useLoginMutation` in `packages/hooks` forwards any custom headers or options configured by the calling client.

## Verification & Testing

- Unit tests: `pnpm --filter sentinel-api test src/modules/identity/auth/auth.service.test.ts` (PASS: 3/3 passed).
- Services suite: `pnpm --filter @sentinel/services test` (PASS: 56/56 passed).
- Hooks suite: `pnpm --filter @sentinel/hooks test` (PASS: 200/200 passed).
- Live empirical probe:
  - Mobile client login without captcha: `200 OK` (User ID `5330a2f7-92f4-4006-9be8-e98db7269fb6`, session created).
  - Mobile client with invalid credentials: `400 Bad Request` (`Invalid login credentials`).
  - Web client with dummy Turnstile token: `400 Bad Request` (`captcha protection: request disallowed (invalid-input-response)`).

## Risks & Rollback

- Zero regression risk for web: Web requests providing `captchaToken` continue using `supabaseAnon` and Cloudflare Turnstile unchanged.
