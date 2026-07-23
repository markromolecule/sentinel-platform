# Attempt-page mobile/accessibility and production telemetry context

**Status:** Investigation context for a later implementation-planning pass  
**Updated:** July 23, 2026  
**Planning boundary:** This document records verified behavior, evidence, risks, and open questions. It is not an implementation plan.

## Purpose

Prepare two separate implementation plans:

1. Improve the student attempt page on mobile and for assistive-technology users.
2. Restore production anomaly visibility on the instructor monitoring pages.

Do not combine these into one delivery plan. They have different failure domains, validation methods, and rollback risks.

## Reported symptoms

### Student attempt experience

- Some answer fields cannot be selected or edited on mobile.
- Audio anomaly monitoring sometimes stops with a message that it took too long to start or recover.
- A close mobile-camera position can be classified as `NO_FACE_DETECTED` or gaze off-screen.
- Passage content competes with the question on small screens. It should start hidden and remain available through an accessible control.
- Header, question content, navigation, and footer positioning are inconsistent across viewport sizes.

### Instructor production monitoring

- Anomalies appear locally but not on production monitoring pages.
- Production API logs show telemetry being received and evaluated.
- Some events are intentionally ignored by policy; at least one `TAB_SWITCH` event was “flagged for persistence.”
- A production process also logged an exit caused by `SIGTERM`.

## Investigation summary

The repository already contains dedicated mobile question navigation, a responsive attempt workspace, MediaPipe calibration, and a telemetry ingestion/queue pipeline. The later plans should refine and validate those systems rather than recreate them.

The most important production distinction is:

> “Event flagged for persistence” confirms policy acceptance, not a successful database write.

In Redis queue mode, the API process is only the producer. Persistence is performed by a separate telemetry worker. The current production evidence shows the producer path but does not show the worker-ready or storage-success logs. A missing, unhealthy, or misconfigured production worker is therefore the leading hypothesis, but it is not yet confirmed.

## Workstream 1: attempt-page mobile responsiveness and accessibility

### Current component flow

```text
attempt-view.tsx
  -> ExamAttemptShell
     -> ExamAttemptShellHeader
     -> ExamAttemptWorkspace
        -> question renderer
        -> passage panel
        -> desktop/mobile question navigation
        -> runtime footer

attempt monitoring
  -> camera/MediaPipe runtime
  -> audio anomaly worker
  -> web telemetry client
```

### Verified layout behavior

- `attempt-view.tsx` uses a fixed `h-screen` root with hidden overflow.
- `ExamAttemptWorkspace` uses JavaScript’s mobile breakpoint from `useIsMobile()`, which is below `768px`.
- The mobile question-navigation component is controlled by Tailwind’s `lg:hidden`, which remains active below `1024px`.
- This creates a `768px`–`1023px` range in which JavaScript and CSS disagree about whether the layout is mobile.
- Below `768px`, question and passage content are stacked into fixed grid rows inside the available height.
- Between `768px` and `1279px`, question and passage are also stacked.
- At `1280px` and above, the passage becomes a resizable side panel.
- Question and passage areas use nested scroll containers while the overall attempt shell is viewport-height constrained.
- `showPassagePanel` currently defaults to `true`. The passage panel can therefore consume mobile space immediately.
- A shared Radix-based `Sheet` component already exists in `@sentinel/ui`; a future plan can reuse it rather than introduce another drawer implementation.
- `useIsMobile()` initially returns `false` until its client-side effect runs. Planning should account for the first-render breakpoint transition and avoid layout or state churn.

### Layout risks to reproduce before choosing a fix

The exact cause of “unclickable fields” is not established. Reproduction should record:

- question type;
- browser, OS, device, and viewport;
- portrait or landscape orientation;
- whether the virtual keyboard is open;
- whether passage and cross-out mode are enabled;
- which element receives the pointer/touch event;
- whether a header, footer, scroll viewport, or transparent layer overlaps the control;
- whether the field is genuinely disabled, loses focus, or is merely outside the usable viewport.

Likely investigation areas include the fixed viewport-height shell, nested scrolling, breakpoint mismatch, mobile-keyboard resizing, and focus movement. These are hypotheses, not confirmed root causes.

### Question-renderer accessibility findings

Existing controls are visually usable in many cases, but semantics vary by question type:

