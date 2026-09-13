---
title: "Phase 4: Automated Tests, Live Probe Verification, and Audit"
type: phase
parent: "0001-task-mobile-auth-captcha-remember-and-forgot-password"
phase: "4"
status: planned
created: "2026-09-13"
tags: [task, phase, verification, testing, audit]
---

# Phase 4: Automated Tests, Live Probe Verification, and Audit

## Objective

Execute automated test suites across all affected packages (`@sentinel/shared`, `@sentinel/hooks`, `sentinel-api`, `sentinel-mobile`), verify that live mobile login succeeds without `(no captcha_token found)`, and conduct an end-to-end audit of all three requirements.

## Dependencies & Prerequisites

- Completion of Phase 1, Phase 2, and Phase 3.

## Impacted Files & Components

- Test suites in `sentinel-api`, `sentinel-mobile`, `packages/shared`, and `packages/hooks`.

## Implementation Tasks

- [ ] Task 4.1 — Run unit tests for `REMEMBERED_EMAIL_KEYS` in `packages/shared`.
- [ ] Task 4.2 — Run unit tests for `AuthService.login` in `sentinel-api`.
- [ ] Task 4.3 — Execute live probe curl against `POST /auth/login` with `x-sentinel-client: mobile` without `captchaToken` to verify `200 OK` and valid session generation.
- [ ] Task 4.4 — Verify typecheck across the monorepo (`pnpm turbo build` or typecheck commands).
- [ ] Task 4.5 — Validate mobile app bundle compilation via Expo.

## Verification & Testing

- `pnpm test` across affected modules.
- Verification probe script against `/auth/login`.

## Risks & Rollback

- Test phase only; zero regression risk.
