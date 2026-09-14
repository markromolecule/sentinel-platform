---
status: completed
phase: "Phase 2"
title: "Target Directory Scaffolding & Barrel Design"
completed: "2026-09-13"
---

# Phase 2: Target Directory Scaffolding & Barrel Design

## Overview

Define the 7 domain subfolders, establish their barrel export contracts (`index.ts`), and design the root `hooks/index.ts` re-export barrier.

## Tasks

- [x] Create the 7 domain subdirectories under `app/sentinel-mobile/features/exam/hooks/`:
  - `checkup/`
  - `consent/`
  - `detail/`
  - `lobby/`
  - `monitoring/`
  - `result/`
  - `session/`
- [x] Define the export specifications for each group's `index.ts`:
  - `checkup/index.ts`: exports `useCheckupAudio`, `useCheckupCalibration`, `useCheckupCamera`, `useExamCheckup`
  - `consent/index.ts`: exports `useExamConsent`
  - `detail/index.ts`: exports `useExamDetails`
  - `lobby/index.ts`: exports `useExamLobby`, `useExamLobbySync`, `useLobbyReadiness`
  - `monitoring/index.ts`: exports `useMobileLiveInspection`, `useMobileMediaPipeMonitoring`
  - `result/index.ts`: exports `useExamResult`
  - `session/index.ts`: exports `useExamSession`, `useExamSessionLifecycle`, `useExamSessionNavigation`, `useExamSessionSecurity`, `useExamSessionSubmission`, `useExamSessionSync`, `useExamSessionTimer`, `useDrawerAnimation`
- [x] Define root `features/exam/hooks/index.ts` re-exporting all 7 domain barrels.

## Directory Layout Specification

```text
app/sentinel-mobile/features/exam/hooks/
├── checkup/
│   ├── use-checkup-audio.ts
│   ├── use-checkup-calibration.ts
│   ├── use-checkup-camera.ts
│   ├── use-exam-checkup.ts
│   ├── use-exam-checkup.test.ts
│   └── index.ts
├── consent/
│   ├── use-exam-consent.ts
│   └── index.ts
├── detail/
│   ├── use-exam-details.ts
│   └── index.ts
├── lobby/
│   ├── use-exam-lobby.ts
│   ├── use-exam-lobby-sync.ts
│   ├── use-lobby-readiness.ts
│   ├── use-exam-lobby.test.ts
│   └── index.ts
├── monitoring/
│   ├── use-mobile-live-inspection.ts
│   ├── use-mobile-live-inspection.test.ts
│   ├── use-mobile-mediapipe-monitoring.ts
│   ├── use-mobile-mediapipe-monitoring.test.ts
│   └── index.ts
├── result/
│   ├── use-exam-result.ts
│   ├── use-exam-result.test.ts
│   └── index.ts
├── session/
│   ├── use-drawer-animation.ts
│   ├── use-drawer-animation.test.ts
│   ├── use-exam-session.ts
│   ├── use-exam-session-lifecycle.ts
│   ├── use-exam-session-navigation.ts
│   ├── use-exam-session-navigation.test.ts
│   ├── use-exam-session-security.ts
│   ├── use-exam-session-submission.ts
│   ├── use-exam-session-sync.ts
│   ├── use-exam-session-sync.test.ts
│   ├── use-exam-session-timer.ts
│   ├── use-exam-session-timer.test.ts
│   ├── use-exam-session.test.ts
│   └── index.ts
└── index.ts # Root barrel exporting all groups
```

## Verification Evidence
- Directory existence confirmed: 7 subdirectories created under `app/sentinel-mobile/features/exam/hooks/`.
- Pre-refactor tests and typechecks remain passing and unaffected.
