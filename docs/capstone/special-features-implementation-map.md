# Sentinel Special Features — Implementation & Source Code Directory

This document serves as an exhaustive, canonical source code reference mapping every **Special Feature** described in **Chapter 3 (Technical Background)** directly to its concrete logic, algorithms, hooks, background workers, and database services within the Sentinel monorepo.

---

## Table of Contents

1. [Edge AI Computer Vision & Adaptive Gaze Calibration (MediaPipe)](#1-edge-ai-computer-vision--adaptive-gaze-calibration-mediapipe)
2. [Edge Acoustic Anomaly & Silence Detection (TensorFlow.js / YAMNet)](#2-edge-acoustic-anomaly--silence-detection-tensorflowjs--yamnet)
3. [On-Demand WebRTC Video Inspection (LiveKit & Supabase Realtime)](#3-on-demand-webrtc-video-inspection-livekit--supabase-realtime)
4. [Table of Specifications (TOS) & Dynamic IRT Difficulty Engine](#4-table-of-specifications-tos--dynamic-irt-difficulty-engine)
5. [Multi-Tier Asynchronous Telemetry Ingestion Pipeline (Redis & BullMQ)](#5-multi-tier-asynchronous-telemetry-ingestion-pipeline-redis--bullmq)
6. [Dual-Mode Generative AI Question Engine & Rubric Snapshotting](#6-dual-mode-generative-ai-question-engine--rubric-snapshotting)
7. [Dynamic Role-Based Access Control (RBAC) & Multi-Tenant Scoping](#7-dynamic-role-based-access-control-rbac--multi-tenant-scoping)
8. [Mobile Kiosk & Anti-Cheat Security Enforcement (React Native Expo)](#8-mobile-kiosk--anti-cheat-security-enforcement-react-native-expo)

---

## 1. Edge AI Computer Vision & Adaptive Gaze Calibration (MediaPipe)

### Overview

Client-side edge facial landmarking and iris tracking running via WebGL/WebAssembly. Computes Eye Aspect Ratio (EAR), iris displacement vectors, head pose deviations, and normalizes signals against an initial student-specific neutral gaze baseline.

### Source Code Mapping

| Layer / Subsystem | Source File Path | Description of Logic & Implementation |
| :--- | :--- | :--- |
| **Shared Math & Types** | [`landmarks.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mediapipe/landmarks.ts) | Indices of 478 MediaPipe facial landmarks (iris centers, eye contour points, nose bridge). |
| | [`eye-state.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mediapipe/calibration/eye-state.ts) | Mathematical calculation of Eye Aspect Ratio ($\text{EAR}$) to detect blink vs. prolonged eye closure. |
| | [`gaze-offset.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mediapipe/calibration/gaze-offset.ts) | Computes horizontal/vertical normalized iris deviations relative to eye corners and eyelids. |
| | [`gaze-direction.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mediapipe/calibration/gaze-direction.ts) | Evaluates current gaze direction against calibrated thresholds (`CENTER`, `LEFT`, `RIGHT`, `UP`, `DOWN`). |
| | [`calibration-profile.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mediapipe/calibration/calibration-profile.ts) | Averaging logic to generate a persistent `MediaPipeCalibrationProfile` from initial samples. |
| | [`analysis.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mediapipe/analysis.ts) | Core frame analysis runner computing multi-face presence, edge boundaries, and anomaly flags. |
| **Web Client (`sentinel-web`)** | [`use-attempt-monitoring.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-monitoring.ts) | Mounts webcam feed, triggers 500 ms frame landmark extraction, and orchestrates client warning alerts. |
| | [`mediapipe-incident-dialog.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_components/mediapipe-incident-dialog.tsx) | Modal prompt alerting students when face is occluded or gaze deviates outside the viewport. |
| **Mobile Client (`sentinel-mobile`)** | [`mobile-mediapipe-calibration.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/lib/mobile-mediapipe-calibration.ts) | Mobile-specific calibration routine capturing baseline facial geometry through the front camera. |
| | [`use-mobile-mediapipe-monitoring.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/monitoring/use-mobile-mediapipe-monitoring.ts) | React Native hook executing vision anomaly detection in coordination with mobile frame captures. |
| **Backend API (`sentinel-api`)** | [`ai-rules.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts) | `GazeTrackingRule`, `FaceDetectionRule`, and `MultipleFacesRule` evaluating persistence thresholds. |
| | [`mediapipe.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.ts) | Backend service managing calibration profile storage and institutional threshold defaults. |

---

## 2. Edge Acoustic Anomaly & Silence Detection (TensorFlow.js / YAMNet)

### Overview

Client-side deep learning audio classification utilizing TensorFlow.js and the YAMNet 521-class AudioSet model running inside a Web Worker. Integrates an RMS waveform calculator for detecting microphone covering or silence.

### Source Code Mapping

| Layer / Subsystem | Source File Path | Description of Logic & Implementation |
| :--- | :--- | :--- |
| **Shared Audio Logic** | [`yamnet-class-mapper.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/audio/yamnet-class-mapper.ts) | Translates 521 AudioSet probabilities into Sentinel classes (`TALKING`, `TYPING`, `TAPPING`, `MOUTH_BREATHING`, `BACKGROUND_NOISE`). |
| | [`audio-anomaly-trigger.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/audio/audio-anomaly-trigger.ts) | Rolling window confidence tracker and cooldown managers preventing duplicate false-positive alarms. |
| | [`audio-anomaly.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/audio/audio-anomaly.ts) | Domain interfaces for acoustic events, spectrum frames, and RMS threshold configurations. |
| **Web Worker & Audio Engine** | [`audio-anomaly.worker.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/workers/audio-anomaly.worker.ts) | Web Worker event listener dispatching audio buffers to TensorFlow.js off the browser UI thread. |
| | [`audio-anomaly-engine.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/workers/audio-anomaly-engine.ts) | Loads YAMNet model graph, executes 15,600 sample inference (0.975s frame at 16 kHz), and calculates RMS silence. |
| | [`tfjs-backend-selection.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/lib/audio/tfjs-backend-selection.ts) | Dynamically selects WebAssembly (`wasm`) or WebGL backend based on browser capabilities. |
| **Web Hooks** | [`use-audio-anomaly-worker.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/hooks/use-audio-anomaly-worker/use-audio-anomaly-worker.ts) | React hook capturing microphone stream (`getUserMedia`), resampling to 16 kHz, and streaming to worker. |
| | [`audio-anomaly-controller.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/hooks/use-audio-anomaly-worker/audio-anomaly-controller.ts) | Controls start/stop states and manages telemetry event dispatch upon threshold breach. |
| **Mobile Bridge** | [`mobile-audio-bridge.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/components/monitoring/mobile-audio-bridge.tsx) | Headless webview bridge enabling TensorFlow.js audio processing on React Native mobile clients. |
| | [`use-mobile-audio-anomaly-monitoring.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/monitoring/use-mobile-audio-anomaly-monitoring.ts) | Mobile hook coordinating background audio capture with the mobile telemetry dispatcher. |
| **Backend & Shell Tooling** | [`update-audio-settings.controller.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/audio/controllers/update-audio-settings.controller.ts) | Hono endpoint (`PUT /audio`) allowing administrative configuration of audio sensitivity baselines. |
| | [`convert-yamnet-model.sh`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/scripts/convert-yamnet-model.sh) | Shell script converting TF Hub YAMNet weights into TFJS-compatible JSON/binary shards. |

---

## 3. On-Demand WebRTC Video Inspection (LiveKit & Supabase Realtime)

### Overview

A hybrid signaling and streaming architecture. Students remain disconnected from LiveKit during exams (consuming 0 minutes). Instructors trigger an on-demand video feed via Supabase Realtime WebSocket broadcast, engaging a LiveKit Selective Forwarding Unit (SFU) room only when inspection is required.

### Source Code Mapping

| Layer / Subsystem | Source File Path | Description of Logic & Implementation |
| :--- | :--- | :--- |
| **Backend Token Generation** | [`create-live-inspection-token.controller.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/live-inspection/controllers/create-live-inspection-token.controller.ts) | Generates cryptographically signed LiveKit JWTs with role-scoped permissions (`canPublish`/`canSubscribe`). |
| | [`live-inspection.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/live-inspection/live-inspection.service.ts) | Validates active exam attempt authorization before generating WebRTC room tokens. |
| | [`livekit.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/livekit/livekit.service.ts) | Wraps `livekit-server-sdk` `AccessToken` and room lifecycle management. |
| **Web Student Client** | [`use-attempt-realtime-broadcast.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-realtime-broadcast.ts) | Listens to Supabase broadcast channel `exam:[examId]:monitoring` for `request-stream` events. |
| | [`AttemptStep.tsx` / Realtime Handlers] | Dynamically acquires a LiveKit token and publishes webcam track upon receiving `"start"` action. |
| **Web Instructor Console** | [`live-feed-monitor.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/monitoring/_components/live-feed-monitor.tsx) | LiveKit React component subscribing to student camera feed and displaying real-time video stream. |
| | [`student-monitoring-detail.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/monitoring/_components/student-monitoring-detail.tsx) | Modal interface allowing proctors to toggle stream requests and view active student status. |
| **Mobile Client** | [`mobile-live-inspection-bridge.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/components/session/mobile-live-inspection-bridge.tsx) | React Native WebRTC component streaming mobile front-camera feed upon proctor request. |
| | [`use-mobile-live-inspection.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/monitoring/use-mobile-live-inspection.ts) | Handles mobile broadcast events, camera release on stop, and disconnect fail-safes. |

---

## 4. Table of Specifications (TOS) & Dynamic IRT Difficulty Engine

### Overview

Pedagogical assessment engine structuring examinations against Bloom's Taxonomy (Remembering to Creating), generating two-way balance matrices, calibrating empirical difficulty ($P$-value) via Item Response Theory, and enforcing question retirement upon exposure limits.

### Source Code Mapping

| Layer / Subsystem | Source File Path | Description of Logic & Implementation |
| :--- | :--- | :--- |
| **TOS Matrix Generation** | [`get-tos-matrix.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/data/get-tos-matrix.ts) | Kysely query grouping active questions by `topic` and `cognitive_level` into a distribution matrix. |
| | [`tos-and-assessment-logic.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/capstone/theory/tos-and-assessment-logic.md) | Canonical theory specification defining Bloom's Taxonomy LOTS/HOTS criteria and scoring rules. |
| **IRT Difficulty Calibration** | [`calibrate-question-difficulty.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/services/calibrate-question-difficulty.ts) | Computes empirical $P = \frac{\text{Correct}}{\text{Attempted}}$ and updates difficulty to `EASY`, `MODERATE`, or `HARD`. |
| **Exposure & Retirement** | [`check-exposure-threshold.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/services/check-exposure-threshold.ts) | Increments question `usage_count` upon exam publication and auto-retires items exceeding limit (default: 3). |
| | [`retire-question-bank.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/data/retire-question-bank.ts) | Database persistence function transitioning exposed questions to `RETIRED` status. |
| **Shared Schemas** | [`question-bank-schema.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/question-bank-schema.ts) | Zod definitions for cognitive levels, predicted difficulties, topics, and matrix summaries. |
| **Web Exam Builder UI** | [`builder/`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/) | Faculty UI displaying cognitive balance distribution grids and question import filtering. |

---

## 5. Multi-Tier Asynchronous Telemetry Ingestion Pipeline (Redis & BullMQ)

### Overview

A decoupled, high-throughput proctoring event pipeline. Filters raw client signals through policy threshold engines, enqueues single real-time events via BullMQ, buffers bulk mobile events in Redis lists, and executes atomic snapshot flushes to PostgreSQL via Kysely.

### Source Code Mapping

| Layer / Subsystem | Source File Path | Description of Logic & Implementation |
| :--- | :--- | :--- |
| **API Route Ingestion** | [`telemetry.routes.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/telemetry.routes.ts) | OpenAPI route declarations for `POST /telemetry/ingest`, `POST /batch`, and `GET /internal/flush`. |
| | [`ingestion.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/ingestion.service.ts) | Central orchestrator evaluating global kill-switches, exam rule toggles, and dispatch paths. |
| **Policy & Rules Engine** | [`telemetry-policy.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-policy.service.ts) | Evaluates events against duration thresholds or sliding-window repeat counters. |
| | [`ai-rules.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts) | Concrete implementations for gaze deviation, face absence, multiple faces, and audio events. |
| | [`telemetry-aggregation.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-aggregation.service.ts) | Manages atomic Redis `INCR` key counters with sliding-window `EXPIRE` times. |
| **Queue & Worker Layer** | [`ingestion-queue.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.ts) | Submits jobs to BullMQ (`submit`) or pushes to Redis list buffer (`bufferBatch`). |
| | [`telemetry.worker.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.ts) | Standalone BullMQ worker process executing 5 concurrent jobs with exponential backoff retries. |
| | [`flush-buffer.controller.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/controllers/flush-buffer.controller.ts) | Cron-triggered controller executing atomic `RENAME telemetry-buffer -> snapshot` and bulk SQL insert. |
| **Database Persistence** | [`storage.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/storage.service.ts) | Facade coordinating incident persistence, queries, and review updates. |
| | [`incident-writer.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-writer.service.ts) | Writes records to PostgreSQL `exam_proctoring_incidents` table using Kysely. |
| | [`incident-persistence.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts) | Maps incoming payloads and orchestrates incident snapshot image paths. |
| **Proctoring Evidence Storage** | [`evidence-storage.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/evidence/services/evidence-storage.service.ts) | Uploads forensic `.webp` violation snapshots to Supabase bucket `sentinel-proctoring-evidence`. |

---

## 6. Dual-Mode Generative AI Question Engine & Rubric Snapshotting

### Overview

Enterprise generative AI pipeline supporting Google Cloud Vertex AI (with Service Account authentication) and Google AI Studio direct API fallback. Generates structured question items with Bloom's Taxonomy tags and enforces immutable essay rubric snapshotting at exam start.

### Source Code Mapping

| Layer / Subsystem | Source File Path | Description of Logic & Implementation |
| :--- | :--- | :--- |
| **Gemini AI Orchestration** | [`gemini.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/integrations/gemini/gemini.service.ts) | Dispatches prompts to `@google/genai`, parses structured outputs, and enforces Zod contracts. |
| | [`ai-generation-worker.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/workers/ai-generation-worker.ts) | Background worker executing asynchronous PDF parsing and multi-item question generation. |
| | [`gemini-schema.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/gemini/gemini-schema.ts) | Shared Zod schemas enforcing JSON schema validation on LLM output. |
| **Essay Rubric Lifecycle** | [`essay-rubric.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/exams/essay-rubric.ts) | Resolves rubric hierarchy: `EXAM_OVERRIDE` $\rightarrow$ `BASELINE` $\rightarrow$ `legacy-standard-v1`. |
| | [`essay-rubric-evaluator.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/exams/essay-rubric-evaluator.ts) | Scores essay criteria (vocabulary, coherence, argument structure) against rubric levels. |
| | [`attempt-snapshot-schema.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/attempt-snapshot-schema.ts) | Serializes immutable rubric and assessment definitions into the student attempt record at start time. |

---

## 7. Dynamic Role-Based Access Control (RBAC) & Multi-Tenant Scoping

### Overview

A decoupled three-layer database-backed permission model (`roles`, `rbac_permissions`, and `rbac_role_permissions`). Enforces fine-grained `resource:action` capabilities via Hono middleware without modifying application source code.

### Source Code Mapping

| Layer / Subsystem | Source File Path | Description of Logic & Implementation |
| :--- | :--- | :--- |
| **Shared RBAC Registry** | [`permissions.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/constants/permissions.ts) | Canonical registry of system capabilities (e.g., `assessments:manage`, `rooms:view`) and default role blueprints. |
| | [`access-control-schema.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/access-control/access-control-schema.ts) | Zod validation schemas for role definitions, user assignment, and permission overrides. |
| **Backend API Route Guards** | [`permissions.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/permissions.ts) | Core middleware functions: `hasActivePermission`, `requireActivePermission`, and `requirePermission`. |
| | [`rbac.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/security/permission/permission.service.ts) | Resolves effective permissions from database by combining roles and direct user overrides. |
| **Multi-Tenant Scoping** | [`academic-scope.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/_shared/academic-scope/) | Scopes database queries by institution, department, course, and section hierarchies. |
| **Database Schema** | [`schema.prisma`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma) | Relational schema definitions for `roles`, `rbac_permissions`, `rbac_role_permissions`, and `user_roles`. |

---

## 8. Mobile Kiosk & Anti-Cheat Security Enforcement (React Native Expo)

### Overview

Cross-platform mobile client engineered with Expo and React Native. Provides hardware-enforced kiosk protections including screenshot/recording blocking, app backgrounding detection, root/jailbreak integrity checks, and batched telemetry synchronization.

### Source Code Mapping

| Layer / Subsystem | Source File Path | Description of Logic & Implementation |
| :--- | :--- | :--- |
| **Kiosk Security Hook** | [`use-exam-session-security.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/session/use-exam-session-security.ts) | Listens to application state changes (`AppState`), intercepts app switching, and emits telemetry. |
| **Screen Capture Prevention** | [`app.json`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/app.json) & [`package.json`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/package.json) | Integrates `expo-screen-capture` to prevent screenshotting and screen recording at the OS level. |
| **Mobile Telemetry Client** | [`mobile-telemetry-client.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/lib/mobile-telemetry-client.ts) | Buffers mobile violations (`APP_BACKGROUNDING`, `SCREENSHOT_ATTEMPT`) and flushes to `/telemetry/ingest/batch`. |
| **Reconnection & State Sync** | [`mobile-exam-reconnection.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/lib/mobile-exam-reconnection.ts) | Manages offline network drops, caches answers locally in AsyncStorage, and resynchronizes with API. |
| **Mobile Session UI** | [`exam-session-screen.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx) | Native mobile exam view integrating timer controls, question drawers, and proctoring overlays. |

---

*Document created and verified against repository commit tree.*  
*Maintained under `docs/capstone/special-features-implementation-map.md`.*
