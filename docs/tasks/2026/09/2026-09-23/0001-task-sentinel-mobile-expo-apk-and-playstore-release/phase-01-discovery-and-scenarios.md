---
title: "Phase 1: Environment Validation & Configuration Contracts"
type: phase
parent: "0001-task-sentinel-mobile-expo-apk-and-playstore-release"
phase: "1"
status: completed
created: "2026-09-23"
tags: [task, phase, mobile, env]
---

# Phase 1: Environment Validation & Configuration Contracts

## Objective

Design and implement the Zod environment schema and resolution contract for `sentinel-mobile`, guaranteeing that all required production environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`, etc.) are validated before application boot and build execution.

## Dependencies & Prerequisites

- Existing Zod package (`zod: ^4.3.6`) in `app/sentinel-mobile/package.json`.
- Identified environment variable references across `sentinel-mobile`.

## Impacted Files & Components

- `app/sentinel-mobile/lib/config/env.ts` [NEW]: Schema definition and typed accessor for runtime env validation.
- `app/sentinel-mobile/scripts/verify-env.mjs` [NEW]: CLI verification script for pre-build checks.
- `app/sentinel-mobile/lib/config/env.test.ts` [NEW]: Unit tests for valid, missing, and malformed environment variables.
- `app/sentinel-mobile/vitest.setup.ts` [MODIFY]: Provide safe default test environment variables for unit test runners.

## Implementation Tasks

- [x] Task 1.1 — Create `lib/config/env.ts` with Zod schema defining:
  - `EXPO_PUBLIC_SUPABASE_URL`: `z.string().url()`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: `z.string().min(20)`
  - `EXPO_PUBLIC_API_URL`: `z.string().url().default('https://api.sentinelph.tech')`
  - `EXPO_PUBLIC_WEB_URL`: `z.string().url().default('https://app.sentinelph.tech')`
  - `EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH`: `z.string().default('auth/callback')`
  - `EXPO_PUBLIC_EXPO_AUTH_PROXY_URL`: `z.string().url().optional()`
- [x] Task 1.2 — Add helper functions `getMobileEnv()` and `parseMobileEnv()` with actionable diagnostic error reporting.
- [x] Task 1.3 — Create `scripts/verify-env.mjs` to run in Node during CI or before `eas build`.
- [x] Task 1.4 — Author unit tests in `lib/config/env.test.ts` covering valid input, invalid URLs, missing required keys, and default fallbacks.

## Verification & Testing

- `pnpm --filter sentinel-mobile test lib/config/env.test.ts` (PASS: 9/9 passed in 4ms).
- `node app/sentinel-mobile/scripts/verify-env.mjs` (PASS: all environment variables verified successfully).
- Full regression suite: `pnpm --filter sentinel-mobile test` (PASS: 57/57 test files passed, 410/410 tests passed).

## Risks & Rollback

- **Risk:** Existing unit tests running in Vitest might lack some env vars.
- **Mitigation:** Setting fallback test values in `vitest.setup.ts` guarantees clean execution across test runners.
