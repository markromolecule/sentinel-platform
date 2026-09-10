---
title: "Phase 4: Automated Test Coverage, Typecheck, and Documentation"
type: phase
parent: "docs/tasks/2026/09/2026-09-10/feat-vertex-ai-migration/README.md"
phase: "04"
status: completed
created: "2026-09-10"
tags: [task, phase, tests, verification, documentation, setup]
---

# Phase 4: Automated Test Coverage, Typecheck, and Documentation

## Objective

Deliver comprehensive automated unit tests covering both Vertex AI mode and AI Studio fallback mode, execute full workspace typechecks, verify Git exclusions for secrets, and document exact environment setup steps for both local developers and production deployments.

## Dependencies & Prerequisites

- Phases 1, 2, and 3 complete.

## Impacted Files & Components

- `app/sentinel-api/src/lib/gemini/gemini.provider.test.ts` — Comprehensive unit test suite for Vertex AI & AI Studio dual modes.
- `app/sentinel-api/src/lib/gemini/gcp-credentials.test.ts` (NEW) — Unit tests for credential resolver.
- `app/sentinel-api/.env.example` (or `SETUP.md`) — Document new Vertex AI environment variables.

## Implementation Tasks

- [x] Task 4.1 — Implement `gcp-credentials.test.ts`:
  - Test file path resolution (`GOOGLE_APPLICATION_CREDENTIALS`).
  - Test inline JSON resolution (`GCP_SERVICE_ACCOUNT_KEY`).
  - Test base64 JSON resolution (`GCP_SA_KEY_BASE64`).
  - Test error throwing when credentials are required but missing.
- [x] Task 4.2 — Implement unit tests in `gemini.provider.test.ts`:
  - Mock `@google/genai` client and verify Vertex AI generation flow.
  - Test base64 conversion during `uploadFile` in Vertex mode.
  - Test that `deleteFile` is a no-op in Vertex mode.
  - Test fallback to AI Studio REST client when Vertex AI is disabled.
  - Test retry and fallback model switching under simulated 429 and 504 errors.
- [x] Task 4.3 — Run test suites:
  - `pnpm --filter sentinel-api test src/lib/gemini/gemini.provider.test.ts`
  - `pnpm --filter sentinel-api test src/lib/gemini/gcp-credentials.test.ts`
  - `pnpm --filter sentinel-api test src/tests/gemini/question-generator.test.ts`
- [x] Task 4.4 — Execute workspace typecheck: `pnpm --filter sentinel-api typecheck`.
- [x] Task 4.5 — Update `SETUP.md` with:
  - Step-by-step instructions for placing `gcp-key.json` locally.
  - Step-by-step instructions for setting `GCP_SERVICE_ACCOUNT_KEY` on Railway / cloud environments.
  - Guidance on verifying Google Cloud billing credit consumption in Google Cloud Console.

## Verification & Testing

- All Vitest unit tests pass with zero regressions.
- TypeScript compiler exits with code 0 (`tsc --noEmit`).
- Git status confirms that `gcp-key.json` and credential patterns are ignored.

## Risks & Rollback

- **Risk:** Existing tests failing due to unmocked `@google/genai` module.
- **Mitigation:** Use `vi.mock('@google/genai')` with clear factory mocks in test files to isolate tests from real network or credential requirements.
