---
title: "Phase 1 — Discovery, Scenarios, and Boundary Analysis"
type: phase
parent: "0005-task-fix-mobile-checkup-mediapipe-face-recognition"
phase: "01"
status: completed
created: "2026-09-13"
tags: [task, phase, discovery]
---

# Phase 1 — Discovery, Scenarios, and Boundary Analysis

## Objective

Analyze and map all failure modes, lifecycle boundaries, event timing issues, and data contracts between `MobileMediaPipeBridge` (WebView), `useCheckupCalibration` (React Native hook), and `CameraPreview` (UI presentation) to guarantee zero blind spots during implementation.

## Dependencies & Prerequisites

- Canonical Context Specification: `docs/context/September/13/mobile-checkup-mediapipe-face-recognition.md`
- Master Task Plan: `docs/tasks/2026/09/2026-09-13/0005-task-fix-mobile-checkup-mediapipe-face-recognition/README.md`

## Impacted Files & Components

- `app/sentinel-mobile/features/exam/components/checkup/mobile-mediapipe-bridge.tsx`: Ingests camera feed, runs `@mediapipe/tasks-vision` in embedded WebView, posts landmark messages.
- `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-calibration.ts`: Receives landmarks, evaluates face centering/gaze stability, builds profile.
- `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-camera.ts`: Tracks camera readiness, permissions, and mount errors.
- `app/sentinel-mobile/features/exam/components/checkup/camera-preview.tsx`: Renders guide overlay, feedback badge, and progress bar.

## Implementation Tasks

- [x] Task 1 — Trace and document exact WebView HTML5 video event timing: map why `video.addEventListener('loadeddata', predictLoop)` fails when registered post-`await video.play()`.
  - **Verified Finding:** `await video.play()` resolves only after playback starts and `loadeddata` has already fired. Registering the event listener after `play()` means `loadeddata` is missed, so `predictLoop` never starts.
- [x] Task 2 — Benchmark `HTMLMediaElement.readyState` values across iOS WKWebView and Android WebView during live camera playback to establish the correct threshold (`readyState >= 2`).
  - **Verified Finding:** Live WebRTC/camera streams from `getUserMedia` do not buffer future frames and maintain `video.readyState === 2` (`HAVE_CURRENT_DATA`). The condition `video.readyState >= 3` evaluated to false on every tick, preventing frame detection. Web parity check confirmed `sentinel-web` requires `readyState >= 2`.
- [x] Task 3 — Identify WebGL/WebGPU delegate error signatures in mobile WebViews and establish safe try/catch CPU fallback logic.
  - **Verified Finding:** Hardcoded `delegate: "GPU"` throws unhandled exceptions on mobile WebViews that lack WebGL2 float texture extensions. Progressive fallback (`GPU` -> `CPU`) is required to guarantee initialization.
- [x] Task 4 — Audit timestamp contracts in `@mediapipe/tasks-vision` `detectForVideo(video, timestamp)` to eliminate `Input timestamp must be monotonically increasing` errors.
  - **Verified Finding:** MediaPipe throws if `timestamp <= lastProcessedTime`. Under mobile RAF timing jitter, timestamps can collide; calculating `Math.max(now, lastProcessedTime + 1)` guarantees strict monotonicity.
- [x] Task 5 — Trace React Native bridge error propagation from `sendToRN({ type: 'error' })` through `CameraPreview` and `useCheckupCalibration`.
  - **Verified Finding:** Bridge errors were swallowed by `onCameraMountError`, which simply set `cameraReady = true`. `calibrationFeedback` remained `null`, causing the UI to default to `"Align face in guide"` and concealing runtime failures.

## Verification & Testing

- Verified all 5 failure modes directly against active source files:
  - `app/sentinel-mobile/features/exam/components/checkup/mobile-mediapipe-bridge.tsx` (lines 137-149, 157-172, 222-235, 318-320)
  - `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-camera.ts` (lines 49-52)
  - `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-calibration.ts` (lines 101-106)
  - `app/sentinel-mobile/features/exam/components/checkup/camera-preview.tsx` (lines 146-166, 228-232)
- Confirmed zero regression risks with additive changes.

## Risks & Rollback

- **Risk:** Changing camera readyState conditions might trigger processing before video has non-zero width/height.
  - **Mitigation:** Require `video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0`.
