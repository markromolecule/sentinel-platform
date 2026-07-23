# Telemetry Duplication & Audio Anomaly Diagnostics — Context Document (July 12)

> **Purpose:** This document provides detailed context for the next implementation plan. It describes three production issues concerning client-side event monitoring: (1) event duplication (double toast notifications and double telemetry emissions), (2) inaccurate fullscreen-exit anomaly flagging during the turn-in phase, and (3) malfunctioning audio anomaly detection and missing client-side toast notifications.

---

## Issue 1 & 2 — Event Duplication and Fullscreen-Exit Race Condition on Turn-In

### Symptom Description

1. **Event Duplication:** When a student triggers a monitored action (such as copy/paste or right-click), the client shows two identical toast messages (e.g., "Clipboard actions are disabled for this exam.") and sends two separate telemetry events to the server.
2. **False Fullscreen Anomalies:** When the student clicks the **[Turn In]** button and the system automatically exits fullscreen mode, the action is falsely flagged as a security anomaly (`FULL_SCREEN_EXIT`). This locks the attempt or logs a violation under the configured security policy, even though the exam was intentionally completed.

### Root Cause Analysis

Both issues stem from the **duplicate instantiation of the custom React hook `useStudentExamAttempt`** on the student exam attempt page.

1. **Page Structure:**
   In [`app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx`](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx>), `useStudentExamAttempt` is called at the page level to check loading, initialization, and locked state:
    ```typescript
    export default function StudentExamAttemptPage() {
        const { isLoading, isInitializingSession, isRedirectingHistory, blockedState } =
            useStudentExamAttempt(); // Call 1
        // ...
        return <AttemptView />;
    }
    ```
2. **Component Structure:**
   Inside [`app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_components/attempt-view.tsx`](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_components/attempt-view.tsx>), `useStudentExamAttempt` is called _again_ to fetch exam details, questions, and bind handlers:
    ```typescript
    export function AttemptView() {
        const { exam, questions, ... } = useStudentExamAttempt(); // Call 2
        // ...
    }
    ```

Because `useStudentExamAttempt` runs twice, it registers all document and window event listeners twice:

- **Two listeners** for `copy`, `cut`, `paste` (from `useClipboardListener`)
- **Two listeners** for `contextmenu` (from `useRightClickListener`)
- **Two listeners** for `keydown` (from `useKeyboardListener`)
- **Two listeners** for `fullscreenchange` (from `useFullscreenListener`)
- **Two listeners** for `blur` / `visibilitychange` (from `useFocusListener`)

#### Impact on Turn-In Fullscreen Exit

When a student clicks "Turn In":

1. The `proceedToTurnInReview` handler executes within the **`AttemptView`** hook instance context.
2. It calls `setMonitoringPhase('submitting')` and `suspendSecurityMonitoring()`, which correctly updates the refs (`isMonitoringSuspendedRef.current = true` and `monitoringPhaseRef.current = 'suspended'`) **only for that instance of the hook**.
3. The parent `StudentExamAttemptPage` hook instance **remains in the active state** (`isMonitoringSuspendedRef.current = false`).
4. When `document.exitFullscreen()` is executed, the browser fires the `fullscreenchange` event.
5. The `fullscreenchange` listener registered by the parent component's hook instance intercepts the event. Because it is still marked active, it interprets the fullscreen exit as a security violation, triggers `lockExam('fullscreen-exit')`, and emits the `FULL_SCREEN_EXIT` telemetry event.

---

## Issue 3 — Audio Anomalies Malfunctioning & Missing Client Toast Alerts

### Symptom Description

Students are not seeing toast messages when audio anomalies occur, and the instructor Monitoring page does not receive audio incidents, even when background noise or speech is present in the student's room.

### Root Cause Analysis

