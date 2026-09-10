---
title: "Migrate Gemini Integration from Google AI Studio to Google Cloud Vertex AI"
type: context
status: completed
created: "2026-09-10"
tags: [context, ai, gemini, vertex-ai, gcp-credits, question-generator]
feature: "vertex-ai-gemini-migration"
---

# Migrate Gemini Integration from Google AI Studio to Google Cloud Vertex AI Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  Currently, Sentinel's AI question generation service (`app/sentinel-api/src/lib/gemini/gemini.provider.ts`) uses direct REST calls to Google AI Studio (`https://generativelanguage.googleapis.com`) authenticated via `GEMINI_API_KEY`. Google AI Studio operates on a separate billing/prepaid track where Google Cloud promotional and monthly developer benefits (such as the $40 accumulated Google Developer Program monthly credits on Billing Account `013354-4925B5-40E47F`) cannot be consumed. To monetize and exhaust these credits, Gemini model inference must be routed through **Google Cloud Vertex AI** (`https://aiplatform.googleapis.com`), which bills directly to the linked GCP Billing Account and draws down active credit balances.
- **Business / User Value:**
  - Fully utilizes the active $40 Google Developer Program premium benefit credits without incurring out-of-pocket charges.
  - Aligns Sentinel with enterprise-grade GCP infrastructure, including service account IAM roles and regional quota management.
- **Success Criteria:**
  - AI question generation requests successfully execute against Google Cloud Vertex AI.
  - Usage charges are deducted from the GCP Billing Account's issued promotional/monthly credits (`CREDIT_TYPE_MONTHLY`).
  - Question generator pipeline (structured JSON schema, passage generation, repair, and replenishment) preserves 100% functional parity with existing behavior.
  - Secure credential management ensures no GCP service account keys (`gcp-key.json`) are committed to version control.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As an instructor/administrator generating an exam preview, I want the AI question generation to reliably produce questions and rubrics using Vertex AI models with the same schema and speed as Google AI Studio.*
- *As a system developer/maintainer, I want to use my GCP monthly developer credits so that AI generation operational costs are covered by Google Cloud credits.*
- *As a DevOps engineer, I want clean environment variable switching between Vertex AI and Google AI Studio (fallback) without breaking local development or automated CI/CD test suites.*

### Functional Requirements

- [x] **FR-01 (Dual-Source Credential Loading & Auth Strategy):**
  - Authenticate using Google Cloud IAM Service Account credentials with role `roles/aiplatform.user`.
  - **Local Development:** Support file path via `GOOGLE_APPLICATION_CREDENTIALS="./gcp-key.json"`.
  - **Cloud Hosting / Production (Railway/Docker):** Support inline service account JSON via environment variables `GCP_SERVICE_ACCOUNT_KEY` (raw JSON string) or `GCP_SA_KEY_BASE64` (base64 encoded JSON string) to avoid needing physical file mounting on ephemeral containers.
  - Require `GOOGLE_CLOUD_PROJECT` (project ID) and `GOOGLE_CLOUD_LOCATION` (defaults to `us-central1`).
- [x] **FR-02 (PDF Ingestion via Direct Base64 Inline Data - Confirmed Option A):**
  - Eliminate dependency on Google AI Studio's temporary Files API (`/v1beta/files`).
  - Read uploaded PDF buffers into base64 strings and pass them directly as `inlineData: { mimeType: 'application/pdf', data: base64Data }` in generation payloads.
  - Avoids the overhead of provisioning Google Cloud Storage (GCS) buckets, managing bucket permissions, or writing file deletion lifecycle logic.
  - Sentinel's 25MB PDF ceiling fits well within Vertex AI's 50MB request body limit.
- [x] **FR-03 (Structured Content Generation & Thinking Budget Parity):**
  - Preserve `responseMimeType: 'application/json'` and `responseJsonSchema` across all Vertex AI generation batches.
  - Ensure thinking budget configurations (`thinkingConfig.thinkingBudget`) and model resolution (`gemini-2.5-flash`, fallback to `gemini-2.5-flash-lite`) behave identically to the existing pipeline.
