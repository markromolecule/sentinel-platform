---
title: "Phase 1: SDK Installation, Git Ignore Hardening, and Credential Loader"
type: phase
parent: "docs/tasks/2026/09/2026-09-10/feat-vertex-ai-migration/README.md"
phase: "01"
status: completed
created: "2026-09-10"
tags: [task, phase, dependencies, credentials, security]
---

# Phase 1: SDK Installation, Git Ignore Hardening, and Credential Loader

## Objective

Install the official `@google/genai` SDK in `sentinel-api`, ensure service account key patterns are strictly ignored in `.gitignore`, and create a robust credential resolution utility supporting both local file paths (`GOOGLE_APPLICATION_CREDENTIALS`) and production inline JSON strings (`GCP_SERVICE_ACCOUNT_KEY` / `GCP_SA_KEY_BASE64`).

## Dependencies & Prerequisites

- Context specification confirmed in `docs/context/September/10/vertex-ai-gemini-migration.md`.

## Impacted Files & Components

- `app/sentinel-api/package.json` — Add `@google/genai` dependency.
- `.gitignore` — Add `gcp-key.json`, `*gcp-key*.json`, and `*-key.json`.
- `app/sentinel-api/.gitignore` — Add `gcp-key.json`, `*gcp-key*.json`, and `*-key.json`.
- `app/sentinel-api/src/lib/gemini/gcp-credentials.ts` (NEW) — Safe credential resolver for file paths and inline environment JSON.

## Implementation Tasks

- [x] Task 1.1 — Install `@google/genai` in `app/sentinel-api` via `pnpm --filter sentinel-api add @google/genai`.
- [x] Task 1.2 — Update root `.gitignore` and `app/sentinel-api/.gitignore` to strictly exclude `gcp-key.json`, `*gcp-key*.json`, and `*-key.json`.
- [x] Task 1.3 — Create `app/sentinel-api/src/lib/gemini/gcp-credentials.ts` that:
  - Checks if `GOOGLE_GENAI_USE_VERTEXAI === 'true'`.
  - Resolves GCP project ID from `GOOGLE_CLOUD_PROJECT` or service account JSON `project_id`.
  - Resolves location from `GOOGLE_CLOUD_LOCATION` (default `us-central1`).
  - Resolves credentials from `GCP_SERVICE_ACCOUNT_KEY` (raw JSON), `GCP_SA_KEY_BASE64` (base64 decoded JSON), or `GOOGLE_APPLICATION_CREDENTIALS` (file path).
  - Emits clear, developer-friendly diagnostic errors if Vertex AI is enabled but credentials are missing or invalid.

## Verification & Testing

- `pnpm --filter sentinel-api test src/lib/gemini/gcp-credentials.test.ts` (PASS: 14/14 passed)
- `pnpm --filter sentinel-api test src/lib/gemini/gemini.provider.test.ts` (PASS: 19/19 passed)
- `git status --ignored` verified that `gcp-key.json` is strictly ignored by Git at both workspace root and `sentinel-api` directories.

## Risks & Rollback

- **Risk:** Malformed JSON in `GCP_SERVICE_ACCOUNT_KEY` crashing application on startup.
- **Mitigation:** Lazily parse and validate credentials on first use with try/catch, logging clear diagnostics rather than crashing during boot.
