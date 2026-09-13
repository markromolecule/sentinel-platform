---
title: "Fix Mobile Checkup MediaPipe Face Recognition & Calibration Guide Alignment"
type: context
status: ready
created: "2026-09-13"
tags: [context, defect-resolution, sentinel-mobile, mediapipe, checkup, calibration]
feature: "mobile-checkup-mediapipe-face-recognition"
---

# Fix Mobile Checkup MediaPipe Face Recognition & Calibration Guide Alignment Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  On the Sentinel Mobile System Checkup screen (`/exam/[id]/checkup`), when the student positions their face inside the calibration guide ellipse, face recognition does not work and remains perpetually stuck displaying `"Align face in guide"`.
  Investigation reveals multiple root causes in the mobile MediaPipe execution pipeline:
  1. **Event Listener Race Condition in WebView Camera Stream:** In `MobileMediaPipeBridge` (`features/exam/components/checkup/mobile-mediapipe-bridge.tsx`), `video.addEventListener('loadeddata', predictLoop)` is attached *after* `await video.play()`. Because `video.play()` resolves only after playback begins and the first frame has already loaded, the `loadeddata` event has already fired. Consequently, `predictLoop` is never started on many devices.
  2. **Restrictive Video ReadyState Check (`readyState >= 3`):** Inside `predictLoop`, the frame processing condition requires `video.readyState >= 3` (`HAVE_FUTURE_DATA`). For real-time WebRTC/camera streams (`navigator.mediaDevices.getUserMedia`) in mobile WebViews (iOS WKWebView and Android WebView), video elements do not buffer future frames and typically remain at `video.readyState === 2` (`HAVE_CURRENT_DATA`). As a result, the loop continuously skips frame processing.
  3. **Fragile Hardcoded GPU Delegate (`delegate: "GPU"`):** MediaPipe's `FaceLandmarker.createFromOptions` hardcodes `delegate: "GPU"` without a CPU fallback. On mobile WebViews where WebGL2 float texture extensions or GPU contexts are constrained, MediaPipe throws an initialization exception and halts.
  4. **Strict Timestamp Monotonicity:** MediaPipe `detectForVideo(video, timestampMs)` throws an exception if `now <= lastProcessedTime`. On mobile RAF loops, sub-millisecond timer resolution or rounding can cause non-strictly-increasing timestamps.
  5. **Silent Error Swallowing in Host React Native Hook:** When MediaPipe or camera initialization fails in the bridge, `sendToRN({ type: 'error' })` notifies React Native, but `use-checkup-camera.ts` simply logs a console warning and sets `cameraReady = true`. `useCheckupCalibration` is never notified, leaving `calibrationFeedback = null` and trapping the user interface in a deceptive `"Align face in guide"` state with no error banner, retry button, or diagnostic details.

- **Business / User Value:**
  - Enables mobile students to successfully calibrate their face position and eye gaze during pre-exam system checkup, unblocking them from starting their exams.
  - Ensures biometric proctoring parity between Sentinel Web and Sentinel Mobile by using identical `@sentinel/shared` calibration thresholds and mathematical formulas.
  - Provides instant, transparent visual feedback and diagnostics if the camera or MediaPipe runtime encounters device/network failures.

- **Success Criteria:**
  - `MobileMediaPipeBridge` reliably initializes the camera and MediaPipe `FaceLandmarker` inside the WebView on both iOS and Android.
  - `predictLoop` starts reliably and analyzes camera frames at the configured `frameIntervalMs` (default 500ms).
  - When the student centers their face inside the SVG guide ellipse, real-time feedback transitions from `"Align face in guide"` / `"No face detected"` to `"Hold still to calibrate..."`, the ellipse turns green, and the calibration progress bar advances from 0% to 100% across 6 stable frames.
  - When calibration completes, `isCalibrated` becomes `true`, the profile is persisted to mobile storage via `writeStoredMobileCalibrationProfile`, and the "Start Exam" CTA button is enabled.
  - If camera access is denied or MediaPipe runtime fails, a clear, actionable error state is presented rather than silently freezing on `"Align face in guide"`.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a student taking an exam on mobile, I want the checkup screen to recognize my face in real time when I align it with the on-screen guide, so that I can calibrate my baseline gaze and proceed to the exam lobby.*
