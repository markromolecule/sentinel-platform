# Context: Administrator UI Improvements — June 14

## Scope

Improvements targeting `sentinel-core` (admin/superadmin portal, port `3002`)
and the `sentinel-web` app (student/instructor portal, port `3000`).

---

## 1. `sentinel-core` — Collection Page: Show Author on Card

### Location

`app/sentinel-core/src/app/(protected)/question/bank/collections/_components/views/collection-card.tsx`

### Problem

The `CollectionCard` component renders a collection's `name`, `lastUpdated`, `questionCount`, and `isPublic` flag — but **no author information**.

The `question_bank_collections` Prisma model has a `created_by` field (UUID FK → `users`) and a resolved `users` relation (aliased as `question_bank_collections_created_byTousers`). The author name must be resolved from `user_profiles` (`first_name`, `last_name`).

### What Needs to Change

1. **Type** — `Collection` interface in `_types/index.ts` is missing an `author` field.
   Add: `author?: string | null` (display name, e.g. `"John Doe"`).

2. **Data layer** — Wherever collections are fetched (query hook or server action),
   join `user_profiles` on `created_by` and include `first_name + last_name` in the response.

3. **UI** — In `CollectionCard`, render the author name below the collection name
   (e.g., small muted text: `"By John Doe"`). If `author` is `null`/`undefined`, render nothing or a fallback (`"Unknown"`).

---

## 2. `sentinel-core` — Support Sidebar: Add Separator Below "Classrooms"

### Location

`app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts`
`app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.tsx`

### Problem

The `CORE_ADMIN_NAV_DEFINITIONS` array groups **Classrooms**, **Exams**, and **Question Bank** together inside a single `"Management"` section. There is no visual separator between the Classroom entry and the academic-tool entries (Exams, Question Bank), so they all appear merged in the sidebar.

### What Needs to Change

Split the `"Management"` section into two distinct sections in `CORE_ADMIN_NAV_DEFINITIONS`:

- **Section A — "Management"** (institutional data): Sections, Subjects, Programs, Classrooms
- **Section B — "Academics"** (or keep "Management"): Exams, Question Bank

The `showSeparator: true` flag on each section already causes `<SidebarSeparator />` to render between sections in `core-admin-sidebar.tsx`. Splitting the definition array is sufficient — no changes needed to the sidebar renderer itself.

> **Note:** The sidebar renderer (`core-admin-sidebar.tsx`) maps over `visibleNavigationSections` and renders `<SidebarSeparator />` between sections when `showSeparator` is `true` and the section is not the last one. This behaviour is already correct.

---

## 3. `sentinel-core` — Remove Icons from Exam Page and Question Bank Sidebar Layouts

### Location

- Exam workspace shell: `app/sentinel-core/src/app/(protected)/exams/_components/layout/`
- Question Bank workspace shell: `app/sentinel-core/src/app/(protected)/question/_components/layout/question-bank-nav.tsx`
- Question Bank nav items use `Database`, `LayoutGrid`, `BarChart3` icons from `lucide-react`

### Problem

The **local sub-navigation sidebars** for the Exam page and Question Bank (the inner panels rendered by `ExamsWorkspaceShell` and `QuestionBankWorkspaceShell`) display icons on each nav link. The request is to **remove these icons** from the local layout navigation — not from the top-level `CoreAdminSidebar`.

### What Needs to Change

In `question-bank-nav.tsx`, each `QuestionBankNavItem` has an `icon: ElementType` field rendered as `<item.icon className="h-4 w-4 shrink-0" />`. Remove the icon render call and optionally the icon field from the nav item definitions.

Apply the same pattern to any icon rendering inside the Exams workspace layout nav.

---

## 4. `sentinel-core` & `sentinel-web` — Exam Assignment: Linking Rooms, Instructors, and Sections

### Background & Current Schema

The `exams` Prisma model (schema: `packages/db/prisma/schema.prisma`) currently supports:

| Field                 | Purpose                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `section_id`          | Single FK → `sections` (legacy, single-section assignment)            |
| `room_id`             | FK → `rooms` (single room per exam)                                   |
| `class_group_id`      | FK → `class_groups`                                                   |
| `assigned_sections`   | Relation → `exam_assigned_sections[]` (junction table, many sections) |
| `proctor_assignments` | Relation → `proctor_assignments[]` (many instructors per exam)        |

The `exam_assigned_sections` junction model:

```
exam_id    String @db.Uuid  → exams
section_id String @db.Uuid  → sections
```

The `proctor_assignments` model:

```
exam_id       String @db.Uuid  → exams
instructor_id String @db.Uuid  → users
scheduled_at  DateTime?
status        proctor_assignment_status (SCHEDULED | ...)
```

### Problem Statement

A single exam is authored once but must be **distributed to multiple sections**, each section occupying a specific **room**, supervised by a specific **instructor**. The current schema partially supports this via `exam_assigned_sections` and `proctor_assignments`, but the assignment model does not yet link a **section ↔ room ↔ instructor** as a single atomic assignment record.

### Design Question to Resolve

Should the system introduce a new model — e.g. `exam_section_assignments` — that ties together `(exam_id, section_id, room_id, instructor_id)` as one record? This would represent:

> "This exam will be taken by Section A, in Room 101, proctored by Instructor X."

**One exam → many `exam_section_assignments`** (one per Section/Room/Instructor combination).

#### Proposed Model (for discussion)

```prisma
model exam_section_assignments {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  exam_id       String    @db.Uuid
  section_id    String    @db.Uuid
  room_id       String?   @db.Uuid
  instructor_id String?   @db.Uuid
  scheduled_at  DateTime? @db.Timestamptz(6)
  created_at    DateTime? @default(now()) @db.Timestamptz(6)

  exams       exams       @relation(fields: [exam_id], references: [exam_id], onDelete: Cascade)
  sections    sections    @relation(fields: [section_id], references: [section_id], onDelete: Cascade)
  rooms       rooms?      @relation(fields: [room_id], references: [room_id])
  instructors users?      @relation(fields: [instructor_id], references: [id])

  @@unique([exam_id, section_id])
  @@schema("public")
}
```

#### End-user Flow (to plan)

1. Admin creates an exam in `sentinel-core` (currently works).
2. Admin opens an "Assign" view and selects one or more sections.
3. For each section, the admin optionally picks a room and an instructor.
4. Records are saved as `exam_section_assignments`.
5. The exam becomes visible to students in the assigned sections via `sentinel-web`.
6. The assigned instructor sees the exam in their proctor queue.

#### Design Decision (Confirmed)

The requirement is: **one exam can be assigned to many (Section, Room, Instructor) combinations**.

Each assignment record represents:

> "Exam X will be taken by **Section A**, held in **Room 101**, proctored by **Instructor Y**."

This is a clean one-to-many: `exams` → `exam_section_assignments[]`.

The proposed `exam_section_assignments` table (above) satisfies this directly. The existing
`exam_assigned_sections` (section-only junction) and `proctor_assignments` (instructor-only junction)
are **superseded** by this new table — they should be treated as legacy and replaced, since the new
table captures section + room + instructor in one atomic record.

#### Implications

- **Student visibility** (`sentinel-web`): a student's exam list is derived by looking up their
  `section_id` against `exam_section_assignments.section_id`.
- **Instructor queue** (`sentinel-web` / `sentinel-core`): an instructor's assigned exams are found
  by matching their `user_id` against `exam_section_assignments.instructor_id`.
- **Room usage**: admins can see which rooms are occupied per scheduled exam by reading
  `exam_section_assignments` joined to `rooms`.
- The `exams.section_id` (legacy single FK) and `exams.room_id` fields can be deprecated once
  all reads/writes migrate to `exam_section_assignments`.