| Question type       | Current observation                                   | Planning implication                                                           |
| ------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Multiple choice     | Answers are plain buttons with visual selection only  | Expose selected state, group purpose, and option names to assistive technology |
| Multiple response   | Answers are plain buttons with visual selection only  | Expose multi-select semantics and each option’s checked/pressed state          |
| True/false          | Uses buttons without selected-state semantics         | Announce the active value                                                      |
| Identification      | Input relies on a placeholder                         | Add a persistent accessible name                                               |
| Essay               | Text area relies on a placeholder                     | Add a persistent accessible name and preserve focus during autosave            |
| Enumeration         | Inputs have visual numbering but no associated label  | Associate the item number/instruction with each input                          |
| Fill in the blank   | Inputs are wrapped by contextual labels               | Retain and verify the existing semantics                                       |
| Matching            | Select controls have contextual labels                | Retain and verify keyboard and screen-reader behavior                          |
| Cross-out controls  | Already expose `aria-pressed` and an accessible label | Preserve this behavior during layout changes                                   |
| Question navigation | Already exposes labels and `aria-current`             | Preserve this behavior in both desktop and mobile navigation                   |

The later plan should cover names, roles, values, focus order, visible focus, keyboard activation, touch activation, validation/error announcements, status messages, and screen-reader output. It should not treat mobile responsiveness and accessibility as CSS-only work.

### Passage behavior to target

For small screens:

- Passage content starts closed so the question remains the primary task.
- A consistently placed, keyboard- and touch-accessible control opens it.
- The passage opens in an accessible sheet/drawer with a title and description.
- Focus moves into the sheet, is trapped while it is open, and returns to the trigger when closed.
- Escape and an explicit close control dismiss it.
- Closing or reopening the passage does not reset the current answer, scroll position unnecessarily, or monitoring state.
- Long rich-text passages and responsive images remain scrollable and sanitized.

The plan must define the exact breakpoint at which sheet behavior begins. It should use the same breakpoint source for rendering, navigation, and passage behavior.

### Audio anomaly findings

The audio provider retains the microphone stream and creates the worker during warm-up, but worker creation does not load the anomaly model.

The actual model initialization occurs later:

1. The attempt monitoring hook provides the media stream and worker.
2. The audio controller creates the Web Audio graph.
3. It sends `INIT` to the worker.
4. The worker selects TensorFlow.js’s CPU backend and loads `/models/yamnet/model.json`.
5. The controller waits up to `15,000ms` for `INIT_SUCCESS`.

If initialization exceeds that limit, the current code reports:

> Audio monitoring took too long to start. The exam will continue without audio anomaly detection.

The runtime is then stopped. No automatic retry/recovery path was found in the controller.

This makes slow model download, slow mobile CPU initialization, a suspended `AudioContext`, or an unhealthy microphone track plausible causes. No one cause is confirmed yet.

Before implementation planning, capture timings for:

- microphone permission and stream acquisition;
- worker creation;
- model request start/end and HTTP/cache result;
- `INIT` sent and `INIT_SUCCESS` received;
- TensorFlow backend initialization;
- `AudioContext.state`;
- microphone track state and `ended` events;
- device, browser, connection type, and whether this is first load or cached.

The future plan must explicitly decide the timeout, retry limit/backoff, user message, telemetry emitted for degraded monitoring, and whether the exam may continue when audio monitoring cannot start.

### MediaPipe findings

- The attempt flow already uses MediaPipe face landmarks, calibration data, and downward-gaze tolerance.
- MediaPipe WASM and the face-landmarker model are loaded from external CDN URLs.
- Runtime analysis marks a face as near the viewport edge at approximately:
    - horizontal center below `0.12` or above `0.88`;
    - vertical center below `0.08` or above `0.92`.
- It also detects partial faces using landmark bounds near the frame edges.
- Low confidence combined with a partial/edge face can become gaze off-screen; other low-confidence results may normalize to no-face.
- Attempt runtime thresholds clamp both gaze and no-face duration to a maximum of `1,500ms`, even though shared defaults are longer.
- Calibration checks readiness, confidence, and center position, but does not validate a minimum/maximum face size or camera distance.

This combination can make close, cropped mobile framing noisy and can promote a transient poor frame to an anomaly quickly. The later plan should not simply lower global sensitivity, because that can weaken exam integrity on desktop and correctly framed devices.

Required evidence before tuning:

- sanitized landmark bounds or face-size ratio;
- face center and confidence;
- reason code (`no face`, `partial face`, `edge`, or gaze direction);
- calibrated versus uncalibrated result;
- camera resolution/orientation;
- representative front-camera samples at normal and close distances;
- event duration and frame count before an anomaly is emitted.

Candidate planning decisions include form-factor-aware framing guidance, calibration rejection for faces that are too close/cropped, hysteresis or sustained-frame requirements, and separate handling for partial-face confidence. These require measured thresholds and regression tests.

### Workstream 1 acceptance criteria for the later plan

The plan should make the following outcomes testable:

