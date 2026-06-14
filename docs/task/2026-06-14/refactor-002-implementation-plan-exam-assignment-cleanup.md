# Refactor Exam-Section Assignment Relationship

**Goal:** Clean up the duplicate assignment fields in the exam creation/editing flow and improve the assignment page UX to support batch multi-row assignments.

---

## Viable Options

### Option A — Frontend-only Refactor (Batch in Client)
Remove Section/Room/Instructor from the exam dialogs and allow multi-row assignments on the assign page. When saving multiple rows, the client makes concurrent `POST` requests to the existing single `POST /exams/:examId/section-assignments` endpoint using `Promise.all`.
* **Tradeoff:** Simplest implementation requiring zero backend route additions, but lacks transactional atomicity (some inserts can succeed while others fail).

### Option B — Add Batch API Endpoint & Refactor Dialogs (Recommended)
Remove legacy fields from the dialogs. Add a dedicated `POST /exams/:examId/section-assignments/batch` endpoint in `sentinel-api` to create multiple assignments atomically in a single transaction. Build a multi-row inline assignment interface on the Assign page using the new batch endpoint.
* **Tradeoff:** Highly robust, database-transactional, and offers a premium user experience, but requires modifications to both frontend and backend.

### Option C — Unified Dialog with Multi-step Form
Combine the exam properties and assignments into a single multi-step wizard dialog (Step 1: Exam Info, Step 2: Section/Room Assignments). Save the exam first, then save the assignments.
* **Tradeoff:** Elegant UX for initial creation, but introduces higher complexity for editing/re-assigning sections later, and bloats the dialog component.

**Best Option:** **Option B** is selected because it strictly aligns with the goal in the context document, solves the race conditions of concurrent API requests, and provides a clear separation of concerns by keeping assignments decoupled from the main exam metadata dialog.

---

## Pre-Planning Checklist

- [x] Read and summarize the task input in one sentence.
- [x] Scan relevant source files to understand existing patterns.
- [x] Identified all files, services, and DB tables the task will touch.
- [x] Determined if a Prisma migration is needed (No, columns are already nullable/optional).

---

## Files & DB Tables Touched

### Shared Package (`packages/shared`)
- `src/schema/exams/exam-create-schema.ts` — Modify validation schema to require `subjectId` and make classrooms/rooms/instructors optional.
- `src/schema/exams/exam-schema.ts` — Modify `createExamBodySchema` refinement rules to support creation without legacy classrooms/sections.
- `src/schema/exams/exam-section-assignment-schema.ts` — Add batch creation body schema (`createExamSectionAssignmentBatchBodySchema`).
- `src/schema/exams/index.ts` — Export new batch schemas.

### Services Package (`packages/services`)
- `src/api/exam-section-assignments.ts` — Add `createExamSectionAssignmentsBatch` API client function.

### Hooks Package (`packages/hooks`)
- `src/query/exam-section-assignments/use-create-exam-section-assignments-batch-mutation.ts` **[NEW]** — React Query hook for the batch endpoint.
- `src/query/exam-section-assignments/index.ts` — Export the new batch hook.

### API (`app/sentinel-api`)
- `src/modules/examination/exams/services/create-exam.ts` — Adapt to allow creating exams with only `subjectId` and no classroom/section.
- `src/modules/examination/exams/services/update-exam.ts` — Adapt update logic to support updating without legacy classroom/section fields.
- `src/modules/examination/section-assignments/section-assignments.dto.ts` — Add batch DTO schemas.
- `src/modules/examination/section-assignments/section-assignments.service.ts` — Add `createExamSectionAssignmentsBatch` service method.
- `src/modules/examination/section-assignments/controllers/create-exam-section-assignments-batch.controller.ts` **[NEW]** — Controller for the batch route.
- `src/modules/examination/section-assignments/section-assignments.route.ts` — Register batch route.

### sentinel-core (`app/sentinel-core`)
- `src/features/exams/_components/forms/fields/basic-info-fields.tsx` — Replace `ClassroomField` with a `SubjectField` dropdown.
- `src/features/exams/_components/forms/fields/schedule-fields.tsx` — Remove `RoomField`.
- `src/features/exams/config/_hooks/use-exam-create-form.ts` — Update hooks to pass `subjectId` and omit legacy classroom/room values.
- `src/features/exams/config/_hooks/use-exam-edit-form.ts` — Update hooks to edit `subjectId` and omit legacy fields.
- `src/app/(protected)/exams/assign/_components/assignment-content.tsx` — Update Assign page to manage multi-row assignments.
- `src/app/(protected)/exams/assign/_components/add-exam-section-assignment-dialog.tsx` — Replace/Refactor with inline rows or multi-row card.
- `src/app/(protected)/exams/assign/_components/assignment-table.tsx` — Adjust if necessary to reflect new states.

### sentinel-web (`app/sentinel-web`)
- `src/features/exams/_components/forms/fields/basic-info-fields.tsx` — Remove `ClassroomField` and add `SubjectField` dropdown.
- `src/features/exams/_components/forms/fields/schedule-fields.tsx` — Remove `RoomField`.
- `src/features/exams/config/_hooks/use-exam-create-form.ts` — Update schema defaults and submission payload.
- `src/features/exams/config/_hooks/use-exam-edit-form.ts` — Update schema defaults and submission payload.

---

## Phase 1: Shared Schema & API Updates

