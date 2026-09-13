---
title: "Phase 1 — Discovery, Scenarios, and Boundary Analysis"
type: task
status: completed
created: "2026-09-13"
tags: [task, phase]
phase: 1
---

# Phase 1 — Discovery, Scenarios, and Boundary Analysis

## Objectives

Document current-state defects, inspect relevant source files, analyze error traces from backend and mobile logs, and specify reproduction scenarios.

## Evidence & Inspected Files

- `app/sentinel-mobile/features/exam/components/checkup/mobile-mediapipe-bridge.tsx`:
  - Missing `mediaCapturePermissionGrantType="grant"` on `<WebView>`, causing repeated Android system camera permission dialogs.
  - Embedded HTML `<video>` has `display: ${showPreview ? 'block' : 'none'}`, setting video dimensions to 0x0 when preview is hidden and causing MediaPipe WASM exceptions and message spam across the JS bridge that freezes question rendering.
  - Offscreen container has `width: 1, height: 1, opacity: 0` without `top/left/pointerEvents`, causing Android Chromium to cull or throttle the offscreen WebView.
- `app/sentinel-mobile/features/exam/lib/mobile-telemetry-client.ts`:
  - `buildMobileTelemetryPayload` and `emitMobileTelemetryEvent` omit `metadata` (`durationMs`, `confidenceScore`, `aggregation`).
- `app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts`:
  - `GazeTrackingRule` and `FaceDetectionRule` require `metadata.durationMs >= 4000` (from `MEDIAPIPE_ATTEMPT_PERSISTENCE_DURATION_MS`) to persist incidents to the instructor's live monitoring timeline on a single occurrence.
- `app/sentinel-mobile/features/exam/hooks/use-mobile-mediapipe-monitoring.ts`:
  - Consecutive anomaly triggers emit telemetry events without metadata, resulting in backend ignoring events (`Event ignored: threshold not met`).
- `app/sentinel-mobile/features/exam/hooks/use-mobile-live-inspection.ts`:
  - Line 93 passes stale `revision: directive.revision` to `acknowledgeLiveInspectionPublisherReady` instead of updated `connection.revision` returned by `createLiveInspectionPublisherConnection`, triggering `409 Conflict: [ApiError: Live inspection lease changed.]`.
- `app/sentinel-mobile/features/exam/hooks/use-exam-checkup.ts`:
  - Line 83 contains verbose debug log `console.log('Recording status update:', status)`.
- `app/sentinel-mobile/app/(tabs)/exam/index.tsx`:
  - `useExamsQuery()` called with empty args instead of `{ viewer: 'student' }`, and lacks focus-based refetching.
- `app/sentinel-mobile/features/exam/lib/mobile-exam-display-adapter.ts`:
  - `adaptExamForMobile` does not evaluate `exam.completedAt` or `attempt_status`, leaving submitted exams in `'available'` or `'published'`.
- `app/sentinel-mobile/features/exam/hooks/use-exam-session-submission.ts`:
  - Does not invalidate `EXAM_QUERY_KEYS.all` on React Query after submission.
- `app/sentinel-mobile/app/exam/[id]/feedback/index.tsx` & `thank-you.tsx`:
  - Buttons styled with `backgroundColor: colors.text` (black in light mode) instead of `colors.primary` (#323d8f).

## Tasks

- [x] Record baseline test execution across mobile exam features.
- [x] Confirm reproduction steps for question rendering, tab filtering, telemetry thresholding, and live inspection.

## Verification

### Baseline Test Execution Evidence

- `pnpm --filter sentinel-mobile test`
  - PASS: 47/47 test files passed, 304/304 tests passed.
- `pnpm --filter sentinel-api test src/modules/telemetry/ingestion/rules/ai-rules.test.ts`
  - PASS: 1/1 test files passed, 6/6 tests passed.

### Reproduction Confirmation

1. **Question Rendering & Camera Prompts:** Confirmed `<WebView>` lacks `mediaCapturePermissionGrantType="grant"` and video element is styled `display: none` when `showPreview=false`.
2. **Turned-In Tab Filtering:** Confirmed `useExamsQuery()` called without `{ viewer: 'student' }` and `adaptExamForMobile` does not normalize completed attempt status to `'turned_in'`.
3. **Telemetry Anomaly Thresholding:** Confirmed `buildMobileTelemetryPayload` omits `metadata`, and backend `aiRules` drop events without `durationMs >= 4000`.
4. **Live Inspection 409 Conflict:** Confirmed line 93 of `use-mobile-live-inspection.ts` sends `directive.revision` rather than `connection.revision`.
5. **Feedback Styling:** Confirmed buttons in `feedback/index.tsx` (line 350) and `thank-you.tsx` (line 95) use `backgroundColor: colors.text`.
