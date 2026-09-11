---
title: "Phase 1: Shared Schema, Hook Forwarding, and API Service Verification"
type: phase
parent: "0002-task-registration-captcha-and-confirmation-code-redirect"
phase: "01"
status: completed
created: "2026-09-11"
tags: [task, phase, shared, schema, api, hooks]
---

# Phase 1: Shared Schema, Hook Forwarding, and API Service Verification

## Objective

Harden the contract pipeline so that `captchaToken` (from Cloudflare Turnstile) is reliably accepted by the shared schema, forwarded via `@sentinel/hooks` in the registration request body, and passed into `options: { captchaToken }` in `sentinel-api`'s `AuthService.register(...)` when invoking Supabase GoTrue Auth.

## Dependencies & Prerequisites

- Context specification approved: `docs/context/September/11/registration-captcha-and-confirmation-code-redirect.md`.

## Impacted Files & Components

- [MODIFY] `packages/shared/src/schema/auth/register-schema.ts`: Ensure `ApiRegisterSchema` accepts `captchaToken: z.string().nullable().optional()`.
- [MODIFY] `packages/shared/src/schema/auth/register-schema.test.ts`: Added test cases for `null`, `undefined`, and valid string token.
- [MODIFY] `packages/hooks/src/query/auth/use-sign-up-mutation.ts`: Validated that `captchaToken` is extracted from either top-level credentials or `credentials.options` and passed to `api('/auth/register', ...)`.
- [NEW] `packages/hooks/src/query/auth/use-sign-up-mutation.test.ts`: Added unit tests verifying token extraction and payload forwarding.
- [MODIFY] `app/sentinel-api/src/modules/identity/auth/auth.service.ts`: Ensured `AuthService.register` forwards `options: { ...(body.captchaToken ? { captchaToken: body.captchaToken.trim() } : {}) }`.

## Implementation Tasks

- [x] **Task 1.1 — Schema Nullable/Optional Update:** In `packages/shared/src/schema/auth/register-schema.ts`, defined `captchaToken: z.string().nullable().optional()`.
- [x] **Task 1.2 — Schema Unit Tests:** In `packages/shared/src/schema/auth/register-schema.test.ts`, verified that `RegisterSchema` and `ApiRegisterSchema` parse payloads where `captchaToken` is a string, `null`, or omitted.
- [x] **Task 1.3 — Hook Payload Assurance:** In `packages/hooks/src/query/auth/use-sign-up-mutation.ts`, guaranteed `captchaToken: typeof captchaToken === 'string' && captchaToken.trim() ? captchaToken.trim() : undefined` is serialized in the POST request body.
- [x] **Task 1.4 — API Service Captcha Relay:** In `app/sentinel-api/src/modules/identity/auth/auth.service.ts`, verified that `supabaseAnon.auth.signUp(...)` receives `captchaToken` inside `options`.

## Verification & Testing

- `node packages/shared/node_modules/vitest/vitest.mjs run packages/shared/src/schema/auth/register-schema.test.ts`: PASS (7/7 tests passed).
- `node packages/shared/node_modules/vitest/vitest.mjs run packages/hooks/src/query/auth/use-sign-up-mutation.test.ts`: PASS (3/3 tests passed).
- `node node_modules/typescript/bin/tsc --project packages/shared/tsconfig.json`: Exit code 0.
- `node node_modules/typescript/bin/tsc --project packages/hooks/tsconfig.json`: Exit code 0.
- `node node_modules/typescript/bin/tsc --project app/sentinel-api/tsconfig.json --noEmit`: Exit code 0.

## Risks & Rollback

- **Risk:** Existing callers omitting `captchaToken` might fail validation.
- **Mitigation:** Setting `z.string().nullable().optional()` ensures complete backward compatibility with callers that omit the field or send null.
