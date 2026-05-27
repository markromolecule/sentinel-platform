> [!NOTE]
> **Canonical location:** [.agents/docs/features/telemetry/05-storage.md](../../../.agents/docs/features/telemetry/05-storage.md)

# Storage — Context, Purpose & How It Works

## Purpose

The Storage module is the **final layer** of the telemetry pipeline. Its job is to take a validated, policy-approved proctoring event and transform it into a structured **incident record** in PostgreSQL — one that instructors can review, filter, and act on through the monitoring dashboard.

Unlike the ingestion layer (which is designed to be fast and stateless), the storage layer is designed to be **correct and durable**:

- It validates that the exam session still exists.
- It enforces ownership (the event's `studentId` must match the session).
- It deduplicates incidents within a configurable time window.
- It escalates severity dynamically based on repeat occurrences.

---

## Architecture (Facade Pattern)

`TelemetryStorageService` is a **static facade** that routes calls to three specialized services:

| Service                      | Responsibility                                     |
| :--------------------------- | :------------------------------------------------- |
| `IncidentPersistenceService` | Writing new or updating existing incident records. |
| `IncidentQueryService`       | Reading and filtering incidents for the dashboard. |
| `IncidentReviewService`      | Updating an incident's review status and notes.    |

---

## The `appendEvent` Flow (Single Incident)

This is the core write path, called for every qualified event.

### Step 1 — Session Validation

```sql
SELECT ea.attempt_id, ea.completed_at, ea.status, s.user_id
FROM exam_attempts ea
JOIN students s ON s.student_id = ea.student_id
WHERE ea.attempt_id = {examSessionId}
```

- If no session is found → `HTTP 404` → BullMQ worker drops the job.
- If `studentId` on the payload does not match `user_id` in the DB → `HTTP 403`.

### Step 2 — Completion Grace Period Check

After an exam finishes, the mobile/web client may still be sending buffered events. The system allows a **5-minute grace window** after `completed_at` for these late-arriving events to be ingested. Beyond that window, the event is rejected with `HTTP 409`.

```
TELEMETRY_GRACE_PERIOD_MS = 5 * 60 * 1000   (5 minutes)

if session.completed_at AND (now - completed_at) > grace period:
  → HTTP 409 (drop in BullMQ, not retried)
```

### Step 3 — Deduplication Check

To prevent a flood of identical incidents from the same session within a short window, the system queries for **recent matching incidents** before inserting a new one:

```sql
SELECT incident_id, details, severity, timestamp
FROM flagged_incidents
WHERE attempt_id = {examSessionId}
  AND rule_key   = {ruleKey}
  AND platform   = {platform}
  AND timestamp  >= {now - dedupeWindowSeconds}   -- default: 120s
ORDER BY timestamp DESC
```

**If a match is found within the dedupe window**: The existing incident is **updated** (not duplicated):

- `timestamp` is refreshed.
- `occurrenceCount` is incremented.
- Severity may be escalated based on the count.
- The `lastEvent` metadata is updated with the new signal's context.

**If no match is found**: A new incident record is inserted.

### Step 4 — Severity Resolution

Severity is not just a fixed mapping from event type — it can **escalate** dynamically. The `IncidentSeverityResolverService` checks how many matching incidents exist in the lookback window and may promote the severity:

| Base Severity | Escalated Severity | Condition Example                         |
| :------------ | :----------------- | :---------------------------------------- |
| `LOW`         | `MEDIUM`           | Multiple repeat occurrences in the window |
| `MEDIUM`      | `HIGH`             | Sustained high-frequency triggering       |
| `HIGH`        | `HIGH`             | Already at maximum                        |

The final severity and the reason for escalation are stored in the incident's `details` JSONB field.

---

## Event-to-Incident Type Mapping

Before inserting, the event type is translated to a structured `incident_type` using the `TELEMETRY_EVENT_TO_INCIDENT_MAP`:

| Event Type                                    | Incident Type                  | Severity   |
| :-------------------------------------------- | :----------------------------- | :--------- |
| `GAZE_OFF_SCREEN`                             | `GAZE`                         | LOW        |
| `NO_FACE_DETECTED`                            | `FACE_NOT_VISIBLE`             | MEDIUM     |
| `MULTIPLE_FACES`                              | `MULTIPLE_FACES`               | HIGH       |
| `TAB_SWITCH` / `FULL_SCREEN_EXIT`             | `TAB_SWITCH`                   | MEDIUM     |
| `CLIPBOARD_ATTEMPT` / `RIGHT_CLICK_ATTEMPT`   | `SUSPICIOUS_MOVEMENT`          | LOW–MEDIUM |
| `PRINT_SCREEN_ATTEMPT` / `SCREENSHOT_ATTEMPT` | `SCREENSHOT`                   | HIGH       |
| `AUDIO_ANOMALY`                               | `AUDIO_DETECTED`               | LOW        |
| `APP_BACKGROUNDING`                           | `APP_BACKGROUNDING`            | HIGH       |
| `ROOT_JAILBREAK_DETECTED`                     | `ROOT_JAILBREAK_DETECTED`      | HIGH       |
| `APP_PINNING_VIOLATION`                       | `APP_PINNING_VIOLATION`        | HIGH       |
| `NOTIFICATION_BLOCK_VIOLATION`                | `NOTIFICATION_BLOCK_VIOLATION` | MEDIUM     |

---

## Incident Record Fields

Each `flagged_incidents` row stores:

| Field                    | Description                                                            |
| :----------------------- | :--------------------------------------------------------------------- |
| `incident_id`            | Auto-generated UUID primary key.                                       |
| `attempt_id`             | Foreign key to `exam_attempts`.                                        |
| `incident_type`          | Normalized type (from mapping above).                                  |
| `platform`               | `web` or `mobile`.                                                     |
| `source`                 | `CLIENT` or non-client.                                                |
| `rule_key`               | The rule that triggered persistence.                                   |
| `severity`               | `LOW`, `MEDIUM`, or `HIGH` (dynamic).                                  |
| `status`                 | `PENDING` (awaiting review) or `REVIEWED`.                             |
| `details`                | JSONB: `occurrenceCount`, `severityReason`, `lastEvent`, raw metadata. |
| `timestamp`              | Time of the most recent triggering event (updated on deduplication).   |
| `configuration_snapshot` | Exam configuration at the time of the event (for audit).               |
| `session_context`        | Student and exam context snapshot.                                     |
| `dedupe_key`             | Computed key used for deduplication lookups.                           |
| `reviewed_at`            | When an instructor reviewed the incident.                              |
| `reviewed_by`            | Instructor's user ID.                                                  |

---

## Batch Append (`appendBatch`)

When the Redis buffer is flushed, all events are processed through `appendBatch`:

1. Events are grouped by `examSessionId` to minimise per-session session-validation queries.
2. For each session group, session validity is checked once.
3. Each event within the group is then processed individually through `appendEvent` (which handles deduplication and severity scaling per event).
4. Failed individual events within a batch are **logged and skipped** — a single bad event does not fail the entire batch.

---

_See also:_

- [`04-redis.md`](./04-redis.md) — The Redis flush that feeds `appendBatch`.
- [`02-ingestion.md`](./02-ingestion.md) — Where `appendEvent` is called from the queue worker.
- Source: [`storage.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/storage.service.ts)
- Source: [`incident-persistence.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts)
- Source: [`storage.constants.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/storage.constants.ts)
