# feat-001 — Administrator UI Improvements

**Summary:** Implement four improvements to `sentinel-core` and `sentinel-api`:
show the collection author on the Collection card; add a sidebar separator between
Classrooms and Exams/Question Bank; remove icons from the Exam and Question Bank
local nav; and introduce an `exam_section_assignments` table plus API to let a
single exam be assigned to many (Section, Room, Instructor) combinations.

---

## Viable Options

> Applies to the exam assignment feature (improvement 4), which is the only
> architecturally significant item.

### Option A — Extend the existing `exam_assigned_sections` table

Add `room_id` and `instructor_id` nullable columns directly to
`exam_assigned_sections`.

**Tradeoff:** Fast migration, zero new table, but mixes concerns and leaves
`proctor_assignments` as a zombie table that still needs cleanup.

### Option B — New `exam_section_assignments` table (replaces both junction tables)

Introduce one atomic `(exam_id, section_id, room_id, instructor_id)` record.
Deprecate `exam_assigned_sections` and `proctor_assignments` at the same time.

**Tradeoff:** Clean design with clear ownership; requires migration of any
existing data and updates to all API call-sites that read those tables.

### Option C — Leave schema unchanged; join in the service layer

Keep both tables; resolve section+room+instructor at query time via a composite
JOIN in the API service.

**Tradeoff:** No migration needed, but query logic becomes complex and
assignment atomicity is not enforced at the DB level.

**Best Option: B** — The requirement explicitly states one atomic record per
(section, room, instructor) tuple. Option B models that exactly, is consistent
with the existing junction-table pattern in the codebase, and eliminates the
ambiguity of maintaining two separate tables. No new dependencies are required.

---

## Pre-Planning Checklist

- [x] Summarized task input in one sentence
- [x] Scanned relevant source files
- [x] Identified all files, services, and DB tables the task will touch
- [x] Determined Prisma migration is required (improvement 4 only)

---

## Files & DB Tables Touched

### Prisma schema

- `packages/db/prisma/schema.prisma` — add `exam_section_assignments` model

### Shared package (`packages/shared`)

- `src/schema/exams/question-bank-schema.ts` — `createdBy` field already exists; no change needed
- `src/schema/exams/exam-section-assignment-schema.ts` **[NEW]** — Zod schema for the new table

### Services package (`packages/services`)

- `src/api/question-bank.ts` — expose `createdBy` through `QuestionBankCollectionRecord`
- `src/api/exam-section-assignments.ts` **[NEW]** — API call functions for the new resource

### Hooks package (`packages/hooks`)

- `src/query/question-bank/use-question-bank-collections-query.ts` — already wires through; no change
- `src/query/exam-section-assignments/` **[NEW]** — query + mutation hooks

### API (`app/sentinel-api`)

- `src/modules/content/question-bank/services/map-question-bank-collection-response.ts` — already maps `createdBy`; verified correct
- `src/modules/examination/section-assignments/` **[NEW]** — controller, DTO, service, data layer
- `src/modules/examination/section-assignments/section-assignments.route.ts` **[NEW]**

### sentinel-core (`app/sentinel-core`)

- `src/app/(protected)/question/bank/collections/_types/index.ts` — add `author` field to `Collection`
- `src/app/(protected)/question/bank/collections/_hooks/use-collection-management.ts` — map `createdBy` → `author`
- `src/app/(protected)/question/bank/collections/_components/views/collection-card.tsx` — render author
- `src/components/sidebar/common/core-admin-nav-config.ts` — split "Management" section
- `src/app/(protected)/question/_components/layout/question-bank-nav.tsx` — remove icons
- `src/app/(protected)/exams/_components/layout/exams-nav.tsx` — remove icons
- `src/app/(protected)/exams/assign/_components/` — new or updated UI for section assignments

---

## Phase 1: Collection Card — Show Author

**Goal:** Surface the `createdBy` display name already returned by the API onto the `CollectionCard` UI.

> **Migration required:** No — the data access layer (`get-question-bank-collections.ts`) already joins `user_profiles` and `map-question-bank-collection-response.ts` already sets `createdBy` as a resolved display name. The API response schema (`questionBankCollectionSchema`) already includes `createdBy: z.string().nullable()`. The service layer (`QuestionBankCollectionRecord` in `packages/services/src/api/question-bank.ts`) also already includes `createdBy`. The data flows end-to-end; only the frontend is missing the field.

- [x] Add `author?: string | null` to the `Collection` interface in
      `app/sentinel-core/src/app/(protected)/question/bank/collections/_types/index.ts`

- [x] In `use-collection-management.ts` (`_hooks/use-collection-management.ts`),
      map `collection.createdBy` to `author` inside `mappedCollections` in `useStableValue`

- [x] In `collection-card.tsx`, render `author` below the collection name as
      `"By {author}"` with muted text. Only render when `author` is non-null.
      Also update `collection-list-item.tsx` (`_components/views/collection-list-item.tsx`)
      if the list view renders cards separately.

