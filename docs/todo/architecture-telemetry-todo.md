# Backend Architecture To-Do: Telemetry & Examination flow

## Phase 1: Directory Setup & Scaffolding

- [x] **Enforce Standard Module Structure**: For each new module and sub-module created below, adhere to the standard Sentinel API folder structure:
    - `controllers/` folder
    - `data/` folder
    - `services/` folder
    - `[module].dto.ts` file
    - `[module].routes.ts` file
    - `[module].service.ts` file (living at the root of the module, parent to the `services/` folder)
- [x] Create `src/modules/examination/flow` sub-module for exam session execution (start, heartbeat, submit).
- [x] Create `src/modules/examination/access` sub-module to handle user eligibility, temporal windows, and room assignments.
- [x] Create `src/modules/telemetry` top-level module to isolate high-throughput proctoring ingestion.
- [x] Create `src/modules/telemetry/ingestion` and `src/modules/telemetry/storage` domains.

## Phase 2: Telemetry Implementation

- [x] Define Zod schemas and DTOs for `ProctoringEventPayload`. Supported event types must include: `GAZE_OFF_SCREEN`, `MULTIPLE_FACES`, `NO_FACE_DETECTED`, `TAB_SWITCH`, `AUDIO_ANOMALY`.
- [x] Implement fast-path ingestion controller `POST /api/v1/telemetry/events`.
- [x] Implement append-only database layer for telemetry (consider batching if necessary, do NOT lock exam tables).
- [x] Add strict validation to drop any heavy payload (e.g. base64 image data) to enforce the "No Video Processing" rule.

## Phase 3: Examination Boundaries (Config & Flow)

- [x] Define DTOs mapping strictly to `ProctorExam['settings']` and `ProctorExam['configuration']` defined in `@sentinel/shared`.
- [x] Implement validation for `ExamSettings` (`shuffleQuestions`, `showCorrectAnswers`, `allowReview`, `randomizeChoices`).
- [x] Implement validation for `ExamConfiguration` parameters, specifically:
    - [x] Security Base: `strictMode`, `screenLock`, `cameraRequired`, `micRequired`, `maxReconnectAttempts`, `autoSubmitTimeoutMinutes`.
    - [x] `aiRules`: `gaze_tracking`, `face_detection`, `audio_anomaly_detection`, `multiple_faces_detection`.
    - [x] `webSecurity`: `tab_switching_monitor`, `full_screen_required`, `clipboard_control`, `right_click_disable`, `print_screen_disable`.
    - [x] `mobileSecurity`: `app_pinning_required`, `prevent_backgrounding`, `notification_block`, `screenshot_block`, `root_jailbreak_detection`.
- [x] Extract exam configuration updates from session progress. Configuration is static once published.
- [x] Implement session initialization endpoint `POST /api/v1/examination/flow/start` that interacts with the `access` boundary before generating a session token.

## Phase 4: Access Control Border

- [x] Implement `AccessGatekeeperService` in `src/modules/examination/access`.
- [x] Integrate checks: Verify student ID against enrollment, check time against `startDate`/`endDate`, and confirm assigned room status.
- [x] Ensure `flow` module calls `access` before granting the exam cryptogram or session session ID.

## Phase 5: Testing

- [x] Write unit tests for Telemetry validation (ensuring large payloads fail).
- [x] Write integration tests proving `flow` depends on `access` but operates independently from `configuration`.

## Implementation Notes

- `flow` now persists sessions through `exam_attempts`, returning the attempt ID as the session ID and reusing active attempts for reconnect-safe resumes.
- `access` now validates the real student profile, enrollment, exam publication state, schedule window, institution boundary, and room assignment integrity before allowing entry.
- `telemetry` now maps validated proctoring events into append-only `flagged_incidents` records tied to the active exam attempt, avoiding writes to exam definition tables.
- Exam configuration defaults now resolve from the shared global examination baseline, and configuration writes are blocked once an exam has been published so runtime flow consumes a stable snapshot.
