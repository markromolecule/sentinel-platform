---
title: "Fix Mobile Exam Questions Rendering, Turned-in Exam Tabs, MediaPipe Telemetry & Feedback Styling"
type: context
status: ready
created: "2026-09-13"
tags: [context, defect-resolution, sentinel-mobile, telemetry, mediapipe]
feature: "mobile-exam-session-telemetry-turned-in-fixes"
---

# Mobile Exam Questions Rendering, Turned-In Tab Filter, MediaPipe Telemetry & Feedback Colors Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  1. **Questions not rendering:** When a student enters the mobile exam session screen (`/exam/[id]/session/[sessionId]`), questions do not render. MediaPipe's hidden WebView executes with `<video style="display:none">`, throwing repeated WASM dimension errors into the React Native bridge and freezing UI rendering; simultaneously, an unhandled Android WebView camera permission dialog blocks the screen.
  2. **Turned-in exams showing under [Available]:** Even after a student completes and turns in an exam, if the exam schedule window is still open, the exam remains under the **[Available]** tab instead of moving to the **[Turned In]** tab. This occurs because `sentinel-mobile` calls `useExamsQuery()` without `{ viewer: 'student' }`, and `adaptExamForMobile` fails to normalize completed attempts to `'turned_in'`.
  3. **MediaPipe anomalies not logged / ignored by backend:** On the attempt page, face tracking anomalies (e.g. `GAZE_OFF_SCREEN`, `NO_FACE_DETECTED`) trigger backend logs stating `[TelemetryPolicy] Event ignored: threshold not met`. Mobile omitted `metadata: { durationMs, confidenceScore }` from `emitMobileTelemetryEvent`. Because `durationMs` was missing, the backend fell back to repeat count thresholds and ignored early events, preventing persistence into `flagged_incidents` and leaving the instructor's live monitoring timeline empty. In addition, each transition from checkup to lobby to attempt re-prompts the student with an OS camera dialog because `mediaCapturePermissionGrantType="grant"` was missing from `<WebView>`.
  4. **Feedback page button colors:** The feedback submission screen (`/exam/[id]/feedback`) and thank-you screen use black buttons (`backgroundColor: colors.text`) instead of the brand blue color (`colors.primary`).

- **Business / User Value:**
  - Guarantees seamless exam taking on mobile with questions loading immediately without freezes or permission interruptions.
  - Keeps student dashboard accurate by properly separating available exams from turned-in exams.
  - Ensures proctoring integrity by correctly transmitting MediaPipe anomaly telemetry to the backend and surfacing live incident flags to instructors.
  - Harmonizes UI aesthetics with Sentinel's brand design system.

- **Success Criteria:**
  - Questions render cleanly and instantly on `/exam/[id]/session/[sessionId]`.
  - Android camera permission is granted seamlessly without re-prompting on attempt start.
  - MediaPipe detects face presence and gaze direction, displaying the warning alert `⚠️ Warning: Face not detected` / `Looking away from screen` when an anomaly occurs and clearing when normal.
  - Anomaly events emitted to backend include `durationMs` and `confidenceScore`, passing `TelemetryPolicy` thresholds and persisting to `flagged_incidents` for instructor monitoring.
  - Completed exams automatically transition from the `Available` tab to the `Turned In` tab on mobile.
  - Action buttons on feedback and thank-you screens use `colors.primary` (`#323d8f`) with white text.
  - Live inspection publisher reconciles successfully using the active lease version returned by `createPublisherConnection`, resolving `Live inspection lease changed` errors so instructors can view the live student feed.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a student taking an exam on mobile, I want questions to display immediately upon entering the session without seeing repeated camera permission popups or frozen screens.*
- *As a student who has submitted an exam, I want the exam to appear in my "Turned In" tab rather than "Available", so that I know my submission was successful and I don't attempt it again.*
- *As a student, I want clear visual feedback when my face is not detected or I look away from the screen, so that I can correct my posture before being penalized.*
- *As an instructor monitoring an exam, I want real-time flagged incidents (e.g. Gaze Off Screen, No Face Detected) from mobile students to appear on the Integrity Timeline.*
- *As an instructor monitoring an exam, I want to view the live mobile camera inspection stream without lease mismatch reconciliation errors.*
- *As a student completing an exam, I want the feedback screen to look visually cohesive with the Sentinel brand theme.*

### Functional Requirements