- [x] Write unit tests in
      `app/sentinel-core/src/app/(protected)/question/bank/collections/_components/views/collection-card.test.tsx` **[NEW]**
      asserting author renders when provided and is absent when null.

---

## Phase 2: Sidebar Separator Below Classrooms

**Goal:** Visually separate Classrooms from Exams/Question Bank in the `sentinel-core` admin sidebar.

> **Migration required:** No.

- [x] In `core-admin-nav-config.ts`
      (`app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts`),
      split the `"Management"` section in `CORE_ADMIN_NAV_DEFINITIONS` into two sections:
    - `"Management"` — Sections, Subjects, Programs, Classrooms (`showSeparator: true`)
    - `"Academics"` — Exams, Question Bank (`showSeparator: true`)

    The sidebar renderer (`core-admin-sidebar.tsx`) already handles `showSeparator`
    and renders `<SidebarSeparator />` between sections automatically.

- [x] Verify that `getCoreAdminNavigationSections` and `buildDefaultNavigationForRole`
      functions still pass all existing tests in
      `core-admin-sidebar.test.tsx`
      (`app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.test.tsx`).
      Update test assertions for section count/labels as needed.

- [x] Ensure the new `"Academics"` section label maps correctly in any role-capability
      lookup (`core-admin-capability-map.ts` in `src/lib/authorization/`) — no new `pageId`
      values are introduced, only section grouping changes.

---

## Phase 3: Remove Icons from Exam and Question Bank Local Nav

**Goal:** Strip the icon elements from the inner workspace navigation of the Exam and Question Bank pages.

> **Migration required:** No.

- [x] In `question-bank-nav.tsx`
      (`app/sentinel-core/src/app/(protected)/question/_components/layout/question-bank-nav.tsx`):
    - Remove `icon: ElementType` from the `QuestionBankNavItem` type
    - Remove `icon` values from all items in `QUESTION_BANK_NAV_GROUPS`
    - Remove `<item.icon className="h-4 w-4 shrink-0" />` from the JSX render block
    - Remove unused `lucide-react` imports (`Database`, `LayoutGrid`, `BarChart3`)

- [x] In `exams-nav.tsx`
      (`app/sentinel-core/src/app/(protected)/exams/_components/layout/exams-nav.tsx`):
    - Remove `icon: ElementType` from the `ExamNavItem` type
    - Remove `icon` values from all items in `EXAM_NAV_GROUPS`
    - Remove `<item.icon className="h-4 w-4 shrink-0" />` from the JSX render block
    - Remove unused `lucide-react` imports (`LayoutDashboard`, `UserCheck`, `ClipboardCheck`, `ShieldAlert`)

- [x] Update `question-bank-nav.test.tsx`
      (`app/sentinel-core/src/app/(protected)/question/_components/layout/question-bank-nav.test.tsx`)
      to assert icons are NOT rendered in nav links.

- [x] Update `exams-nav.test.tsx`
      (`app/sentinel-core/src/app/(protected)/exams/_components/layout/exams-nav.test.tsx`)
      to assert icons are NOT rendered in nav links.

---

## Phase 4: Exam Section Assignments — Schema & Migration

**Goal:** Introduce the `exam_section_assignments` table in the Prisma schema and apply the migration.

> **Migration required:** Yes — new table added.  
> **Rollback:** `prisma migrate reset` (dev) or drop table `exam_section_assignments` (prod).

- [x] Add the following model to `packages/db/prisma/schema.prisma`:

    ```prisma
    model exam_section_assignments {
      id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
      exam_id       String    @db.Uuid
      section_id    String    @db.Uuid
      room_id       String?   @db.Uuid
      instructor_id String?   @db.Uuid
      scheduled_at  DateTime? @db.Timestamptz(6)
      created_at    DateTime? @default(now()) @db.Timestamptz(6)
      updated_at    DateTime? @db.Timestamptz(6)

      exams       exams     @relation(fields: [exam_id], references: [exam_id], onDelete: Cascade)
      sections    sections  @relation(fields: [section_id], references: [section_id], onDelete: Cascade)
      rooms       rooms?    @relation(fields: [room_id], references: [room_id])
      instructor  users?    @relation("exam_section_assignments_instructor", fields: [instructor_id], references: [id])

      @@unique([exam_id, section_id])
      @@index([exam_id])
      @@index([section_id])
      @@index([instructor_id])
      @@schema("public")
    }
    ```

    Also add the back-relation on the `exams`, `sections`, `rooms`, and `users` models:
    - `exams`: `exam_section_assignments exam_section_assignments[]`
    - `sections`: `exam_section_assignments exam_section_assignments[]`
    - `rooms`: `exam_section_assignments exam_section_assignments[]`
    - `users`: `exam_section_assignments exam_section_assignments[] @relation("exam_section_assignments_instructor")`

- [x] Run `pnpm --dir packages/db exec prisma migrate dev --name add-exam-section-assignments`
      and verify the generated SQL before applying.

- [x] Write a migration smoke test in
      `app/sentinel-api/src/modules/examination/section-assignments/tests/migration-smoke.test.ts` **[NEW]**
      asserting the table exists and the unique constraint is enforced.