- Every supported answer type can be selected, edited, and cleared by touch and keyboard.
- Opening the mobile keyboard does not hide the active field or required navigation.
- No content is permanently obscured by the header, footer, passage, or navigation.
- Passage content starts hidden at the agreed small-screen breakpoint and is fully accessible from its trigger.
- Navigation, passage behavior, and layout use one documented breakpoint strategy.
- Answer state and attempt timing survive orientation changes and passage open/close actions.
- Interactive controls have accessible names, states, visible focus, and adequate touch targets.
- The page reflows without horizontal loss of content at supported zoom levels.
- Audio initialization has observable stages, bounded recovery behavior, and a clear degraded state.
- Normal close-camera mobile framing does not create false no-face/off-screen incidents, while genuine absence and off-screen behavior are still detected.

### Suggested device and accessibility matrix

At minimum, include:

- widths `320`, `360`, `390/393`, `412/430`, `768/820`, `1024`, `1280`, and `1440`;
- portrait and landscape where applicable;
- iOS Safari and Android Chrome on real devices when available;
- desktop Chrome plus keyboard-only navigation;
- a screen-reader pass on at least one Apple and one Chromium-based platform;
- mobile virtual keyboard open/close;
- slow network and first-load audio/model cache;
- camera near/far, partial face, no face, downward gaze, and genuine off-screen cases;
- WCAG 2.2 AA checks, including reflow/zoom and target size.

## Workstream 2: production anomaly visibility

### Verified telemetry path

```text
browser detector
  -> web telemetry client
  -> POST /telemetry/events
  -> TelemetryIngestionService
  -> telemetry policy
     -> ignored: no incident by design
     -> accepted: submit to queue/storage
  -> Redis/BullMQ telemetry worker OR synchronous storage fallback
  -> flagged_incidents
  -> instructor monitoring API
  -> monitoring UI
```

### How to interpret the supplied logs

| Log evidence                                                                    | What it proves                                        | What it does not prove                                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| `[TelemetryIngestion] Received event`                                           | The API accepted and parsed a browser event           | The event qualified for an incident or reached storage |
| `Event ignored: threshold not met`                                              | Policy intentionally rejected that occurrence         | A monitoring defect                                    |
| `Event flagged for persistence`                                                 | Policy accepted the event for the next pipeline stage | Queue completion or a database row                     |
| `Submitting event to queue`                                                     | The producer attempted to enqueue work                | A running consumer or successful storage               |
| `[TelemetryWorker] Worker ready`                                                | A worker process connected and started consuming      | This specific job completed                            |
| `[TelemetryStorage] Incident appended successfully` or `updated (deduplicated)` | Storage completed for an incident                     | The monitoring API/UI returned that row                |

The supplied production excerpt contains producer and policy logs but no worker-ready or storage-success evidence.

### Queue and deployment findings

- Telemetry queue mode is resolved from settings/environment.
- With Redis mode and `REDIS_URL`, the API adds a BullMQ job.
- When Redis is requested but unavailable in configuration, the service warns and falls back to synchronous storage.
- The telemetry worker has a separate entry point and package command:

```bash
pnpm --dir app/sentinel-api start:telemetry-worker
```

- The normal API `start` command runs `src/server.ts`; it does not start the telemetry worker.
- Local development wiring starts more than the production API command, which can explain “works locally, missing in production.”
- No repository deployment definition was found that proves a production telemetry-worker service or replica is running.

Therefore, the leading hypothesis is that production is enqueueing accepted events without a healthy consumer. Confirm this operationally before changing application code.

### Monitoring query findings

- Instructor monitoring reads persisted `flagged_incidents`; it does not display raw detections ignored by policy or jobs waiting in Redis.
- Monitoring queries associate incidents with an attempt.
- Student detail and overview logic can select the latest attempt. A reconnect, reset, or newer attempt can make the UI query a different `attempt_id` from the one shown in the supplied logs.

Verification must trace the same `attempt_id` from browser event through the database and monitoring response.

### Required read-only production check

Perform this before implementation planning or code changes. Do not expose secret values in notes or logs.

1. Confirm the effective telemetry mode, queue name, Redis availability, and whether `REDIS_URL` is configured.
2. Confirm a separately deployed telemetry-worker process uses the worker command above.
3. Check worker replica count, health/restart state, and logs for `Worker ready`.
4. Inspect BullMQ counts for waiting, active, completed, delayed, and failed jobs.
5. Select one recent event that policy flagged and trace its event/job identifier, `attempt_id`, event type, and deduplication key.
6. Confirm a corresponding `flagged_incidents` row exists or capture the worker/storage failure.
7. Query the instructor monitoring API for the same exam, student, and `attempt_id`.
8. Only after storage and API output are confirmed should the frontend query, filters, and cache be investigated.

Queue draining, retrying failed jobs, changing settings, or writing production rows is outside this read-only check and requires explicit authorization.

