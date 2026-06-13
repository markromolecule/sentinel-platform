# Implementation Plan: Multiple Instructor Assignment, Avatars, and Room/Sections

This plan describes the enhancements to allow multiple instructors to be assigned to exams, display avatars, rooms, and sections on instructor assignments, and implement a premium multi-instructor selection UX.

## Task Summary
Enable multiple active proctor assignments per exam, enrich the instructor assignment list with user avatar icons, scheduled rooms, and section details, and replace the single-instructor select field with a searchable popover multi-select field displaying selected instructors as chips.

## Architectural Notes
- **Database Tables Touched**: `proctor_assignments`, `user_profiles`, `rooms`, `exam_assigned_sections`, `sections`.
- **Database Schema Migration**: No schema migration is required. The database schema already supports multiple proctor assignments per exam through multiple rows in the `proctor_assignments` join table.
- **Breaking API Changes**: None. We are extending existing responses with new optional properties and adding an optional `instructorIds` array field to the create form payload while retaining backward compatibility.

---

## Proposed Changes

### Phase 1: Shared Schema Enhancements

**Goal:** Extend validation schemas and default values to support multi-instructor form values and additional assignment details.

- [x] Modify [exam-assignment-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-assignment-schema.ts)
  - Add `avatarUrl` (nullable string) to `examAssignmentActorSchema`.
  - Add `roomName` (nullable string) and `sectionNames` (array of strings) to `examAssignmentExamSummarySchema`.
- [x] Modify [exam-create-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-create-schema.ts)
  - Add `instructorIds` as an optional string array to `examCreateFormSchema`.
- [x] Modify [exam-constants.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/constants/exams/exam-constants.ts)
  - Add `instructorIds: []` to the default values of `getExamCreateFormDefaults()`.
- [x] Run `pnpm --dir packages/shared test` or check schemas via unit tests.
  **Migration required:** No — schema models are unchanged, only validation/defaults are extended.

---

### Phase 2: Backend API Enhancements

**Goal:** Retrieve room, sections, and avatar data in the assignment query, and bypass the single-proctor assignment restriction.

- [x] Modify [get-exam-assignments.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/data/get-exam-assignments.ts)
  - Left join `rooms as r` on `r.room_id = e.room_id` and select `r.room_name as roomName`.
  - Select `assignee_profile.avatar_url as assigneeAvatarUrl` and `assigner_profile.avatar_url as assignerAvatarUrl`.
  - Query and aggregate assigned section names using a subquery to select `sectionNames` (similar to how `get-exams.ts` fetches assigned section names).
- [x] Modify [exam-assignment.types.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/exam-assignment.types.ts)
  - Add `avatarUrl` to `ExamAssignmentActorRecord`.
  - Add `roomName` and `sectionNames` to `ExamAssignmentExamRecord`.
- [x] Modify [map-exam-assignment.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/map-exam-assignment.ts)
  - Map `avatarUrl` in `assigner` and `assignee`.
  - Map `roomName` and `sectionNames` in `exam`.
- [x] Modify [get-exam-assignments.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/get-exam-assignments.ts)
  - Pass down the new query columns to `mapExamAssignment`.
- [x] Modify [create-exam-assignment.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/create-exam-assignment.ts)
  - Remove/comment out the `findConflictingExamAssignment` check to allow assigning an exam to multiple instructors.
- [x] Write integration test cases in `create-exam-assignment.test.ts` to assert that multiple instructors can be successfully assigned without conflicts.
- [x] Run `pnpm --dir app/sentinel-api test` and verify that all 800+ backend tests pass.
  **Migration required:** No.

---

### Phase 3: Frontend Table & Avatar Enhancements

**Goal:** Display room, section names, and instructor avatar images in the Instructor Assignment table.

- [x] Modify [columns.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/exams/assign/_components/columns.tsx)
  - Add `Room` column to show the exam room name.
  - Add `Sections` column to show all sections assigned to the exam (comma-separated).
  - Update `assignedInstructor` column to render `<Avatar>` with `<AvatarImage>` if `avatarUrl` is present, falling back to initials `<AvatarFallback>`.
- [x] Modify [assignment-table.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/exams/assign/_components/assignment-table.tsx)
  - Update `InstructorAssignmentRow` interface with `avatarUrl`, `roomName`, and `sectionNames`.
- [x] Modify [assignment-content.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/exams/assign/_components/assignment-content.tsx)
  - Map the new fields from `ApiExamAssignment` to `InstructorAssignmentRow`.
- [x] Run `pnpm --dir app/sentinel-core test` to verify table components render correctly.
  **Migration required:** No.

---

### Phase 4: Frontend Multi-Instructor Selection UX

**Goal:** Implement a premium searchable popover multi-select field on the creation form and submit assignments sequentially.

- [x] Modify [instructor-field.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields/instructor-field.tsx)
  - Replace `<Select>` dropdown with a searchable popover multi-select dropdown.
  - Display selected instructors as dismissible badge chips at the top of the field.
  - Highlight selected options with checked rows and checkboxes.
- [x] Modify [use-exam-create-form.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/config/_hooks/use-exam-create-form.ts)
  - Update form submit to check if `data.instructorIds` has items, and sequentialize calling `assignExamMutation.mutateAsync` for each selected instructor.
- [x] Modify [basic-info-fields.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields.test.tsx)
  - Update the mock form state and select element expectations for the new layout.
- [x] Run `pnpm --dir app/sentinel-core test` to ensure all 317+ core frontend tests pass.
  **Migration required:** No.

---

## Done Criteria

- [x] Multiple active proctor assignments can be created for the same exam.
- [x] Room and Section details appear in the Instructor Assignment table.
- [x] Instructors with an avatar image display their avatar URL on the table.
- [x] Multiple instructors can be selected on the "Create Exam" dialog via popover checkboxes and dismissed via chips.
- [x] All automated Vitest test runs pass in both `sentinel-api` and `sentinel-core` workspaces.
