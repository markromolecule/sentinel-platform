---
title: "Phase 4: Full Quality Gates, Pre-flight Verification & Handoff"
type: phase
parent: "0001-task-sentinel-mobile-expo-apk-and-playstore-release"
phase: "4"
status: completed
created: "2026-09-23"
tags: [task, phase, mobile, verification]
---

# Phase 4: Full Quality Gates, Pre-flight Verification & Handoff

## Objective

Execute full regression testing across `sentinel-mobile`, validate pre-flight environment checks against local and production configurations, verify EAS configuration and credentials readiness, and provide clear operational instructions for building `.apk` files and deploying to Google Play Store.

## Dependencies & Prerequisites

- Phases 1, 2, and 3 completed.

## Impacted Files & Components

- Test execution logs.
- Documentation and handoff guides.

## Implementation Tasks

- [x] Task 4.1 — Run full Vitest suite in `app/sentinel-mobile`: `pnpm --filter sentinel-mobile test`.
- [x] Task 4.2 — Execute `pnpm --filter sentinel-mobile run verify:env` to validate real environment variables against schema.
- [x] Task 4.3 — Run EAS build dry-run or validation check (`eas config` / `eas build --platform android --profile preview --dry-run` or non-interactive pre-check).
- [x] Task 4.4 — Reconcile EAS remote environment variables to ensure `preview` profile has access to production variables.
- [x] Task 4.5 — Document complete end-to-end instructions for the developer to trigger their first `.apk` build and Google Play Store submission.

## Verification & Testing

- 100% test pass rate across all test files (`57/57` files passed, `410/410` tests passed).
- `verify:env` script outputs green/success for valid `.env` and catches intentionally omitted required keys.
- EAS configuration valid for profiles `preview`, `production-apk`, and `production`.
- Created comprehensive release runbook: `docs/context/September/23/mobile-release-runbook.md`.

## Risks & Rollback

- **Risk:** Network or EAS credentials prompt when running builds.
- **Mitigation:** Clear instructions provided in release runbook for developer execution of `eas build` with active authenticated account `livadomc`.
