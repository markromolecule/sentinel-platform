# Stabilizing the Student Attempt Page

## Purpose

Prepare the attempt-page monitoring system for implementation work by separating observed symptoms, confirmed code behavior, likely root causes, validation gaps, and acceptance criteria.

The target outcome is trustworthy telemetry: one logical occurrence per detected action, accurate event classification, timely student feedback, and no incidents produced by normal attempt completion.

## Scope

### In scope

- Web attempt-page monitoring lifecycle
- Audio anomaly classification and notification
- MediaPipe gaze detection
- Telemetry deduplication and occurrence aggregation
- Fullscreen teardown during turn-in
- Screen-capture shortcut monitoring
- Mobile backgrounding telemetry
- Passage rendering on the attempt page

### Out of scope unless a requirement is added

- Training a new audio model
- Guaranteed prevention or detection of operating-system screenshots from a normal browser
- Native mobile screenshot prevention
- Redesigning the authoring format for passages

## Important terminology

- **Detection:** the browser, audio engine, or MediaPipe runtime recognizes a candidate action.
- **Emission:** the client sends a telemetry request.
- **Persistence:** the API inserts or updates a flagged incident.
- **Occurrence:** one distinct, accepted detection. Multiple occurrences may intentionally be aggregated into one incident row.
- **Duplicate:** the same logical detection is emitted or counted more than once.
- **Cooldown/debounce:** a client-side time window that suppresses repeated detections.
- **Dedupe window:** the server-side period in which distinct occurrences of the same rule may be aggregated into one incident row.

This distinction is essential: seeing one row with `occurrenceCount > 1` is aggregation, not automatically duplication.

## Executive root-cause assessment

| Area                                         | Root cause or current assessment                                                                                                                                                                                                                                                                                                                                                                                          | Confidence                                                 | Planning consequence                                                                                                                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate events and wrong occurrence counts | The original report does not identify whether duplication occurs at detection, emission, retry, or persistence. The current system contains client burst suppression, action-based `dedupeKey` values, an attempt-level database lock, duplicate-key rejection, and server aggregation. The remaining defect cannot be assigned to a layer without correlating one physical action through those stages.                  | Medium                                                     | Instrument and reproduce before changing dedupe rules. Define whether the expected result is separate rows or one row with an incremented count.                                                                             |
| Audio reports typing or alerts late          | Audio output is controlled by the runtime `enabledAnomalyTypes`, class-ID mapping, confidence thresholds, consecutive-frame threshold, and two cooldown layers. YAMNet needs a full 15,600-sample window and the default configuration requires two qualifying frames, so feedback is intentionally delayed by roughly multiple inference windows. Editing or “training” `model.json` is not the first corrective action. | High                                                       | Validate runtime settings and raw class scores first; tune mappings/thresholds and latency gates using recorded fixtures. Retrain/replace the model only if evidence shows the model itself cannot separate required sounds. |
| Audio event appears on a later anomaly       | The engine buffers nearly one second of audio, requires consecutive qualifying frames, resets counters independently per type, and applies cooldowns in both the engine and hook. This can make a valid alert appear delayed. A true stale or queued event is not yet proven.                                                                                                                                             | Medium                                                     | Add timestamped diagnostics from audio capture through toast and API ingestion, then test speech followed by silence/typing.                                                                                                 |
| Gaze event is absent or late                 | Dispatch requires a continuous off-screen signal for up to 1,500 ms on the attempt page and sampling is interval-based. Low landmark confidence is normally converted to `low-confidence` with no signal unless a partial face/off-screen condition is also present. Calibration and `tolerateDownwardGaze` can further classify movement as centered.                                                                    | High                                                       | Test direction, confidence, calibration, downward-gaze policy, frame interval, and duration threshold separately. Tune only from captured landmark fixtures and device trials.                                               |
| Fullscreen exit is logged after turn-in      | This is a teardown-order race: leaving fullscreen produces `fullscreenchange`, while React state/effects and navigation do not become suspended atomically. Current code already uses a synchronous phase ref/suspension guard, and the API silently ignores `FULL_SCREEN_EXIT` after completion.                                                                                                                         | High for original cause; medium on current reproducibility | Treat the current guards as the intended fix and add an end-to-end turn-in regression test. Confirm suspension is set before fullscreen exit or navigation begins.                                                           |
| Print Screen does not work                   | OS screenshot shortcuts are commonly intercepted before the page receives `keydown`. `preventDefault()` cannot stop an action whose event is never delivered. macOS `Cmd+Shift+3/4/5` and Windows Snipping Tool shortcuts therefore cannot be guaranteed by browser JavaScript.                                                                                                                                           | High                                                       | Reframe this as best-effort shortcut telemetry. Document supported browsers and use kiosk/native controls if guaranteed enforcement is required.                                                                             |
| Mobile monitoring is unclear                 | In the current listener, mobile focus/background loss shows a warning and increments local `tabSwitches`, but returns before emitting `TAB_SWITCH`. Web-only controls are intentionally skipped, and the shared schema has separate mobile event types.                                                                                                                                                                   | High                                                       | Define the expected mobile event (`APP_BACKGROUNDING` versus `TAB_SWITCH`) and connect the mobile lifecycle source to telemetry. Test on real iOS and Android devices.                                                       |
| Passage output is unclear                    | Passage data is resolved through `getRuntimePassageDetails` and rendered conditionally through `ExamAttemptRuntimePassage`, but the report provides no failing fixture, viewport, content type, or expected design. There is not enough evidence to name a rendering defect.                                                                                                                                              | Low                                                        | Capture representative passage fixtures and expected screenshots before planning a UI change.                                                                                                                                |

