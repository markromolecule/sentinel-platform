# Attempt Page Event And Answer Exposure Investigation

## Purpose

This note expands the current attempt-page bug list into implementation-ready
findings. It separates confirmed root causes from likely causes and captures the
files that should be reviewed when creating the implementation plan.

## Investigation Summary

- The answer exposure issue has at least two confirmed paths:
    - The student exam detail response still sends full question content to the client.
    - Some runtime question renderers use answer-key fields as visible input placeholders.
- The duplicate telemetry issue is partly guarded on the client, but the storage layer
  intentionally aggregates repeated events into a single incident by incrementing
  `occurrenceCount`. The reported "first event counts as 2" still needs runtime
  reproduction because existing unit tests expect first client bursts to emit only once.
- Fullscreen telemetry is ignored after a completed attempt on the API, but active
  attempts still emit `FULL_SCREEN_EXIT` whenever `document.fullscreenElement` becomes
  empty. That includes browser minimize/window focus flows while the attempt is active.
- Audio anomaly is wired for the attempt page and reuses the checkup audio provider.
  The most likely failure areas are stream lifetime, worker warmup/ownership, browser
  audio context activation, or missing runtime enablement/configuration.
- Automatic close on high-severity incidents already exists, but the policy is
  hard-coded to 3 HIGH incidents within 15 minutes instead of being exam-configurable.
- Makeup and retake windows already exist in the lifecycle/remediation surface, but the
  product rule for when instructors may grant them still needs to be finalized.

## Issue 1: Attempt Page Shows Answers To Students

### Affected Question Types

- `FILL_BLANK`
- `MATCHING`
- `ENUMERATION`
- `MULTIPLE_RESPONSE`
- Possibly `IDENTIFICATION`, because it also carries `correctAnswer` /
  `acceptedAnswers` in the shared question content shape.

### Confirmed Root Causes

1. Student exam detail API returns the same `ExamQuestion` content shape used by
   instructors.
    - `app/sentinel-api/src/modules/examination/exams/services/get-exam-detail.service.ts`
      maps `question.content` directly into `ExamQuestion.content`.
    - `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.service.ts`
      passes `questions` through unchanged, even when `studentView` is true.
    - `packages/shared/src/types/exams/exam.ts` defines `ExamQuestionContent` with
      answer-key fields: `correctAnswer`, `acceptedAnswers`, `pairs.right`, `blanks`,
      and `correctBoolean`.

2. Runtime renderers print answer-key values as placeholders even when
   `showCorrectAnswer={false}`.
    - `FILL_BLANK`: `fill-blank-question.tsx` uses each `blank` as the input
      placeholder. If `blanks` stores the answer key, the answer is visible.
    - `MATCHING`: `matching-question.tsx` uses `pair.right` as the input placeholder,
      which directly exposes the correct match.

3. `ENUMERATION` does not visibly print the answer in the current renderer, but it uses
   `acceptedAnswers` or `blanks` to decide how many fields to render. Because the full
   answer content still reaches the browser, it is still exposed through the client
   payload/devtools.

4. `MULTIPLE_RESPONSE` appears visually guarded because it only marks correct choices
   when `showCorrectAnswer` is true. However, the full `correctAnswer` array still
   reaches the client, so it remains exposed outside the visible UI.

### Implementation Direction

- Add a student-safe question mapper on the API before returning exam detail data to
  students.
- Keep grading/submission logic using authoritative server-side question data, not the
  sanitized client payload.
- Remove answer-key placeholders from runtime renderers:
    - `FILL_BLANK`: use neutral placeholders such as `Response 1`.
    - `MATCHING`: use neutral placeholders such as `Type the matching answer`.
    - `ENUMERATION`: preserve field count without shipping accepted answer values.
- Define a student runtime content shape, for example:
    - Multiple choice / response: keep `options`, remove `correctAnswer`.
    - True/false: remove `correctAnswer` and `correctBoolean`.
    - Identification: remove `correctAnswer` and `acceptedAnswers`.
    - Fill blank: keep prompt and blank count/labels only; remove answers.
    - Matching: keep left-side prompts and possibly shuffled right-side choices if the
      product wants selection-based matching; otherwise remove `right` values.
    - Enumeration: keep expected item count, remove accepted answers.

