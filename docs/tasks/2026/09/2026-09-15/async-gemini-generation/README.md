---
title: "Decouple Heavy AI Question Generation to Asynchronous Railway & Supabase Pro Pipeline"
type: task
status: completed
created: "2026-09-15"
tags: [task, ai, gemini, vertex-ai, railway, supabase-pro, async, bullmq]
---

# Decouple Heavy AI Question Generation to Asynchronous Railway & Supabase Pro Pipeline

## Outcome

Instructors can reliably generate large question preview banks (40–80 questions) from multiple, multi-page lecture PDFs in production without encountering proxy timeouts (504) or dropped CORS headers. AI generation is completely decoupled from synchronous HTTP request limits by utilizing an asynchronous job execution model on Railway with Supabase Pro tracking and Realtime/polling delivery.

## Pre-planning record

### Context & Decisions

- **Context Specification:** [`docs/context/September/15/gemini-async-generation-railway-supabase.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/15/gemini-async-generation-railway-supabase.md)
- **ADR:** [`docs/decisions/2026-09-15-async-gemini-generation-railway-supabase.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-15-async-gemini-generation-railway-supabase.md)
- **Prior Infrastructure ADR:** [`docs/decisions/0001-prioritize-supabase-pro-over-railway-pro-for-live-exams.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/0001-prioritize-supabase-pro-over-railway-pro-for-live-exams.md)

### Actors and goals

- **Instructor:** Uploads 1–3 lecture PDFs (up to 15MB total, 100+ pages) and requests 40–80 questions; views real-time generation progress (batches, quality checks) and receives full question preview without timeouts. If the tab or modal is closed, the job continues and remains available for 24 hours.
- **Platform Engineer:** Eliminates edge proxy 504 drops and proxy-level CORS header stripping; ensures compute workload executes reliably on a dedicated Railway Worker container isolated from API web deploys, with automated crash and stalled job recovery.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- |
| SC-01 | Instructor generates 80 questions from 3 PDFs (15MB total) | Authenticated as instructor on `app.sentinelph.tech` | `POST /ai/generate-preview/jobs` returns HTTP 202 in <500ms with `jobId`. UI shows progress bar. Worker finishes generation in background (~90–150s). UI receives complete preview. | Upstream Gemini rate limits trigger worker backoff; if persistent, job marked failed with structured error. | Draft |
| SC-02 | Instructor closes browser tab or modal during generation | Job is in `processing` state on Railway | Worker completes generation and stores preview payload in Supabase `ai_generation_jobs`. | Result remains cached for 24h; user notified on return. | Draft |
| SC-03 | Small generation (<10 questions, single small PDF <10 pages) via legacy endpoint | Authenticated caller targeting `POST /ai/generate-preview` | Completes synchronously in <15s for legacy test/script compatibility. | If request exceeds 10 questions or 10 pages, returns HTTP 400 instructing use of `/jobs`. | Draft |
| SC-04 | Worker container crashes or restarts mid-job | Job was in `processing` state with staged files | BullMQ stalled detector / DB reconciler detects stale lock, marks job `failed`, and cleans disk. | Reconciler updates row status to `failed` within 15 minutes; disk sweepers purge orphaned `/tmp/` files. | Draft |
| SC-05 | Instructor attempts to access another instructor's job | Authenticated user B requests `GET /ai/generate-preview/jobs/:id` of user A | Endpoint returns HTTP 404 Not Found; Supabase Realtime channel drops subscription via RLS. | No data exposure or job existence leakage across tenants. | Draft |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
| --- | --- | --- | --- | --- | --- |
| DEC-01 | How should long-running AI question generation bypass edge proxy timeouts? | Asynchronous Job Pipeline with Railway Persistent Worker + Supabase Pro | Multi-batch generation takes 90–180s. Railway Hikari edge proxy drops idle HTTP connections at ~100s, producing 504 without CORS headers. Asynchronous jobs decouple execution from HTTP lifecycles. | Keep synchronous with higher timeout (still vulnerable to 100s drops); SSE streaming (vulnerable to client disconnects). | [ADR-0002](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-15-async-gemini-generation-railway-supabase.md) |
| DEC-02 | How should progress and results be communicated to the frontend? | Supabase Pro Realtime Subscription (with 2s Polling Fallback) | Selected during grill discovery. Leverages Supabase Pro's dedicated realtime channels on `ai_generation_jobs` for zero-latency, reactive UI updates, backed by an HTTP polling fallback. RLS enforces tenant isolation. | Pure REST polling (higher request volume); SSE streaming (client disconnect vulnerability). | [ADR-0002](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-15-async-gemini-generation-railway-supabase.md) |
| DEC-03 | How should uploaded PDF files be staged while the Railway background worker processes the job? | Direct Multipart to Railway API with Ephemeral Local Staging & Vertex AI Inline Base64 | Frontend sends multipart upload directly to Railway. Railway writes files to ephemeral disk (`/tmp/ai-jobs/<jobId>/`), enqueues the job, passes files to `VertexAiProvider` as inline base64 data, and unlinks the local directory upon completion. Capped at 15MB total raw PDF to respect Vertex AI limits. | Ephemeral Supabase Storage bucket (adds storage ops, upload round-trips, and egress bandwidth). | [ADR-0002](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-15-async-gemini-generation-railway-supabase.md) |
| DEC-04 | How should background AI generation jobs be queued and dispatched? | BullMQ on Redis (Mandatory in Prod) with Local Dev In-Memory Fallback | In production (`NODE_ENV=production`), Redis + BullMQ is mandatory; if absent, system fails fast with HTTP 503. In-memory async fallback is strictly scoped to local development (`NODE_ENV=development`). Ensures zero job loss from container recycling. | Silent in-memory fallback in production (violates resilience guarantee on container restart). | [ADR-0002](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-15-async-gemini-generation-railway-supabase.md) |
| DEC-05 | How should backward compatibility and client routing be handled? | 100% Async for Frontend + Gated Sync Legacy Endpoint | Frontend UI (`ImportModal`) routes 100% of generations through `POST /ai/generate-preview/jobs`. Legacy `POST /ai/generate-preview` is preserved for existing tests/scripts, gated by a strict ceiling (<10 questions and 1 PDF < 10 pages). | Routing small jobs synchronously from frontend (unpredictable latency depending on page density). | [ADR-0002](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-15-async-gemini-generation-railway-supabase.md) |
| DEC-06 | Where does the worker execute in production? | Dedicated Railway Worker Service (`sentinel-ai-worker`) | Production runs a dedicated background worker container decoupled from API web traffic. Routine API redeployments do not restart or terminate in-flight AI worker jobs. Embedded worker mode is retained for local/staging. | Running solely inside API container (routine pushes kill in-flight jobs). | [ADR-0002](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-15-async-gemini-generation-railway-supabase.md) |

### Unknowns and blockers

- None. All architectural forks, file staging strategies, dispatch engines, security rules, and communication channels are resolved. Ready for phased execution.

## Scope

- Create `ai_generation_jobs` table / schema migration in `@sentinel/db` with Row Level Security (RLS) enabled.
- Implement `POST /ai/generate-preview/jobs` and authenticated `GET /ai/generate-preview/jobs/:id` in `sentinel-api`.
- Deploy dedicated Railway Worker service (`src/workers/ai-generation-worker.ts`) and register BullMQ queue.
- Implement worker startup sweep and hourly cleanup for `/tmp/ai-jobs/` ephemeral storage.
- Implement database stuck-job reconciler (marks jobs stuck >15 minutes as `failed`).
- Update frontend `useGenerateQuestionsMutation` and `ImportModal` to show live progress and retrieve finished preview questions.

## Non-goals

- Altering Gemini prompt structures or question schema definitions.
- Changing examination attempt submission or LiveKit proctoring flows.
- Moving the Next.js frontend away from Vercel.
- Ingesting PDF payloads larger than 15MB (deferred to future Google Cloud Storage bucket implementation).

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| AC-01 | SC-01 / DEC-01 / DEC-06 | Large input generation (80 questions, 100+ pages) completes without 504 gateway timeout or CORS drops | Asynchronous pipeline on dedicated Railway worker | E2E stress test with 3 PDFs and 80 questions | Planned |
| AC-02 | SC-01 / DEC-01 | `POST /ai/generate-preview/jobs` returns HTTP 202 in < 500ms with a valid `jobId` | Fast enqueue route + local staging | Vitest route test | Implemented |
| AC-03 | SC-01 / DEC-02 | Frontend receives live progress events via Supabase Realtime (with 2s HTTP polling fallback) | React mutation hook + Realtime channel | Integration test with simulated updates | Implemented |
| AC-04 | SC-02 / DEC-03 | PDF files staged on Railway ephemeral disk are unlinked upon completion, and orphan files are purged by sweeper | Worker `finally` block + startup/interval sweep | Unit test verifying disk cleanup | Implemented |
| AC-05 | DEC-04 | Queue requires Redis in production (fails fast with 503 if disconnected) and permits in-memory fallback only in development | `AiGenerationQueueService` strict mode validation | Unit test covering production vs dev modes | Implemented |
| AC-06 | DEC-05 | Synchronous `POST /ai/generate-preview` is gated to < 10 questions and 1 PDF < 10 pages | Legacy route gating check | Route test checking 400 rejection on large requests | Implemented |
| AC-07 | SC-04 | Stalled jobs caused by worker termination are moved to `failed` within 15 minutes | DB reconciler query + BullMQ stalled listener | Unit test verifying stuck job reconciliation | Implemented |
| AC-08 | SC-05 | Non-owning instructors cannot access job status via REST (404) or Supabase Realtime (RLS) | Controller ownership check + Postgres RLS policy | Integration test asserting authorization barrier | Implemented |

## Phases

- [x] [`phase-01-database-schema-and-job-tracking.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-15/async-gemini-generation/phase-01-database-schema-and-job-tracking.md) — Phase 1: Database Schema, RLS Security & Job Tracking
- [x] [`phase-02-railway-background-worker-and-queue.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-15/async-gemini-generation/phase-02-railway-background-worker-and-queue.md) — Phase 2: Dedicated Railway Background Worker, BullMQ & Recovery Sweepers
- [x] [`phase-03-api-endpoints-and-backward-compatibility.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-15/async-gemini-generation/phase-03-api-endpoints-and-backward-compatibility.md) — Phase 3: Backend API Endpoints, Authorization & Gated Legacy Route
- [x] [`phase-04-frontend-realtime-ui-and-client.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-15/async-gemini-generation/phase-04-frontend-realtime-ui-and-client.md) — Phase 4: Frontend UI Realtime Progress & Client Mutation Hook
- [x] [`phase-05-e2e-verification-and-release.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-15/async-gemini-generation/phase-05-e2e-verification-and-release.md) — Phase 5: End-to-End Verification, Security Penetration & Release Readiness
