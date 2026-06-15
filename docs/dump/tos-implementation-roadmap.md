# TOS Assessment Engine — Production Implementation Roadmap

> **Source Context:** [`docs/tos-item-analysis.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tos-item-analysis.md)
> **Standard:** `1-3-1-rule.md` applied for all structural proposals

---

## Background & Problem Statement

Sentinel's question generator currently uses Gemini to produce untagged questions from PDFs.
The system needs to evolve in two directions:

1. **TOS Automation** — every generated question must carry a `topic`, `cognitive_level` (Bloom's Taxonomy), and `predicted_difficulty` so the CMS can plot a live TOS matrix that educators can review before approving a question pool.
2. **413 Fix** — generating 50–100 questions across multiple question types exceeds Hono's default body limit or Gemini's synchronous response size; the orchestrator must batch requests with a concurrency cap.

---

## Structural Options (1-3-1 Analysis)

### Three Options for the 413 Fix

| #   | Option                                        | Trade-offs                                                           |
| --- | --------------------------------------------- | -------------------------------------------------------------------- |
| 1   | **Sequential micro-batching**                 | Safest for rate limits; slowest wall-clock time                      |
| 2   | **Parallel batching with concurrency cap** ✅ | Fast, production-safe, partially implemented in orchestrator         |
| 3   | **Job queue (BullMQ/Redis)**                  | Most scalable; heavy infrastructure lift; overkill for current scale |

### Best Option: Option 2 — Parallel batching with concurrency cap

The orchestrator already calls `Promise.allSettled(batchPromises)`, so partial parallelism is in place. We need to add a concurrency limit (cap at 3 concurrent Gemini calls), raise Hono's body size limit in `server.ts`, and enrich each batch prompt with TOS metadata instructions. This delivers the 413 fix and TOS tagging without new infrastructure.

---

## Milestone 1 — Schema & Data Layer

**Goal:** Add all TOS lifecycle fields to `question_bank_questions` and run the Prisma migration.

### 1.1 Prisma Schema

#### [MODIFY] [schema.prisma](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma)

- [x] Add `topic` field (`String?`) — AI-extracted topic tag from the source PDF
- [x] Add `cognitive_level` field (`String?`) — Bloom's Taxonomy level (`REMEMBERING | UNDERSTANDING | APPLYING | ANALYZING | EVALUATING | CREATING`)
- [x] Add `predicted_difficulty` field (`question_difficulty?`) — Gemini's initial estimate at generation time
- [x] Add `actual_difficulty` field (`question_difficulty?`) — IRT-calibrated; `null` until first calibration run
- [x] Add `usage_count` field (`Int @default(0)`) — incremented each time question is included in a published exam
- [x] Add `last_used_at` field (`DateTime?`) — timestamp of most recent exam inclusion
- [x] Add `status` field of new enum `question_bank_status` (values: `ACTIVE | RETIRED | COOLING_OFF | ARCHIVED`), defaults to `ACTIVE`
- [x] Add `@@index([status])` and `@@index([cognitive_level])` to `question_bank_questions`
- [x] Define new enum `question_bank_status` in schema

### 1.2 Migration

- [x] Run `pnpm db:migrate` (migration: `20260428220000_add_tos_lifecycle_fields`)
- [x] Verify migration file generated in `packages/db/prisma/migrations/`
- [x] Confirm Kysely types regenerated with new columns

### 1.3 Shared Schema

#### [MODIFY] [gemini-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/gemini/gemini-schema.ts)

- [x] Add `topic`, `cognitiveLevel`, `predictedDifficulty` to the AI response item type

#### [MODIFY] [assessment-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/assessment-schema.ts)

- [x] Add `bloomCognitiveLevelSchema` enum with 6 Bloom's levels
- [x] Export `BloomCognitiveLevel` and `QuestionBankStatus` types

---

## Milestone 2 — AI Generation Refactor (413 Fix + TOS Tagging)

**Goal:** Fix 413 for 50–100 multi-type questions; enrich every generated question with TOS metadata.

### 2.1 Server Body Limit

#### [MODIFY] [app.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/app.ts)

- [x] Raise multipart body limit to `50mb` for AI routes via Hono `bodyLimit` middleware
- [x] Add `413` error handler returning `{ success: false, error: 'Payload too large.' }`

### 2.2 Prompt Builder

#### [MODIFY] [prompt-builder.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/gemini/services/prompt-builder/prompt-builder.service.ts)

- [x] Add Bloom's Taxonomy tagging instruction: instruct Gemini to emit `topic`, `cognitive_level`, `predicted_difficulty` per question

#### [MODIFY] [definitions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/gemini/services/prompt-builder/definitions.ts)

- [x] Add `topic`, `cognitive_level`, `predicted_difficulty` to the JSON response schema passed to Gemini's structured output API

### 2.3 Question Generator Orchestrator

#### [MODIFY] [orchestrator.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/gemini/services/question-generator/orchestrator.ts)

- [x] Add `CONCURRENCY_LIMIT = 3` constant
- [x] Replace `Promise.allSettled(batchPromises)` with a semaphore-gated concurrent runner (`runWithConcurrencyLimit`)
- [x] Update `RawGeneratedQuestion` type to include `topic`, `cognitiveLevel`, `predictedDifficulty`
- [x] Update `itemSchema` Zod validation to parse the new fields
- [x] Forward new fields through `createGeminiNativeSourceDocuments` and downstream mapping

### 2.4 Question Normalizer

#### [MODIFY] question-normalizer files

- [x] Update `normalizeGeneratedQuestions` to map `topic`, `cognitiveLevel`, `predictedDifficulty` from raw AI output
- [x] Update `buildAiPreviewSavePayload` to forward TOS metadata to the save payload

### 2.5 Question Bank Data Layer

#### [MODIFY] [create-question-bank-questions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/services/create-question-bank-questions.ts)

- [x] Persist `topic`, `cognitive_level`, `predicted_difficulty`, `status = 'ACTIVE'` when inserting

#### [NEW] `data/increment-question-usage.ts`

- [x] Kysely query: `UPDATE question_bank_questions SET usage_count = usage_count + 1, last_used_at = NOW()` for a list of IDs

#### [NEW] `data/retire-questions.ts`

- [x] Kysely query: set `status = 'RETIRED'` for questions that exceeded the exposure threshold

#### [NEW] `services/check-exposure-threshold.ts`

- [x] Read `usage_count` against `QB_EXPOSURE_LIMIT` env var (default `3`); call `retire-questions` automatically

### 2.6 Exam Publish Hook

#### [MODIFY] exam publish service

- [x] After exam is published, call `incrementQuestionUsage` for all `question_bank_question_id` values
- [x] After incrementing, call `checkExposureThreshold` to auto-retire over-exposed questions

---

## Milestone 3 — TOS Dashboard UI ✅

**Goal:** Build the TOS matrix view for educators to review AI-generated question distribution before approving a pool.

### 3.1 Route Structure

#### [NEW] `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/`

- [x] `page.tsx` — TOS matrix page entry point
- [x] `_constants/index.ts` — `BLOOM_LEVELS`, `BLOOM_LEVEL_LABELS`, `BLOOM_LEVEL_COLORS`, `BLOOM_LEVEL_HEADER_COLORS`
- [x] `_components/tos-stats-cards.tsx` — 4-stat summary row (Active, Retired, Topics Tagged, Grand Total)
- [x] `_components/tos-matrix-table.tsx` — two-way grid (Y-axis: topics, X-axis: Bloom levels) with color-coded headers and clickable rows
- [x] `_components/tos-topic-detail-sheet.tsx` — side sheet with per-topic Bloom breakdown + LOTS/HOTS summary
- [x] `_components/tos-level-distribution.tsx` — horizontal bar chart of column totals
- [x] `_components/tos-matrix-page-content.tsx` — page orchestrator

### 3.2 API — TOS Aggregation Endpoint

#### [MODIFY] [question-bank.route.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/question-bank.route.ts)

- [x] Add `GET /question-bank/tos-matrix` route

#### [NEW] [get-tos-matrix.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/data/get-tos-matrix.ts)

- [x] Kysely query: aggregates `topic` + `cognitive_level` for ACTIVE questions → `{ rows, columnTotals, grandTotal, activeCount, retiredCount }`

#### [NEW] [get-tos-matrix.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/controllers/get-tos-matrix.controller.ts)

- [x] OpenAPI controller with assessment access guard and institution scoping

### 3.3 Services Package

#### [NEW] [tos-matrix.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/tos-matrix.ts)

- [x] `getTosMatrix(apiClient, params?)` — typed API caller

### 3.4 Query Hook

#### [NEW] [use-tos-matrix-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/question-bank/use-tos-matrix-query.ts)

- [x] `useTosMatrixQuery(args?)` following standard hook pattern

### 3.5 Sidebar Navigation

#### [MODIFY] [constants/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/sidebar/instructor/constants/index.ts)

- [x] Added "TOS Matrix" nav item under Question Bank with `BarChart3` icon

---

## Milestone 4 — IRT Calibration Engine ✅

**Goal:** Auto-update `actual_difficulty` via P-Value calculation from student performance data.

### 4.1 Calibration Service

#### [NEW] [calibrate-question-difficulty.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/services/calibrate-question-difficulty.ts)

- [x] Accepts list of `question_bank_question_id`
- [x] Queries answer data via `getQuestionPerformanceStats` (evaluates correctness from `answer_snapshot` using `scoreExamAttempt`)
- [x] Computes P-Value: `correct_count / total_attempted`
- [x] Maps to `actual_difficulty`: `EASY` (P ≥ 0.85) | `MODERATE` (0.30 < P < 0.85) | `HARD` (P ≤ 0.30)
- [x] Questions with 0 attempts → skipped (no update)
- [x] ESSAY / manual-grade questions → excluded upstream
- [x] Dependencies injected for testability

#### [NEW] [get-question-performance-stats.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/data/get-question-performance-stats.ts)

- [x] Kysely query: joins `exam_questions` + COMPLETED `exam_attempts`, evaluates correctness per question using existing `scoreExamAttempt`, returns `{ questionBankQuestionId, correctCount, totalAttempted }[]`

#### [NEW] [update-question-actual-difficulty.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/data/update-question-actual-difficulty.ts)

- [x] Kysely bulk update for `actual_difficulty` per question ID

### 4.2 Calibration Trigger

- [x] **Post-exam completion (preferred)** — integrated into `SessionManagerService.completeSession` as a non-critical fire-and-forget call; failures are caught and logged without blocking exam submission.

### 4.3 Tests

#### [NEW] [calibrate-question-difficulty.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/tests/question-bank/calibrate-question-difficulty.test.ts)

- [x] P-Value 0.9 → `EASY`
- [x] P-Value 0.29 → `HARD`
- [x] P-Value 0.50 → `MODERATE`
- [x] P-Value boundary 0.85 → `EASY`
- [x] P-Value boundary 0.30 → `HARD`
- [x] 0 attempts → skipped, no DB write
- [x] Questions absent from stats → skipped
- [x] Mixed calibrated + skipped scenario
- [x] No DB call when all skipped
- [x] All 305 tests pass ✅

---

## Testing Strategy

### Automated Tests

#### Milestone 1 — Schema

- [ ] Verify migration runs cleanly on test DB (CI check)
- [ ] `packages/shared/src/schema/gemini/gemini-schema.test.ts` — existing config schema still validates with new optional fields

#### Milestone 2 — AI Refactor / 413 Fix

- [ ] `orchestrator.test.ts`
    - [ ] `createBatches` splits 50-question, 3-type distribution correctly
    - [ ] Concurrency cap: mock Gemini; confirm ≤ 3 simultaneous calls
    - [ ] `topic`, `cognitiveLevel`, `predictedDifficulty` present in output
- [ ] `prompt-builder.test.ts` — Bloom's instruction appears in built prompt
- [ ] `check-exposure-threshold.test.ts`
    - [ ] `usage_count >= QB_EXPOSURE_LIMIT` → `RETIRED`
    - [ ] Below threshold → `ACTIVE`

#### Milestone 3 — TOS API

- [ ] `get-tos-matrix.test.ts` — mock questions with varied topic + level, assert aggregation shape
- [ ] Integration test: `GET /question-bank/collections/:id/tos` returns expected matrix structure

#### Milestone 4 — IRT Calibration

- [ ] `calibrate-question-difficulty.test.ts`
    - [ ] P-Value 0.85 → `EASY`
    - [ ] P-Value 0.29 → `HARD`
    - [ ] P-Value 0.50 → `MODERATE`
    - [ ] 0 attempts → no update

### Manual QA

#### 413 Fix Verification

- [ ] Upload a PDF and request **50 questions with 4 question types** (20 MC + 10 TF + 10 Essay + 10 Identification) → confirm `200` response
- [ ] Upload a **25 MB PDF** → confirm graceful `413` error message (not a crash)
- [ ] Inspect Network tab → no single payload over the new body limit

#### TOS Matrix UI

- [ ] Generate 50-question bank via AI → navigate to TOS matrix page for that collection
- [ ] Confirm grid renders with rows per detected topic, columns per Bloom level
- [ ] Click a cell → confirm question drawer shows correct questions
- [ ] Click "Retire Question" → status updates to `RETIRED`, question removed from active matrix
- [ ] Publish an exam → confirm `usage_count` increments; at threshold, question auto-appears as `RETIRED`

#### IRT Calibration

- [ ] Simulate exam completion (set `status = COMPLETED` via Prisma Studio)
- [ ] Confirm `actual_difficulty` written back after calibration trigger fires
- [ ] 9/10 correct → `EASY` | 2/10 correct → `HARD`

---

## File Impact Summary

| Layer                                                                     | Files                                    |
| ------------------------------------------------------------------------- | ---------------------------------------- |
| `packages/db/prisma/schema.prisma`                                        | MODIFY — 6 new fields + enum + 2 indexes |
| `packages/shared/src/schema/`                                             | MODIFY — 2 files                         |
| `sentinel-api/src/server.ts`                                              | MODIFY — body limit + 413 handler        |
| `sentinel-api/src/lib/gemini/services/prompt-builder/`                    | MODIFY — 2 files                         |
| `sentinel-api/src/lib/gemini/services/question-generator/orchestrator.ts` | MODIFY — concurrency + TOS fields        |
| `sentinel-api/src/lib/gemini/services/question-normalizer/`               | MODIFY                                   |
| `sentinel-api/src/modules/content/question-bank/`                         | MODIFY + NEW — 7 new data/service files  |
| `sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/`        | NEW — full route tree (9 files)          |
| `sentinel-web/src/hooks/query/question/`                                  | NEW — 1 mutation hook                    |

---

> Awaiting approval to begin execution. Task tracking will be managed in `task.md` per the to-do-workflow.