### Acceptance Criteria

- Student attempt API responses never include answer-key fields.
- Runtime UI never displays answers as placeholders, badges, labels, or hidden debug UI.
- Submission and scoring still use server-side answer keys and still pass existing
  grading/scoring tests.
- Add tests for student-view sanitization and renderer behavior for `FILL_BLANK`,
  `MATCHING`, `ENUMERATION`, `MULTIPLE_RESPONSE`, and `IDENTIFICATION`.

## Issue 2: Duplicate Events / Incorrect Occurrence Count

### Reported Symptoms

- First student-triggered event appears duplicated.
- A single trigger should produce `occurrenceCount = 1`, not 2.
- Toast warnings should match actual user actions, not duplicated event pipelines.
- Reported event types:
    - `TAB_SWITCH`
    - `CLIPBOARD_ATTEMPT`
    - `RIGHT_CLICK_ATTEMPT`
    - Possibly all web telemetry events.

### Current Behavior Found

- Client attempt listeners live in
  `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts`.
- Client burst guards already exist:
    - Clipboard: 800 ms guard.
    - Right-click: 800 ms guard.
    - Tab/focus: 1000 ms guard.
    - Fullscreen: 1000 ms guard.
- Existing client tests assert first clipboard/right-click bursts emit one telemetry
  event and one toast.
- API storage deduplicates events within the configured window by updating one incident
  and incrementing `occurrenceCount`.
    - `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`
    - Default dedupe window: `DEFAULT_TELEMETRY_SETTINGS.operations.dedupeWindowSeconds = 120`.
- API tests assert first persisted event has `occurrenceCount = 1`.

### Possible Root Causes To Verify

1. React Strict Mode or remounting may attach duplicate listeners in the browser runtime
   even though unit tests do not reproduce it.
2. A single browser action can fire multiple low-level events:
    - Clipboard keyboard shortcut plus DOM `copy` / `paste`.
    - Tab switch shortcut plus `visibilitychange` and `blur`.
    - Fullscreen exit plus blur/focus changes.
3. The API may receive both single-event ingestion and batch/queued ingestion for the
   same logical action in some flows.
4. The support/instructor UI may be reading `occurrenceCount` as "number of incidents"
   instead of "number of low-level events aggregated into this incident".
5. Race condition risk: two identical events arriving concurrently before the first
   insert is visible can create two rows or an immediate count jump unless there is an
   idempotency key/unique dedupe guard.

### Implementation Direction

- Add a client-generated `eventId` or `dedupeKey` per logical event action.
- Include dedupe metadata in telemetry payloads and persist it.
- Enforce server-side idempotency for duplicate `eventId` / `dedupeKey` within the
  attempt and event type.
- Audit whether both `/telemetry/events` and `/telemetry/batch` can process the same
  action.
- Add browser-level integration tests around actual event sequences:
    - `keydown Ctrl/Cmd+V` plus `paste`.
    - `visibilitychange` plus `blur`.
    - right-click repeated within 800 ms.
- Decide whether support UI should display:
    - `incident row count`,
    - `occurrenceCount`,
    - or both separately.

### Acceptance Criteria

- One logical student action emits one warning toast.
- One logical student action persists with `occurrenceCount = 1`.
- Repeating the same action after the configured burst window increments only once per
  action.
- A hard refresh/remount does not double-register listeners.
- Server idempotency prevents duplicate persistence even if the same action is posted
  twice.

## Issue 3: Minimize / Submit Flow Counts As FULL_SCREEN_EXIT

### Reported Symptoms

- The attempt page counts minimizing the screen as `FULL_SCREEN_EXIT`.
- During submit/turn-in, leaving fullscreen can still be treated as an exam violation.

### Current Behavior Found

- Client fullscreen listener emits when:
    - monitoring is not suspended,
    - fullscreen monitoring is enabled,
    - and `document.fullscreenElement` is empty.
