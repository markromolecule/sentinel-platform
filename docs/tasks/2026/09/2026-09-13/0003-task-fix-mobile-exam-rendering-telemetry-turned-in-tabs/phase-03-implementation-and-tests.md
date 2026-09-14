---
title: "Phase 3 — Incremental Implementation and Tests"
type: task
status: completed
created: "2026-09-13"
tags: [task, phase]
phase: 3
---

# Phase 3 — Incremental Implementation and Tests

## Objectives

Implement the bug fixes incrementally with isolated unit tests for each component.

## Implementation Steps

### Step 3.1: Mobile MediaPipe Bridge & Camera Permissions

- File: `app/sentinel-mobile/features/exam/components/checkup/mobile-mediapipe-bridge.tsx`
- Actions:
  - Add `mediaCapturePermissionGrantType="grant"` to `<WebView>`.
  - In `htmlContent`, update `<video>` styles so it remains in layout: `width: 100%; height: 100%; object-fit: cover;` without `display: none`.
  - In `startCamera()`, call `video.play()` explicitly.
  - Update `styles.container` to `opacity: 0.01; width: 1; height: 1; pointerEvents: 'none'; position: 'absolute'; top: 0; left: 0`.

### Step 3.2: Mobile Telemetry Metadata & Duration Calculation

- Files:
  - `app/sentinel-mobile/features/exam/lib/mobile-telemetry-client.ts`
  - `app/sentinel-mobile/features/exam/hooks/use-mobile-mediapipe-monitoring.ts`
- Actions:
  - Accept and serialize `metadata: { durationMs, confidenceScore, aggregation }` in `buildMobileTelemetryPayload` and `emitMobileTelemetryEvent`.
  - In `use-mobile-mediapipe-monitoring.ts`, calculate `durationMs = Math.max(consecutiveFrames.current[activeSignal] * (frameIntervalMs ?? 1000), 4000)`.
  - Pass `metadata: { durationMs, confidenceScore }` when emitting `GAZE_OFF_SCREEN` and `NO_FACE_DETECTED`.

### Step 3.3: Live Inspection Publisher Revision Handshake

- File: `app/sentinel-mobile/features/exam/hooks/use-mobile-live-inspection.ts`
- Actions:
  - Update `reconcileDirective`: set `activeRevision = connection?.revision ?? directive.revision`.
  - Pass `revision: activeRevision` to `acknowledgeLiveInspectionPublisherReady`.
  - In `catch`, use `activeRevision ?? 1` when acknowledging failure.
- File: `app/sentinel-mobile/features/exam/hooks/use-exam-checkup.ts`:
  - Remove debug log `console.log('Recording status update:', status)`.

### Step 3.4: Turned-In Exam Tab Filtering & Normalization

- Files:
  - `app/sentinel-mobile/app/(tabs)/exam/index.tsx`
  - `app/sentinel-mobile/features/exam/lib/mobile-exam-display-adapter.ts`
  - `app/sentinel-mobile/features/exam/hooks/use-exam-session-submission.ts`
- Actions:
  - Call `useExamsQuery({ viewer: 'student' })` in `(tabs)/exam/index.tsx`.
  - Add `useFocusEffect` to trigger `refetch()` when returning to the tab.
  - In `adaptExamForMobile`, if `exam.completedAt` is truthy or `(exam as any).attempt_status === 'COMPLETED'`, normalize `status: 'turned_in'`.
  - In `use-exam-session-submission.ts`, invalidate `EXAM_QUERY_KEYS.all` on success.

### Step 3.5: Feedback Screens Button Styling

- Files:
  - `app/sentinel-mobile/app/exam/[id]/feedback/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/feedback/thank-you.tsx`
- Actions:
  - Update button styling from `backgroundColor: colors.text` to `backgroundColor: colors.primary` with white text (`#ffffff`).

## Automated Unit Tests & Verification

- `pnpm --filter sentinel-mobile exec tsc --noEmit` (PASS: 0 errors)
- `pnpm --filter sentinel-mobile test features/exam/lib/mobile-exam-display-adapter.test.ts` (PASS: 7/7 tests passed)
- `pnpm --filter sentinel-mobile test features/exam/lib/mobile-telemetry-client.test.ts` (PASS: 6/6 tests passed)
- `pnpm --filter sentinel-mobile test features/exam/components/checkup/mobile-mediapipe-bridge.test.tsx` (PASS: 2/2 tests passed)
- `pnpm --filter sentinel-mobile test features/exam/hooks/use-mobile-mediapipe-monitoring.test.ts` (PASS: 5/5 tests passed)
- `pnpm --filter sentinel-mobile test features/exam/hooks/use-mobile-live-inspection.test.ts features/exam/components/session/mobile-live-inspection-bridge.test.tsx` (PASS: 12/12 tests passed)
- `pnpm --filter sentinel-mobile test features/exam/hooks/use-exam-session.test.ts` (PASS: 9/9 tests passed)
- `pnpm --filter sentinel-mobile test` (PASS: 48/48 test files, 312/312 tests passed)