**Goal:** Modify the shared schemas and create the batch assignment endpoint in the API.

> **Migration required:** No. Legacy fields `class_group_id`, `section_id`, and `room_id` on the `exams` table are already nullable and can remain in the DB to avoid breaking changes, but will be ignored by the forms.

- [x] In [exam-create-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-create-schema.ts), update `examCreateFormSchema`:
    - Add `subjectId: z.string().uuid({ message: 'Select a valid subject.' })`
    - Change `classroomIds` to be optional: `z.array(z.string().uuid()).optional()`
- [x] In [exam-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-schema.ts), update `createExamBodySchema` refinement rules:
    - Allow validation to pass when `subjectId` is provided, even if `classroomId` or legacy section fields are absent.
- [x] In [exam-section-assignment-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-section-assignment-schema.ts), add `createExamSectionAssignmentBatchBodySchema`:
    ```typescript
    export const createExamSectionAssignmentBatchBodySchema = z.object({
        assignments: z.array(createExamSectionAssignmentBodySchema),
    });
    ```
- [x] In [exam-section-assignments.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/exam-section-assignments.ts), implement `createExamSectionAssignmentsBatch`:
    - Perform a `POST` request to `/exams/${examId}/section-assignments/batch`.
- [x] In `sentinel-api`, create [create-exam-section-assignments-batch.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/section-assignments/controllers/create-exam-section-assignments-batch.controller.ts) **[NEW]**:
    - Build route and handler using `createExamSectionAssignmentBatchBodySchema`.
- [x] In [section-assignments.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/section-assignments/section-assignments.service.ts), add `createExamSectionAssignmentsBatch` method:
    - Execute a bulk insert in the database inside a transaction.
- [x] In [section-assignments.route.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/section-assignments/section-assignments.route.ts), register the `batch` route.
- [x] Write integration test [batch-assignments.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/section-assignments/tests/batch-assignments.test.ts) **[NEW]** to verify bulk assignment creation and conflict rejection.

---

## Phase 2: Exam Creation API Alignment

**Goal:** Modify the exam creation service to support exams created with only a `subjectId` and no initial classroom/section mapping.

- [x] In [create-exam.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/create-exam.ts):
    - Update `createExam` to handle optional `classroomId`. If absent, skip `resolveInstructorExamAssignmentTargets` and resolve only `subjectId` directly from the body.
- [x] In [update-exam.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/update-exam.ts):
    - Align update logic to handle nullable classroom/section/room fields.
- [x] Run Vitest tests on `sentinel-api` exams module: `pnpm --dir app/sentinel-api test` and verify success.

---

## Phase 3: Forms Refactoring (`sentinel-core` & `sentinel-web`)

**Goal:** Remove legacy section/classroom/room assignment fields from the exam create/edit forms.

- [x] In `sentinel-core` and `sentinel-web` [basic-info-fields.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields.tsx):
    - Import and query subjects using `useSubjectsQuery`.
    - Replace `ClassroomField` with a dropdown Select field for `subjectId`.
- [x] In `sentinel-core` and `sentinel-web` [schedule-fields.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/schedule-fields.tsx):
    - Remove the `RoomField` component from the form layout.
- [x] In `sentinel-core` and `sentinel-web` [use-exam-create-form.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/config/_hooks/use-exam-create-form.ts):
    - Update schema resolvers to handle the new `subjectId` field.
    - Set payload fields to only submit intrinsic properties (remove `roomId`, `classroomId`, `sectionIds`).
- [x] In `sentinel-core` and `sentinel-web` [use-exam-edit-form.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/config/_hooks/use-exam-edit-form.ts):
    - Update defaults and updates to bind directly to `subjectId` and exclude `roomId`, `classroomId`, `sectionIds`.
- [x] Run Vitest tests for the form hooks to ensure metadata builds correctly.

---

## Phase 4: Upgrade Assignment UX (`sentinel-core`)

**Goal:** Implement the multi-row inline section assignment UI on the admin assign page.

- [x] Create [use-create-exam-section-assignments-batch-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/exam-section-assignments/use-create-exam-section-assignments-batch-mutation.ts) **[NEW]** in `packages/hooks`.
- [x] In `sentinel-core` [assignment-content.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/exams/assign/_components/assignment-content.tsx):
    - Replace `AddExamSectionAssignmentDialog` with an inline panel/section that allows the admin to dynamically add, edit, and remove assignment rows (Section, Room, Instructor, Date & Time).
    - Provide a "Save Assignments" button that triggers the new batch mutation.
    - Provide a validation warning if a duplicate section is selected across rows.
- [x] Run the Turborepo dev/build commands to verify type safety and layout: `pnpm build`.
- [x] Write component tests in `sentinel-core` [exam-section-assignment-list.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/exams/assign/_components/exam-section-assignment-list.test.tsx) verifying the new multi-row assignment layout.

---

## Done Criteria

- [x] Exam create/edit dialogs in `sentinel-core` and `sentinel-web` only prompt for `title`, `description`, `subject`, `duration`, `passingScore`, and schedule dates.
- [x] `POST /exams/:examId/section-assignments/batch` API endpoint is implemented and covered by unit tests.
- [x] Admins can add multiple section assignments inline on the `sentinel-core` assign page and submit them all at once.
- [x] No compilation or TypeScript errors exist in the monorepo.
- [x] All Vitest suites pass successfully.
