# feat-005 — Replicate Exams and Assignments Features to sentinel-web

**Summary:** Replicate the exam dashboard improvements and section assignments features from the administrator portal (`sentinel-core`) to the instructor portal (`sentinel-web`). This includes rendering visibility badges (Public vs Private), displaying assigned rooms/instructors/creators on the exam cards/list items, adding the public toggle during creation/editing, and migrating the interactive `/exams/assign` management interface.

---

## Viable Options

> Applies to how we replicate the assign page components in `sentinel-web`.

### Option A — Full Replicated Components (Recommended)

Copy the `types.ts`, `row-instructor-combobox.tsx`, `new-assignments-builder.tsx`, `add-exam-section-assignment-dialog.tsx`, and `exam-section-assignment-list.tsx` from `sentinel-core` to `sentinel-web`, and refactor `assignment-content.tsx` to mount them.

- **Tradeoff:** Ensures exact parity between the two apps and preserves all features, but requires copying a few layout files. Since both apps consume the same packages (`@sentinel/hooks`, `@sentinel/ui`), all copied components will immediately compile and run.

### Option B — Shared Component Package extraction

Move the exam assign components from `sentinel-core` to `packages/ui` or a shared feature workspace.

- **Tradeoff:** Cleanest DRY approach, but adds significant configuration overhead for routing/hooks imports within packages, which currently contains mostly presentation-only components.

**Selected Option: Option A** is selected to avoid leaking routing and query hooks logic into the presentation-focused `packages/ui` workspace while ensuring feature parity between core and web workspaces.

---

## Pre-Planning Checklist

- [x] Read and summarize the task input in one sentence
- [x] Scan relevant source files to understand existing patterns
- [x] Identify all files, services, and DB tables the task will touch
- [x] Determine if a Prisma migration is needed (No — schema changes are already applied globally)

---

## Proposed Changes

---

### Phase 1: Replicate Exam Cards & List Item Details

**Goal:** Display visibility badges (Public/Private), assigned rooms, assigned instructors, and creator/publisher details on the exam cards and list items in the instructor dashboard.

**Migration required:** No.

- [x] Modify [exam-card-body.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/cards/exam-card/exam-card-body.tsx):
    - Replace legacy `exam.room` mapping with `exam.assignedRoomNames` (comma-separated).
    - Add an Instructor row utilizing `exam.assignedInstructorNames` (comma-separated).
    - Add creator/publisher line (`Draft by {createdByName}` / `Published by {publishedByName}` / `Created by {createdByName}`).
- [x] Modify [exam-card-header.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/cards/exam-card/exam-card-header.tsx):
    - Render `Globe` (Public) / `Lock` (Private) badges based on `exam.isPublic`.
- [x] Modify [exam-list-item.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/cards/exam-list-item.tsx):
    - Add Globe/Lock visibility badges.
    - Render `assignedRoomNames` and `assignedInstructorNames` instead of legacy single fields.
    - Render creator/publisher line.
- [x] Write co-located Vitest component tests to assert rooms/instructors render correctly or fall back to `–` when empty.

---

### Phase 2: Add Public Toggle to Creation Form

**Goal:** Enable instructors to toggle whether an exam is public or private.

**Migration required:** No.

- [x] Modify [basic-details-fields.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields/basic-details-fields.tsx):
    - Add the `isPublic` Switch toggle from `sentinel-core`.
- [x] Verify form submission schema and payload in `use-exam-create-form.ts` and `use-exam-edit-form.ts` to ensure `isPublic` is mapped.

---

### Phase 3: Replicate Assignment Management Interface

**Goal:** Replace the legacy read-only assignment table on the `/exams/assign` route with the interactive assignment selection and management components.

**Migration required:** No.

- [x] Create [types.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/types.ts>) **[NEW]**:
    - Port the `AssignmentRow` interface.
- [x] Create [row-instructor-combobox.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/row-instructor-combobox.tsx>) **[NEW]**:
    - Port the instructor search and combobox element.
- [x] Create [new-assignments-builder.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/new-assignments-builder.tsx>) **[NEW]**:
    - Port the multi-row assignment layout and batch mutation triggers.
- [x] Create [add-exam-section-assignment-dialog.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/add-exam-section-assignment-dialog.tsx>) **[NEW]**:
    - Port the dialog wrapper.
- [x] Create [exam-section-assignment-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/exam-section-assignment-list.tsx>) **[NEW]**:
    - Port the data table listing classroom/room/instructor assignments.
- [x] Modify [assignment-content.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/assignment-content.tsx>):
    - Replace the old list layout with the exam selection dropdown header and management sub-components.
- [x] Delete [assignment-table.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/assignment-table.tsx>) **[DELETE]** and [columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/columns.tsx>) **[DELETE]**.
- [x] Create co-located component tests in [exam-section-assignment-list.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/exam-section-assignment-list.test.tsx>) **[NEW]** to assert correct lists load and actions function.

---

## Verification Plan

### Automated Tests

- Run tests in `sentinel-web`:
    ```bash
    pnpm --dir app/sentinel-web test
    ```
- Run formatting and linting:
    ```bash
    pnpm format:check && pnpm lint
    ```

### Manual Verification

1. Navigate to `/exams` in `sentinel-web` and verify that exam cards display correct visibility badges, comma-separated assigned rooms/instructors (or `–` when empty), and creator names.
2. Open the edit dialog on an exam and verify that the "Public Exam" switch exists and updates the setting.
3. Click "Share / Assign" on an exam or navigate to `/exams/assign` to verify that you can select an exam, see its assigned classrooms, and add new ones via the batch assignments builder dialog.
