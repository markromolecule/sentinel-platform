---
title: "Fix Mobile Question Rendering, Section Breakdown Preservation, and Result View Parity"
type: task
status: complete
created: "2026-09-09"
completed: "2026-09-09"
tags: [task, mobile, questions, question-rendering, section-breakdown, result-parity]
---

# Fix Mobile Question Rendering, Section Breakdown Preservation, and Result View Parity

## Outcome

1. Ensure `MobileSessionQuestion` preserves `sectionId` and `content` properties during question adaptation so question section affiliations and prompts are never dropped.
2. Ensure `ResultView` accurately correlates questions to `exam.questionSections` and safely feeds questions into `buildExamAttemptQuestionReports` without runtime contract mismatches.
3. Harden `QuestionCard` and question rendering fallbacks across all 8 question types with full test coverage and verified zero TypeScript errors.
4. Promote the context specification `docs/context/September/9/fix-mobile-exam-submission-and-question-visibility.md` from `draft` to `ready`.

---

## Pre-planning record

### Actors and goals

- **Student:** Taking an assessment or viewing results on mobile; expects questions, section categories, and question performance breakdowns to display accurately without missing data or blank views.
- **Instructor / Grader:** Expects exam section groupings and question scores to match across web and mobile platforms.

### Domain language

- **`MobileSessionQuestion`:** The normalized mobile-specific representation of an exam question used in `ExamSessionScreen` and `ResultView`.
- **`sectionId`:** Unique identifier associating a question with an `ExamQuestionSection` (e.g. Part I: Multiple Choice, Part II: Essay).
- **`Question Breakdown`:** Section-by-section score and progress metrics rendered on the result preview screen.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Student in exam session with sections | Exam contains questions in multiple sections | Questions render prompt, options/inputs, and retain `sectionId` | Default section fallback | Verified |
| SC-02 | Student views exam result with sections | Exam has `questionSections` defined | Performance breakdown lists each section with calculated or provisional scores | Falls back to "Core Assessment" | Verified |
| SC-03 | `ResultView` builds attempt question reports | Attempt contains adapted mobile questions | Reports generated safely with prompt and type; no undefined content access | Safe prompt fallback | Verified |
| SC-04 | Exam has no sections | Exam has no `questionSections` | Displays unified "Core Assessment" breakdown cleanly | Shows total points | Verified |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | Where should `sectionId` be preserved? | In `adaptExamQuestionsForMobile` and `MobileSessionQuestion` interface | `ResultView` filters by `q.sectionId === sec.id`; omitting it zeroes out section breakdowns | Computing sections only on the server | `mobile-question-adapter.ts` |
| DEC-02 | How should `ResultView` feed questions to `buildExamAttemptQuestionReports`? | Ensure each question has a normalized `content` object containing `prompt` and original fields | `buildExamAttemptQuestionReports` accesses `question.content.prompt` directly | Rewriting `@sentinel/shared` report builder | `result-view.tsx` |
| DEC-03 | What lifecycle state should the Sept 9 context spec have? | Update to `status: ready` once section breakdown and question contracts are codified | Unifies the submission idempotency and question rendering lifecycle | Leaving spec perpetually in `draft` | `docs/context/September/9/` |

### Unknowns and blockers

- None. All source files, contracts, and test files have been verified.

---

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01, DEC-01 | `MobileSessionQuestion` includes optional `sectionId?: string \| null` and `content?: ExamQuestion['content']` | `mobile-exam-adapter.types.ts` | TypeScript check | Verified |
| AC-02 | SC-01, DEC-01 | `adaptExamQuestionsForMobile` maps `sectionId` from `question.sectionId ?? question.section_id` | `mobile-question-adapter.ts` | Unit tests in `mobile-question-adapter.test.ts` | Verified |
| AC-03 | SC-02, SC-03, DEC-02 | `ResultView` computes section breakdowns accurately and normalizes questions before calling `buildExamAttemptQuestionReports` | `result-view.tsx` | Unit tests in `result-view.test.tsx` | Verified |
| AC-04 | SC-04 | `ResultView` continues to cleanly fall back to "Core Assessment" when no sections exist | `result-view.tsx` | Unit tests in `result-view.test.tsx` | Verified |
| AC-05 | DEC-03 | `docs/context/September/9/fix-mobile-exam-submission-and-question-visibility.md` updated to `status: ready` | `fix-mobile-exam-submission-and-question-visibility.md` | Frontmatter audit | Verified |
| AC-06 | All | Full mobile test suite passes (`pnpm test`) and `tsc --noEmit` exits 0 | `sentinel-mobile` | Fresh CLI run | Verified |

---

## Scope

- Extending `MobileSessionQuestion` interface with `sectionId` and `content`.
- Preserving `sectionId` and `content` in `adaptExamQuestionsForMobile`.
- Hardening `ResultView` section breakdown calculation and report generation.
- Adding comprehensive test coverage for section filtering and report generation in `result-view.test.tsx`.
- Updating context specification status and decision ledger.

## Non-goals

- Altering `@sentinel/shared` grading logic or database schemas.
- Changing mobile navigation sheet or session footer controls (already complete).

---

## Phases

- [x] [`phase-01-model-contracts-and-section-preservation.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-09/fix-mobile-question-rendering-and-result-parity/phase-01-model-contracts-and-section-preservation.md) — Phase 1: Model Contracts and Section ID Preservation
- [x] [`phase-02-result-view-report-compatibility-and-breakdowns.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-09/fix-mobile-question-rendering-and-result-parity/phase-02-result-view-report-compatibility-and-breakdowns.md) — Phase 2: Result View Report Compatibility and Section Breakdowns
- [x] [`phase-03-verification-and-context-audit.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-09/fix-mobile-question-rendering-and-result-parity/phase-03-verification-and-context-audit.md) — Phase 3: Automated Verification, Quality Gates, and Context Audit

---

## Verification

- `sentinel-mobile` test suite: `./node_modules/.bin/vitest run` (PASS: 265/265 passed across 41 test files)
- `sentinel-mobile` TypeScript check: `./node_modules/.bin/tsc --noEmit` (PASS: 0 errors)
