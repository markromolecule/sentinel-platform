---
title: "Fix AI Worker Redis Quota Limit and Runaway CPU Loop"
type: context
status: ready
created: "2026-09-26"
tags: [context, fix, redis, bullmq, ai-worker]
feature: "fix-ai-worker-redis-quota"
---

# Fix AI Worker Redis Quota Limit and Runaway CPU Loop Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  1. The server enters a high CPU/resource utilization loop ("eats the server") and emits repeating `ERR max requests limit exceeded` errors even when zero users are active.
  2. Submitting an AI generation job (`POST /ai/generate-preview/jobs`) immediately fails with HTTP `503 Service Unavailable`:
     `"Unable to enqueue AI generation task to the background queue. Please try again shortly."`
  3. Client console displays `share-modal.js:1 Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')`.

- **Root Cause Analysis (Evidence-Backed):**
  1. **Upstash Request Metering:** Production `REDIS_URL` points to an Upstash serverless Redis instance. Upstash meters and enforces a hard limit of 500,000 commands/month on pay-as-you-go. BullMQ workers (`ai-generation`, `telemetry-ingestion`) continuously poll Redis (`bzpopmin bull:ai-generation:marker 10`, `evalsha` stalled checks every 30s) 24/7. Even when 100% idle, two workers issue ~18,000–24,000 commands/day, which consumed all 500,000 requests in ~25 days without any user workload.
  2. **Tight Runaway CPU Spin ("Eating the Server"):** Once request #500,001 hit, Upstash rejected all commands with `ERR max requests limit exceeded`. In BullMQ, `bzpopmin` is supposed to block for 10 seconds. However, when Redis returns an immediate error, `bzpopmin` fails instantly (~2ms), emits a worker `error` event, and immediately retries without any backoff or pause. This resulted in an infinite tight loop of 5–10 Redis requests per second, consuming 100% CPU and flooding the logs.
  3. **AI Generation 503:** When `POST /ai/generate-preview/jobs` attempts to enqueue a new task, `AiGenerationQueueService.enqueueJob` calls `queue.add()`, which is rejected by Redis (`ERR max requests limit exceeded`). The service catches this and maps it to HTTP 503.
  4. **`share-modal.js` Error:** Verified that `share-modal.js` does not exist in the Sentinel codebase; it originates from a third-party client browser extension (e.g., social share, screencast/Loom extension) injected into the browser window.

- **Success Criteria:**
  - Background workers utilize a persistent, unmetered Redis instance (e.g. Railway Redis plugin), removing command count throttling.
  - BullMQ workers implement exponential backoff and circuit-breaking upon consecutive Redis command/connection errors, preventing runaway CPU spins.
  - AI question generation enqueues cleanly without 503 errors.

## 2. Requirements & User Stories

### User Stories & Scenarios

- *As a Teacher/Admin, I want to upload curriculum documents to generate preview questions, so that I can draft assessments without backend 503 service unavailable interruptions.*
- *As a Platform Engineer, I want background workers to back off exponentially during Redis outages or error states, so that background workers never consume 100% CPU or flood server logs in tight loops.*

### Functional Requirements

- [ ] **Infrastructure:** Update production/staging environment `REDIS_URL` to point to a persistent, unmetered Redis instance (e.g., Railway Redis service or containerized Redis).
- [ ] **Worker Resilience & Backoff:** In `ai-generation-worker.lifecycle.ts` (and `telemetry.worker.ts`), implement error backoff / circuit-breaking. When consecutive Redis errors occur, pause worker consumption with exponential backoff (e.g., 2s, 5s, 15s up to 30s) before attempting to reconnect/resume.
- [ ] **Tuned Polling Options:** Ensure BullMQ worker settings use conservative stalled intervals (`stalledInterval >= 60_000ms`) and explicit `drainDelay` settings.
- [ ] **Embedded Worker Check:** Verify `ENABLE_EMBEDDED_AI_WORKER=false` on API instances in production to prevent duplicate idle pollers when a dedicated worker container runs.

### Edge Cases & Failure Modes

- **Redis Connection Outage:** Worker detects repeated connection/command failures, enters paused/backoff mode, logs a single throttled warning every 30s, and resumes automatically once Redis connectivity recovers.
- **Queue Enqueue Failure:** API returns a structured HTTP 503 with informative retry-after headers instead of crashing.

## 3. Technical & Architectural Context

- **Affected Layers:**
  - `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-worker.lifecycle.ts`
  - `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.config.ts`
  - `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.service.ts`
  - `app/sentinel-api/src/lib/redis/redis.service.ts`
  - `app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.ts`
- **Environment & Hosting:**
  - Transition `REDIS_URL` in Railway from Upstash (`rediss://...upstash.io:6379`) to a Railway Redis service (`redis://...railway.internal:6379`).

## 4. Scope & Boundaries

- **In Scope:**
  - Diagnosing and addressing the root cause of the 503 error and server CPU burn.
  - Adding circuit breaker / error backoff to BullMQ worker lifecycle.
  - Tuning worker config and documentation for dedicated Redis.
- **Out of Scope:**
  - Rewriting question generation prompts or Vertex/Gemini AI business logic.
  - Modifying client-side browser extensions.

## 5. References & Decisions

- **Decision (2026-09-26):** Switch from request-metered serverless Redis (Upstash) to a dedicated unmetered Redis instance (Railway Redis) and implement worker circuit-breaking/backoff.
- Prior Context: [[docs/context/September/15/gemini-async-generation-railway-supabase|September 15 Context Spec]]
- Prior ADR: [[docs/decisions/2026-09-15-async-gemini-generation-railway-supabase|ADR: Async Gemini Generation]]
