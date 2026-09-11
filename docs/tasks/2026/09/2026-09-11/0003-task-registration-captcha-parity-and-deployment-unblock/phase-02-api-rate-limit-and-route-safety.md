---
title: "Phase 2: Registration Rate Limit Relaxation and Route Safety"
type: phase
parent: "0003-task-registration-captcha-parity-and-deployment-unblock"
phase: "2"
status: completed
created: "2026-09-11"
tags: [task, phase, auth, rate-limit, backend, api]
---

# Phase 2: Registration Rate Limit Relaxation and Route Safety

## Objective

Relax the aggressive IP-based rate limit on `/auth/register` in `sentinel-api` from 3 requests per hour to 10 requests per 15 minutes, preventing students and testers from being trapped in 429 lockouts while re-solving captchas or correcting form fields.

## Dependencies & Prerequisites

- `createRateLimitMiddleware` using Upstash Redis.
- Route definition in `app/sentinel-api/src/modules/identity/auth/auth.routes.ts`.

## Impacted Files & Components

- `app/sentinel-api/src/modules/identity/auth/auth.routes.ts`: Relaxed `registerRateLimit` options.

## Implementation Tasks

- [x] Task 2.1 — Change `registerRateLimit` configuration to `limit: 10, windowSeconds: 15 * 60`.
- [x] Task 2.2 — Clean up accumulated Redis rate limit keys (`rl:auth:register:<IP>`) during testing to unblock the current developer environment.
- [x] Task 2.3 — Confirm `auth.controller.ts` and `auth.service.ts` pass `captchaToken` cleanly into `supabaseAnon.auth.signUp`.

## Verification & Testing

```bash
# Verify local AuthService with dummy token reaches Supabase GoTrue with captcha evaluation
pnpm --dir app/sentinel-api exec tsx -r dotenv/config -e '...'
# => (invalid-input-response) indicates token was evaluated by Cloudflare
```

## Risks & Rollback

- **Risk:** Slight increase in registration velocity; mitigated by 10/15min limit and Cloudflare Turnstile enforcement.
- **Rollback:** Revert `limit` and `windowSeconds` in `auth.routes.ts`.
