# Telemetry System — End-to-End Documentation

This document provides a comprehensive, end-to-end explanation of how Sentinel's telemetry pipeline works — from raw client signals all the way to persisted incident records in the database — without choking the backend under production load.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Telemetry Events](#2-telemetry-events)
3. [Ingestion Pipeline](#3-ingestion-pipeline)
4. [Policy & Rules Engine](#4-policy--rules-engine)
5. [Redis & Queue Layer](#5-redis--queue-layer)
6. [Storage Layer](#6-storage-layer)
7. [Settings & Runtime Control](#7-settings--runtime-control)
8. [End-to-End Flow Summary](#8-end-to-end-flow-summary)
9. [Environment Variables Reference](#9-environment-variables-reference)

---

## 1. System Overview

The telemetry system is a **multi-tier event pipeline** designed to handle high-frequency proctoring signals without directly writing every raw event to the database. This prevents backend saturation under peak load (e.g., 100+ concurrent exam sessions).

The system operates in two selectable modes:

| Mode        | Behavior                                                                                                                                                                                             |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`sync`**  | Events are written directly and synchronously to PostgreSQL. Simple, but not suited for high concurrency.                                                                                            |
| **`redis`** | Events are first buffered in a Redis list or dispatched to a **BullMQ** queue, then flushed to the database in bulk by a background worker or cron job. This is the **production-recommended mode**. |

---

## 2. Telemetry Events

### Supported Event Types

| Event Type                     | Source         | Severity |
| :----------------------------- | :------------- | :------- |
| `GAZE_OFF_SCREEN`              | MediaPipe (AI) | LOW      |
| `NO_FACE_DETECTED`             | MediaPipe (AI) | MEDIUM   |
| `MULTIPLE_FACES`               | MediaPipe (AI) | HIGH     |
| `TAB_SWITCH`                   | Browser        | MEDIUM   |
| `FULL_SCREEN_EXIT`             | Browser        | MEDIUM   |
| `CLIPBOARD_ATTEMPT`            | Browser        | MEDIUM   |
| `RIGHT_CLICK_ATTEMPT`          | Browser        | LOW      |
| `PRINT_SCREEN_ATTEMPT`         | Browser        | HIGH     |
| `AUDIO_ANOMALY`                | AI (Audio)     | LOW      |
| `APP_BACKGROUNDING`            | Mobile         | HIGH     |
| `SCREENSHOT_ATTEMPT`           | Mobile         | HIGH     |
| `ROOT_JAILBREAK_DETECTED`      | Mobile         | HIGH     |
| `APP_PINNING_VIOLATION`        | Mobile         | HIGH     |
| `NOTIFICATION_BLOCK_VIOLATION` | Mobile         | MEDIUM   |

### Event Payload Shape

Every event sent to the API carries a `ProctoringEventBody`:

- `examSessionId` — The active exam attempt's session ID.
- `studentId` — The student being monitored.
- `eventType` — One of the supported types above.
- `ruleKey` — The policy rule this event maps to (e.g., `aiRules.gaze_tracking`).
- `source` — `CLIENT` (browser/mobile) or non-client (server/AI-processed).
- `platform` — `web` or `mobile`.
- `metadata` — Optional bag containing `durationMs`, `confidenceScore`, etc.

---

## 3. Ingestion Pipeline

The ingestion pipeline is the **central orchestrator** that receives raw events and decides what to do with them.

### Entry Points (API Routes)

| Method | Endpoint                    | Description                              |
| :----- | :-------------------------- | :--------------------------------------- |
| `POST` | `/telemetry/ingest`         | Single event ingestion (real-time).      |
| `POST` | `/telemetry/ingest/batch`   | Batch event ingestion (high-throughput). |
| `GET`  | `/telemetry/internal/flush` | Cron-triggered buffer flush to database. |

### Single Event Flow (`processEvent`)

```
Client sends event
  → TelemetryIngestionService.processEvent()
    → 1. Check if telemetry is globally enabled (from settings cache)
    → 2. Run TelemetryPolicyService.filterImportantEvent()
         ↳ Check if the rule is enabled for this exam's configuration
         ↳ Evaluate the rule (duration threshold or repeat count)
         → 3a. Decision: 'ignore' → Drop the event. No DB write.
         → 3b. Decision: 'persist' → Forward to queue
    → 4. TelemetryIngestionQueueService.submit()
         ↳ sync mode: write directly to DB
         ↳ redis mode: enqueue as a BullMQ job
```

### Batch Event Flow (`processBatch`)

For high-frequency signals (e.g., mobile apps flushing 10 events at once):

```
Client sends batch
  → TelemetryIngestionService.processBatch()
    → 1. Check global settings
    → 2. Filter each event through TelemetryPolicyService (loop)
    → 3. Collect only the 'persist' decisions
    → 4. TelemetryIngestionQueueService.bufferBatch()
         ↳ sync mode: appendBatch() per chunk
         ↳ redis mode: RPUSH each JSON-serialized event to a Redis list
```

> [!IMPORTANT]
> The batch path uses a **Redis List buffer** (`telemetry-buffer`) — NOT BullMQ jobs — for maximum throughput. This avoids per-event job overhead and lets a cron job drain it in bulk.

---

## 4. Policy & Rules Engine

Before any event is persisted, it must pass through the **Policy + Rules Engine**. This is the gatekeeper that prevents noise from flooding the incident log.

### Check 1: Global Kill Switch

The `TelemetryIngestionService` reads from `telemetry.global.settings` (cached for **30 seconds**). If `operations.enabled = false`, all events are silently dropped.

### Check 2: Exam-Level Rule Toggle

Each exam can have specific AI rules enabled/disabled in its configuration. For example, a specific exam may have `aiRules.gaze_tracking = false`, in which case all `GAZE_OFF_SCREEN` events from that session are dropped.

### Check 3: Rule Evaluation

Each event type is mapped to a concrete `BaseTelemetryRule` implementation. Rules evaluate one of two conditions:

#### Duration Threshold

An event is persisted if a single occurrence lasted long enough:

```
if payload.metadata.durationMs >= durationThresholdMs → persist
```

#### Repeat Threshold (Redis Counter)

An event is persisted if it has occurred N times within a sliding time window. This uses an **atomic Redis INCR counter** with a TTL:

```
key = telemetry:important-log-window:{platform}:{ruleKey}:{examSessionId}:{studentId}
INCR key → count
if count == 1: EXPIRE key {windowSeconds}
if count == threshold: persist
```

> [!NOTE]
> Only the **exact threshold hit** triggers persistence. Counts above the threshold are silently discarded. This means one incident record per threshold breach, not one per occurrence.

### Rule Thresholds Reference

| Rule               | Trigger Conditions                                                         |
| :----------------- | :------------------------------------------------------------------------- |
| **Gaze Tracking**  | `durationMs >= 1,500ms` OR `3 occurrences` in `120s`                       |
| **Face Detection** | `durationMs >= 1,500ms` OR `2 occurrences` in `60s`                        |
| **Multiple Faces** | Immediate if `confidenceScore >= 0.8`; otherwise `3 occurrences` in `120s` |
| **Audio Anomaly**  | `confidenceScore >= 0.85` OR `3 occurrences` in `120s`                     |

> [!TIP]
> All thresholds can be overridden at runtime via `telemetry.global.settings.ruleOverrides` without a deployment. This is managed by the Support portal.

---

## 5. Redis & Queue Layer

Redis serves **two distinct roles** in the telemetry system.

### Role 1: BullMQ Job Queue (Single Events)

Used by `TelemetryIngestionQueueService.submit()` for real-time, single-event ingestion in `redis` mode.

- Queue name: `telemetry-ingestion` (env: `TELEMETRY_REDIS_QUEUE_NAME`)
- Job name: `append-proctoring-event`
- **Retry policy**: Up to **3 attempts** with **exponential backoff** starting at 1,000ms
- **Auto-cleanup**: Keeps last 1,000 completed jobs and last 5,000 failed jobs
- Worker concurrency: **5 concurrent** job processors (env: `TELEMETRY_INGESTION_WORKER_CONCURRENCY`)

A dedicated **BullMQ Worker** (`telemetry.worker.ts`) runs as a separate process, picking up jobs and calling `TelemetryStorageService.appendEvent()`. If a terminal error occurs (404 or 409), the job is **dropped** (not retried) to avoid poison-pill loops.

### Role 2: Redis List Buffer (Batch Events)

Used by `TelemetryIngestionQueueService.bufferBatch()` for high-throughput batch ingestion.

- Buffer name: `telemetry-buffer` (env: `TELEMETRY_REDIS_BUFFER_NAME`)
- **Write operation**: `RPUSH` — appends serialized JSON events to the end of a Redis list.
- **This path is fire-and-forget from the client's perspective** — the API responds immediately without waiting for a DB write.

#### Buffer Flush (Cron Job)

The `GET /telemetry/internal/flush` endpoint is called by a scheduled cron job. It performs an **atomic snapshot flush**:

```
1. Check list length: LLEN telemetry-buffer
2. If empty → return 0 (no-op)
3. RENAME telemetry-buffer → telemetry-buffer:snapshot:{timestamp}  ← ATOMIC
4. LRANGE snapshot 0 -1 → deserialize all events
5. TelemetryStorageService.appendBatch() → single bulk INSERT to PostgreSQL
6. DEL snapshot → cleanup
```

> [!IMPORTANT]
> The `RENAME` command is the critical safety mechanism. It atomically moves the live buffer to a snapshot key, meaning new incoming events will write to a fresh list with no data loss, while the flush processes the snapshot independently. If the DB write fails, the snapshot key persists in Redis for manual recovery.

### Fallback

If `REDIS_URL` is not configured and the settings request `redis` mode, the system **automatically falls back to `sync` mode** with a console warning. This prevents startup failures in local development.

---

## 6. Storage Layer

Once an event passes policy evaluation and has been dequeued (or flushed from the buffer), it reaches the **Storage Layer**, which is responsible for writing the final incident record to PostgreSQL.

### Architecture (Facade Pattern)

`TelemetryStorageService` is a static facade that delegates to three specialized services:

| Service                      | Responsibility                                                    |
| :--------------------------- | :---------------------------------------------------------------- |
| `IncidentPersistenceService` | Writing new incident records (single and batch).                  |
| `IncidentQueryService`       | Reading/filtering incidents for the monitoring dashboard.         |
| `IncidentReviewService`      | Updating review status (e.g., marking an incident as "reviewed"). |

### Event-to-Incident Mapping

Every stored event is mapped from a raw `ProctoringEventBody` to a database `exam_proctoring_incidents` record using the `TELEMETRY_EVENT_TO_INCIDENT_MAP`:

| Event Type                                      | Incident Type      | Severity |
| :---------------------------------------------- | :----------------- | :------- |
| `GAZE_OFF_SCREEN`                               | `GAZE`             | `LOW`    |
| `NO_FACE_DETECTED`                              | `FACE_NOT_VISIBLE` | `MEDIUM` |
| `MULTIPLE_FACES`                                | `MULTIPLE_FACES`   | `HIGH`   |
| `TAB_SWITCH` / `FULL_SCREEN_EXIT`               | `TAB_SWITCH`       | `MEDIUM` |
| `PRINT_SCREEN_ATTEMPT` / `SCREENSHOT_ATTEMPT`   | `SCREENSHOT`       | `HIGH`   |
| `APP_BACKGROUNDING` / `ROOT_JAILBREAK_DETECTED` | _(same name)_      | `HIGH`   |

### Incident Record

Each incident stored in the database includes:

- `incident_type` and `severity` (mapped from event type)
- `exam_session_id` and `student_id` (for scoped queries)
- `event_metadata` — the full raw event payload as JSONB (for audit trails)
- `runtime_settings_snapshot` — the telemetry settings version in effect at the time of the event
- `reviewed_at`, `reviewed_by` — populated when an instructor reviews the incident

---

## 7. Settings & Runtime Control

The telemetry system supports **hot-reconfiguration** via a support-managed settings record in the database. Settings are cached for **30 seconds** per API instance to avoid database hammering.

### Settings Key: `telemetry.global.settings`

```json
{
    "version": 1,
    "operations": {
        "enabled": true,
        "ingestionMode": "redis",
        "batchingEnabled": true,
        "maxBatchSize": 100,
        "batchWindowMs": 5000
    },
    "ruleOverrides": {
        "aiRules.gaze_tracking": {
            "enabled": true,
            "durationThresholdMs": 2000,
            "repeatThreshold": 2
        }
    }
}
```

| Setting                      | Effect                                                           |
| :--------------------------- | :--------------------------------------------------------------- |
| `operations.enabled`         | Global kill switch — disables all event processing when `false`. |
| `operations.ingestionMode`   | Switch between `sync` and `redis` without a deployment.          |
| `operations.batchingEnabled` | Enables/disables the Redis list buffer for batch events.         |
| `ruleOverrides[ruleKey]`     | Tighten or loosen thresholds for specific rules at runtime.      |

---

## 8. End-to-End Flow Summary

```
[Client (Web/Mobile)]
    │
    │ POST /telemetry/ingest or /ingest/batch
    ▼
[TelemetryIngestionService]
    │
    ├─ Check: globally enabled?       → NO  → drop (silent)
    │
    ├─ Check: rule enabled for exam?  → NO  → drop (logged)
    │
    ├─ Evaluate rule (Policy Engine)
    │     ├─ Duration threshold met?  → YES → persist
    │     └─ Repeat count == N?       → YES → persist (via Redis INCR counter)
    │                                 → NO  → drop (logged)
    │
    ├─ [single event] Queue via BullMQ Job
    │       ▼
    │  [BullMQ Worker] (separate process)
    │       │ retry up to 3x w/ exponential backoff
    │       ▼
    │  TelemetryStorageService.appendEvent()
    │
    └─ [batch event] RPUSH to Redis List (fire-and-forget)
            │
            │ (cron: GET /telemetry/internal/flush)
            ▼
        RENAME → snapshot → LRANGE all → appendBatch()
            ▼
    [PostgreSQL: exam_proctoring_incidents]
            │
            ▼
    [Instructor Monitoring Dashboard]
```

---

## 9. Environment Variables Reference

| Variable                                 | Default               | Description                                              |
| :--------------------------------------- | :-------------------- | :------------------------------------------------------- |
| `TELEMETRY_INGESTION_MODE`               | `sync`                | Set to `redis` to enable async queue mode.               |
| `REDIS_URL`                              | —                     | Redis connection string. Required for `redis` mode.      |
| `TELEMETRY_REDIS_QUEUE_NAME`             | `telemetry-ingestion` | BullMQ queue name.                                       |
| `TELEMETRY_REDIS_BUFFER_NAME`            | `telemetry-buffer`    | Redis list buffer name for batch events.                 |
| `TELEMETRY_INGESTION_WORKER_CONCURRENCY` | `5`                   | Number of concurrent BullMQ workers.                     |
| `TELEMETRY_INGESTION_ATTEMPTS`           | `3`                   | Job retry attempts before marking failed.                |
| `TELEMETRY_INGESTION_BACKOFF_MS`         | `1000`                | Initial backoff delay (exponential).                     |
| `TELEMETRY_INGESTION_KEEP_COMPLETED`     | `1000`                | Max completed jobs to retain in Redis.                   |
| `TELEMETRY_INGESTION_KEEP_FAILED`        | `5000`                | Max failed jobs to retain in Redis.                      |
| `TELEMETRY_CRON_SECRET` / `CRON_SECRET`  | —                     | Bearer token for authenticating the flush cron endpoint. |

---

_Created on: 2026-04-29_

_Related Source Files:_

- [`ingestion.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/ingestion.service.ts)
- [`ingestion-queue.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.ts)
- [`telemetry-policy.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-policy.service.ts)
- [`telemetry-aggregation.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-aggregation.service.ts)
- [`ai-rules.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts)
- [`telemetry.worker.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.ts)
- [`storage.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/storage.service.ts)
- [`storage.constants.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/storage.constants.ts)
- [`ingestion-queue.config.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/config/ingestion-queue.config.ts)