1. **AudioContext Conflicts (Primary Cause):**
   Because `useStudentExamAttempt` is instantiated twice, `useAudioAnomalyWorker` is also instantiated twice.
   If the Web Worker is not warmed up (which happens when `micRequired` is false but `audio_anomaly_detection` is true in the preloader), both hooks independently instantiate `AudioAnomalyController` without a shared worker.
   Each controller tries to construct its own browser Audio Graph and `AudioContext` connecting to the same microphone `MediaStream`. Creating multiple concurrent AudioContexts in a browser:
    - Can trigger browser security policies that block subsequent audio context creation.
    - Can cause silent failure or suspension of one or both AudioContexts, disrupting YAMNet model inference.
    - Leads to double registration of event listeners on the Web Worker, causing race conditions in message reception.

2. **Server-Side Policy Ignored (Secondary Cause):**
   In the server logs, we see `[TelemetryPolicy] Event ignored: threshold not met` for `AUDIO_ANOMALY`.
   According to `AudioAnomalyRule.evaluate()`:
    - If `confidenceScore >= 0.4` (the default confidence threshold), the incident is persisted immediately.
    - If `confidenceScore < 0.4` (typical for silence anomalies, since the threshold is `0.015`), it defaults to the repeat threshold rule (`AUDIO_REPEAT_THRESHOLD`), which requires **3 occurrences within 120 seconds**.
    - Single or low-confidence occurrences (such as a brief sound or single silence check) are ignored by design.
    - If the student-side pipeline fails due to the dual AudioContext collision, no high-confidence speech/noise events (`TALKING` threshold = `0.45`) are ever emitted, leaving only suppressed low-confidence events.

---

## Proposed Refactoring and Resolution Plan

### Step 1: Hook Unification (Resolves Issue 1 & 2)

We will modify the page and view component to share a single instance of `useStudentExamAttempt`.

1. **Modify `StudentExamAttemptPage` (`page.tsx`):**
    ```typescript
    export default function StudentExamAttemptPage() {
        const attempt = useStudentExamAttempt(); // Single instantiation

        if (attempt.isLoading || attempt.isInitializingSession || attempt.isRedirectingHistory) {
            return <StudentExamLoadingState />;
        }

        if (attempt.blockedState?.isBlocked) {
            return <BlockedStateView state={attempt.blockedState} />;
        }

        return <AttemptView attempt={attempt} />;
    }
    ```
2. **Modify `AttemptView` (`attempt-view.tsx`):**
   Accept `attempt` as a prop and destructure all needed fields from it.
    ```typescript
    export interface AttemptViewProps {
        attempt: ReturnType<typeof useStudentExamAttempt>;
    }

    export function AttemptView({ attempt }: AttemptViewProps) {
        const { exam, questions, ... } = attempt;
        // ...
    }
    ```

### Step 2: Audio Worker Warmup Hardening (Resolves Issue 3)

1. **Unify Hook Instantiation:** Unifying the hook resolves the dual `AudioContext` and Audio Graph conflict, ensuring a single clean audio pipeline.
2. **Preloader Hardening:** Update `monitoring-preloader.tsx` to warm up `warmupAudioAnomaly` when `aiRules.audio_anomaly_detection` is enabled, regardless of whether `micRequired` is true.
    ```typescript
    // Warm up Audio Anomaly Detection if enabled
    if (configuration.aiRules?.audio_anomaly_detection) {
        warmupAudioAnomaly();
    }
    ```

---

## Verification Plan

### Automated Verification

- Run Vitest tests on the attempt page to ensure the unified props structure does not break rendering or submission flow:
  `pnpm --dir app/sentinel-web exec vitest run src/app/(protected)/student/exam/[id]/attempt/page.test.tsx`
- Run Vitest tests for the audio worker:
  `pnpm --dir app/sentinel-web exec vitest run src/hooks/use-audio-anomaly-worker/use-audio-anomaly-worker.test.tsx`

### Manual Verification

- **Duplication check:** Trigger right-click and copy-paste in the exam attempt and ensure **exactly one** warning toast is shown.
- **Fullscreen Turn-In check:** Submit the exam and ensure that no fullscreen lock or violation is generated.
- **Audio Anomaly check:** Confirm that generating talking sounds triggers a single warning toast on the client and is successfully persisted to the backend database.
