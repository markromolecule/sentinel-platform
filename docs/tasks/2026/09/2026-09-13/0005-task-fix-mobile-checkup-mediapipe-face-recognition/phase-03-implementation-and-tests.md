---
title: "Phase 3 — Incremental Implementation and Tests"
type: phase
parent: "0005-task-fix-mobile-checkup-mediapipe-face-recognition"
phase: "03"
status: completed
created: "2026-09-13"
tags: [task, phase, implementation, tests]
---

# Phase 3 — Incremental Implementation and Tests

## Objective

Execute the implementation changes across `mobile-mediapipe-bridge.tsx`, `camera-preview.tsx`, `use-checkup-calibration.ts`, and `use-checkup-camera.ts`, and write automated tests verifying loop execution, delegate fallback, and error handling.

## Dependencies & Prerequisites

- Phase 2 Architecture: `docs/tasks/2026/09/2026-09-13/0005-task-fix-mobile-checkup-mediapipe-face-recognition/phase-02-architecture-and-contracts.md`

## Impacted Files & Components

- `app/sentinel-mobile/features/exam/components/checkup/mobile-mediapipe-bridge.tsx`
- `app/sentinel-mobile/features/exam/components/checkup/camera-preview.tsx`
- `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-calibration.ts`
- `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-camera.ts`
- `app/sentinel-mobile/features/exam/hooks/checkup/use-exam-checkup.ts`
- `app/sentinel-mobile/app/exam/[id]/checkup/index.tsx`
- `app/sentinel-mobile/types/exam/index.ts`
- `app/sentinel-mobile/features/exam/components/checkup/mobile-mediapipe-bridge.test.tsx`
- `app/sentinel-mobile/features/exam/hooks/checkup/use-exam-checkup.test.ts`

## Implementation Tasks

- [x] Task 1 — **Update `MobileMediaPipeBridge` HTML/JS Runtime:**
  - Fixed event race condition with `ensurePredictLoopRunning()`, starting `predictLoop` immediately upon `video.play()` resolution while keeping one-shot fallbacks for `loadeddata` and `playing`.
  - Loosened video readyState check to `video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0` to support WebRTC live camera streams on mobile WebViews.
  - Implemented progressive GPU-to-CPU fallback in `initMediaPipe()`.
  - Enforced monotonic timestamps with `Math.max(now, lastProcessedTime + 1)` before invoking `detectForVideo()`.
  - Validated `navigator.mediaDevices && navigator.mediaDevices.getUserMedia` existence and added explicit `beforeunload` cleanup.
- [x] Task 2 — **Update `useCheckupCalibration` & `useCheckupCamera` Hooks:**
  - Added `cameraError` to `useCheckupCamera` and `useCheckupCalibration` state, forwarding bridge and camera errors directly into `calibrationFeedback`.
  - Verified `isFaceCentered` tracks `evaluation.isValid`.
  - Ensured dynamic guidance strings (`evaluation.details`) display correctly when unaligned.
- [x] Task 3 — **Update `CameraPreview` Component:**
  - Added `bridgeStatus` tracking ('loading' | 'ready' | 'error').
  - Shows `"Initializing face detection…"` banner while model is downloading/compiling.
  - Displays error container with retry action if camera or bridge initialization fails.
  - Smoothly highlights the guide ellipse in emerald green (`#10b981`) when `isFaceCentered` is true.
- [x] Task 4 — **Update & Expand Unit Tests:**
  - Updated `mobile-mediapipe-bridge.test.tsx` to verify script generation, GPU fallback logic, and readyState checks.
  - Updated `use-exam-checkup.test.ts` to assert `cameraError` recording and surfacing into `calibrationFeedback`.
  - Verified all tests pass cleanly.

## Verification & Testing

1. **Mobile MediaPipe Bridge & Calibration Tests:**
   ```bash
   pnpm vitest run features/exam/components/checkup/mobile-mediapipe-bridge.test.tsx features/exam/lib/mobile-mediapipe-calibration.test.ts
   ```
   **Output:** 2 passed, 10 tests passed (100%).

2. **Checkup Hook Coordinator Tests:**
   ```bash
   pnpm vitest run features/exam/hooks/checkup/use-exam-checkup.test.ts
   ```
   **Output:** 1 passed, 9 tests passed (100%).

3. **TypeScript Static Typecheck:**
   ```bash
   npx tsc --noEmit
   ```
   **Output:** Exited with code 0 (zero TypeScript errors).

## Risks & Rollback

- **Risk:** WebView syntax errors inside template string might not be caught by TypeScript compiler.
  - **Mitigation:** Verified script strings through automated unit tests (`mobile-mediapipe-bridge.test.tsx`), checking syntax structure and matching functions.

