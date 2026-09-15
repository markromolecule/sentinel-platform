---
title: "ADR-0002: Asynchronous AI Generation Pipeline via Railway Worker and Supabase Pro"
type: decision
status: accepted
created: "2026-09-15"
tags: [adr, ai, gemini, vertex-ai, railway, supabase-pro, async, bullmq, architecture]
---

# ADR-0002: Asynchronous AI Generation Pipeline via Railway Worker and Supabase Pro

## Context

Sentinel's AI question generation enables instructors to upload course PDFs and synthesize 10–80 questions across various cognitive levels and question formats.

In local development, the full pipeline completes smoothly because the local Node.js server holds open HTTP connections indefinitely without proxy constraints.

In production:

- The frontend is served via **Vercel** (`app.sentinelph.tech`).
- The API backend is hosted on **Railway** (`api.sentinelph.tech`, running `server.ts` with `serve` from `@hono/node-server`).
- The frontend browser makes a direct cross-origin request to `https://api.sentinelph.tech/ai/generate-preview`.

When generating 40–80 questions from multi-document PDFs (50–120+ pages), the pipeline executes 4–8 serial/concurrent batches plus passage quality validation and repair passes, totaling **90 to 180 seconds**.

At approximately **100 seconds**, the Railway Hikari edge proxy cuts the in-flight TCP socket with an HTTP 504 Gateway Timeout. Because this timeout originates from the edge proxy rather than the Hono application server, it lacks CORS headers (`Access-Control-Allow-Origin`). The browser immediately halts with a deceptive CORS policy error (`No 'Access-Control-Allow-Origin' header is present on the requested resource`), and the frontend surfaces `Unable to connect to the AI generation service`.

Holding synchronous HTTP connections open for multi-minute LLM jobs is fundamentally brittle across public edge networks and intermediary proxies (Cloudflare, institutional Wi-Fi gateways). Sentinel requires an asynchronous generation architecture that leverages its existing **Railway** container infrastructure and **Supabase Pro** stack to support heavy workloads reliably.

---

## Options Considered

### Option 1: Asynchronous Job Pipeline with Railway Persistent Worker + Supabase Pro (Accepted)

- **Mechanism:**
  1. The client sends a multipart request (`POST /ai/generate-preview/jobs`) containing PDFs (up to 15MB total) and generation configuration.
  2. The API persists uploaded files to ephemeral disk (`/tmp/ai-jobs/<jobId>/`), creates an `ai_generation_jobs` record in Supabase Postgres (`status: 'queued'`), dispatches a job to **BullMQ** (`ai-generation` queue backed by Redis), and immediately returns `202 Accepted` with `{ jobId, status: 'queued' }` in <500ms.
  3. A persistent background worker on Railway executes `QuestionGeneratorService.generatePreviewFromPdf()` without HTTP socket timeout limits.
  4. The worker updates progress (`queued` -> `processing (X%)` -> `completed` / `failed`) in Supabase Postgres.
  5. The client tracks progress via **Supabase Realtime** WebSocket subscription (protected by PostgreSQL Row Level Security) with a 2-second HTTP polling fallback (`GET /ai/generate-preview/jobs/:id`) and receives the final question payload upon completion.
- **Worker Execution Topology:**
  - **Production:** A dedicated Railway Worker service (`sentinel-ai-worker` running `pnpm --filter @sentinel/api worker:ai`) dedicated solely to queue processing. Routine deployments of the web API service do not restart or terminate in-flight AI worker jobs.
  - **Local Development / Staging:** An embedded worker mode inside `server.ts` enabled via `ENABLE_EMBEDDED_AI_WORKER=true` (or in-memory asynchronous dispatch if Redis is absent in local dev).
- **Queue Engine & Failure Contract (BullMQ vs. Postgres):**
  - **BullMQ (Redis)** acts as the distributed queue, concurrency limiter, and lock coordinator. It handles job leasing, stalled job detection, and retries.
  - **Supabase Postgres (`ai_generation_jobs`)** acts as the durable system of record, providing queryable job history, client-facing status, result payloads, and Supabase Realtime change data capture (CDC).
  - **Production Requirement:** In production (`NODE_ENV=production`), Redis is a strict requirement. If Redis is unreachable, job submission fails fast with `HTTP 503 Service Unavailable` rather than silently degrading into volatile in-memory state. In-memory fallback is strictly restricted to `NODE_ENV=development`.
- **Crash & Stuck-Job Recovery:**
  - BullMQ automatically renews locks (`lockDuration: 60000ms`, `stalledInterval: 30000ms`). If a worker container crashes, BullMQ marks the job as stalled and re-queues it up to 1 retry.
  - A database reconciler runs periodically to inspect any jobs stuck in `processing` or `queued` with no active lock for >15 minutes, marking them `failed` with `"Worker process terminated unexpectedly"`.
- **Vertex AI Multimodal Payload Limits:**
  - Generation utilizes **Google Cloud Vertex AI** (`VertexAiProvider` via `@google/genai`) using inline base64 data.
  - Total raw PDF input is capped at **15MB** across all files (~20MB base64 encoded) to ensure requests never breach Vertex AI's 20–30MB HTTP inline request limit. Requests exceeding 15MB are rejected at the API boundary with `HTTP 413 Payload Too Large`.
  - Future enterprise scaling for inputs >15MB is documented to use Cloud Storage (`gs://`) bucket staging.
