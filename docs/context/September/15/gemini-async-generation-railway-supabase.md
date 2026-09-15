---
title: "Decouple Heavy AI Question Generation to Asynchronous Railway & Supabase Pro Pipeline"
type: context
status: ready
created: "2026-09-15"
tags: [context, ai, gemini, vertex-ai, railway, supabase-pro, async, bullmq, cors, timeout]
feature: "gemini-async-generation-railway-supabase"
---

# Decouple Heavy AI Question Generation to Asynchronous Railway & Supabase Pro Pipeline Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  Generating large-scale question previews (40–80 questions across multiple PDF files totaling 50–120+ pages) works smoothly in local development (where Node.js holds open HTTP connections indefinitely), but consistently fails in production with:

  ```text
  Access to fetch at 'https://api.sentinelph.tech/ai/generate-preview' from origin 'https://app.sentinelph.tech' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
  AI Generation Error: ApiError: Unable to connect to the AI generation service. Please check your network connection or try generating with a smaller question batch.
  ```

  While the frontend (`app.sentinelph.tech`) is deployed on Vercel, the backend (`api.sentinelph.tech`) is DNS-routed to a containerized Node.js service on Railway (`railway-hikari`). The generation engine is configured for **Google Cloud Vertex AI** (`VertexAiProvider` via `@google/genai` on GCP project `gen-lang-client-0472453739`). The root cause of the failure is that **synchronous HTTP POST requests exceeding ~100 seconds are terminated by the edge proxy (Railway Hikari gateway timeout 504)** before the multi-batch Vertex AI generation and passage critic loops can complete. Because the 504 Gateway Timeout is generated at the proxy layer rather than the Hono application server, CORS headers are stripped, causing the browser to surface a misleading CORS block and network error.

- **Business / User Value:**
  Instructors can generate full comprehensive exam question banks (40–80+ questions) from extensive multi-chapter PDF materials without timeouts, browser drops, or arbitrary question-count caps, leveraging enterprise Google Cloud Vertex AI credits and higher quotas. Instructors also receive real-time granular progress feedback (e.g., "Staging documents", "Generating batch 3/8", "Evaluating passage quality") instead of staring at an unresponsive loading spinner.

- **Success Criteria:**
  1. Complete decoupling of Vertex AI generation execution duration from synchronous HTTP request/response lifecycles.
  2. Zero edge-level 504/502 gateway drops or proxy-induced CORS failures during high-volume generation.
  3. Ability to generate 40–80 questions across 100+ pages reliably on production infrastructure using Vertex AI.
  4. Real-time progress updates delivered to the frontend UI via Supabase Pro Realtime (with 2s polling fallback).
  5. Strict tenant isolation and Row Level Security preventing unauthorized access to generation jobs.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As an Instructor on `app.sentinelph.tech`, I want to upload multiple lecture PDFs (up to 15MB total) and request 50–80 questions of varying types, so that my entire prelim or final exam bank is synthesized in one unified workflow via Vertex AI.*
- *As an Instructor, I want to see a live progress bar showing batch-by-batch progress and passage validation steps, so that I have visibility and confidence during longer generations (1–3 minutes).*
- *As an Instructor, if my laptop goes to sleep or I close the modal, I want my generation to complete in the background and remain available for 24 hours.*
- *As a Platform Engineer, I want long-running Vertex AI batch generation to execute in a resilient, isolated background worker on Railway with Supabase Pro state persistence, drawing down Google Cloud credits without proxy timeouts.*

### Functional Requirements

- [ ] **FR-01 (Async Job Enqueue Endpoint):** Introduce an asynchronous generation route (`POST /ai/generate-preview/jobs`) that validates input, stages files to `/tmp/ai-jobs/<jobId>/`, enqueues a task in BullMQ, creates an `ai_generation_jobs` record in Supabase Postgres, and returns `HTTP 202 Accepted` with `{ jobId, status: 'queued' }` in < 500ms.
- [ ] **FR-02 (Railway Background Processor):** Execute the existing `QuestionGeneratorService` pipeline (batch generation, passage quality checks, deficit replenishment via `VertexAiProvider`) inside an isolated Railway worker process backed by BullMQ with decoupled execution timeouts.
- [ ] **FR-03 (Job State & Progress Tracking):** Store generation job status (`queued`, `processing`, `completed`, `failed`), progress percentage, step descriptions, and error/preview payloads in Supabase Postgres (`ai_generation_jobs`).
- [ ] **FR-04 (Frontend Realtime / Polling Subscription):** Update the frontend `useGenerateQuestionsMutation` and `ImportModal` to always submit jobs asynchronously, subscribing to status updates via Supabase Realtime with a 2-second HTTP polling fallback (`GET /ai/generate-preview/jobs/:id`).
- [ ] **FR-05 (Backward Compatibility & Fallback):** Retain synchronous `POST /ai/generate-preview` strictly for backwards compatibility with existing unit/integration tests and CLI scripts, gated by a strict heuristic ceiling (<10 questions and 1 PDF < 10 pages). Requests exceeding this ceiling receive HTTP 400 instructing them to use `POST /ai/generate-preview/jobs`.