- [x] **FR-04 (Provider Abstraction & Graceful AI Studio Fallback):**
  - Implement a dual-mode provider architecture in `GeminiProvider`:
    - When `GOOGLE_GENAI_USE_VERTEXAI="true"` or GCP service account credentials are provided, use Vertex AI via `@google/genai` SDK.
    - When Vertex AI configuration is absent and `GEMINI_API_KEY` is present, seamlessly fall back to Google AI Studio REST calls.
    - Allows CI/CD, unit tests, and developers without GCP keys to continue functioning uninterrupted.
- [x] **FR-05 (Secret Management & Git Hygiene):**
  - Strictly ignore `gcp-key.json`, `*gcp-key*.json`, and `*-key.json` in both root `.gitignore` and `app/sentinel-api/.gitignore`.
  - Document setup steps in `SETUP.md` or `.env.example`.

### Edge Cases & Failure Modes

- **Missing / Invalid Credentials:** If `GOOGLE_GENAI_USE_VERTEXAI="true"` but neither valid file credentials nor valid inline JSON are detected, throw a descriptive HTTP 500 error explaining the missing credential configuration.
- **Quota / Rate Limiting (HTTP 429):** Retain exponential backoff retry behavior on HTTP 429 quota exhaustion.
- **Upstream Vertex AI Errors (502/503/504):** Automatically retry with fallback model `gemini-2.5-flash-lite` before terminating the batch.
- **Empty / Blocked Prompt Feedback:** Detect safety blocks or empty candidate outputs and provide explicit error messaging matching existing error contracts.

---

## 3. Technical & Architectural Context

- **Affected Domains / Layers:** Backend API (`app/sentinel-api`).
- **Existing Files & Reference Symbols:**
  - `app/sentinel-api/src/lib/gemini/gemini.provider.ts` (`GeminiProvider`): Core LLM provider handling client initialization, prompt payload preparation, and JSON parsing.
  - `app/sentinel-api/src/lib/gemini/services/question-generator/types.ts` (`QuestionGeneratorLlmProvider`, `LlmFile`): Type contract for LLM generation.
  - `app/sentinel-api/src/lib/gemini/services/question-generator/steps/upload-files.ts`: File upload and cleanup lifecycle step (simplified for inline base64).
  - `app/sentinel-api/src/lib/gemini/services/question-generator/orchestrator.ts`: Question generator pipeline orchestrator.
  - `app/sentinel-api/.gitignore` & `.gitignore`: Root and package level ignore rules for credential keys.
- **Dependencies to Add:**
  - `@google/genai`: Official Google Gen AI SDK supporting both Vertex AI and Gemini Developer API.
- **Data Model & Schema Changes:** None (database schema is untouched).
- **Security & Authorization:**
  - Service account keys must never be committed to Git.
  - IAM role required: `roles/aiplatform.user` (Vertex AI User) on the target Google Cloud project.

---

## 4. UI/UX & Interaction Guidelines (if applicable)

- Not applicable (backend integration change; frontend question generation UI remains unchanged).

---

## 5. Scope & Boundaries

- **In Scope:**
  - Installing and configuring `@google/genai` SDK in `app/sentinel-api`.
  - Updating `GeminiProvider` to support Vertex AI with base64 inline PDF data and dual-source credentials (file path + inline env string).
  - Retaining Google AI Studio fallback when `GEMINI_API_KEY` is present.
  - Adding `gcp-key.json` and key patterns to `.gitignore`.
  - Updating unit tests (`gemini.provider.test.ts`, `question-generator.test.ts`) to verify both Vertex AI and fallback flows.
- **Out of Scope / Non-Goals:**
  - Migrating databases or file storage to Google Cloud Storage.
  - Altering student exam interfaces or client-side generation forms.

---

## 6. References & External Context

- Google Cloud Console Billing Credits: Billing Account `013354-4925B5-40E47F` ($40 active Google Developer Program monthly benefits).
- Google Gen AI SDK documentation: `@google/genai` Vertex AI mode (`GOOGLE_GENAI_USE_VERTEXAI`).
- Existing Gemini Provider: `app/sentinel-api/src/lib/gemini/gemini.provider.ts`.
