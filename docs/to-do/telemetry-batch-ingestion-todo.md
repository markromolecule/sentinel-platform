# Telemetry Batch Ingestion & Cron Flush To-Do Plan

This plan implements a high-performance telemetry ingestion pipeline that buffers events in Redis and flushes them to Postgres in bulk via a scheduled task.

## 1. Schema & DTOs
- [ ] Create `batchProctoringEventSchema` in `ingestion.dto.ts` to accept arrays of events.
- [ ] Implement `BatchProctoringEventBody` type.

## 2. Ingestion Path (High-Speed Catch)
- [ ] Create `POST /events/batch` endpoint in a new `ingest-batch.controller.ts`.
- [ ] Implement `TelemetryIngestionService.processBatch` to filter events individually before buffering.
- [ ] Add `pushToBuffer` logic in `TelemetryIngestionQueueService` using Redis `RPUSH`.

## 3. Storage Layer (Bulk Insert)
- [ ] Implement `TelemetryStorageService.appendBatch` for multi-row inserts in Kysely.
- [ ] Add efficiency checks: avoid redundant session/config lookups for the same session ID in a batch.

## 4. Cron Flush Logic
- [ ] Implement `flushBuffer` in `TelemetryIngestionQueueService` using Redis `RENAME` (snapshot pattern).
- [ ] Create a secured `/internal/telemetry/flush` endpoint.
- [ ] Register the new routes in `ingestion.routes.ts`.

## 5. Verification & Documentation
- [ ] Write integration test for the batch-to-db flow.
- [ ] Document the frontend batching logic (5-second window).
- [ ] Provide example `curl` commands for testing.