- **Ephemeral Disk Cleanup:**
  - Normal path: The worker unlinks `/tmp/ai-jobs/<jobId>/` inside a `finally` block upon job completion or failure.
  - Crash recovery path: The worker process executes an automated startup sweep and hourly cron sweep unlinking any directory in `/tmp/ai-jobs/` older than 1 hour.
- **Pros:**
  - **Zero Edge Timeout Vulnerability:** Completely eliminates HTTP socket timeout limits across Vercel, Railway, Cloudflare, and institutional proxies.
  - **Granular Progress Visibility:** Instructors see stage-by-stage updates (e.g., "Batch 3/8 generated", "Validating passages") rather than an unresponsive spinner.
  - **Fault Resilience & Reconnection:** If an instructor closes their tab or navigates away, the job completes on the server; results remain cached for 24 hours.
  - **Tenant Isolation:** Postgres Row Level Security (`auth.uid() = user_id`) ensures instructors can only subscribe to and inspect their own jobs.
- **Cons:**
  - Requires adding the `ai_generation_jobs` table and updating the frontend `useGenerateQuestionsMutation` hook to handle the job lifecycle.

### Option 2: HTTP Server-Sent Events (SSE) Streaming from Railway

- **Mechanism:**
  - The client initiates an SSE connection (`POST /ai/generate-preview/stream`).
  - Railway keeps the HTTP connection alive by continuously streaming heartbeat comments (`: ping\n\n`) and JSON batch completion events.
  - The client accumulates raw questions as chunks arrive and completes when the stream closes.
- **Pros:**
  - Avoids creating an asynchronous database table or background queue; results stream in real time.
  - Prevents edge proxy timeouts as long as byte data or keep-alive pings are written every few seconds.
- **Cons:**
  - **Client Connection Vulnerability:** If the user's laptop sleeps, network drops, or tab disconnects during a 2-minute stream, the connection terminates and the generation is lost or orphaned.
  - **State Ephemerality:** No persistent record or resume capability for generated previews if the client drops.

### Option 3: Synchronous Edge Timeout Extension & Higher Gemini Concurrency

- **Mechanism:**
  - Attempt to configure Railway proxy timeouts to 300 seconds and increase batch concurrency from 2 to 4 or 5 so 40–80 questions finish in ~35–45 seconds.
  - Retain the synchronous `POST /ai/generate-preview` request format.
- **Pros:**
  - Zero changes to frontend API client contracts or database schemas.
- **Cons:**
  - **Fragile & Bounded:** Does not scale if an instructor uploads 100+ pages or requests 80 questions.
  - **Gemini API Rate Limits:** Increasing concurrency to 5+ batches simultaneously risks hitting Google Cloud Vertex AI TPM/RPM quotas (429).
  - Intermediary proxies (Cloudflare, institutional Wi-Fi gateways) will still terminate connections at 100s regardless of Railway settings.

---

## Decision

**We will adopt Option 1: Asynchronous Job Pipeline with Railway Persistent Worker + Supabase Pro.**

Long-running generative AI operations are inherently asynchronous. Decoupling the generation pipeline into an asynchronous job model provides 100% resilience against edge timeouts, network blips, and proxy drops, while unlocking rich real-time UI feedback for instructors.

---

## Consequences

### Positive

- Heavy multi-PDF inputs and 40–80 question generations will succeed 100% reliably regardless of duration.
- The deceptive "CORS error on timeout" disappears completely because the initial HTTP request finishes in <500ms.
- Instructors receive clear progress bars and stage feedback.
- Background jobs persist even if the instructor navigates away or loses connection.
- Decoupled worker process isolates heavy LLM batches from web API restarts.

### Negative / Required Mitigations

- Database migration required for `ai_generation_jobs` with RLS policies enabled and automated TTL cleanup after 24 hours.
- Redis + BullMQ required in production to ensure resilient, durable job queuing and worker lifecycle management.
- Ephemeral disk staging on Railway requires startup and periodic sweeping to guarantee zero orphaned temporary files upon crash.
- Total raw PDF payload capped at 15MB to prevent breaching Vertex AI inline base64 limits.

---

## Validation and Review

- **Validation Gate:**
  1. Test asynchronous job creation with an 80-question, 3-PDF request on production.
  2. Verify that `POST /ai/generate-preview/jobs` returns HTTP 202 in < 500ms with a valid `jobId`.
  3. Verify that non-owning users cannot read `GET /ai/generate-preview/jobs/:id` (returns 404).
  4. Verify that the Railway worker completes all batches and updates job status to `completed`.
  5. Verify that the frontend UI displays live progress via Supabase Realtime and renders the resulting questions without timeout or CORS errors.
  6. Verify that terminating the worker mid-job triggers stalled job recovery and updates the database row to `failed` without orphaned disk files.
- **Review Trigger:** Review when scaling beyond 50 concurrent generation jobs or if migrating PDF temporary storage to Google Cloud Storage (`gs://`) buckets.
