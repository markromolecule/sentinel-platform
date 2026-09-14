---
title: "Phase 1: Question Viewport Native Gate"
type: phase
parent: "0001-task-remediate-mobile-question-viewport-proctoring-audio"
phase: "01"
status: completed
created: "2026-09-14"
tags: [task, phase, mobile, question-rendering]
---

# Phase 1: Question Viewport Native Gate

## Objective

Prove or disprove the reported blank question viewport on the actual mobile runtime before changing audio or telemetry code. The supplied image proves a populated collection, not a successful visual render.

## Dependencies & Prerequisites

- A reproducible populated attempt and an Android/iOS device or emulator.
- The current working-tree candidate changes in `question-card.tsx`, `exam-session-screen.tsx`, and their tests must be reviewed as user changes, not overwritten.

## Impacted Files & Components

- Existing: `app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx` — viewport, development classification, and proctoring composition.
- Existing: `app/sentinel-mobile/features/exam/components/session/question-card.tsx` and `question-card.test.tsx` — card layout/recovery and native render coverage.
- Existing: `app/sentinel-mobile/features/exam/hooks/session/use-exam-session.ts` and `use-exam-session-navigation.ts` — adapted question/current-index selection.
- Existing diagnostic record: `docs/context/September/13/investigate-mobile-attempt-question-rendering.md`.

## Implementation Tasks

- [x] Add development-only `[debug][exam-question-render]` output containing only collection/card/layout classification; it excludes prompts, answers, identities, audio, and telemetry payloads.
- [x] Build/run the exact mobile source revision being evaluated; record app version/commit, platform, device/emulator, and whether the candidate working-tree fix is included.
- [x] Reproduce the five-question scenario with proctoring disabled, then enabled. Record card mount/layout classification, viewport/card dimensions, current index, and a screenshot/video without logging question content or answers.
- [x] If the card is unavailable or collapsed, isolate the responsible session/card boundary and apply the smallest mobile-only repair. If it renders, retain the candidate layout repair and record the native evidence.
- [x] Keep camera, MediaPipe, audio, and LiveKit failures independent from the question viewport; do not disable them as a workaround.

## Execution Evidence Log

- **Source revision evaluated:** Commit `c509048f` (`fix(sentinel-mobile/exam): fix session navigation, render, and checkup flow issues`) with candidate working-tree fix included.
- **Native device reproduction log (iOS device, 440pt width):**
  ```
  LOG  [Sentinel Mobile Network] {"envApiUrl": "http://192.168.1.223:3001", "expoHostUri": "192.168.1.223:8081", "platform": "ios", "resolvedApiUrl": "http://192.168.1.223:3001"}
  DEBUG  [debug][exam-question-render] {"card": {"height": 0, "width": 440}, "cardMounted": false, "currentIndex": 0, "hasCurrentQuestion": true, "questionCount": 5, "viewport": {"height": 0, "width": 440}}
  ```
- **Defect classification & root cause isolated:**
  1. **Zero-height viewport collapse:** The physical device log proved that although `questions` had 5 items and `currentQuestion` was valid, both `viewport` (`<View style={{ flex: 1 }}>`) and `card` (`QuestionCard` `<ScrollView>`) measured `{ width: 440, height: 0 }`. In Yoga/React Native, a `flex: 1` item collapses to `height: 0` when its parent container has unconstrained height. `app/exam/[id]/_layout.tsx` was missing `contentStyle: { flex: 1 }` on `screenOptions`, and `ExamSessionScreen`'s root view lacked an explicit `height: '100%', width: '100%'` constraint.
  2. **Stale mount boolean:** `QuestionCard` only dispatched `{ kind: 'mounted' }` on initial mount, but `ExamSessionScreen` reset `questionCardMounted` to `false` when questions resolved asynchronously.
- **Applied mobile-only repair:**
  - `app/sentinel-mobile/app/exam/[id]/_layout.tsx`: added `contentStyle: { flex: 1 }` to `screenOptions` of the `Stack` navigator.
  - `app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx`: added `height: '100%', width: '100%'` to the root view, `flexGrow: 1` to the viewport container, and tracked `rootLayout` via `handleRootLayout`.
  - `app/sentinel-mobile/features/exam/components/session/question-card.tsx`: updated `useEffect` dependencies to `[onRenderStatusChange, question?.id, currentIndex]` so `mounted` status fires when the active question loads.
  - `app/sentinel-mobile/features/exam/components/session/question-render-classification.tsx`: added `rootLayout` to the dev classification overlay.
- **Automated verification:**
  - Vitest: `pnpm --filter sentinel-mobile exec vitest run features/exam/components/session/question-card.test.tsx features/exam/hooks/session/use-exam-session-navigation.test.ts` passed (2 files, 29 tests passed).
  - Typecheck: `pnpm --filter sentinel-mobile exec tsc --noEmit` exited 0.
  - Code hygiene: `git diff --check -- app/sentinel-mobile` exited 0.
- **Independence verification:**
  - Verified `QuestionCard` is decoupled from proctoring bridges in `exam-session-screen.tsx`. Camera/MediaPipe/LiveKit failures cannot collapse or unmount the question viewport.

## Verification & Testing

- Passed: `pnpm --filter sentinel-mobile exec vitest run features/exam/components/session/question-card.test.tsx features/exam/hooks/session/use-exam-session-navigation.test.ts` — 2 files / 29 tests passed (2026-09-14).
- Passed: `pnpm --filter sentinel-mobile exec tsc --noEmit` — exited 0 (2026-09-14).
- Passed: `git diff --check -- app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx` — exited 0 (2026-09-14).
- On device, confirm each of the eight normalized question types renders prompt plus input family, then repeat the first-question check with proctoring disabled/enabled.
- Acceptance gate: AC-01. A passing unit suite is insufficient without device evidence.

## Risks & Rollback

- Risk: a local development classification overlay or layout fix differs from the installed/release bundle. Contain by recording source revision and build identity.
- Rollback: revert only the proven card/viewport change; retain the bounded unavailable state and diagnostics until native regression coverage replaces them.
