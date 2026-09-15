---
title: "Phase 3: Backend API Endpoints, Authorization & Gated Legacy Route"
type: phase
parent: "docs/tasks/2026/09/2026-09-15/async-gemini-generation/README.md"
phase: "3"
status: completed
created: "2026-09-15"
tags: [task, phase, api, hono, endpoints, authorization, security]
---

# Phase 3: Backend API Endpoints, Authorization & Gated Legacy Route

## Objective

Create the `POST /ai/generate-preview/jobs` endpoint that enforces the 15MB Vertex AI payload limit and responds with HTTP 202 Accepted in <500ms, implement `GET /ai/generate-preview/jobs/:id` with strict user ownership authorization, and gate the legacy synchronous `POST /ai/generate-preview` endpoint to prevent proxy timeouts.

## Dependencies & Prerequisites

- Phases 1 & 2 completed (database schema, repository, queue, and worker ready).

## Impacted Files & Components

- `app/sentinel-api/src/modules/integrations/gemini/gemini.controller.ts` — Job submission, status retrieval, and legacy gating.
- `app/sentinel-api/src/modules/integrations/gemini/gemini.route.ts` — Mount new OpenAPI routes.
- `app/sentinel-api/src/modules/integrations/gemini/gemini.dto.ts` — Add Zod schemas with strict bounds and response formats.
- `app/sentinel-api/src/tests/gemini/gemini-route.test.ts` — Integration and authorization tests.

## Implementation Tasks

- [x] Task 3.1 — Define DTO schemas in `gemini.dto.ts`:
  - `generatePreviewJobResponseSchema`:

    ```ts
    z.object({
      success: z.literal(true),
      data: z.object({
        jobId: z.string().uuid(),
        status: z.enum(['queued', 'processing', 'completed', 'failed']),
        createdAt: z.string(),
      }),
    })
    ```

  - `getPreviewJobStatusResponseSchema`:

    ```ts
    z.object({
      success: z.literal(true),
      data: z.object({
        jobId: z.string().uuid(),
        status: z.enum(['queued', 'processing', 'completed', 'failed']),
        progress: z.number().int().min(0).max(100),
        currentStep: z.string().nullable(),
        result: generateQuestionPreviewResponseSchema.optional(),
        error: z.string().nullable().optional(),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
    })
    ```

- [x] Task 3.2 — Implement `POST /ai/generate-preview/jobs`:
  - Verify active permissions: `['ai:generate_questions', 'assessments:manage']`.
  - Parse multipart payload containing files and `GenerateQuestionPreviewConfig`.
  - **Payload Guardrail:** Assert total combined file size <= 15MB (`MAX_TOTAL_PDF_SIZE_BYTES = 15 * 1024 * 1024`). If exceeded, throw:
    `HTTPException(413, { message: 'Total PDF payload exceeds 15MB limit for inline Vertex AI generation. Please split your documents or reduce file size.' })`.
  - Generate new `jobId = crypto.randomUUID()`.
  - Stage files to `/tmp/ai-jobs/<jobId>/` via `AiJobFileStagingService`.
  - Insert job into PostgreSQL via `AiGenerationJobRepository.createJob()` with `user_id = authenticatedUser.id` and `institution_id = contextInstitutionId`.
  - Enqueue task via `AiGenerationQueueService.enqueueJob()`.
  - Return `HTTP 202 Accepted` immediately with `{ success: true, data: { jobId, status: 'queued', createdAt } }` in <500ms.
- [x] Task 3.3 — Implement `GET /ai/generate-preview/jobs/:id` with Ownership Authorization:
  - Extract authenticated caller context (`userId`, `role`, `institutionId`).
  - Retrieve job by `id`.
  - If job does not exist: throw `HTTPException(404, { message: 'Generation job not found' })`.
  - **Ownership Check:**
    - If `job.user_id !== userId` AND NOT (`role === 'admin' && job.institution_id === institutionId`), throw `HTTPException(404, { message: 'Generation job not found' })`.
    - *Note:* Returning 404 instead of 403 avoids leaking the existence of other instructors' job IDs.
  - Return formatted job status, progress percentage, current step, and result payload if completed.
- [x] Task 3.4 — Gate Legacy Synchronous `POST /ai/generate-preview`:
  - Retain endpoint strictly for legacy automated tests and CLI scripts.
  - Add heuristic validation:
    - If requested `questionCount > 10` or uploaded files > 1:
      throw `HTTPException(400, { message: 'Generations with more than 10 questions or multiple files must use the asynchronous endpoint POST /ai/generate-preview/jobs.' })`.
    - If within limits, execute direct generation.

## Verification & Testing

- `pnpm --filter sentinel-api test src/tests/gemini/gemini-route.test.ts`: PASS (23/23 tests passed in 65ms).
  - Verified `POST /ai/generate-preview/jobs` accepts valid multipart payload and returns HTTP 202 in < 500ms.
  - Verified `POST /ai/generate-preview/jobs` returns HTTP 413 when total file size exceeds 15MB.
  - Verified `GET /ai/generate-preview/jobs/:id` returns HTTP 404 on non-existent jobs and IDOR attempts by non-owning instructors.
  - Verified `GET /ai/generate-preview/jobs/:id` returns HTTP 200 for job owner and institution admin.
  - Verified legacy `POST /ai/generate-preview` returns HTTP 400 when requesting >10 questions or >1 PDF file.
  - Verified `POST /ai/generate-preview/jobs` cleans up local disk and marks job failed if queue dispatch fails.
- Full suite verification: `pnpm --filter sentinel-api test src/modules/integrations/gemini/ src/tests/gemini/`: PASS (54/54 tests passed in 172ms).

## Risks & Rollback

- Non-breaking addition: Existing endpoints remain functional under guarded thresholds.
- Rollback: Revert routes in `gemini.route.ts`.
