---
title: "Phase 4: Deployment Synchronization & Live Smoke Test"
type: phase
parent: "0003-task-registration-captcha-parity-and-deployment-unblock"
phase: "4"
status: planned
created: "2026-09-11"
tags: [task, phase, deployment, verification, production]
---

# Phase 4: Deployment Synchronization & Live Smoke Test

## Objective

Push verified code to remote branch `fix-onboarding-validation`, merge Pull Request into `master`, trigger successful CI, allow Railway (`api.sentinelph.tech`) and Vercel (`app.sentinelph.tech`) to deploy updated builds, and verify live registration with Turnstile.

## Dependencies & Prerequisites

- Phase 1, Phase 2, and Phase 3 completed and verified locally.
- Git remote access to GitHub repository `markromolecule/sentinel`.

## Impacted Files & Components

- Git branch `fix-onboarding-validation` -> Pull Request to `master`.
- Production services: Railway API container and Vercel web frontend.

## Implementation Tasks

- [x] Task 4.1 — Stage and commit all changes with conventional commit message:
  `fix(auth): align register captcha resolution, relax rate limit, and fix core ci test`
- [x] Task 4.2 — Push branch to `origin/fix-onboarding-validation`.
- [x] Task 4.3 — Merge changes into `master` and push to `origin/master`.
- [ ] Task 4.4 — Verify that GitHub Actions CI workflow passes on `master`.
- [ ] Task 4.5 — Monitor Railway deployment of `sentinel-api` until active status is green.
- [ ] Task 4.6 — Execute live probe curl against `https://api.sentinelph.tech/auth/register` with dummy token to confirm it returns `(invalid-input-response)` instead of `(no captcha_token found)`.
- [ ] Task 4.7 — Perform manual student registration on `https://app.sentinelph.tech/auth/register` and verify redirect to `/auth/confirm-code`.

## Verification & Testing

```bash
# 1. Live probe:
curl -X POST https://api.sentinelph.tech/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"probe_live@gmail.com","password":"Password123!","firstName":"Julian","lastName":"Adriano","terms":true,"captchaToken":"test-token"}'
# Expected: HTTP 400 (invalid-input-response) -> confirms backend is evaluating captcha!

# 2. End-to-end browser test:
# Complete registration on https://app.sentinelph.tech/auth/register
# Expected: Redirects to /auth/confirm-code?email=...
```

## Risks & Rollback

- **Risk:** Build failures on Railway or Vercel.
- **Rollback:** `git revert` or redeploy previous container in Railway dashboard.