- Submit flow has an existing intention to suspend monitoring before result navigation.
  There is test coverage named "starts result navigation before exiting fullscreen on
  turn in".
- API ignores `FULL_SCREEN_EXIT` after attempt completion, but still persists it while
  the attempt is active.

### Likely Root Causes

1. Minimize/window-management can cause fullscreen exit while the attempt is active; the
   current listener cannot distinguish malicious fullscreen exit from OS/browser window
   minimize.
2. The submit path may have a timing gap where fullscreen changes before
   `isMonitoringSuspended` is updated.
3. The API only filters post-completion fullscreen telemetry, not client-side
   "intentional navigation/submit/minimize" cases.

### Implementation Direction

- Add an explicit attempt monitoring phase/reason flag:
    - `active`
    - `submitting`
    - `navigating-to-turn-in`
    - `completed`
    - `temporarily-hidden`
- Suppress `FULL_SCREEN_EXIT` when the submit/turn-in flow is already in progress.
- Consider logging minimize/window-hidden as `TAB_SWITCH` or focus-loss only if the rule
  says it should be considered cheating; do not silently map it to fullscreen exit.
- Keep API post-completion rejection as a backstop.
- Add tests that dispatch fullscreen change during submit and verify no fullscreen
  incident is emitted.

### Acceptance Criteria

- Clicking submit/turn-in does not create a `FULL_SCREEN_EXIT` incident.
- Minimize behavior is classified according to product policy, not automatically as a
  fullscreen exit.
- Deliberate fullscreen exit while actively taking the exam still locks/logs as expected.

## Issue 4: Audio Anomaly Not Working During Attempt

### Reported Symptoms

- Audio anomaly works during checkup.
- Audio anomaly does not work during the actual attempt page even though microphone
  permission was granted.

### Current Behavior Found

- Attempt monitoring calls `useAudioAnomalyWorker`.
- `useAudioAnomalyWorker` is enabled only when all are true:
    - `configuration.micRequired`
    - `configuration.aiRules.audio_anomaly_detection`
    - `examSessionId`
    - authenticated `studentId`
    - not suspended
- Attempt audio uses `useCheckupAudio()` from `StudentExamAudioProvider`.
- `StudentExamAudioProvider` wraps the whole student exam route layout, so the stream
  should survive navigation from checkup/lobby/attempt.
- `MonitoringPreloader` warms the worker on lobby/checkup when mic and audio anomaly
  are enabled.

### Possible Root Causes To Verify

1. `audioStream` is null by the time the attempt mounts because the provider stopped the
   stream, the layout remounted, or the track ended.
2. `examSessionId` is unavailable during the first attempt render, causing the worker to
   idle; later startup may fail due to effect dependencies or stream state.
3. Browser audio context may need a user gesture/resume when entering attempt.
4. Worker warmup may create a provided worker whose listeners/config are not ready or
   are being reused after a previous start/stop cycle.
5. Runtime config is always `DEFAULT_AUDIO_ANOMALY_CONFIG`, which may not match support
   settings or enabled anomaly types expected in production.
6. Audio anomaly telemetry may be emitted but filtered by API policy/settings if
   `aiRules.audio_anomaly_detection` or telemetry rule override is disabled.

### Implementation Direction

- Add attempt-level diagnostics for:
    - `isEnabled`
    - phase
    - has live stream
    - has worker
    - `examSessionId`
    - `studentId`
    - config gate values
- On attempt mount, if mic is required and no live stream exists, request/recover audio
  access or block entry with a clear recovery action.
- Ensure `AudioContext.resume()` is attempted after user interaction if the context is
  suspended.
- Add tests for transition from checkup to attempt with a provided stream and worker.
- Confirm whether support telemetry settings should feed audio anomaly runtime config
  instead of only `DEFAULT_AUDIO_ANOMALY_CONFIG`.

### Acceptance Criteria

- Audio anomaly worker reaches `running` during attempt when mic and audio anomaly are
  enabled.
- If the stream is lost, the attempt shows a recoverable warning and does not silently
  stay idle.
- An anomaly during attempt emits one `AUDIO_ANOMALY` telemetry event with metadata.

