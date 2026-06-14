# Context: Confusion in Exam-Assignment Relationship

**Date:** 2026-06-14
**Affects:** `sentinel-core`, `sentinel-web`

---

## Problem Summary

There is a **responsibility overlap** between the exam creation dialog and the `/exams?view=assign` assignment page. Both currently handle the relationships between:

- **Sections** (`sections` table via `section_id` on `exams`)
- **Rooms** (`rooms` table via `room_id` on `exams`)
- **Instructors/Proctors** (`users` via `proctor_assignments`)

This creates two sources of truth, confusing admins and developers alike.

---

## Current Architecture

### Data Model (`packages/db/prisma/schema.prisma`)

The `exams` table has **legacy inline FK columns** that tie one exam directly to a single section/room:

```prisma
model exams {
  exam_id    String   @id
  section_id String?  @db.Uuid   // legacy: one section directly on the exam
  room_id    String?  @db.Uuid   // legacy: one room directly on the exam
  ...
  exam_section_assignments  exam_section_assignments[]  // new: proper one-to-many
  proctor_assignments       proctor_assignments[]
}
```

The **new join table** properly models the one-to-many relationship:

```prisma
model exam_section_assignments {
  id            String    @id
  exam_id       String    @db.Uuid   // FK → exams.exam_id
  section_id    String    @db.Uuid   // FK → sections.section_id
  room_id       String?   @db.Uuid   // FK → rooms.room_id  (optional)
  instructor_id String?   @db.Uuid   // FK → users.id       (optional)
  scheduled_at  DateTime? @db.Timestamptz(6)

  @@unique([exam_id, section_id])  // one section can only be assigned once per exam
}
```

This means **one exam → many `exam_section_assignments`**, each representing:
```
1 exam → instructor A → section A → room A
       → instructor B → section B → room B
```

### sentinel-core: Existing Assignment Page

**Route:** `/exams?view=assign`
**Entry component:** `app/sentinel-core/src/app/(protected)/exams/assign/_components/assignment-content.tsx`

The page currently:
1. Shows a dropdown to pick an active exam (`useExamsQuery`)
2. Lists existing `exam_section_assignments` for the selected exam (`useExamSectionAssignmentsQuery`)
3. Opens `AddExamSectionAssignmentDialog` to add a new assignment (section + optional room + optional instructor + optional schedule)

**Key files:**

| File | Role |
|---|---|
| `assignment-content.tsx` | Page shell — exam selector + assignment list card |
| `add-exam-section-assignment-dialog.tsx` | Dialog: select section, room, instructor, scheduledAt → calls `useCreateExamSectionAssignmentMutation` |
| `exam-section-assignment-list.tsx` | Renders existing assignments; supports delete via `useDeleteExamSectionAssignmentMutation` |
| `assignment-table.tsx` / `columns.tsx` | Table column definitions for the assignment list |

### sentinel-core: Exam Creation Dialog

**Location:** `app/sentinel-core/src/app/(protected)/exams/_components/`

The exam creation/edit dialog **also includes** section, room, and instructor fields — these write directly to the legacy `section_id`, `room_id` scalar columns on `exams`, **bypassing** `exam_section_assignments` entirely.

This is the root of the conflict.

---

## Goal

### Phase 1 — Strip assignment fields from the exam dialog

Remove `section`, `room`, and `instructor` fields from the exam **create/edit** dialog in `sentinel-core` (and equivalently in `sentinel-web` if present).

Exams should only carry intrinsic properties:
- `title`, `description`, `subject_id`, `duration_minutes`, `passing_score`
- `difficulty`, `status`, `exam_category`, `scheduled_date`, `end_date_time`
- `exam_configurations`

### Phase 2 — Improve the assignment page UX

The current UX forces the user to:
1. Select the exam from a dropdown (full page reload / URL update)
2. Click "Assign Section" to open a dialog
3. Fill the dialog, submit, dialog closes
4. Repeat steps 2–3 for every additional section

**Proposed UX improvement:** A single panel (no repeated dialog re-open) that lets the admin:

- Select an exam once
- Add **multiple** assignment rows inline (section + room + instructor + date per row)
- Submit all rows at once (batch `POST /exams/:id/section-assignments`)

This mirrors the mental model already expressed in the schema (`@@unique([exam_id, section_id])`).

### Phase 3 — Optional: deprecate legacy scalar columns

Once all UIs route through `exam_section_assignments`, the `section_id`, `room_id` scalar columns on `exams` can be nulled out and eventually dropped via a migration. This is a **non-breaking** change if done in a follow-up PR.

---

## API Contract (Reference)

### Create assignment
```
POST /exams/:examId/section-assignments
Body: CreateExamSectionAssignmentPayload {
  sectionId: string       // required
  roomId?: string
  instructorId?: string
  scheduledAt?: string    // ISO 8601
}
```

### List assignments
```
GET /exams/:examId/section-assignments
Returns: ExamSectionAssignmentRecord[]
```

### Delete assignment
```
DELETE /exams/:examId/section-assignments/:assignmentId
```

Hooks: `useCreateExamSectionAssignmentMutation`, `useExamSectionAssignmentsQuery`, `useDeleteExamSectionAssignmentMutation` — all in `@sentinel/hooks`.

---

## Affected Modules

| App | Path | Action |
|---|---|---|
| `sentinel-core` | `exams/_components/` (exam dialog) | Remove section/room/instructor fields |
| `sentinel-core` | `exams/assign/_components/` | Improve UX — inline multi-row assignment |
| `sentinel-web` | `src/features/exams/_components/` | Mirror the same dialog cleanup |
| `packages/db` | `prisma/schema.prisma` | (Phase 3) Drop legacy `exams.section_id`, `exams.room_id` scalar columns |

---

## Constraints & Notes

- `@@unique([exam_id, section_id])` — the same section cannot be assigned twice to the same exam. The UI must handle this gracefully (disable already-assigned sections in the dropdown or show an error).
- `exam_section_assignments.room_id` and `instructor_id` are **optional** — a section can be assigned without a room or instructor yet.
- Rooms with `status = 'MAINTENANCE'` should be filtered out of room selectors (already done in the current dialog).
- `sentinel-web` has its own exam feature under `src/features/exams/` — check `builder/`, `config/`, and `monitoring/` sub-folders for any dialogs that also embed section/room fields.
