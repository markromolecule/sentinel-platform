---
title: "Phase 3: Orchestrator Step Alignment & Lifecycle Cleanup"
type: phase
parent: "docs/tasks/2026/09/2026-09-10/feat-vertex-ai-migration/README.md"
phase: "03"
status: completed
created: "2026-09-10"
tags: [task, phase, orchestrator, pipeline, question-generator]
---

# Phase 3: Orchestrator Step Alignment & Lifecycle Cleanup

## Objective

Ensure all question generator pipeline steps (`uploadFilesStep`, `resolvePageCountsStep`, `generateBatchesStep`, `repairInvalidQuestions`, `replenishQuestionDeficits`) seamlessly support both URI-based files (AI Studio) and inline base64 files (Vertex AI) without errors or contract leaks.

## Dependencies & Prerequisites

- Phase 2 complete (`GeminiProvider` supports dual-mode and `LlmFile` handles inline base64).

## Impacted Files & Components

- `app/sentinel-api/src/lib/gemini/services/question-generator/steps/upload-files.ts` — Align error handling and cleanup for inline files.
- `app/sentinel-api/src/lib/gemini/services/question-generator/steps/generate-batches.ts` — Pass `files` with either `uri` or `inlineData` to provider.
- `app/sentinel-api/src/lib/gemini/services/question-generator/steps/resolve-page-counts.ts` — Support inline base64 file payloads for page counting queries.
- `app/sentinel-api/src/lib/gemini/services/question-generator/orchestrator.ts` — Ensure pipeline logs clearly reflect whether Vertex AI or AI Studio is active.

## Implementation Tasks

- [x] Task 3.1 — Verify `uploadFilesStep` handles inline base64 `LlmFile` without unnecessary delay or failures.
- [x] Task 3.2 — Update `generateBatchesStep` to forward `files` to `provider.generateStructuredJson` supporting both `{ uri }` and `{ inlineData }`.
- [x] Task 3.3 — Update `resolvePageCountsStep` to forward `{ inlineData }` when page counting requires inspecting the document.
- [x] Task 3.4 — Verify `deleteUploadedFilesStep` safely skips deletion attempts when files are inline (no remote file exists).
- [x] Task 3.5 — Add telemetry / diagnostic log in `orchestrator.ts` indicating: `Using AI backend: Vertex AI (project: ..., location: ...)` vs `Using AI backend: Google AI Studio`.

## Verification & Testing

- Run the full question generator pipeline unit test suite: `pnpm --filter sentinel-api test src/tests/gemini/question-generator.test.ts`.
- Verify that mock providers supplying `inlineData` generate expected batches identically to URI-based providers.

## Risks & Rollback

- **Risk:** Missing `uri` property breaking downstream components that expect `file.uri` to be a non-empty string.
- **Mitigation:** Provide a synthetic data URI or fallback property `uri: file.uri ?? 'inline://' + file.name` so legacy readers do not encounter `undefined` exceptions.