---

## Phase 5: Exam Section Assignments — API (sentinel-api)

**Goal:** Expose CRUD endpoints for `exam_section_assignments` from the API.

> **Migration required:** No (schema applied in Phase 4).

- [x] Create Zod schema in
      `packages/shared/src/schema/exams/exam-section-assignment-schema.ts` **[NEW]**:
    - `examSectionAssignmentSchema` — response shape (id, examId, sectionId, roomId, instructorId, scheduledAt, createdAt, updatedAt)
    - `createExamSectionAssignmentBodySchema` — body: `{ sectionId, roomId?, instructorId?, scheduledAt? }`
    - `updateExamSectionAssignmentBodySchema` — body: all fields optional
    - Export types: `ExamSectionAssignment`, `CreateExamSectionAssignmentBody`, `UpdateExamSectionAssignmentBody`
    - Export from `packages/shared/src/schema/exams/index.ts` (or the shared index)

- [x] Create data-access functions in
      `app/sentinel-api/src/modules/examination/section-assignments/data/`:
    - `get-exam-section-assignments.ts` — fetch all assignments for an `examId`, joining `sections`, `rooms`, `user_profiles`
    - `create-exam-section-assignment.ts` — insert record; enforce unique `(exam_id, section_id)`
    - `update-exam-section-assignment.ts` — patch `room_id`, `instructor_id`, `scheduled_at` by `id`
    - `delete-exam-section-assignment.ts` — delete by `id`, scoped to `exam_id`

- [x] Create service in
      `app/sentinel-api/src/modules/examination/section-assignments/section-assignments.service.ts` **[NEW]**
      delegating to the data-access functions above.

- [x] Create DTO/response schemas in
      `app/sentinel-api/src/modules/examination/section-assignments/section-assignments.dto.ts` **[NEW]**
      using the shared Zod schemas.

- [x] Create controllers in
      `app/sentinel-api/src/modules/examination/section-assignments/controllers/`:
    - `get-exam-section-assignments.controller.ts` **[NEW]**
    - `create-exam-section-assignment.controller.ts` **[NEW]**
    - `update-exam-section-assignment.controller.ts` **[NEW]**
    - `delete-exam-section-assignment.controller.ts` **[NEW]**

- [x] Register routes in
      `app/sentinel-api/src/modules/examination/section-assignments/section-assignments.route.ts` **[NEW]**
      under the path prefix `/exams/:examId/section-assignments`.
      Register the route in the parent examination router.

- [x] Write Vitest tests in
      `app/sentinel-api/src/modules/examination/section-assignments/tests/section-assignments.test.ts` **[NEW]**
      covering: create (success, duplicate section conflict), get, update, delete.

---

## Phase 6: Exam Section Assignments — Frontend (`sentinel-core`)

**Goal:** Wire the new API into the sentinel-core Assign view so admins can link sections, rooms, and instructors to an exam.

> **Migration required:** No.

- [x] Add `getExamSectionAssignments`, `createExamSectionAssignment`,
      `updateExamSectionAssignment`, `deleteExamSectionAssignment` to
      `packages/services/src/api/exam-section-assignments.ts` **[NEW]**
      following the same pattern as `packages/services/src/api/question-bank.ts`.

- [x] Add React Query hooks in
      `packages/hooks/src/query/exam-section-assignments/`:
    - `use-exam-section-assignments-query.ts` **[NEW]**
    - `use-create-exam-section-assignment-mutation.ts` **[NEW]**
    - `use-update-exam-section-assignment-mutation.ts` **[NEW]**
    - `use-delete-exam-section-assignment-mutation.ts` **[NEW]**
    - `index.ts` — barrel export **[NEW]**

- [x] Export all new hooks from `packages/hooks/src/index.ts`.

- [x] Build the assignment UI in
      `app/sentinel-core/src/app/(protected)/exams/assign/_components/`:
    - `exam-section-assignment-list.tsx` **[NEW]** — table of current assignments
    - `add-exam-section-assignment-dialog.tsx` **[NEW]** — form: Section select, Room select (optional), Instructor select (optional), scheduled date/time
    - Wire into the existing `/exams?view=assign` route (`ExamsDashboardClient` or a new assign-specific page component)

- [x] Write component tests in
      `app/sentinel-core/src/app/(protected)/exams/assign/_components/exam-section-assignment-list.test.tsx` **[NEW]**
      asserting list renders, add dialog opens, and delete triggers the mutation.

---

## Done Criteria

- [x] `CollectionCard` renders the author name sourced from the API `createdBy` field
- [x] A `<SidebarSeparator />` visually separates Classrooms from Exams in the admin sidebar
- [x] Exam and Question Bank local nav links contain no icons
- [x] `exam_section_assignments` migration applied and verified
- [x] `GET|POST /exams/:examId/section-assignments` and `PATCH|DELETE /exams/:examId/section-assignments/:id` are live
- [x] Admin can assign sections + optional room + optional instructor to an exam in `sentinel-core`
- [x] All new and modified test files pass with `pnpm test`
- [x] `pnpm lint` passes across all workspaces