## Evidence from the current implementation

### Telemetry integrity and occurrence counting

Relevant code:

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client/_utils/action-metadata.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-writer.service.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-details.utils.ts`

Current controls include:

1. Per-action burst windows on the client.
2. Stable metadata containing `eventId`, `dedupeKey`, and `clientActionAt`.
3. Duplicate `dedupeKey` rejection by the API.
4. An attempt row lock to serialize concurrent writes.
5. Aggregation of later distinct events within a configured window, incrementing `occurrenceCount`.

The remaining ambiguity is product semantics. The implementation deliberately combines later events of the same rule into a single row. The implementation plan must state whether the UI should display:

- one incident row with an accurate occurrence count, or
- one row per physical occurrence.

Changing this without that decision risks “fixing” intended aggregation.

### Audio anomaly pipeline

Relevant code:

- `app/sentinel-web/src/workers/audio-anomaly-engine.ts`
- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/use-audio-anomaly-worker.ts`
- `packages/shared/src/audio/audio-anomaly.ts`
- `app/sentinel-web/public/models/yamnet/yamnet_class_map.csv`

Current behavior:

- Incoming browser audio is resampled to 16 kHz.
- Inference starts after 15,600 samples are buffered.
- YAMNet scores are mapped to anomaly types using configured class IDs.
- A type must pass its threshold for the configured number of consecutive frames.
- The worker and React hook both apply cooldown behavior.
- If several types trigger in one inference, only the highest-confidence type is emitted.
- Defaults enable only `TALKING` and `BACKGROUND_NOISE`; actual exam runtime settings may override this.

This makes the active runtime configuration the first thing to inspect when only one label appears. Model-file modification is premature because `model.json` is a converted graph artifact, not a safe hand-edited rule file.

### Gaze detection pipeline

Relevant code:

- `packages/shared/src/mediapipe/analysis.ts`
- `packages/shared/src/mediapipe/calibration.ts`
- `packages/shared/src/mediapipe/runtime.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring/_hooks/use-mediapipe-runtime-thresholds.ts`

The attempt runtime clamps gaze and no-face duration thresholds to at most 1,500 ms. Actual perceived latency also includes the frame interval. A signal must remain continuous; a centered or low-confidence frame resets its tracker. This explains why short glances may not emit and why unstable landmark confidence can suppress an otherwise visible movement.

### Turn-in and fullscreen lifecycle

