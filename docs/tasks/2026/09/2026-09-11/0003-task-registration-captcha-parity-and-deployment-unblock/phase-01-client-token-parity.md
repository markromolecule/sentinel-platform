---
title: "Phase 1: Client Token Resolution Fallback Parity"
type: phase
parent: "0003-task-registration-captcha-parity-and-deployment-unblock"
phase: "1"
status: completed
created: "2026-09-11"
tags: [task, phase, auth, turnstile, frontend]
---

# Phase 1: Client Token Resolution Fallback Parity

## Objective

Ensure that `useRegisterForm` in `sentinel-web` extracts the Cloudflare Turnstile token using the exact resilient triple fallback proven in `useLoginForm` (`captchaToken || data.captchaToken || form.getValues('captchaToken')`), preventing any desynchronization or race condition during registration submission.

## Dependencies & Prerequisites

- Existing Turnstile widget in `RegisterForm`.
- React Hook Form schema resolver using `RegisterSchema`.

## Impacted Files & Components

- `app/sentinel-web/src/app/auth/register/_hooks/use-register-form/index.ts`: Updated `resolvedToken` extraction in `onSubmit`.
- `app/sentinel-web/src/app/auth/register/_hooks/use-register-form/index.test.tsx`: Validated token extraction and submission behavior.

## Implementation Tasks

- [x] Task 1.1 — Update `useRegisterForm` to include `form.getValues('captchaToken')` in `resolvedToken`.
- [x] Task 1.2 — Verify that submission passes `resolvedToken` to `useSignUpMutation` under both `options.captchaToken` and top-level `captchaToken`.
- [x] Task 1.3 — Run automated tests in `sentinel-web` to ensure no regressions in registration hook or component.

## Verification & Testing

```bash
pnpm --dir app/sentinel-web test src/app/auth/register
```
*Result:* 4 test files passed (17 tests).

## Risks & Rollback

- **Risk:** None; purely additive fallback matching the battle-tested pattern from `useLoginForm`.
- **Rollback:** Revert line 97 in `use-register-form/index.ts`.
