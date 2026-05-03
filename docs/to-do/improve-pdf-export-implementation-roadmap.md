# Exam PDF Export & Builder Improvements — Production Implementation Roadmap

> **Source Context:** [`docs/improve-pdf-export.md`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/improve-pdf-export.md)
> **Workflow:** `.agents/workflows/to-do-workflow.md`
> **Standard:** `.agents/rules/global/1-3-1-rule.md`

## Background & Problem Statement

The instructor exam export should produce a printable examination paper that looks natural in a university setting, respects paper size, paginates cleanly, and uses the instructor-authored section structure without duplicating question type headings. The exam builder also needs section-level instructions and a cleaner rule model so instructor admit is configured with the other exam rules instead of being manually handled in the builder sidebar.

Current inspection highlights:

- `app/sentinel-web/src/features/exams/export/exam-print-export.tsx` renders each question as a bordered card and prints essay answer lines with numeric labels.
- `app/sentinel-web/src/features/exams/export/exam-export-utils.ts` groups questions by section and then by question type, which creates duplicate section/type presentation.
- `exam_sections` currently stores `title` and `order_index` only, so section instructions need a schema/data-layer addition.
- `configuration.lobbyAdmissionMode` already stores instructor admit behavior, while `settings` only stores shuffle/review/choice options.
- `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/_components/exam-builder-sidebar.tsx` renders instructor admit beside builder rules, while the full config UI renders it in security settings.

## Structural Options (1-3-1 Analysis)

### Option 1 — Frontend-only print cleanup

Update only the print/export components and builder UI copy. This is fast, but it cannot persist section instructions and would leave instructor admit split between configuration and sidebar behavior.

### Option 2 — Incremental contract/data update with focused UI refactor

Add `description` to exam sections, keep instructor admit backed by `configuration.lobbyAdmissionMode`, expose that control consistently inside exam rules, and refactor the print renderer to use the section contract directly. This addresses every requested behavior without changing the runtime access model.

### Option 3 — Full exam settings model redesign

Move instructor admit from `configuration` into `settings`, add compatibility migrations, and refactor access, configuration, builder, preview, and student runtime code around the new location. This may be cleaner long term, but it has a larger blast radius and risks regressing lobby access flows.

## Best Option

Choose **Option 2 — Incremental contract/data update with focused UI refactor**.

Why:

- It satisfies the PDF export and section instruction requirements with a clear data contract.
- It keeps the existing lobby gate behavior on `configuration.lobbyAdmissionMode`, where access and monitoring logic already expect it.
- It makes the instructor experience cleaner by surfacing instructor admit in the rule UI while avoiding a risky settings/configuration migration.

Recommended next step: implement the milestones below in order, starting with the section description contract so export and builder UI can depend on the same persisted field.

## Milestone 1 — Data Contract & Persistence

**Goal:** Persist per-section instructions and expose them through existing exam detail/update contracts.

### 1.1 Prisma Schema

#### [MODIFY] [`packages/db/prisma/schema.prisma`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma)

- [x] Add nullable `description String? @db.Text` to `exam_sections`.
- [x] Preserve existing `exam_sections_exam_id_order_index_key` and `exam_sections_exam_id_idx` constraints.

### 1.2 Migration

- [x] Generate a Prisma migration for `exam_sections.description`.
- [x] Review generated SQL for a nullable column addition with no destructive data changes.
- [x] Regenerate Kysely/generated DB types if the repo workflow requires it.

### 1.3 Shared Schemas & Types

#### [MODIFY] [`packages/shared/src/schema/exams/exam-schema.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-schema.ts)

- [x] Add `description: z.string().nullable().optional()` to `examSectionSchema`.
- [x] Add `description: z.string().trim().max(1000).nullable().optional()` to `examSectionInputSchema`.
- [x] Add contract tests for section description acceptance and trimming/null handling in existing exam schema tests.

#### [MODIFY] [`packages/shared/src/types/exams/exam.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/types/exams/exam.ts)

- [x] Add `description?: string | null` to `ExamQuestionSection`.

### 1.4 Services DTOs & Mappers

#### [MODIFY] [`packages/services/src/api/exams/types.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/exams/types.ts)

- [x] Add `description?: string | null` to `ApiExamSection`.
- [x] Add `description?: string | null` to `UpdateExamQuestionSectionPayload`.

#### [MODIFY] [`packages/services/src/api/exams/mappers.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/exams/mappers.ts)

- [x] Map API section descriptions into `questionSections`.

#### [MODIFY] [`app/sentinel-api/src/modules/examination/exams/exam.dto.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/exam.dto.ts)

