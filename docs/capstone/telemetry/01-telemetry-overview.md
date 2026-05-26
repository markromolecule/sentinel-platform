> [!NOTE]
> **Canonical location:** [.agents/docs/features/telemetry/01-telemetry-overview.md](../../../.agents/docs/features/telemetry/01-telemetry-overview.md)

# Telemetry — Overview & Context

## Purpose

The Telemetry module is the **observability backbone** of Sentinel's proctoring system. Its job is to receive raw behavioral signals from clients (web, mobile, and AI) during an active exam session and convert them into meaningful, queryable incident records that instructors can review.

Without the telemetry system, Sentinel would have no way to audit whether a student was looking away, had another person visible on-screen, or switched browser tabs during an exam. The telemetry module bridges the gap between raw real-time signals and structured, reviewable incident data.

---

## Scope

The telemetry system handles **all exam proctoring signals**, regardless of their origin:

| Origin             | Examples                                                                             |
| :----------------- | :----------------------------------------------------------------------------------- |
| **MediaPipe / AI** | Gaze tracking, face detection, audio anomaly                                         |
| **Browser (Web)**  | Tab switches, fullscreen exit, clipboard/right-click attempts                        |
| **Mobile App**     | App backgrounding, screenshot attempts, jailbreak detection, notification violations |

---

## What Is a Telemetry Event?

A **telemetry event** is a single behavioral signal emitted by the client at a specific moment in time during an exam. Each event carries:

- `examSessionId` — The attempt being monitored.
- `studentId` — The student the event belongs to.
- `eventType` — The specific behavior (e.g., `GAZE_OFF_SCREEN`, `TAB_SWITCH`).
- `ruleKey` — The rule this event maps to for policy evaluation.
- `source` — `CLIENT` (browser/mobile) or a non-client source (server/AI-processed).
- `platform` — `web` or `mobile`.
- `metadata` — Optional bag: `durationMs`, `confidenceScore`, and AI aggregation context.
- `timestamp` — When the event occurred.

---

## Supported Event Types

| Event Type                     | Source         | Default Severity |
| :----------------------------- | :------------- | :--------------- |
| `GAZE_OFF_SCREEN`              | MediaPipe (AI) | LOW              |
| `NO_FACE_DETECTED`             | MediaPipe (AI) | MEDIUM           |
| `MULTIPLE_FACES`               | MediaPipe (AI) | HIGH             |
| `TAB_SWITCH`                   | Browser        | MEDIUM           |
| `FULL_SCREEN_EXIT`             | Browser        | MEDIUM           |
| `CLIPBOARD_ATTEMPT`            | Browser        | MEDIUM           |
| `RIGHT_CLICK_ATTEMPT`          | Browser        | LOW              |
| `PRINT_SCREEN_ATTEMPT`         | Browser        | HIGH             |
| `AUDIO_ANOMALY`                | AI (Audio)     | LOW              |
| `APP_BACKGROUNDING`            | Mobile         | HIGH             |
| `SCREENSHOT_ATTEMPT`           | Mobile         | HIGH             |
| `ROOT_JAILBREAK_DETECTED`      | Mobile         | HIGH             |
| `APP_PINNING_VIOLATION`        | Mobile         | HIGH             |
| `NOTIFICATION_BLOCK_VIOLATION` | Mobile         | MEDIUM           |

---

## System-Level Goals

The telemetry system is designed around three principles:

1. **Non-blocking**: Clients should never wait for database writes. Signals are accepted and queued immediately.
2. **Noise-filtered**: Not every raw signal becomes an incident. The Policy & Rules Engine ensures only meaningful anomalies are persisted.
3. **Auditable**: Every persisted incident retains the full event payload and the telemetry settings version active at the time, enabling forensic review.

---

## Two Operational Modes

The system supports two modes, selectable via the `TELEMETRY_INGESTION_MODE` environment variable:

| Mode        | When to Use                                                                                                                                        |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`sync`**  | Local development or low-load environments. Events are written directly to PostgreSQL inline with the HTTP request.                                |
| **`redis`** | Production. Events are queued via BullMQ or buffered in a Redis list. The HTTP request returns immediately; database writes happen asynchronously. |

> [!TIP]
> If `redis` mode is requested but `REDIS_URL` is not configured, the system automatically falls back to `sync` mode — no crash, no data loss.

---

## Where This Fits in the Architecture

```
[Student's Device]
       │
       │ POST /telemetry/ingest (or /ingest/batch)
       ▼
[Ingestion Pipeline]  ← filters noise via Policy & Rules Engine
       │
       ▼
[Redis Buffer / BullMQ Queue]  ← decouples client from DB writes
       │
       ▼
[Storage Layer]  ← writes flagged_incidents to PostgreSQL
       │
       ▼
[Instructor Monitoring Dashboard]
```

---

_See also:_

- [`02-ingestion.md`](./02-ingestion.md) — How events are received and filtered.
- [`03-policy-rules-settings.md`](./03-policy-rules-settings.md) — The rules engine that decides what to persist.
- [`04-redis.md`](./04-redis.md) — How Redis decouples writes from the API.
- [`05-storage.md`](./05-storage.md) — How incidents are written and structured.