---

## 3. Technical & Architectural Context

### Affected Domains & Components

- **Frontend (`app/sentinel-web`, `app/sentinel-core`):**
  - `use-generate-questions-mutation.ts`: Switches from synchronous blocking fetch to job submission + Supabase Realtime subscription + polling fallback.
  - `ImportModal`: Replaces indeterminate spinner with progress bar (0–100%), stage indicator text, and non-blocking background notification.
- **Backend API (`app/sentinel-api`):**
  - `src/modules/integrations/gemini/gemini.controller.ts`: Add `POST /ai/generate-preview/jobs` and `GET /ai/generate-preview/jobs/:id`.
  - `src/modules/integrations/gemini/queue/ai-generation-queue.service.ts`: BullMQ queue manager with strict production Redis validation.
  - `src/modules/integrations/gemini/queue/ai-generation.worker.ts`: BullMQ worker processing generation tasks.
  - `src/workers/ai-generation-worker.ts`: Standalone entrypoint for the dedicated Railway Worker service.
  - `src/lib/gemini/services/question-generator/orchestrator/orchestrator.service.ts`: Instrument batch and repair loops with `onProgress` hooks.
  - `src/server.ts`: Optional embedded worker registration via `ENABLE_EMBEDDED_AI_WORKER=true`.
- **Database & Queue (`@sentinel/db`, Supabase Pro, Redis):**
  - Schema migration in `packages/db/prisma/schema.prisma` adding `ai_generation_jobs` table.
  - Supabase Realtime publication on `ai_generation_jobs` with `REPLICA IDENTITY DEFAULT`.
  - Redis connection via existing `lib/redis/redis.service.ts`.

### Multimodal Upload & Vertex AI Payload Constraints

- Uploaded PDF files are written directly to Railway ephemeral disk (`/tmp/ai-jobs/<jobId>/`).
- Generation passes buffers to `VertexAiProvider.uploadFile()`, which base64-encodes data into `inlineData: { mimeType: 'application/pdf', data: base64Data }`.
- **Payload Boundary:** Total combined raw PDF size is capped at **15MB** (~20MB post-base64 expansion) to remain safely within Google Cloud Vertex AI's 20–30MB inline HTTP request limit. Requests exceeding 15MB are rejected at the API layer with HTTP 413.
- Notice: The consumer Google AI Studio "Gemini Files API" is not used in Vertex AI mode. Vertex AI utilizes inline base64 data buffers.

---

## 4. Security, Authorization & Realtime Scoping

- **Endpoint Authorization (`GET /ai/generate-preview/jobs/:id`):**
  - The endpoint extracts the authenticated user from the session/JWT context (`c.get('user')`).
  - Access is granted if and only if:
    1. `job.user_id === authenticatedUser.id`, OR
    2. The caller possesses role `'admin'` within the same `job.institution_id`.
  - If a non-owner attempts to fetch the job, the API returns `HTTP 404 Not Found` (preventing enumeration of job IDs).
- **Supabase Realtime Row Level Security (RLS):**
  - RLS is explicitly enabled on `ai_generation_jobs`.
  - Policies defined in migration:
    ```sql
    ALTER TABLE "public"."ai_generation_jobs" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "ai_generation_jobs_owner_select"
    ON "public"."ai_generation_jobs"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

    CREATE POLICY "ai_generation_jobs_service_role"
    ON "public"."ai_generation_jobs"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
    ```
  - Because Supabase Realtime respects PostgreSQL RLS on table publications, instructors subscribing to `ai_generation_jobs` receive change events exclusively for jobs they own. Cross-tenant data leakage is completely prevented.

---

## 5. Decision Ledger & Grill Record