- [x] Include section description in exam detail DTO output.

#### [MODIFY] [`app/sentinel-api/src/modules/examination/exams/services/normalize-exam-structure-input.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/normalize-exam-structure-input.ts)

- [x] Normalize `description` to trimmed text or `null` when writing `exam_sections`.

#### [MODIFY] [`app/sentinel-api/src/modules/examination/exams/services/get-exam-detail.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/get-exam-detail.ts)

- [x] Return `description` for each question section.

#### [MODIFY] [`app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts)

- [x] Preserve section descriptions in mapped exam detail responses.

## Milestone 2 — Exam Builder Section Instructions

**Goal:** Let instructors author instructions/descriptions per section in the builder.

### 2.1 Builder State

#### [MODIFY] builder hooks and store under [`app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder`](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder>)

- [x] Add section description to the builder section state shape.
- [x] Ensure save/update payloads include `questionSections[].description`.
- [x] Ensure loading an existing exam hydrates section descriptions.
- [x] Add a section description update action with a typed handler.

### 2.2 Builder UI

#### [MODIFY] builder section management components

- [x] Add a concise textarea/input for each section instruction.
- [x] Keep the control near the section title editing flow.
- [x] Use existing form/input components and avoid adding a new design pattern.
- [x] Ensure empty descriptions save as `null` or are omitted consistently with the API normalizer.

### 2.3 Builder Tests

- [x] Add/extend frontend tests for editing a section description and sending it in the save payload.
- [x] Add a regression test that preserves section descriptions when reordering sections or questions.

## Milestone 3 — Exam Rules & Instructor Admit Cleanup

**Goal:** Make instructor admit visible with exam rules while preserving the existing `configuration.lobbyAdmissionMode` runtime contract.

### 3.1 Config UI

#### [MODIFY] [`app/sentinel-web/src/features/exams/config/_components/exam-rules-section.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/config/_components/exam-rules-section.tsx)

- [x] Add a rule row for `configuration.lobbyAdmissionMode`.
- [x] Default the instructor-admit rule to enabled when admin/global defaults resolve to `INSTRUCTOR_GATED`.
- [x] Keep labels aligned with instructor language: "Require instructor admit".

#### [MODIFY] [`app/sentinel-web/src/features/exams/config/_components/security-settings-section.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/config/_components/security-settings-section.tsx)

- [x] Remove or relocate the duplicate lobby admission toggle after it is available in exam rules.
- [x] Keep reconnect and auto-submit controls in the security section.

### 3.2 Builder Sidebar

#### [MODIFY] [`app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/_components/exam-builder-sidebar.tsx`](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/_components/exam-builder-sidebar.tsx>)

- [x] Remove the manually appended "Require Instructor Admit" sidebar toggle.
- [x] Remove the extra description text for admit rules in the sidebar.
- [x] Render the admit option from the same constants/rule metadata used by other exam rules.

#### [MODIFY] [`app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/_components/_constants/index.ts`](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/_components/_constants/index.ts>)

- [x] Replace `TOGGLE_OPTIONS` with a typed list that supports both `settings.*` toggles and `configuration.lobbyAdmissionMode`.
- [x] Remove the placeholder comment `// Add the admit here`.

### 3.3 Configuration Defaults

#### [VERIFY] configuration services

- [x] Trace `DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultLobbyAdmissionMode` through `build-default-exam-configuration.ts`.
- [x] Verify `map-exam-configuration-state.ts` returns the admin/global default when no exam-specific row exists.
- [x] Add a test proving new instructor exams default to instructor admit when global admin settings require it.

## Milestone 4 — Print/PDF Export Rendering

**Goal:** Produce a clean examination-paper layout that paginates naturally and avoids duplicate headings/cards.

### 4.1 Export Data Shape

#### [MODIFY] [`app/sentinel-web/src/features/exams/export/exam-export-utils.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/export/exam-export-utils.ts)

- [x] Remove type-group rendering from the main export structure.
- [x] Return sections with ordered questions directly.
- [x] Include section descriptions/instructions in export sections.
- [x] Preserve deterministic ordering by section order and question order.
- [x] Keep utility coverage for unsectioned questions.

### 4.2 Paper Size Settings

#### [MODIFY] [`app/sentinel-web/src/features/exams/export/exam-print-export.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/export/exam-print-export.tsx)

- [x] Add a no-print paper size selector with at least `A4`, `Letter`, and `Legal`.
- [x] Apply the selected size through print CSS `@page size`.
- [x] Persist the selected size in component state only unless product requirements later call for saving it.
- [x] Keep the print action clear as "Print / Save PDF".

