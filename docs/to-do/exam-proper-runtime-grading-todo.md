# To-Do: Exam Proper Runtime, Multi-Section Assignment, and Grading

## Source

This plan is based on [`docs/task/attempt/01-test-proper.md`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/task/attempt/01-test-proper.md).

## Analysis Summary

- The current student submit flow in [attempt/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx>) is still placeholder behavior. It shows a success toast, clears local session storage, and redirects to `/student/history` without a real score summary or explicit turn-in confirmation step.
- The browser security hook in [use-exam-monitoring.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.ts>) already handles `visibilitychange`, `blur`, `fullscreenchange`, clipboard, right-click, and screen-capture shortcuts, but `Alt + Tab` cannot be truly disabled by browser code. This must be treated as a detection, lock, and telemetry problem instead of an OS-level block.
- The instructor create/edit exam flow is single-section end to end today:
    - [subject-section-fields.tsx](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields/subject-section-fields.tsx)
    - [use-exam-create-form.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/config/_hooks/use-exam-create-form.ts)
    - [use-exam-edit-form.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/config/_hooks/use-exam-edit-form.ts)
    - [exam-create-schema.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-create-schema.ts)
    - [exams.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/exams.ts)
- The database also stores a single `section_id` and `section_name` on the `exams` table in [schema.prisma](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma), so multi-section assignment is a data-model task, not only a dialog redesign.
- The instructor grading pages are still mock-driven:
    - [use-grading-list.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/_hooks/use-grading-list.ts>)
    - [use-grading-detail.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/_hooks/use-grading-detail.ts>)
- Because grading must become section-aware and instructor-aware, the grading task depends on how multi-section exams and proctor assignments will be modeled.

## 1-3-1 Analysis

### One Goal

- Turn the current scattered exam-proper issues into one coherent rollout covering student submission, runtime security, multi-section assignment, and instructor grading.

### Three Viable Options

#### Option 1: UI-Only Patches

- Add a score page, tweak the exam dialog, and add section filters to grading without changing shared contracts.

Pros:

- Fastest visible progress.

Cons:

- Breaks once real multi-section data is needed.
- Keeps grading on top of mocks or brittle adapters.
- Hides the real limitation that the exam contract is still single-section.

#### Option 2: Contract-First Phased Rollout

- Align runtime submission first.
- Redesign multi-section assignment across schema, API, and UI next.
- Finalize grading only after the assignment model is stable.

Pros:

- Best fit for the real codebase constraints.
- Keeps each phase reviewable before moving forward.
- Avoids building grading on top of the wrong section model.

Cons:

- Slightly slower than patching UI symptoms first.

#### Option 3: Full Exam Module Rewrite

- Rebuild attempt flow, assignment, monitoring, and grading as one large milestone.

Pros:

- Maximum feature movement in one pass.

Cons:

- Too wide for safe debugging and review.
- High risk because student runtime, exam contracts, and grading all change together.

### One Recommended Outcome

- Proceed with **Option 2** and review each phase before implementation continues.

## To-Do Workflow

### Phase 1: Lock the Student Submit and Result Flow [COMPLETED]

- [x] Inspect the active student exam runtime and confirm the canonical route before coding:
    - [attempt/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx>)
    - related task docs still refer to `monitoring`, so route naming must be reconciled first
- [x] Replace the fake submit behavior with a real backend-backed completion flow tied to `exam_attempts`.
- [x] Decide whether the post-submit screen is:
    - a dedicated result page under the student exam flow, or
    - a controlled redirect into the existing history detail screen with `attemptId`
- [x] Show the student’s score summary in the final state using the real `score` and `total_score` values.
- [x] Add an explicit footer action for `Turn In` only if the runtime truly has a separate review-before-final-submit state.
- [x] Standardize status wording so the UI, API, and history pages do not mix `submit`, `submitted`, `turn_in`, and `turned_in` inconsistently.