### `SIGTERM` interpretation

`src/server.ts` handles `SIGTERM` as a graceful shutdown. Platforms routinely send it during deployments, restarts, scaling, or replacement of an unhealthy instance. The pnpm message alone does not identify a telemetry defect.

Correlate its timestamp with deployment events, health-check failures, memory/CPU limits, restart count, and worker/API shutdown logs. Treat it as an incident only if it was unexpected or caused an availability gap.

### Workstream 2 acceptance criteria for the later plan

- Every policy-accepted production event reaches a terminal queue state.
- Failed jobs retain an actionable error and have an explicit retry/dead-letter policy.
- A persisted incident can be traced by `attempt_id` from ingestion through the monitoring API.
- Instructor monitoring displays the incident for the correct attempt within an agreed latency.
- Policy-ignored events remain absent from incident views but are distinguishable in operational telemetry.
- API and worker deployment health are independently observable.
- Deploy/restart shutdowns do not silently lose accepted jobs.
- Local and production process topology is documented and intentionally equivalent where required.

## Constraints and non-goals

- Do not weaken proctoring thresholds globally to mask mobile false positives.
- Do not make production mutations during diagnosis without authorization.
- Do not interpret raw detector logs as persisted instructor incidents.
- Do not replace existing mobile navigation, calibration, telemetry policy, or shared sheet primitives without first showing why extension is insufficient.
- Preserve active answer state, autosave behavior, timing, reconnect behavior, and telemetry while changing layout.
- Keep the two workstreams separately deployable and separately verifiable.

## High-value source areas for the later planning pass

### Attempt UI and question controls

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_components/attempt-view.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-ui-state.ts`
- `app/sentinel-web/src/features/exams/_components/engine/attempt/exam-attempt-shell.tsx`
- `app/sentinel-web/src/features/exams/_components/engine/attempt/exam-attempt-workspace.tsx`
- `app/sentinel-web/src/features/exams/_components/engine/attempt/exam-attempt-shell-header.tsx`
- `app/sentinel-web/src/features/exams/_components/engine/attempt/runtime/exam-attempt-runtime-header.tsx`
- `app/sentinel-web/src/features/exams/_components/engine/attempt/runtime/exam-attempt-runtime-footer.tsx`
- `app/sentinel-web/src/features/exams/_components/engine/question-renderer/`
- `packages/ui/src/hooks/use-mobile.ts`
- `packages/ui/src/components/ui/sheet.tsx`

### Audio and MediaPipe

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_components/student-exam-audio-provider.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-monitoring.ts`
- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring/_hooks/use-mediapipe-runtime-thresholds.ts`
- `packages/shared/src/mediapipe/calibration/calibration-sample.ts`
- `packages/shared/src/mediapipe/analysis.ts`

### Telemetry and monitoring

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client/`
- `app/sentinel-api/src/modules/telemetry/ingestion/ingestion.service.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-job-processor.service.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-writer.service.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.ts`
- `app/sentinel-api/src/modules/examination/monitoring/services/get-exam-monitoring-overview.ts`
- `app/sentinel-api/src/modules/examination/monitoring/services/get-exam-monitoring-student-detail.ts`
- `app/sentinel-api/package.json`
- `turbo.json`

The planning pass should re-resolve exact paths and symbols because nearby refactors may move these files.

## Open questions to resolve before finalizing plans

### Workstream 1

- Which question types and mobile browsers reproduce the unclickable-control issue?
- Is the viewport using `100vh`, `100dvh`, or another strategy on the failing device?
- Which breakpoint should define small-screen sheet and navigation behavior?
- Does the reported audio message come from initialization timeout, stream loss, or a separate reconnect path?
- What initialization time distribution is observed on supported mobile hardware?
- Which face-size/bounds values distinguish normal close framing from an unusably cropped face?
- What false-positive and false-negative rates are acceptable for mobile detection?

### Workstream 2

- Is a production telemetry worker deployed and healthy?
- What are the current queue counts and oldest waiting-job age?
- Did the flagged `TAB_SWITCH` job fail, remain queued, deduplicate into an existing row, or persist successfully?
- Does the monitoring page query the same attempt ID shown in ingestion logs?
- Was the observed `SIGTERM` expected during a deployment or caused by health/resource failure?

## Handoff requirements for the later implementation-plan prompt

Ask the planning LLM to:

1. Produce two independent plans, one per workstream.
2. Begin the production plan with the read-only verification gate.
3. Label every item as verified, inferred, or requiring reproduction.
4. Map changes to concrete files and existing abstractions.
5. Define automated, manual device, accessibility, and production validation.
6. Include observability, rollout, and rollback criteria.
7. Avoid proposing threshold or architecture changes until the open evidence is collected.
