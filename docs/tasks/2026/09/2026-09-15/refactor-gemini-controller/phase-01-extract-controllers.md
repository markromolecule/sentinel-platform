---
title: "Phase 1: Extract Modular Gemini Sub-Controllers"
type: phase
parent: "Refactor Gemini Controller into Dedicated Sub-Controllers"
phase: "01"
status: completed
created: "2026-09-15"
tags: [task, phase, refactor, gemini]
---

# Phase 1: Extract Modular Gemini Sub-Controllers

## Objective

Extract three cohesive controller files from monolithic `gemini.controller.ts` into `src/modules/integrations/gemini/controller/` and wire up a unified barrel export.

## Dependencies & Prerequisites

- None.

## Impacted Files & Components

- `src/modules/integrations/gemini/controller/generate-preview.controller.ts` (New): Handles synchronous preview generation.
- `src/modules/integrations/gemini/controller/create-preview-job.controller.ts` (New): Handles asynchronous job creation and staging.
- `src/modules/integrations/gemini/controller/get-preview-job-status.controller.ts` (New): Handles job polling and tenant check.
- `src/modules/integrations/gemini/controller/index.ts` (New): Barrel export for all controller symbols.
- `src/modules/integrations/gemini/gemini.controller.ts` (Modified): Re-exports `./controller` for backward compatibility.

## Implementation Tasks

- [x] Create `generate-preview.controller.ts` with `MAX_LEGACY_PDF_SIZE_BYTES`, `createGenerateQuestionPreviewRoute`, `generatePreviewRoute`, `legacyGenerateReviewRoute`, and `generatePreviewRouteHandler`.
- [x] Create `create-preview-job.controller.ts` with `MAX_TOTAL_PDF_SIZE_BYTES`, `createGeneratePreviewJobRoute`, and `createGeneratePreviewJobRouteHandler`.
- [x] Create `get-preview-job-status.controller.ts` with `getPreviewJobStatusRoute` and `getPreviewJobStatusRouteHandler`.
- [x] Create `index.ts` barrel export re-exporting all sub-controllers.
- [x] Replace `gemini.controller.ts` with `export * from './controller';`.

## Verification & Testing

- Vitest check on test suites:
  ```bash
  pnpm --filter sentinel-api test src/tests/gemini/ src/modules/integrations/gemini/
  ```
  **Result:** Passed (7/7 test files, 54/54 tests passing).

- Vitest check on CORS integration:
  ```bash
  pnpm --filter sentinel-api test src/tests/cors.test.ts
  ```
  **Result:** Passed (1/1 test file, 11/11 tests passing).

## Risks & Rollback

- Risk: Missing exports or path issues.
- Rollback: Revert git changes on `gemini.controller.ts` and remove `controller/` files.