- *As a student with an off-center or distant face, I want immediate instructive feedback (e.g. "Move closer", "Look directly at camera", "Open your eyes"), so that I understand how to position my device properly.*
- *As a student whose device or network encounters a camera/MediaPipe failure, I want an informative error banner and a retry option, so that I am not left wondering why the screen is unresponsive.*
- *As an exam proctor / instructor, I want student baseline calibration profiles generated on mobile to match the precision of Sentinel Web, ensuring accurate anomaly detection during live sessions.*

### Functional Requirements

- [ ] **FR-1: Reliable Prediction Loop Execution in `MobileMediaPipeBridge`:**
  - Start `predictLoop` immediately once `await video.play()` resolves, or immediately if `video.readyState >= 2`.
  - Also attach a fallback `{ once: true }` listener on `loadeddata` and `playing` to ensure the loop kicks off under all browser timing conditions.
  - Relax `predictLoop` condition to `video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0`.
- [ ] **FR-2: GPU-to-CPU Graceful Fallback for `FaceLandmarker`:**
  - In `initMediaPipe`, attempt to create `FaceLandmarker` with `delegate: "GPU"`.
  - If GPU initialization fails (e.g. WebGL context restriction), catch the error, log a warning, and fall back to `delegate: "CPU"`.
  - If `storage.googleapis.com` or CDN assets fail, emit a descriptive structured error to React Native.
- [ ] **FR-3: Strictly Monotonic Timestamp Tracking:**
  - Compute frame timestamp as `Math.max(now, lastProcessedTime + 1)` before passing to `faceLandmarker.detectForVideo(video, timestamp)` to satisfy MediaPipe's monotonicity contract.
- [ ] **FR-4: Camera Stream Diagnostics and Error Surfacing:**
  - Verify `navigator.mediaDevices && navigator.mediaDevices.getUserMedia` before invocation.
  - In `useCheckupCalibration` and `useCheckupCamera`, accept bridge errors (`onError`) and set `calibrationFeedback` to explain the exact problem (e.g. `"Camera access failed in preview: [error]"` or `"MediaPipe initialization failed: [error]"`).
- [ ] **FR-5: Alignment & Feedback Parity with Web:**
  - Forward raw detected landmarks (`landmarksByFace`) to `handleLandmarksDetected`.
  - Pass active confidence threshold (`Math.max(0.35, confidenceThreshold - 0.15)`) to `evaluateMobileCheckupFrame`.
  - Map evaluation results into live guidance:
    - `"No face detected in the camera frame."`
    - `"Your face is off-center. Please look directly at the center of the camera."`
    - `"Your face is too far from the camera. Please move closer to the device."`
    - `"Your face is too close to the camera. Please move the device farther away."`
    - `"Both eyes appear closed. Please keep your eyes open during calibration."`
    - `"Hold still to calibrate..."` (when valid and centered).
- [ ] **FR-6: Progress Accumulation & Profile Persistence:**
  - Verify `isMobileCalibrationStable` across consecutive candidate frames.
  - Fill progress bar to 100% over 6 frames, build profile via `buildMobileCalibrationProfile`, save via `writeStoredMobileCalibrationProfile(id, profile)`, and set `isCalibrated = true`.

### Edge Cases & Failure Modes

- **Camera Permission Denied or Revoked:** Display the existing permission card with "Grant Permission" CTA; do not mount `MobileMediaPipeBridge` until permission is granted.
- **Offline / Slow Connection (CDN model download delayed):** Display a loading indicator `"Initializing face detection model..."` while MediaPipe WASM and `.task` files download, preventing premature display of the guide overlay.
- **Multiple Faces in View:** Display `"Multiple faces detected in the camera frame"` and decelerate progress until only one face is visible.
- **Eyes Closed / Blinking:** Display `"Both eyes appear closed. Please keep your eyes open during calibration"` and pause progress.
- **Head Movement / Jitter:** If the student moves erratically, `isMobileCalibrationStable` returns false, and progress gracefully steps back by 2 frames rather than hard-resetting to 0.

---

## 3. Technical & Architectural Context

- **Affected Domains / Layers:**
  - Mobile App (`app/sentinel-mobile/`)
  - Feature: Exam Checkup (`features/exam/`)
  - Components: `camera-preview.tsx`, `mobile-mediapipe-bridge.tsx`
  - Hooks: `use-checkup-calibration.ts`, `use-checkup-camera.ts`, `use-exam-checkup.ts`
  - Lib: `mobile-mediapipe-calibration.ts`

