---
status: completed
phase: "Phase 1"
title: "Discovery, Mapping and Contracts"
completed: "2026-09-13"
---

# Phase 1: Discovery, Mapping and Contracts

## Overview

Catalog all 30 existing hook files, export signatures, internal hook dependencies, and external consumer references.

## Tasks

- [x] Catalog all 19 hook files and 11 unit test files.
- [x] Map out which hooks depend on other sibling hooks:
  - `useExamCheckup` -> `useCheckupCamera`, `useCheckupAudio`, `useCheckupCalibration`
  - `useExamLobby` -> `useLobbyReadiness`, `useExamLobbySync`
  - `useExamSession` -> `useExamSessionSecurity`, `useExamSessionTimer`, `useExamSessionSubmission`, `useExamSessionSync`, `useExamSessionNavigation`, `useExamSessionLifecycle`
- [x] Identify all 9 external consumer files importing from `features/exam/hooks`.
- [x] Verify baseline vitest execution (49 passing tests) and `tsc --noEmit`.

## Inventory & Dependency Mapping

### 1. Hook Inventory (19 hook files, 11 test files)
1. **Checkup (4 hooks + 1 test file):**
   - `use-checkup-audio.ts` -> exports `useCheckupAudio`
   - `use-checkup-calibration.ts` -> exports `useCheckupCalibration`
   - `use-checkup-camera.ts` -> exports `useCheckupCamera`
   - `use-exam-checkup.ts` -> exports `useExamCheckup`, re-exports camera/audio/calibration
   - `use-exam-checkup.test.ts` (8 tests)

2. **Lobby (3 hooks + 1 test file):**
   - `use-exam-lobby.ts` -> exports `useExamLobby`, re-exports readiness/sync
   - `use-exam-lobby-sync.ts` -> exports `useExamLobbySync`
   - `use-lobby-readiness.ts` -> exports `useLobbyReadiness`
   - `use-exam-lobby.test.ts` (4 tests)

3. **Session (8 hooks + 5 test files):**
   - `use-exam-session.ts` -> exports `useExamSession`, re-exports sub-hooks
   - `use-exam-session-lifecycle.ts` -> exports `useExamSessionLifecycle`
   - `use-exam-session-navigation.ts` -> exports `useExamSessionNavigation`
   - `use-exam-session-security.ts` -> exports `useExamSessionSecurity`
   - `use-exam-session-submission.ts` -> exports `useExamSessionSubmission`
   - `use-exam-session-sync.ts` -> exports `useExamSessionSync`
   - `use-exam-session-timer.ts` -> exports `useExamSessionTimer`
   - `use-drawer-animation.ts` -> exports `useDrawerAnimation`
   - `use-exam-session.test.ts` (9 tests)
   - `use-exam-session-navigation.test.ts` (2 tests)
   - `use-exam-session-sync.test.ts` (2 tests)
   - `use-exam-session-timer.test.ts` (2 tests)
   - `use-drawer-animation.test.ts` (3 tests)

4. **Monitoring (2 hooks + 2 test files):**
   - `use-mobile-live-inspection.ts` -> exports `useMobileLiveInspection`
   - `use-mobile-mediapipe-monitoring.ts` -> exports `useMobileMediaPipeMonitoring`
   - `use-mobile-live-inspection.test.ts` (6 tests)
   - `use-mobile-mediapipe-monitoring.test.ts` (5 tests)

5. **Detail (1 hook):**
   - `use-exam-details.ts` -> exports `useExamDetails`

6. **Consent (1 hook):**
   - `use-exam-consent.ts` -> exports `useExamConsent`

7. **Result (1 hook + 1 test file):**
   - `use-exam-result.ts` -> exports `useExamResult`
   - `use-exam-result.test.ts` (8 tests)

### 2. External Consumers (9 files)
1. `app/sentinel-mobile/app/exam/[id]/checkup/index.tsx` -> imports `useExamCheckup`
2. `app/sentinel-mobile/app/exam/[id]/instruction/index.tsx` -> imports `useExamDetails`
3. `app/sentinel-mobile/app/exam/[id]/index.tsx` -> imports `useExamDetails`
4. `app/sentinel-mobile/app/exam/[id]/privacy/index.tsx` -> imports `useExamConsent`
5. `app/sentinel-mobile/app/exam/[id]/lobby/index.tsx` -> imports `useExamLobby`
6. `app/sentinel-mobile/app/exam/[id]/result/index.tsx` -> imports `useExamResult`
7. `app/sentinel-mobile/features/exam/components/session/question-drawer.tsx` -> imports `useDrawerAnimation`
8. `app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx` -> imports `useExamSession`, `useMobileMediaPipeMonitoring`
9. `app/sentinel-mobile/features/exam/components/session/mobile-live-inspection-bridge.tsx` -> imports `useMobileLiveInspection`

## Baseline Verification Evidence
- `pnpm --filter sentinel-mobile test features/exam/hooks`: PASS (10 test suites, 49 tests passed)
- `pnpm --filter sentinel-mobile exec tsc --noEmit`: PASS (0 type errors)