## Open Question 1: Strict Policy For High Flags Closing Exam

### Current Implementation

- Implemented in backend storage path.
- When persisted/updated incident severity is `HIGH`,
  `maybeApplyAutomaticLifecyclePolicy` calls `resolveAutomaticLifecyclePolicy`.
- Current hard-coded policy:
    - 3 HIGH incidents
    - within 15 minutes
    - closes the attempt with reason `AUTO_HIGH_INCIDENT_THRESHOLD`
- Files:
    - `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`
    - `app/sentinel-api/src/modules/examination/lifecycle/services/resolve-automatic-lifecycle-policy.ts`
    - `app/sentinel-api/src/modules/examination/lifecycle/lifecycle.constants.ts`

### Gap

- It is not exam-configurable.
- It only counts HIGH incident rows within the time window. Because telemetry dedupes
  repeated events into one row, "3 occurrences" of one deduped incident may not equal
  "3 high incidents" under the current policy.
- It does not appear to support per-rule thresholds, per-severity ladders, or product
  policies such as "one critical event closes immediately".

### Planning Decision Needed

- Should automatic closure be based on:
    - number of HIGH incident rows,
    - summed `occurrenceCount`,
    - specific event types,
    - weighted severity score,
    - or a combination?
- Should instructors configure:
    - enabled/disabled automatic close,
    - HIGH threshold count,
    - time window,
    - immediate-close event types,
    - per-rule severity overrides?

## Open Question 2: Retake And Makeup Handling

### Current Implementation

- Lifecycle states and events already include:
    - `LOCKED`
    - `REOPENED`
    - `RESET`
    - `CLOSED`
    - `SUPERSEDED`
    - `MAKEUP_GRANTED`
    - `RETAKE_GRANTED`
- Backend grant endpoints exist:
    - `POST /exams/:id/students/:studentId/lifecycle/grant-makeup`
    - `POST /exams/:id/students/:studentId/lifecycle/grant-retake`
- Retake requires a `sourceAttemptId`.
- Makeup allows `sourceAttemptId` to be nullable.
- Frontend service helpers and report/monitoring hooks already call these endpoints.

### Gap

- The issue note proposes granting retake/makeup after examination end date, but the
  current schema allows arbitrary `availableFrom` and `availableUntil` as long as the
  window is internally valid.
- Product policy needs to define whether instructors can grant:
    - during active exam,
    - after scheduled end only,
    - after attempt is closed/submitted only,
    - after score finalization only,
    - or only through report action queues.

### Planning Decision Needed

- Define lifecycle eligibility rules for each action:
    - `REOPEN`: same attempt, short recovery window for locked/closed attempt.
    - `RETAKE`: new attempt tied to a source attempt, usually after submitted/closed.
    - `MAKEUP`: new opportunity for absent or not-started student, optionally no source
      attempt.
- Decide whether automatic closure should automatically queue retake review or only
  mark the attempt for instructor review.

## Recommended Implementation Sequence

1. Fix answer exposure first. This is the highest-risk issue because it compromises exam
   integrity even without telemetry failures.
2. Add telemetry idempotency and reproduce duplicate event paths in browser/integration
   tests.
3. Refine fullscreen/minimize classification and submit-flow suppression.
4. Stabilize audio anomaly startup/recovery on attempt entry.
5. Move automatic close thresholds into exam configuration after product policy is
   finalized.
6. Lock down retake/makeup eligibility rules and add lifecycle tests around exam end
   dates, closed attempts, and source attempts.

## Suggested Test Coverage

- API student exam detail sanitization for every auto-gradable question type.
- Runtime renderers do not display correct answers when `mode="runtime"` and
  `showCorrectAnswer={false}`.
- Client telemetry emits one event for one logical browser action.
- API telemetry idempotency prevents duplicate first events.
- Fullscreen exit during submit is ignored.
- Fullscreen exit during active exam is still logged.
- Audio anomaly reaches running phase with a live provider stream.
- Automatic close policy closes only the triggering attempt and respects configurable
  thresholds when those settings are added.
- Makeup/retake lifecycle routes reject windows that violate the finalized product
  rules.
