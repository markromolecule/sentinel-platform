# Ingestion — Context, Purpose & How It Works

## Purpose

The Ingestion module is the **entry point** for all proctoring events arriving at the backend. It acts as an orchestrator that performs three jobs in sequence:

1. **Gate**: Check whether telemetry is globally enabled.
2. **Filter**: Run the event through the Policy & Rules Engine to determine if it is significant enough to persist.
3. **Route**: Send qualifying events to either the Redis queue (async) or the database (sync), depending on the configured mode.

The ingestion layer is intentionally stateless and fast — it should complete its work and respond to the client in milliseconds, even in production under high concurrency.

---

## API Endpoints

| Method | Endpoint                    | Description                                                        |
| :----- | :-------------------------- | :----------------------------------------------------------------- |
| `POST` | `/telemetry/ingest`         | Receive a **single** proctoring event in real-time.                |
| `POST` | `/telemetry/ingest/batch`   | Receive a **batch** of events at once (high-throughput path).      |
| `GET`  | `/telemetry/internal/flush` | Cron-triggered endpoint to drain the Redis buffer to the database. |

---

## Single Event Flow (`processEvent`)

Called on every individual `POST /telemetry/ingest` request.

```
1. Resolve telemetry settings (cached, 30s TTL)
   └─ If globally disabled → drop event, return immediately

2. Log the received event (debug context)

3. TelemetryPolicyService.filterImportantEvent()
   └─ Check if rule is enabled for this exam's configuration
   └─ Run the rule's evaluation (duration or repeat threshold)
   └─ Decision: 'ignore' → return, no further action
   └─ Decision: 'persist' → proceed

4. TelemetryIngestionQueueService.submit()
   ├─ sync mode → TelemetryStorageService.appendEvent() (inline DB write)
   └─ redis mode → enqueue as a BullMQ job
```

---

## Batch Event Flow (`processBatch`)

Called on every `POST /telemetry/ingest/batch`. This path is optimised for **mobile apps** and scenarios where the client accumulates events locally and sends them in one payload (e.g., after reconnecting to the network).

```
1. Resolve telemetry settings (cached, 30s TTL)
   └─ If globally disabled → drop entire batch, return

2. Loop through each event in the batch:
   └─ Run TelemetryPolicyService.filterImportantEvent()
   └─ Collect only 'persist' decisions

3. If zero events survived filtering → return (no-op)

4. TelemetryIngestionQueueService.bufferBatch()
   ├─ sync mode → appendBatch() per chunk
   └─ redis mode → RPUSH all events to the Redis list buffer
```

> [!IMPORTANT]
> The batch path uses a **Redis List** (`telemetry-buffer`), not BullMQ jobs. This avoids per-event job overhead when handling bursts of 10–100 events at once. The buffer is drained periodically by the cron flush endpoint.

---

## The Queue Service (`TelemetryIngestionQueueService`)

This service is the router between the ingestion pipeline and the downstream storage/queue layers. It manages:

- **Mode detection**: Reads `TELEMETRY_INGESTION_MODE` (or `operations.ingestionMode` from live settings) and selects `sync` or `redis`.
- **BullMQ queue**: For single events in `redis` mode. Each event becomes a durable job with retry + backoff.
- **Redis list buffer**: For batch events in `redis` mode. Uses `RPUSH` for fast appends.
- **Graceful fallback**: If `redis` mode is set but `REDIS_URL` is not configured, it logs a warning and falls back to `sync` automatically.

### Chunk Logic

Before buffering a batch, the service splits it into chunks no larger than `maxBatchSize` (from settings, default: all events in one chunk). This prevents a single `RPUSH` call from becoming too large.

---

## The Flush Endpoint (`/telemetry/internal/flush`)

This `GET` endpoint is called by an external **cron job** (e.g., Vercel Cron, a scheduled Lambda, or a simple crontab).

**Security**: The endpoint requires a `Bearer {TELEMETRY_CRON_SECRET}` header. If no secret is configured, access is permitted with a console warning (useful in local dev).

**What it does**:

1. Checks if Redis mode is active. Returns `0` immediately if not.
2. Calls `TelemetryIngestionQueueService.flushBuffer()` — see [04-redis.md](./04-redis.md) for the atomic flush implementation.
3. Returns `{ flushedCount: N }` so the cron job can log how many events were drained.

---

## Why Two Paths? (Single vs Batch)

| Concern      | Single Path                 | Batch Path                      |
| :----------- | :-------------------------- | :------------------------------ |
| **Latency**  | Near real-time (BullMQ job) | Delayed until cron flush        |
| **Overhead** | One BullMQ job per event    | One `RPUSH` per batch           |
| **Best for** | Browser real-time signals   | Mobile offline-buffered signals |
| **Storage**  | BullMQ job queue in Redis   | `telemetry-buffer` Redis list   |

---

_See also:_

- [`03-policy-rules-settings.md`](./03-policy-rules-settings.md) — The filtering engine called inside `processEvent`.
- [`04-redis.md`](./04-redis.md) — How the queue and buffer are managed.
- Source: [`ingestion.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/ingestion.service.ts)
- Source: [`ingestion-queue.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.ts)