| Decision ID | Question / Fork | Chosen Option | Rationale & Trade-off |
| :--- | :--- | :--- | :--- |
| **DEC-01** | Long-running generation architecture | **Asynchronous Job Pipeline** | Decouples LLM generation from synchronous HTTP sockets. Eliminates 100s edge proxy timeouts and unformatted 504/502 drops. |
| **DEC-02** | Frontend communication channel | **Supabase Pro Realtime + Polling Fallback** | Leverages Supabase Pro's dedicated Realtime channels for zero-latency, reactive UI updates, backed by a 2-second HTTP polling fallback. |
| **DEC-03** | PDF File Staging & Delivery | **Railway Ephemeral Disk Staging + Vertex AI Inline Base64** | Direct upload to Railway ephemeral storage (`/tmp/ai-jobs/<jobId>/`), read as buffers and encoded as inline base64 payloads to Google Cloud Vertex AI, purged upon job completion. Total raw PDF payload capped at 15MB. Zero Supabase storage quota or egress costs. |
| **DEC-04** | Queue Engine & Failure Contract | **BullMQ on Redis (Production Requirement) + Local In-Memory Fallback** | In production (`NODE_ENV=production`), Redis + BullMQ is mandatory; if absent, system fails fast with 503. In-memory async fallback is strictly scoped to local development (`NODE_ENV=development`). Ensures zero job loss from container recycling. |
| **DEC-05** | API Endpoint Compatibility & Client Routing | **100% Async for Frontend + Gated Sync Legacy Endpoint** | Frontend UI routes 100% of generations through `POST /ai/generate-preview/jobs`. Legacy `POST /ai/generate-preview` is preserved for existing tests/scripts, gated by a strict ceiling (<10 questions and 1 PDF < 10 pages). |
| **DEC-06** | Worker Deployment Topology | **Dedicated Railway Worker Service in Production** | Production runs a dedicated background worker container (`sentinel-ai-worker`) decoupled from API web traffic, ensuring routine API pushes do not abort in-flight LLM generations. Embedded worker mode is retained for local/staging. |

---

## 6. Scope & Boundaries

- **In Scope:**
  - Architecting the asynchronous job creation, processing, and retrieval flow.
  - Deploying a dedicated Railway Worker service and configuring BullMQ queue.
  - Utilizing Supabase Pro (Postgres + Realtime with RLS) for job persistence and instant frontend updates.
  - Designing UI progress states (0–100%, stage status) for multi-batch generation in `ImportModal`.
  - Crash recovery, stuck-job sweepers, and temporary disk cleanup mechanisms.
- **Out of Scope / Non-Goals:**
  - Rewriting the Gemini prompt structure, Bloom's taxonomy mapping, or question type schemas.
  - Moving the Next.js frontend away from Vercel.
  - Supporting PDF inputs exceeding 15MB (future roadmap will leverage Google Cloud Storage `gs://` buckets).

---

## 7. Operational Resilience, Recovery & Lifecycle

- **Job Retention & TTL:**
  - All records in `ai_generation_jobs` have an `expires_at` timestamp initialized to `created_at + interval '24 hours'`.
  - A scheduled database cleanup task purges records older than 24 hours.
- **Worker Crash & Stuck-Job Recovery:**
  - BullMQ manages active job leases (`lockDuration: 60000ms`, `stalledInterval: 30000ms`). If a worker container crashes, BullMQ detects the stalled lock and triggers a retry.
  - A database reconciler task runs periodically to inspect any jobs in `processing` or `queued` state with no active worker for >15 minutes, automatically updating their status to `failed` with `"Worker terminated unexpectedly"`.
- **Ephemeral Disk Cleanup & Orphan Prevention:**
  - *Standard path:* The worker unlinks `/tmp/ai-jobs/<jobId>/` inside a `finally` block upon job completion or failure.
  - *Startup sweep:* When the worker process initializes, it scans `/tmp/ai-jobs/` and unlinks any directories older than 1 hour.
  - *Periodic sweep:* An hourly interval job removes any temporary folders older than 1 hour to prevent disk leaks if containers die ungracefully.
- **Upstream Rate Limiting (429) & Backoff:**
  - `VertexAiProvider` implements exponential backoff with jitter on HTTP 429 and 503 upstream responses.
  - Because execution occurs inside the background worker, backoff delays (e.g. 5–15 seconds) do not risk breaching HTTP socket limits.

---

## 8. References & External Context

- [[docs/decisions/2026-09-15-async-gemini-generation-railway-supabase|ADR-0002: Asynchronous AI Generation Pipeline]]
- [[docs/decisions/0001-prioritize-supabase-pro-over-railway-pro-for-live-exams|ADR-0001: Supabase Pro Prioritization]]
- [[docs/context/August/19/railway-backend-ai-generation|August 19 Railway Backend Migration Context]]
- [[docs/task/2026-08-18/fix-001-persistent-cors-issue-analysis/README|CORS & Proxy Analysis]]