- [ ] **FR-1:** Fix `MobileMediaPipeBridge` `<video>` DOM element: ensure it remains rendered (`width: 100%; height: 100%; object-fit: cover`) and calls `video.play()` so MediaPipe `FaceLandmarker` gets valid frames without throwing WASM errors.
- [ ] **FR-2:** Fix Android WebView camera permission: add `mediaCapturePermissionGrantType="grant"` to `<WebView>` in `mobile-mediapipe-bridge.tsx` to prevent redundant OS permission prompts.
- [ ] **FR-3:** Style `MobileMediaPipeBridge` offscreen container cleanly with `opacity: 0.01; width: 1; height: 1; pointerEvents: 'none'; position: 'absolute'; top: 0; left: 0` so Chromium does not throttle execution.
- [ ] **FR-4:** Update `buildMobileTelemetryPayload` and `emitMobileTelemetryEvent` in `mobile-telemetry-client.ts` to accept and serialize `metadata: { durationMs, confidenceScore, aggregation? }`.
- [ ] **FR-5:** Update `useMobileMediaPipeMonitoring` to calculate `durationMs` (clamped to at least 4000ms when sustained across consecutive frames) and include confidence score when emitting `GAZE_OFF_SCREEN` and `NO_FACE_DETECTED`.
- [ ] **FR-6:** Update `app/(tabs)/exam/index.tsx` to query exams with `useExamsQuery({ viewer: 'student' })` and add `useFocusEffect` to refetch on tab focus.
- [ ] **FR-7:** Update `adaptExamForMobile` in `mobile-exam-display-adapter.ts` to evaluate `exam.completedAt` and `attempt_status`, resolving status to `'turned_in'` when an attempt is completed.
- [ ] **FR-8:** Invalidate `EXAM_QUERY_KEYS.all` in `useExamSessionSubmission` upon successful session submission.
- [ ] **FR-9:** Update feedback CTA buttons in `app/exam/[id]/feedback/index.tsx` and `app/exam/[id]/feedback/thank-you.tsx` to use `colors.primary` (`#323d8f`) and white text.
- [ ] **FR-10:** In `use-mobile-live-inspection.ts`, capture the updated `connection.revision` returned by `createLiveInspectionPublisherConnection` and pass it to `acknowledgeLiveInspectionPublisherReady` (preventing 409 `Live inspection lease changed` failures). Also clean up noisy debug console logs in `use-exam-checkup.ts`.

---

## 3. Technical & Architectural Context

### Affected Domains & Layers

- **Mobile (`app/sentinel-mobile/`):**
  - `features/exam/components/checkup/mobile-mediapipe-bridge.tsx`: WebView camera permissions, video DOM styling, and MediaPipe execution loop.
  - `features/exam/hooks/use-mobile-mediapipe-monitoring.ts`: Duration calculation, metadata passing, anomaly warning state.
  - `features/exam/lib/mobile-telemetry-client.ts`: Telemetry payload metadata schema and serialization.
  - `app/(tabs)/exam/index.tsx`: Exam query parameters, tab filtering, screen focus refetching.
  - `features/exam/lib/mobile-exam-display-adapter.ts`: Status normalization for completed student attempts.
  - `features/exam/hooks/use-exam-session-submission.ts`: Query cache invalidation post-submission.
  - `app/exam/[id]/feedback/index.tsx` & `thank-you.tsx`: Primary brand button colors.

### Key Existing Contracts & Standards

- `packages/shared/src/exams/resolve-exam-status.ts`: Canonical status resolver (`resolveStudentExamStatus`).
- `packages/shared/src/constants/telemetry.ts`: `MEDIAPIPE_ATTEMPT_PERSISTENCE_DURATION_MS = 4000`.
- `app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts`: Evaluates `metadata.durationMs >= 4000` to persist incidents.

---

## 4. Scope & Boundaries

- **In Scope:**
  - Fixing WebView camera permissions and MediaPipe rendering in `sentinel-mobile`.
  - Passing telemetry duration and confidence metadata so backend policies persist flagged incidents.
  - Normalizing turned-in exam statuses and auto-refreshing tabs on mobile.
  - Applying Sentinel brand blue colors to feedback screens.
  - Automated tests verifying status resolution, telemetry payload generation, and adapter mappings.

- **Out of Scope / Non-Goals:**
  - Changing backend AI proctoring threshold rules (backend contracts are authoritative).
  - Altering instructor dashboard layout (backend ingestion and WebSocket/polling handles updates automatically once incidents persist).

---

## 5. Grill Decision Ledger

- **Decision 1 (Status Normalization):**
  - *Context:* When an exam has `completedAt` or `attempt_status === 'COMPLETED'`, should mobile use the shared `resolveStudentExamStatus` logic?
  - *Decision:* Yes. In `adaptExamForMobile`, call `resolveStudentExamStatus` if student attempt indicators exist, matching the web implementation in `normalize-student-exam.ts`.
- **Decision 2 (MediaPipe Video Element in WebView):**
  - *Context:* How should `<video>` be styled inside the MediaPipe WebView when `showPreview=false`?
  - *Decision:* Keep the HTML `<video>` element rendered (`display: block`, 100% dimensions) and call `video.play()` so MediaPipe gets video frames, but keep the React Native parent `<View>` styled with `opacity: 0.01; width: 1; height: 1; pointerEvents: 'none'; position: 'absolute'; top: 0; left: 0`.
- **Decision 3 (Telemetry Duration):**
  - *Context:* Backend requires `durationMs >= 4000` to persist MediaPipe incidents without waiting for repeat counts.
  - *Decision:* In `useMobileMediaPipeMonitoring`, when consecutive anomaly threshold is satisfied, set `durationMs: Math.max(consecutiveFrames * frameIntervalMs, 4000)` and include `confidenceScore`, satisfying `aiRules.gaze_tracking` and `aiRules.face_detection`.
