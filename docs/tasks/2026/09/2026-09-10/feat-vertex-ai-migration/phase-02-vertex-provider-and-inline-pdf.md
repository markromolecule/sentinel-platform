---
title: "Phase 2: Dual-Mode GeminiProvider & Base64 Inline PDF Ingestion"
type: phase
parent: "docs/tasks/2026/09/2026-09-10/feat-vertex-ai-migration/README.md"
phase: "02"
status: completed
created: "2026-09-10"
tags: [task, phase, vertex-ai, gemini, provider, base64]
---

# Phase 2: Dual-Mode GeminiProvider & Base64 Inline PDF Ingestion

## Objective

Refactor `GeminiProvider` (`app/sentinel-api/src/lib/gemini/gemini.provider.ts`) to support dual-mode operation: when Vertex AI is configured, route generation calls through `@google/genai` using Vertex AI endpoints with base64 `inlineData` PDF delivery; when omitted, preserve existing Google AI Studio REST calls with `GEMINI_API_KEY`.

## Dependencies & Prerequisites

- Phase 1 complete (`@google/genai` installed, credential resolver in place).

## Impacted Files & Components

- `app/sentinel-api/src/lib/gemini/gemini.provider.ts` — Add Vertex AI client initialization, dual-mode generation branching, inline base64 PDF delivery, and response schema mapping.
- `app/sentinel-api/src/lib/gemini/services/question-generator/types.ts` — Update `LlmFile` interface to accommodate inline base64 representations alongside URI references.

## Implementation Tasks

- [x] Task 2.1 — Update `LlmFile` in `types.ts` to support inline base64 content:
  ```ts
  export type LlmFile = {
      name: string;
      uri: string;
      mimeType: string;
      sizeBytes?: string;
      displayName?: string;
      inlineData?: LlmInlineData;
  };
  ```
- [x] Task 2.2 — Enhance `GeminiProvider.uploadFile`:
  - When in Vertex AI mode: return an `LlmFile` with `inlineData: { mimeType, data: buffer.toString('base64') }` and `name: displayName`. No HTTP upload to Files API is attempted.
  - When in AI Studio mode: perform existing resumable upload to `https://generativelanguage.googleapis.com/upload/v1beta/files`.
- [x] Task 2.3 — Enhance `GeminiProvider.deleteFile`:
  - When in Vertex AI mode: immediately resolve as a no-op (no remote file exists on Google Cloud to delete).
  - When in AI Studio mode: perform existing DELETE call to Files API.
- [x] Task 2.4 — Implement Vertex AI generation in `GeminiProvider.generateStructuredJson`:
  - Map prompt, inline base64 files, and `responseJsonSchema` into `@google/genai` `client.models.generateContent({ model, contents, config: { responseMimeType: 'application/json', responseSchema, thinkingConfig } })`.
  - Maintain identical retry logic: 429 backoff, 502/503/504 fallback to `gemini-2.5-flash-lite`, and JSON parsing error trapping.
- [x] Task 2.5 — Maintain seamless fallback to existing Google AI Studio implementation when `GOOGLE_GENAI_USE_VERTEXAI` is false or unset.

## Verification & Testing

- `pnpm --filter sentinel-api test src/lib/gemini/gemini.provider.test.ts` (PASS: 24/24 passed, including 5 new Vertex AI test cases)
- `pnpm --filter sentinel-api test src/lib/gemini/gcp-credentials.test.ts` (PASS: 14/14 passed)
- Verified `uploadFile` returns `inlineData` without network calls in Vertex AI mode.
- Verified `deleteFile` is a no-op without network calls in Vertex AI mode.
- Verified quota retry (429) and model fallback (504 -> `gemini-2.5-flash-lite`) in Vertex AI mode.
- Verified full backward compatibility and zero regressions with Google AI Studio mode.

## Risks & Rollback

- **Risk:** Type incompatibilities between raw JSON schema objects and `@google/genai` schema expectations.
- **Mitigation:** Verified `@google/genai` accepts raw JSON schema objects directly in `config.responseSchema` without serialization or formatting conflicts.
