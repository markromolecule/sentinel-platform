# Phase 3 — MediaPipe Sandbox Aligned To Shared Telemetry

## Dependencies

- The current telemetry contract in `packages/shared/src/schema/telemetry/telemetry-schema.ts`
- The current ingestion pipeline in `app/sentinel-api/src/modules/telemetry/ingestion/`
- The current configuration model in `packages/shared/src/schema/exams/assessment-schema.ts`

## Goal

Build a dev-only sandbox for calibrating MediaPipe-based signals before they are introduced into the real attempt runtime. The sandbox must validate **how MediaPipe maps into existing telemetry events**, not create a separate gaze logging subsystem.

---

## Initial Check

Before implementation:

- inspect the current telemetry contracts and ingestion tests
- inspect the current empty or stub MediaPipe infrastructure module
- confirm which AI event types already exist and can be reused
- identify the smallest end-to-end slice:
    - local payload preview first
    - optional dev-only ingestion second

---

## Scope

### Infrastructure module

```txt
app/sentinel-api/src/modules/infrastructure/mediapipe/
```

### Suggested sandbox route

```txt
app/sentinel-web/src/app/(protected)/(instructor)/exams/sandbox/gaze/page.tsx
```

The sandbox is a development and QA tool. It is not a production student page.

---

## Non-Goals

Do **not** introduce:

- `GazeLogEvent`
- `POST /mediapipe/log`
- `GET /mediapipe/log/:sessionId`
- a second incident persistence model
- raw landmark persistence as the production source of truth

MediaPipe output must ultimately map to the existing telemetry ingestion contract.

---

## Telemetry Event Targets

The sandbox should validate emission logic for the shared telemetry events that already exist:

- `GAZE_OFF_SCREEN`
- `NO_FACE_DETECTED`
- `MULTIPLE_FACES`
- `AUDIO_ANOMALY` only if current scope and capture support make it implementable without overreaching

Each emitted event must map to the correct existing fields:

- `platform`
- `source`
- `ruleKey`
- `eventType`
- `metadata.confidenceScore`
- `metadata.durationMs`

---

## Tasks

### Task 3.1 — Keep MediaPipe responsibilities narrow

Use `app/sentinel-api/src/modules/infrastructure/mediapipe/` for integration-specific logic such as:

- threshold constants
- classification helpers
- confidence handling
- event mapping helpers

Avoid starting with public API routes unless a concrete integration need appears later.

### Task 3.2 — Build the sandbox UI

The sandbox page should provide:

- live camera feed
- MediaPipe landmark overlay
- current classification output
- confidence display
- threshold and debounce controls
- a local event preview panel showing the exact telemetry payload shape that would be emitted

It may optionally send real dev-only test events through the existing telemetry ingestion endpoint, but local preview of the payload is required first.

### Task 3.3 — Define calibration outputs

The sandbox must produce documented calibration guidance for:

- threshold values
- debounce windows
- minimum confidence handling
- face-loss timeout behavior
- multiple-face detection behavior
- when signals should be ignored rather than emitted

### Task 3.4 — Map MediaPipe output to shared telemetry

For each supported AI signal, document:

- the MediaPipe observation
- the derived runtime classification
- the matching shared telemetry event
- the matching `ruleKey`
- whether the signal should be gated by `cameraRequired` and the relevant `aiRules.*` toggle

### Task 3.5 — Define runtime readiness for later integration

Before this phase is considered done, the sandbox must answer:

- what thresholds are safe to ship first
- which signals are reliable enough for student runtime
- which signals should remain debug-only for now
- how low-confidence or noisy frames are suppressed

---

## Backend Test Requirement

Any backend logic added under `app/sentinel-api/src/modules/infrastructure/mediapipe/` or any telemetry-mapping logic touched by this phase must have test coverage.

Expected test locations:

- `app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.test.ts` if MediaPipe-specific mapping/helpers are added
- existing telemetry ingestion tests if payload mapping or validation behavior changes

Minimum coverage:

- valid event mapping to shared telemetry fields
- confidence and debounce suppression behavior
- rejection of unsupported or malformed payload shapes if an API layer is introduced later

---

## Deliverables Checklist

- [ ] Sandbox route exists and is clearly dev-only
- [ ] MediaPipe output is visible and inspectable in real time
- [ ] Sandbox shows the current shared telemetry payload shape instead of a custom log format
- [ ] Thresholds, confidence rules, and debounce rules are documented
- [ ] Supported MediaPipe signals are explicitly mapped to existing telemetry events and rule keys
- [ ] No custom MediaPipe logging API is introduced
- [ ] Backend tests exist for any MediaPipe-side mapping logic added in this phase

---

## Exit Criteria

This phase is complete when MediaPipe calibration is documented well enough to integrate into the real student attempt flow without inventing a parallel proctoring pipeline.
