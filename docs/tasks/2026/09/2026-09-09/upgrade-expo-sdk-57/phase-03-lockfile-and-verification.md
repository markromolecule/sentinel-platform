---
title: "Phase 03: Lockfile Regeneration and Verification"
type: phase
parent: "upgrade-expo-sdk-57"
phase: "03"
status: completed
created: "2026-09-09"
tags: [task, phase, mobile, lockfile, verification]
---

# Phase 03: Lockfile Regeneration and Verification

## Objective

Install dependencies using `pnpm install`, regenerate `pnpm-lock.yaml`, verify package compatibility with `npx expo install --check`, run full TypeScript typechecking and unit test suites, and ensure Metro starts cleanly with cleared cache.

## Dependencies & Prerequisites

- Phase 01 package updates complete.
- Phase 02 code and configuration migrations complete.

## Impacted Files & Components

- `pnpm-lock.yaml`: Regenerated lockfile for all packages.
- `app/sentinel-mobile/app.json`: Aligned schema for SDK 57 (removed deprecated newArchEnabled/edgeToEdgeEnabled, migrated splash to plugin).
- `app/sentinel-mobile/constants/theme.ts`: Added `unspecified` colorScheme handling for React Native 0.86.
- `app/sentinel-mobile/app/index.tsx`: Cleaned up StatusBar props for SDK 57.
- `app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx`: Replaced deprecated `StyleSheet.absoluteFillObject` with `StyleSheet.absoluteFill`.

## Implementation Tasks

- [x] Execute `pnpm install` in the monorepo root.
- [x] Run `npx expo install --check` inside `app/sentinel-mobile` to verify zero version mismatches.
- [x] Run `pnpm --dir app/sentinel-mobile exec tsc --noEmit` to verify type safety.
- [x] Run `pnpm --dir app/sentinel-mobile test` to ensure all 36 test files and 229+ unit tests pass.
- [x] Run `npx expo-doctor` in `app/sentinel-mobile` to verify configuration integrity.

## Verification & Testing

- Automated tests: `pnpm --dir app/sentinel-mobile test` passes (PASS: 36/36 test files, 229/229 tests passed).
- Typecheck: `pnpm --dir app/sentinel-mobile exec tsc --noEmit` passes (PASS: 0 errors).
- Expo check: `npx expo install --check` passes (PASS: Dependencies are up to date).
- Expo doctor: `npx expo-doctor` passes (PASS: 21/21 checks passed. No issues detected!).

## Risks & Rollback

- Revert `pnpm-lock.yaml` via `git checkout pnpm-lock.yaml` if resolution encounters unresolvable conflicts.