### Phase 2: Harden Browser Security Within Real Browser Limits [COMPLETED]

- [x] Audit the current monitoring hook behavior in [use-exam-monitoring.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.ts>).
- [x] Treat `Alt + Tab` as focus-loss detection, not as a truly blockable shortcut.
- [x] Verify the focus-loss path consistently locks the exam when these events happen:
    - `visibilitychange`
    - `blur`
    - `fullscreenchange`
- [x] Align telemetry emission with the current web-security policy so incidents are logged only when the corresponding rule is enabled.
- [x] Decide whether the runtime should:
    - warn only,
    - lock until resume, or
    - auto-submit after repeated violations
- [x] Add focused tests for the monitoring hook and any backend flow changes triggered by runtime security.

### Phase 3: Redesign Exam Assignment for Multiple Sections [COMPLETED]

- [x] Confirm the intended business rule: one exam record shared across many sections, not duplicated exams per section.
- [x] Design the data-model change required for multi-section assignment because `exams` currently stores only one `section_id` and `section_name`.
- [x] Update shared contracts and API payloads from singular `section`/`sectionId` to a multi-section shape that still supports edit mode cleanly.
- [x] Redesign the create and update dialogs to use a grouped multi-select or checkbox layout similar to the offered-subject workflow.
- [x] Fetch selectable sections from the assigned/enrolled subject data source, limited to the chosen subject.
- [x] Ensure edit mode can prefill, diff, and persist multiple selected sections safely.
- [x] Add contract tests for create/update validation so the backend rejects invalid or empty multi-section submissions.

### Phase 4: Finalize Instructor Grading on Real Data

- [x] Replace `MOCK_GRADING_EXAMS` and `MOCK_GRADING_STUDENTS` usage with real queries.
- [x] Define the grading list around real exam attempts, scores, and submission states.
- [x] Add section-aware filtering for exams assigned to multiple sections.
- [x] Add instructor/proctor-aware filtering when different instructors handle different sections.
- [x] Confirm whether grading ownership follows:
    - exam creator only,
    - assigned proctor per section, or
    - both with scoped visibility
    Current implementation is `exam creator OR assigned proctor`, with visibility scoped at the exam level because `proctor_assignments` currently links by `exam_id` and does not yet model per-section assignment.
- [x] Update export behavior so Excel output respects the active filters and uses real score data.
- [x] Add backend coverage for grading queries if new endpoints or aggregations are introduced.

### Phase 5: Validation and Rollout Gate

- [x] Run focused web tests for student submit flow, runtime security, and grading views.
- [x] Run focused API tests for exam create/update contracts and attempt completion behavior.
- [ ] Verify these manual scenarios before merge:
    - single-section exam still works
    - multi-section create works
    - multi-section edit works
    - student submit shows the correct score state
    - focus-loss lock behaves predictably
    - grading can filter by section and instructor/proctor
- [ ] Capture any remaining design polish or analytics improvements as a separate follow-up, not inside the contract phases.

## Scope Guardrails

- Do not promise true browser blocking for `Alt + Tab`; implement reliable detection and enforcement instead.
- Do not patch the exam dialogs alone without updating shared schema, API payloads, and persistence rules.
- Do not finalize grading against mock data if the multi-section contract is still unresolved.
- Keep the submit/result flow aligned with the existing student history module unless a new result route is clearly justified.

## Suggested Build Order

1. Phase 1 and Phase 2 together, because runtime submit and security behavior share the same student attempt surface.
2. Phase 3 next, because grading depends on the final section-assignment contract.
3. Phase 4 after multi-section assignment is stable.
4. Phase 5 as the merge gate.

## Exit Criteria

- Student exam submission is real, reviewable, and shows a clear result state.
- Browser-security handling is explicit about what can be detected versus what cannot be blocked.
- Exam assignment supports multiple sections through real contracts, not UI-only workarounds.
- Instructor grading uses live data and can filter scores by section and instructor/proctor context.
