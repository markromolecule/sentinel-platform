---
title: "Migrate Gemini Integration from Google AI Studio to Google Cloud Vertex AI"
type: task
status: planned
created: "2026-09-10"
tags: [task, ai, gemini, vertex-ai, gcp-credits, question-generator]
---

# Migrate Gemini Integration from Google AI Studio to Google Cloud Vertex AI

## Outcome

Transition Sentinel's AI question generation service from Google AI Studio to Google Cloud Vertex AI to draw down the user's active $40 Google Developer Program monthly credits on Billing Account `013354-4925B5-40E47F`. The system will support dual-source credentials (local file path + production environment variable string), direct base64 `inlineData` PDF ingestion (zero extra GCS bucket infrastructure), and graceful fallback to Google AI Studio when Vertex AI credentials are not configured.

## Pre-planning record

### Actors and goals

- **System Developer / Maintainer:** Wants AI question generation costs absorbed by active $40 Google Developer Program monthly credits on GCP instead of separate out-of-pocket charges.
- **Instructor / Administrator:** Generates question previews from PDF lesson materials with the same high-speed structured output, rubrics, and accuracy.
- **DevOps / CI Engineer:** Runs tests in environments with or without GCP keys without breaking automated pipelines or leaking credentials.

### Domain language

- **Vertex AI:** Google Cloud's enterprise machine learning platform (`https://aiplatform.googleapis.com`), directly linked to Google Cloud project billing.
- **Google AI Studio:** Google's developer prototyping interface (`https://generativelanguage.googleapis.com`) using standalone API keys.
- **Application Default Credentials (ADC):** Google Cloud's standard credential resolution mechanism using service account keys or environment variables.
- **InlineData:** Base64-encoded file representation in Gemini generation requests that avoids the need for dedicated file hosting buckets.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Local dev generates questions with Vertex AI | `GOOGLE_GENAI_USE_VERTEXAI="true"` and `GOOGLE_APPLICATION_CREDENTIALS="./gcp-key.json"` | Loads key file, routes to Vertex AI, uses base64 inline PDF, returns questions | Throws clear 500 if key missing | Planned |
| SC-02 | Production / Railway generates questions with Vertex AI | `GOOGLE_GENAI_USE_VERTEXAI="true"` and `GCP_SERVICE_ACCOUNT_KEY` env var | Parses JSON string directly, authenticates with Vertex AI without file mounting | Throws clear 500 if JSON malformed | Planned |
| SC-03 | Local dev or CI without Vertex credentials | `GOOGLE_GENAI_USE_VERTEXAI` is unset/false and `GEMINI_API_KEY` is present | Gracefully falls back to existing Google AI Studio REST pipeline | Throws 500 if both are missing | Planned |
| SC-04 | Large PDF up to 25MB uploaded | PDF is <= 25MB | Buffer is base64-encoded and sent within Vertex AI's 50MB payload ceiling | HTTP 413 if > 25MB (preserved) | Planned |
| SC-05 | Upstream Vertex error / transient failure | Vertex AI returns 502/503/504 or rate-limit 429 | Exponential backoff and model fallback (`gemini-2.5-flash` -> `gemini-2.5-flash-lite`) | Throws structured HTTPException | Planned |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | How will PDF documents be delivered to Vertex AI? | Option A: Direct base64 `inlineData` | Zero extra cloud infrastructure; no GCS bucket, no storage billing, no IAM bucket policies, no file deletion race conditions | Option B: Dedicated Google Cloud Storage bucket (`gs://...`) | [Context Spec](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/10/vertex-ai-gemini-migration.md) |
| DEC-02 | How will service account credentials be loaded across environments? | Option A: Dual-source (file path via `GOOGLE_APPLICATION_CREDENTIALS` + inline JSON string via `GCP_SERVICE_ACCOUNT_KEY`) | Simplifies local development (`./gcp-key.json`) while enabling clean ephemeral cloud container deployments (Railway/Docker) without mounting secrets | Option B: Strict file path only | [Context Spec](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/10/vertex-ai-gemini-migration.md) |
| DEC-03 | Should Google AI Studio support be retained? | Yes, dual-mode with automatic graceful fallback | Prevents breaking CI/CD pipelines, offline test suites, and environments without GCP service accounts | Full cutover removing AI Studio | [Context Spec](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/10/vertex-ai-gemini-migration.md) |

