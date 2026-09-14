---
title: "Phase 2 — Architecture, Contracts, and Data Modeling"
type: phase
parent: "0005-task-fix-mobile-checkup-mediapipe-face-recognition"
phase: "02"
status: completed
created: "2026-09-13"
tags: [task, phase, architecture, contracts]
---

# Phase 2 — Architecture, Contracts, and Data Modeling

## Objective

Design the updated contracts, error handling pipeline, and resilient lifecycle mechanisms in `MobileMediaPipeBridge` and `useCheckupCalibration` to support robust real-time face detection, diagnostic error surfacing, and smooth calibration.

## Dependencies & Prerequisites

- Phase 1 Discovery: `docs/tasks/2026/09/2026-09-13/0005-task-fix-mobile-checkup-mediapipe-face-recognition/phase-01-discovery-and-scenarios.md`

## Impacted Files & Components

- `app/sentinel-mobile/features/exam/components/checkup/mobile-mediapipe-bridge.tsx`
- `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-calibration.ts`
- `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-camera.ts`
- `app/sentinel-mobile/features/exam/components/checkup/camera-preview.tsx`
- `app/sentinel-mobile/types/exam/index.ts`

## Implementation Tasks

- [x] Task 1 — **Define Resilient Camera & Loop Lifecycle in `MobileMediaPipeBridge` HTML/JS:**
  - Designed `ensurePredictLoopRunning()` helper that guarantees `predictLoop()` executes without depending on one-shot events.
  - In `startCamera()`, call `ensurePredictLoopRunning()` immediately after `await video.play().catch(...)`.
  - Secondary triggers attached via `video.addEventListener('loadeddata', ensurePredictLoopRunning, { once: true })` and `video.addEventListener('playing', ensurePredictLoopRunning, { once: true })`.
  - In `predictLoop`, relax gate to `video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0`.
  - Calculate monotonic timestamp `const timestamp = Math.max(now, lastProcessedTime + 1)`.
- [x] Task 2 — **Define GPU-to-CPU Delegate Fallback Architecture:**
  - In `initMediaPipe()`, attempt `FaceLandmarker.createFromOptions` with `delegate: "GPU"`.
  - On catch, log warning (`GPU delegate initialization failed, falling back to CPU`) and retry with `delegate: "CPU"`.
  - If both fail, send structured error `{ type: 'error', error: 'Failed to initialize FaceLandmarker: ' + err.message }` to React Native.
- [x] Task 3 — **Refactor Error Propagation Contract:**
  - Extended `UseExamCheckupReturn` and `CameraPreviewProps` in `types/exam/index.ts` with `cameraError?: string | null` and `modelStatus?: 'initializing' | 'ready' | 'error'`.
  - Wired bridge error handling so errors from `MobileMediaPipeBridge` are captured by `onCameraMountError` and forwarded to `calibrationFeedback`.
- [x] Task 4 — **Refine Camera Loading & Initialization State:**
  - Bridge sends `{ type: 'status', status: 'initializing' }` on mount and `{ type: 'status', status: 'ready' }` once FaceLandmarker is initialized and camera playback starts.
  - Checkup UI displays `"Initializing face detection model..."` loading state while downloading assets, preventing premature guide overlay rendering.

## Verification & Testing

- Contract audit completed: `types/exam/index.ts` updated with `cameraError` and `modelStatus`.
- TypeScript verification passed: `pnpm vitest run features/exam/hooks/checkup/use-exam-checkup.test.ts` passed (8/8 tests).
- Verified backward compatibility with `exam-session-screen.tsx` and `mobile-live-inspection-bridge.tsx`.

## Risks & Rollback

- **Risk:** Modifying `MobileMediaPipeBridge` might affect `ExamSessionScreen` or `MobileLiveInspectionBridge`.
  - **Mitigation:** The changes are purely additive and improve stability (fixing race conditions, adding CPU fallback). All existing props (`showPreview`, `onLandmarksDetected`, imperative ref methods) remain identical.
