> [!NOTE]
> **Canonical location:** [.agents/docs/features/telemetry/04-redis.md](../../../.agents/docs/features/telemetry/04-redis.md)

# Redis — Context, Purpose & How It Works

## Purpose

Redis serves as the **asynchronous decoupling layer** between the high-frequency client signal ingestion and the slower PostgreSQL database writes. It prevents the backend from choking under load by ensuring that the HTTP request/response cycle is never blocked by a database INSERT.

Redis plays **three distinct roles** in the telemetry system:

| Role                    | Data Structure    | Use Case                                   |
| :---------------------- | :---------------- | :----------------------------------------- |
| **BullMQ Job Queue**    | Sorted Set + Hash | Durable, retryable single-event processing |
| **List Buffer**         | `RPUSH` list      | High-throughput batch event staging        |
| **Aggregation Counter** | `INCR` + TTL      | Sliding-window repeat-threshold counting   |

---

## Role 1: BullMQ Job Queue (Single Events)

When a single event passes the policy filter and the system is in `redis` mode, it is enqueued as a **BullMQ job**.

- **Queue name**: `telemetry-ingestion` (env: `TELEMETRY_REDIS_QUEUE_NAME`)

### Job Configuration

| Setting        | Default                       | Env Variable                         |
| :------------- | :---------------------------- | :----------------------------------- |
| Retry attempts | 3                             | `TELEMETRY_INGESTION_ATTEMPTS`       |
| Backoff        | Exponential, starting 1,000ms | `TELEMETRY_INGESTION_BACKOFF_MS`     |
| Keep completed | 1,000 (by count)              | `TELEMETRY_INGESTION_KEEP_COMPLETED` |
| Keep failed    | 5,000 (by count)              | `TELEMETRY_INGESTION_KEEP_FAILED`    |

### BullMQ Worker

A separate long-running Node.js process (`telemetry.worker.ts`) consumes jobs from the queue:

```
Worker picks up job
  → TelemetryStorageService.appendEvent(db, job.data)
  → Success: job marked completed
  → Terminal error (404/409): job DROPPED (not retried — avoids poison pills)
  → Transient error: retried up to 3x with exponential backoff
```

**Concurrency**: Up to 5 parallel job processors (env: `TELEMETRY_INGESTION_WORKER_CONCURRENCY`).

**Graceful shutdown**: Worker listens for `SIGINT`/`SIGTERM`, calls `worker.close()` before exit — no jobs lost on restart.

> [!NOTE]
> Terminal errors (HTTP 404 — session not found, HTTP 409 — exam completed) are **dropped** intentionally. Retrying these would be futile and would fill the failed job list with permanently unresolvable items.

---

## Role 2: Redis List Buffer (Batch Events)

For batch ingestion, events are appended to a **Redis List** using `RPUSH`. This is far faster than creating individual BullMQ jobs for each event in a large batch.

- **Buffer name**: `telemetry-buffer` (env: `TELEMETRY_REDIS_BUFFER_NAME`)
- **Write**: `RPUSH telemetry-buffer "{event1}" "{event2}" ...` — fire-and-forget, API returns immediately.

### Atomic Flush (Cron Job)

The buffer is drained by a cron job calling `GET /telemetry/internal/flush`. The flush uses an atomic **snapshot** pattern to prevent data loss during concurrent writes:

```
1. LLEN telemetry-buffer
   → If 0: return (no-op)

2. RENAME telemetry-buffer → telemetry-buffer:snapshot:{timestamp}
   ← ATOMIC: new RPUSHes now write to a fresh empty list

3. LRANGE snapshot 0 -1
   → Deserialize all events

4. TelemetryStorageService.appendBatch(db, events)
   → Bulk INSERT to PostgreSQL

5. DEL snapshot → cleanup
   → If step 4 fails: snapshot key persists for manual recovery
```

> [!IMPORTANT]
> The `RENAME` is the key safety primitive — it is atomic, so events arriving _during_ a flush are never lost. They land in the new empty `telemetry-buffer` while the flush operates on the renamed snapshot in isolation.

---

## Role 3: Aggregation Counter (Repeat Threshold)

The Policy Rules Engine uses Redis to maintain **per-student, per-rule sliding-window counters** without touching the database.

**Key pattern**:

```
telemetry:important-log-window:{platform}:{ruleKey}:{examSessionId}:{studentId}
```

**Logic**:

```
INCR key  → count
if count == 1:
  EXPIRE key {windowSeconds}
if count == threshold:
  → persist event (incident created)
else:
  → ignore
```

Only the **exact threshold hit** triggers persistence. Events beyond the threshold within the same TTL window are silently dropped — exactly one incident per breach.

---

## Connection Management & Fallback

Connections are created lazily on first use and reused. If `REDIS_URL` is not configured but `redis` mode is requested, the system **automatically falls back to `sync` mode** with a console warning — local development never breaks due to a missing Redis instance.

---

_See also:_

- [`02-ingestion.md`](./02-ingestion.md) — How events are routed to Redis.
- [`03-policy-rules-settings.md`](./03-policy-rules-settings.md) — The aggregation counter is used here.
- [`05-storage.md`](./05-storage.md) — What happens after the buffer is flushed.
- Source: [`ingestion-queue.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.ts)
- Source: [`telemetry.worker.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.ts)
- Source: [`telemetry-aggregation.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-aggregation.service.ts)