### Unknowns and blockers

- *None remaining.* Credit applicability confirmed, PDF approach confirmed, credential strategy confirmed.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01, DEC-02 | `@google/genai` SDK is installed and `.gitignore` prevents key files from being committed | `package.json`, `.gitignore`, `app/sentinel-api/.gitignore` | `git status` check and dependency inspection | Verified |
| AC-02 | SC-01, SC-02, DEC-02 | Credential loader resolves service account credentials from either file path or inline JSON string | `gemini.provider.ts`, `gcp-credentials.ts` | Unit test with mocked credentials | Verified |
| AC-03 | SC-01, DEC-01 | `GeminiProvider` sends PDFs as base64 `inlineData` when in Vertex AI mode | `providers/vertex-ai.provider.ts` | Unit test verifying payload structure | Verified |
| AC-04 | SC-01, SC-05 | `GeminiProvider` enforces structured JSON schema, thinkingConfig, and fallback models on Vertex AI | `providers/vertex-ai.provider.ts` | Unit test with simulated response | Verified |
| AC-05 | SC-03, DEC-03 | `GeminiProvider` preserves fallback to Google AI Studio when Vertex AI is disabled | `gemini.provider.ts`, `providers/ai-studio.provider.ts` | Unit test with `GEMINI_API_KEY` | Verified |
| AC-06 | SC-01..05 | All existing question generator unit tests pass without regressions | `question-generator.test.ts`, `gemini.provider.test.ts` | `pnpm --filter sentinel-api test` | Verified |
| AC-07 | SC-01, SC-02 | Environment variable setup documentation is updated | `SETUP.md`, `.env.example` | Code review and documentation check | Verified |

## Scope

- Installing `@google/genai` in `app/sentinel-api`.
- Gitignore hardening for service account key files.
- Credential loader for file paths and inline environment variable strings.
- Upgrading `GeminiProvider` with dual-mode Vertex AI / AI Studio routing.
- Base64 inline PDF handling for Vertex AI.
- Unit tests and developer setup documentation.

## Non-goals

- Migrating PostgreSQL, Redis, or other cloud dependencies to Google Cloud.
- Creating or managing Google Cloud Storage buckets.
- Changing frontend UI, client question generator forms, or assessment schemas.

## Phases

- [x] `phase-01-dependencies-and-credentials.md` — Phase 1: SDK Installation, Git Ignore Hardening, and Credential Loader
- [x] `phase-02-vertex-provider-and-inline-pdf.md` — Phase 2: Dual-Mode GeminiProvider & Base64 Inline PDF Ingestion
- [x] `phase-03-orchestrator-adaptation-and-pipeline.md` — Phase 3: Orchestrator Step Alignment & Lifecycle Cleanup
- [x] `phase-04-testing-verification-and-setup-docs.md` — Phase 4: Automated Test Coverage, Typecheck, and Documentation

## Verification

- Automated test run: `pnpm --filter sentinel-api test src/lib/gemini/gemini.provider.test.ts` (24/24 passed)
- Question generator tests: `pnpm --filter sentinel-api test src/tests/gemini/question-generator.test.ts` (12/12 passed)
- Full Gemini suite: `pnpm --filter sentinel-api test src/lib/gemini/` (115/115 passed)
- Git status check: verified `.gitignore` excludes `gcp-key.json` and credentials

## Deviations

- Refactored `orchestrator.ts` into a modular subdirectory (`orchestrator/constants`, `orchestrator/telemetry`, `orchestrator/recovery`, `orchestrator/service`) maintaining backward compatibility via `orchestrator.ts` facade.

## Result

Migration successfully completed. Sentinel's Question Generation service now natively supports Vertex AI using official `@google/genai` SDK, draws down the user's active $40 promotional GCP developer credits, bypasses cloud storage requirements via base64 inline PDF ingestion, and maintains seamless fallback to Google AI Studio.