Relevant code:

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-monitoring.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/index.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-session-eligibility.service.ts`

The client now suppresses fullscreen events when monitoring is suspended or the phase is `submitting`, `navigating-to-turn-in`, or `suspended`. The API also ignores fullscreen events for completed attempts. The planning task is to verify ordering and regression coverage, not introduce another independent flag.

### Screenshot shortcuts

The listener recognizes `PrintScreen`, macOS `Cmd+Shift+3/4/5`, and Windows `Meta+Shift+S` when a browser delivers the keyboard event. This is necessarily best effort. A browser application cannot reliably observe or cancel all OS-level capture commands.

### Mobile behavior

Mobile visibility loss currently takes a different path from desktop: it warns the student but does not call `emitTelemetryEvent`. This is a concrete functional gap if the requirement is to persist mobile backgrounding. The implementation must use the schema’s mobile semantics rather than silently treating every mobile background action as a desktop tab switch.

## Planning-ready workstreams

### 1. Establish an event-integrity trace

Add a development-only correlation trace with:

- physical-action/test-case ID
- detector source
- event type and subtype
- detection timestamp
- toast timestamp
- client `eventId` and `dedupeKey`
- request attempt/retry count
- API disposition: inserted, aggregated, or ignored as duplicate
- incident ID and resulting occurrence count

This trace is the prerequisite for resolving the duplication report.

### 2. Build a deterministic monitoring test matrix

Cover each event type across detection, emission, persistence, and UI display. Include repeated identical browser events, distinct events inside/outside the dedupe window, React Strict Mode mount/unmount, request retry, and concurrent ingestion.

### 3. Calibrate audio with fixtures

Use labeled recordings for speech, typing, tapping, breathing, background noise, silence, and mixed sounds. Record raw top YAMNet classes, mapped confidence, threshold outcome, frame count, cooldown outcome, and end-to-end alert latency. Decide acceptable false-positive, false-negative, and latency targets before tuning.

### 4. Calibrate gaze with landmark fixtures and devices

Test center, left, right, up, down, closed eyes, face near each viewport edge, partial face, glasses, low light, and calibrated/uncalibrated states. Separate classification accuracy from duration/sampling latency.

### 5. Lock down attempt teardown ordering

Define one transition sequence:

1. Set monitoring phase to `submitting` synchronously.
2. Mark monitoring suspended.
3. Submit/complete the attempt.
4. Exit fullscreen if still active.
5. Navigate to turn-in.

Verify that a fullscreen event occurring at any point after step 1 is ignored by both client and API.

### 6. Define platform capability policy

Document screenshot monitoring as best effort for browsers. Decide whether stronger enforcement requires kiosk mode, a managed-browser policy, an extension, Electron, or a native mobile client.

### 7. Complete mobile telemetry

Choose the canonical event for app backgrounding, emit it from lifecycle/visibility changes, assign dedupe semantics, and validate on real iOS Safari/PWA and Android Chrome/PWA or the supported native app.

### 8. Specify passage rendering requirements

Create fixtures for plain text, rich text, image, long content, and no passage. Supply expected desktop/mobile screenshots and behavior for panel open/closed, scrolling, question navigation, and sanitization.

## Acceptance criteria

### Event integrity

- One physical action produces one accepted occurrence.
- Retries or duplicate DOM/browser signals with the same logical action do not increment the count.
- A later distinct action increments the count exactly once when aggregation is intended.
- The timeline clearly distinguishes row count from occurrence count.

### Audio

- A supported speech fixture produces `AUDIO_ANOMALY` with `anomalyType: TALKING` within the agreed latency budget.
- Typing does not replace a higher-confidence speech result unless the measured scores justify it.
- Every enabled type has a passing positive fixture and a negative/control fixture.
- Toast label, persisted subtype, timestamp, and confidence refer to the same detection.
- Runtime settings used for the attempt are visible in diagnostics.

### Gaze

- Sustained off-screen gaze emits `GAZE_OFF_SCREEN` within the configured duration plus one frame interval.
- A brief glance below the agreed duration does not emit.
- Centered gaze and permitted downward reading do not generate false positives.
- Low-confidence behavior is explicit and covered by tests.

### Turn-in

- Normal submission, fullscreen exit, and redirect produce no `FULL_SCREEN_EXIT` occurrence after submission starts.
- A genuine fullscreen exit during the active phase still emits and locks as configured.
- Late or retried post-completion fullscreen requests are ignored without changing occurrence count.

### Screen capture

- Delivered supported shortcut events create at most one occurrence per action burst.
- Product copy and documentation do not claim guaranteed OS screenshot prevention in a browser.
- Unsupported/intercepted shortcuts are listed in the compatibility matrix.

### Mobile

- Backgrounding emits the chosen mobile telemetry type exactly once per transition.
- Returning to the app does not create a second occurrence for the same transition.
- Desktop-only fullscreen, clipboard, right-click, and keyboard assumptions are not applied to mobile.

### Passage

- Each approved fixture matches its expected desktop and mobile output.
- Long content scrolls without hiding navigation or answer controls.
- Panel state remains correct while moving between questions with and without passages.

## Required validation environments

- Chrome and Edge on Windows
- Chrome and Safari on macOS
- Safari on iOS and Chrome on Android, using real devices
- Development and production builds, because React lifecycle and worker timing can differ
- Slow CPU/network profile for race and latency testing

## Decisions needed before implementation planning

1. Should repeated occurrences be aggregated into one incident row or stored as separate rows?
2. What are the acceptable audio false-positive, false-negative, and alert-latency targets?
3. Is downward gaze allowed for reading passages or answering on-screen questions?
4. Is screenshot monitoring explicitly best effort, or is a kiosk/native enforcement solution required?
5. Which mobile platforms and delivery modes are supported?
6. What are the approved passage designs and representative content fixtures?

## Recommended implementation order

1. Event trace and reproducible test matrix
2. Occurrence/deduplication contract
3. Turn-in lifecycle regression coverage
4. Mobile backgrounding emission
5. Audio fixture calibration and tuning
6. Gaze fixture calibration and tuning
7. Passage rendering specification and fixes
8. Platform capability documentation for screenshots

This order prevents tuning detectors or changing persistence rules before the system can prove where an event was created, suppressed, duplicated, or aggregated.
