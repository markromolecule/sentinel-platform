# Implementation Plan - Audio Event Log Enhancements

This plan outlines the steps to fully integrate audio anomaly detection into the Sentinel platform, ensuring that events like background noise are correctly detected, reported, and displayed in the instructor monitoring interface.

## 1. Phased Task Breakdown

### Phase 1: Shared Configuration & Type System

**Goal:** Ensure the shared configuration and type definitions support all desired audio anomaly types, including `BACKGROUND_NOISE`.

- [x] **Task 1.1: Enable `BACKGROUND_NOISE` in Default Config**
    - **Context:** The current default configuration excludes `BACKGROUND_NOISE` from active monitoring.
    - **Action:** Update `DEFAULT_AUDIO_ANOMALY_CONFIG` in `packages/shared/src/audio/audio-anomaly.ts` to include `BACKGROUND_NOISE` in `enabledAnomalyTypes`.
- [x] **Task 1.2: Define New Audio Event Types (Optional)**
    - **Context:** Inspired by "No Face Detected", we should consider a "SILENCE_DETECTED" event if the microphone is muted or inactive.
    - **Action:** Evaluate the need for `SILENCE_DETECTED` and add it to `AUDIO_ANOMALY_TYPES` if approved.
- [x] **Task 1.3: Update Telemetry Event Definitions**
    - **Context:** Ensure `TELEMETRY_EVENT_DEFINITIONS` correctly maps audio anomalies to the appropriate rules.
    - **Action:** Verify `AUDIO_ANOMALY` in `packages/shared/src/schema/telemetry/telemetry-schema.ts`.

### Phase 2: Client-side Detection (Web Worker)

**Goal:** Ensure the audio worker correctly identifies and emits events for all enabled anomaly types.

- [x] **Task 2.1: Verify `AudioAnomalyEngine` Processing**
    - **Context:** The engine filters anomalies based on `enabledAnomalyTypes`.
    - **Action:** Ensure the engine in `app/sentinel-web/src/workers/audio-anomaly-engine.ts` properly increments counters and triggers callbacks for `BACKGROUND_NOISE`.
- [x] **Task 2.2: Implement Threshold Calibration Logic**
    - **Context:** Different environments may require different noise floor levels.
    - **Action:** Ensure `mapYamnetScoresToAnomaly` uses the `effectiveThreshold` which accounts for `sensitivityMultiplier`.
- [x] **Task 2.3: Audio Status Heartbeat**
    - **Context:** To mirror "No Face Detected", we should periodically report if the audio stream is "healthy" but silent vs "inactive".

### Phase 3: Backend Ingestion & Rule Evaluation

**Goal:** Ensure the backend correctly persists audio events and escalates them to reviewable flags.

- [x] **Task 3.1: Refine `AudioAnomalyRule` Thresholds**
    - **Context:** The backend currently has a hardcoded `AUDIO_CONFIDENCE_THRESHOLD` of 0.85, which may override client-side triggers (e.g., Background Noise at 0.7).
    - **Action:** Update `app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts` to respect the confidence reported by the client or use type-specific thresholds.
- [x] **Task 3.2: Verify Data Persistence**
    - **Context:** Audio events must be saved as `TelemetryIncident` records with correct `anomalyType` metadata.
    - **Action:** Ensure the ingestion service correctly extracts `anomalyType` from metadata and populates the database.

### Phase 4: Instructor Monitoring UI

**Goal:** Provide a clear, actionable view of audio events for instructors.

- [x] **Task 4.1: Update `FlaggingTimeline` Styles**
    - **Context:** Events should be visually distinct based on their type.
    - **Action:** Verify and refine `AUDIO_ANOMALY_BADGE_STYLES` in `app/sentinel-web/src/features/exams/monitoring/_components/flagging-timeline.tsx`.
- [x] **Task 4.2: Add Descriptive Labels**
    - **Context:** Instructors need to know why an audio event was flagged.
    - **Action:** Update `rawEventDetails` or `getTimelineDescription` to provide more context for specific audio types (e.g., "Sustained background noise detected").

### Phase 5: Testing & Validation

**Goal:** Ensure reliability and prevent regressions.

- [x] **Task 5.1: Shared Logic Tests**
    - **Action:** Add unit tests for `yamnet-class-mapper.ts` covering all anomaly types and sensitivity levels.
- [x] **Task 5.2: Worker Integration Tests**
    - **Action:** Mock YAMNet scores in a test environment to verify the worker emits the correct `ANOMALY_DETECTED` events.
- [x] **Task 5.3: Backend Rule Tests**
    - **Action:** Update `ai-rules.test.ts` to include test cases for different audio anomaly types and confidence scores.

## 2. Conditional Requirements

### Database Migrations

- No schema changes are anticipated as `TelemetryIncident` already supports `metadata` JSON and `anomalyType` fields. However, if new event types are added to enums at the DB level, a migration will be required.

### Access Control

- Ensure that `proctor` and `instructor` roles have permissions to view audio-specific telemetry data.

## 3. Workflow Compliance

- **1-3-1 Rule:** All major architectural decisions will be presented with three options.
- **To-Do Workflow:** This document serves as the master tracking file for the audio event log feature.