- **Existing Files & Reference Symbols:**
  - `app/sentinel-mobile/features/exam/components/checkup/mobile-mediapipe-bridge.tsx`: WebView HTML5 camera & MediaPipe runner.
  - `app/sentinel-mobile/features/exam/components/checkup/camera-preview.tsx`: Camera container, SVG ellipse guide, status text, and progress bar.
  - `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-calibration.ts`: Calibration state machine, landmark handler, stability check.
  - `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-camera.ts`: Camera device permission and ready state.
  - `app/sentinel-mobile/features/exam/lib/mobile-mediapipe-calibration.ts`: Pure wrapper around `@sentinel/shared` calibration utilities.
  - `@sentinel/shared`: `evaluateMediaPipeCalibrationCandidate`, `isMediaPipeFaceCenteredForCalibration`, `createMediaPipeCalibrationSample`.

- **Data Model & Schema Changes:**
  - None. Stored profile schema in AsyncStorage (`sentinel-mobile:mediapipe-profile:${id}`) remains `MediaPipeCalibrationProfile`.

- **Security & Authorization:**
  - OS Camera permission requested through Expo Camera (`useCameraPermissions`) and forwarded to WebView via `mediaCapturePermissionGrantType="grant"` and `onPermissionRequest`.

---

## 4. UI/UX & Interaction Guidelines

- **Layout & Visual Design:**
  - Preserve the 300px preview container with rounded corners (`borderRadius: 20`) and dark background.
  - SVG Ellipse guide at `cx: layout.width * 0.5`, `cy: layout.height * 0.45`, `rx: layout.width * 0.22`, `ry: layout.height * 0.32`.
  - Guide stroke: `rgba(255, 255, 255, 0.4)` (dashed) when unaligned, `#22c55e` (solid/dashed) when centered.
  - Dynamic status badge: semi-transparent slate pill (`rgba(15, 23, 42, 0.75)`) displaying real-time guidance feedback with smooth transitions.
  - Top progress bar indicating calibration completion (0% -> 100%).

- **State Management & Feedback:**
  - Loading state: While MediaPipe is downloading models, display `"Initializing face detection model..."`.
  - Error state: If MediaPipe or camera fails, display the exact error message with a "Retry" button.
  - Complete state: Guide turns green, badge reads `"Face calibrated"`, and "Start Exam" CTA unlocks.

---

## 5. Scope & Boundaries

- **In Scope:**
  - Resolving the WebView camera startup and event listener race condition in `MobileMediaPipeBridge`.
  - Relaxing readyState constraints to support mobile live camera streams.
  - Adding GPU-to-CPU fallback for MediaPipe FaceLandmarker in WebView.
  - Surface bridge errors to React Native so the UI displays actionable feedback instead of hanging.
  - Ensuring calibration progress and profile creation work smoothly from the mobile checkup screen.
  - Unit tests verifying bridge message handling, error forwarding, and calibration state transitions.

- **Out of Scope / Non-Goals:**
  - Native C++ / VisionCamera rebuilds (keeping Expo managed workflow with WebView bridge).
  - Changes to Sentinel API backend or database schemas.
  - Modifications to Sentinel Web checkup page (already functioning).

---

## 6. References & External Context

- **Confirmed Architectural Decisions:**
  - **Single Unified Camera Pipeline:** Retained `MobileMediaPipeBridge` inside WebView as the unified camera engine across checkup calibration, active session monitoring, and LiveKit live inspection. Solved the root causes directly at the WebView runtime level (race condition, readyState, GPU-to-CPU fallback, error surfacing) rather than splitting preview into native `CameraView`.
- **Related ADRs:**
  - `docs/decisions/2026-09-05-mobile-web-exam-runtime-and-telemetry-parity.md` (Mobile Web Exam Runtime & Telemetry Parity)
- **Related Context Specs:**
  - `docs/context/September/13/mobile-exam-session-telemetry-turned-in-fixes.md`
  - `docs/context/August/25/fix-mobile-exam-questions-evidence-feedback-livekit.md`
- **Prior Task Breakdowns:**
  - `docs/task/2026-08-18/fix-002-mobile-mediapipe-calibration/`
