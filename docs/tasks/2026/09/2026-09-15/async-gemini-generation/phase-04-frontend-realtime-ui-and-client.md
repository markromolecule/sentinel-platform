---
title: "Phase 4: Frontend UI Realtime Progress & Client Mutation Hook"
type: phase
parent: "docs/tasks/2026/09/2026-09-15/async-gemini-generation/README.md"
phase: "4"
status: completed
created: "2026-09-15"
tags: [task, phase, frontend, react, supabase-realtime, polling]
---

# Phase 4: Frontend UI Realtime Progress & Client Mutation Hook

## Objective

Update the frontend question generator mutation to submit 100% of generation requests through the asynchronous pipeline, establish a reactive Supabase Realtime channel subscription with a 2-second HTTP polling fallback, and display an animated progress bar with dynamic stage descriptions in `ImportModal`.

## Dependencies & Prerequisites

- Phase 3 completed (API endpoints deployed and verified with CORS headers).
- Supabase Pro project active with Realtime enabled on `ai_generation_jobs`.

## Impacted Files & Components

- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/query/use-generate-questions-mutation.ts`
- `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/query/use-generate-questions-mutation.ts`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-ai-import-store.ts`
- `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/use-ai-import-store.ts`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-processing-progress.ts`
- `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/use-processing-progress.ts`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_components/configure-step/processing-status.tsx`
- `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal/_components/configure-step/processing-status.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal.tsx`
- `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-import-handler.ts`
- `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/use-import-handler.ts`
- `packages/services/src/api-client.ts` — Typed `submitAiGenerationJob()` and `getAiGenerationJobStatus()` methods.

## Implementation Tasks

- [x] Task 4.1 — Update `packages/services/src/api-client.ts`:
  - Added typed methods & exports:
    - `submitAiGenerationJob(formData: FormData): Promise<{ jobId: string, status: string }>`
    - `getAiGenerationJobStatus(jobId: string): Promise<AiGenerationJobStatusResponse>`
- [x] Task 4.2 — Re-architect `use-generate-questions-mutation.ts`:
  - Route **100% of generations** through `POST /ai/generate-preview/jobs` asynchronously.
  - Upon receiving `jobId`, initialize Supabase Realtime channel subscription:

    ```ts
    const channel = supabase
      .channel(`ai-generation-job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_generation_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          handleJobUpdate(payload.new);
        }
      )
      .subscribe();
    ```

  - Parallel 2-second HTTP polling interval against `GET /ai/generate-preview/jobs/${jobId}` as resilient fallback.
  - On `status === 'completed'`: cleans up subscription and interval, resolves promise with questions.
  - On `status === 'failed'`: cleans up subscription and interval, rejects promise with error message.
- [x] Task 4.3 — Upgrade `ImportModal` Generation State:
  - Progress bar showing percentage (`0%` to `100%`).
  - Dynamic stage text updated live by backend orchestrator events.
  - Non-blocking notice: *"Running in the background. You may keep working or close this dialog without interrupting your generation."*
  - Session storage tracking: `activeJobId`, `jobProgress`, and `currentStep` persisted to `sessionStorage` in `useAiImportStore`.
  - Allowed closing the dialog while generation runs in background with toast navigation button.
- [x] Task 4.4 — Synchronize Parity across `sentinel-web` and `sentinel-core`:
  - Mirrored identical hooks, store updates, and UI components across both web applications.

## Verification & Testing

- `@sentinel/services` test suite:

  ```bash
  pnpm --filter @sentinel/services test
  ```

  **Result:** Passed (19/19 test files, 57/57 tests passing).

- `sentinel-web` mutation and progress tests:

  ```bash
  pnpm --filter sentinel-web test app/\(protected\)/\(instructor\)/question/bank/_components/dialogs/import-modal/_hooks/query/use-generate-questions-mutation.test.ts
  pnpm --filter sentinel-web test app/\(protected\)/\(instructor\)/question/bank/_components/dialogs/import-modal/_components/configure-step.test.tsx
  ```

  **Result:** Passed (6/6 tests passing across both test files).

- `sentinel-core` mutation and progress tests:

  ```bash
  pnpm --filter sentinel-core test app/\(protected\)/question/bank/_components/dialogs/import-modal/_hooks/query/use-generate-questions-mutation.test.ts
  pnpm --filter sentinel-core test app/\(protected\)/question/bank/_components/dialogs/import-modal/_components/configure-step.test.tsx
  ```

  **Result:** Passed (6/6 tests passing across both test files).

## Risks & Rollback

- Client WebSocket disconnection: Mitigated by the concurrent 2-second HTTP polling loop.
- Rollback: Revert `use-generate-questions-mutation.ts` and `api-client.ts`.