### 4.3 Examination Paper Layout

#### [MODIFY] [`app/sentinel-web/src/features/exams/export/exam-print-export.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/export/exam-print-export.tsx)

- [x] Remove bordered wrapper cards around individual questions.
- [x] Render questions as numbered exam items with compact spacing.
- [x] Render section title once and section instructions beneath it.
- [x] Stop rendering duplicate question-type headings unless the instructor explicitly created them as section titles.
- [x] Keep points visible but unobtrusive.
- [x] Use print-safe typography, margins, and answer spacing appropriate for university exam papers.

### 4.4 Response Areas

#### [MODIFY] [`app/sentinel-web/src/features/exams/export/exam-print-export.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/export/exam-print-export.tsx)

- [x] Remove numeric labels from essay answer lines.
- [x] Keep numeric labels for enumeration/fill-in answer lines where answer count matters.
- [x] Preserve true/false, multiple-choice, multiple-response, matching, identification, enumeration, and fill-blank response areas.
- [x] Ensure no correct answers, rubrics, source evidence, or instructor-only metadata render in export.

### 4.5 Pagination

#### [MODIFY] print CSS in [`exam-print-export.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/export/exam-print-export.tsx)

- [x] Use `break-inside: avoid` only for compact question blocks.
- [x] Allow long essay/section content to flow onto the next page instead of clipping.
- [x] Add page-friendly spacing rules for section headers and answer lines.
- [x] Verify browser print preview creates additional pages when content exceeds the selected paper size.

## Milestone 5 — Automated Tests

**Goal:** Lock the new contracts and prevent export regressions.

### 5.1 API & Schema Tests

- [ ] Extend `app/sentinel-api/src/tests/exams/exam-contracts.test.ts` for `questionSections[].description`.
- [ ] Extend `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.test.ts` for section description output.
- [ ] Add/extend tests for `normalize-exam-structure-input.ts` to assert trimmed/null section descriptions.
- [ ] Add/extend configuration tests proving instructor admit defaults honor global settings.

### 5.2 Frontend Export Tests

#### [MODIFY] [`app/sentinel-web/src/features/exams/export/exam-export-utils.test.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/export/exam-export-utils.test.ts)

- [x] Update tests to expect section-level ordered questions instead of type groups.
- [x] Add a test for section instructions in export sections.
- [x] Add a test ensuring unsectioned questions still render.

#### [MODIFY] [`app/sentinel-web/src/features/exams/export/exam-print-export.test.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/export/exam-print-export.test.tsx)

- [x] Assert section instructions render.
- [x] Assert question-type duplicate headings do not render.
- [x] Assert essay lines do not include `1.`, `2.`, `3.` labels.
- [x] Assert question wrappers no longer use card/border presentation.
- [x] Assert instructor-only metadata remains hidden.

### 5.3 Builder & Config UI Tests

- [x] Add/extend config UI tests for instructor admit under exam rules.
- [x] Add/extend builder sidebar tests for admit rule rendering from shared metadata.
- [x] Add/extend builder section tests for editing and saving section instructions.

## Milestone 6 — Manual QA

**Goal:** Confirm the PDF and builder behavior matches instructor expectations.

- [x] Create or open an exam with at least three sections and mixed question types.
- [x] Add unique instructions/descriptions to each section.
- [x] Save and reload the builder; confirm section instructions persist.
- [x] Toggle instructor admit from the exam rules area; confirm the builder sidebar and full configuration agree.
- [x] Export as A4 and verify print preview uses A4 paper size.
- [x] Export as Letter and verify print preview uses Letter paper size.
- [x] Confirm each section title appears once.
- [x] Confirm section instructions appear under the correct section.
- [x] Confirm question type names do not appear as duplicate headings unless authored as section titles.
- [x] Confirm individual questions are not wrapped in card borders.
- [x] Confirm essay answer lines are unnumbered.
- [x] Confirm enumeration/fill-in answer lines still provide the expected number of blanks.
- [x] Confirm a long exam flows to additional pages without clipped content.
- [x] Confirm answer keys, rubrics, and source evidence are not printed.

## Implementation Order

- [ ] Complete Milestone 1 before touching builder/export UI so all consumers share the same section instruction contract.
- [ ] Complete Milestone 2 before export instruction rendering so persisted data exists to display.
- [ ] Complete Milestone 3 independently after verifying current instructor-admit defaults.
- [ ] Complete Milestone 4 after data and UI contracts are stable.
- [ ] Run Milestone 5 automated tests.
- [ ] Perform Milestone 6 manual QA against at least one mixed-question exam.
