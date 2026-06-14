# Exam Card Assignment Display Fix

## Summary

Fix the exam dashboard cards and list items so that **Room**, **Section**, and **Instructor** information displayed on them is sourced **exclusively from the `exam_section_assignments` table** (not the now-removed `room_id` field on the exam itself). When no room has been assigned through the Assignment page, the card must show a blank/dash instead of a stale or misleading value. Multiple rooms and multiple sections assigned across several `exam_section_assignments` rows must all be shown as comma-separated lists. Instructor names must also be surfaced on the card.

---

## Problem Analysis

The current exam card (`exam-card-body.tsx`) and list item (`exam-list-item.tsx`) display room data via `exam.room` — a field on the unified `Exam` type that maps to the exam record's **own** `room_id` column. The Create Exam dialog no longer includes a room picker (the room option was intentionally removed), so that column is always null for new exams. However the card still renders "No room" even when rooms are properly assigned through `exam_section_assignments`.

The `exam_section_assignments` table is the correct source of truth:
- Each row links an exam → section → optional room → optional instructor.
- One exam can have **many** rows (one per section).
- So one exam may have multiple rooms **and** multiple instructors.

The dashboard `useExamsQuery` returns a flat `ExamSummary` that does **not** include section-assignment data. To display assignment metadata on cards we have two options:

| Option | Trade-offs |
|---|---|
| **A – Enrich `GET /exams` with aggregated assignment data** | Single network call; requires backend change (new subqueries); keeps all display logic in one place. |
| **B – Fetch `useExamSectionAssignmentsQuery` per card** | Many extra API calls (N+1); bad for performance with many exams. |
| **C – Add aggregated fields to `ExamSummary` via correlated subqueries** | Best UX; minimal extra payload; single query. **Recommended.** |

**Decision: Option C** — add two aggregated arrays to `ExamSummary`:
- `assignedRoomNames: string[]` — rooms from assignment rows
- `assignedInstructorNames: string[]` — instructors from assignment rows

Sections are already handled via the existing `sectionNames` / `assignedSectionNames` arrays from `exam_assigned_sections`. These cover the assignment-page sections too (since the batch create writes to that table).

---

## Open Questions

> [!IMPORTANT]
> **Review required:** Should the card fall back to `exam.room` (legacy field) when `assignedRoomNames` is empty, or always show `–` for new exams without an assignment?
> - **Recommended:** always show `–` when `assignedRoomNames` is empty (the old `room_id` column is no longer populated for new exams).

> [!NOTE]
> No Prisma migration is required. All changes are read-only aggregation subqueries and frontend display changes.

---

## Proposed Changes

---

### Phase 1: Backend – Enrich `ExamSummary` with Assignment Data

**Goal:** Add `assignedRoomNames` and `assignedInstructorNames` arrays to the exam list API response so the frontend can render them without extra calls.

**Migration required:** No — read-only aggregation via correlated subqueries.

---

#### [MODIFY] [get-exams.ts (data)](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/get-exams.ts)

Add two correlated subqueries inside `getExamsData()` `select` array:

```ts
// Rooms assigned via exam_section_assignments
(eb) =>
    eb
        .selectFrom('exam_section_assignments as esa_r')
        .innerJoin('rooms as r_inner', 'r_inner.room_id', 'esa_r.room_id')
        .select(
            sql<string[]>`coalesce(json_agg(distinct r_inner.room_name), '[]'::json)`.as(
                'assigned_room_names',
            ),
        )
        .whereRef('esa_r.exam_id', '=', 'e.exam_id')
        .as('assigned_room_names'),

// Instructors assigned via exam_section_assignments
(eb) =>
    eb
        .selectFrom('exam_section_assignments as esa_i')
        .innerJoin('user_profiles as up_inner', 'up_inner.user_id', 'esa_i.instructor_id')
        .select(
            sql<string[]>`coalesce(
                json_agg(distinct trim(concat(up_inner.first_name, ' ', up_inner.last_name))),
                '[]'::json
            )`.as('assigned_instructor_names'),
        )
        .whereRef('esa_i.exam_id', '=', 'e.exam_id')
        .as('assigned_instructor_names'),
```

- [x] Add `assigned_room_names` correlated subquery to `getExamsData()` in `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
- [x] Add `assigned_instructor_names` correlated subquery to `getExamsData()` in `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`

---

#### [MODIFY] [map-exam-response.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts)

- [x] Add `assigned_room_names?: string[] | null` to `RawExamRecord` type
- [x] Add `assigned_instructor_names?: string[] | null` to `RawExamRecord` type
- [x] Map both in `mapExamSummaryResponse()`:
  ```ts
  assignedRoomNames: parseJsonArray(record.assigned_room_names),
  assignedInstructorNames: parseJsonArray(record.assigned_instructor_names),
  ```

---

#### [MODIFY] [exam-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-schema.ts)

- [x] Add `assignedRoomNames: z.array(z.string()).optional()` to `examSummarySchema`
- [x] Add `assignedInstructorNames: z.array(z.string()).optional()` to `examSummarySchema`

---

#### [MODIFY] [exam.ts (shared types)](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/types/exams/exam.ts)

- [x] Add `assignedRoomNames?: string[]` to the `Exam` type
- [x] Add `assignedInstructorNames?: string[]` to the `Exam` type

---

#### Tests for Phase 1

- [x] Update `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts`:
  - Assert `assigned_room_names` is `[]` when no assignments exist
  - Assert `assigned_room_names` contains room names when assignments with rooms exist
- [x] Update `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.test.ts`:
  - Assert `assignedRoomNames` maps correctly from raw record
  - Assert `assignedInstructorNames` maps correctly from raw record

---

### Phase 2: Frontend – Update Exam Card & List Item Display

**Goal:** Exam card and list item show rooms and instructors sourced from `assignedRoomNames` / `assignedInstructorNames`. Empty array = `–`. Sections show all assigned sections via existing `sectionNames`.

---

#### [MODIFY] [exam-card-body.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/cards/exam-card/exam-card-body.tsx)

- [x] Replace `exam.room` location display with:
  ```tsx
  {exam.assignedRoomNames?.length
      ? exam.assignedRoomNames.join(', ')
      : '–'}
  ```
- [x] Add an **Instructor** row (with a `User` icon) in the grid below the location row:
  ```tsx
  {exam.assignedInstructorNames?.length
      ? exam.assignedInstructorNames.join(', ')
      : '–'}
  ```
- [x] Verify section display: `exam.sectionNames?.join(' • ')` already handles multiple sections — confirm it is rendered even when `exam.section` is null (assignment-sourced exams)

---

#### [MODIFY] [exam-list-item.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/cards/exam-list-item.tsx)

- [x] Replace line 90 `exam.room` with `assignedRoomNames` joined or `–`
- [x] Add instructor span using `assignedInstructorNames`
- [x] Ensure section display (lines 77–80) uses `exam.sectionNames` when available

---

#### Tests for Phase 2

- [x] Add/update test in `exam-section-assignment-list.test.tsx` or create `exam-card-body.test.tsx`:
  - Render with `assignedRoomNames: []` → show `–` for room
  - Render with `assignedRoomNames: ['ROOM101', 'ROOM201']` → show `ROOM101, ROOM201`
  - Render with `assignedInstructorNames: ['Juan dela Cruz']` → show instructor name

---

### Phase 3: Smoke-Test & Cleanup

**Goal:** End-to-end verification that all scenarios work correctly.

- [x] Run `pnpm --dir app/sentinel-api test` — all tests pass
- [x] Run `pnpm --dir app/sentinel-core test` — all tests pass
- [x] Run `pnpm lint` — no errors
- [x] Manually verify:
  - New exam (no assignment) → card shows `–` for Room and Instructor, sections show normally
  - Exam assigned to 2 sections with different rooms and instructors → card shows both rooms comma-separated, both instructors comma-separated
  - List view shows same data

---

## Verification Plan

### Automated Tests

```bash
pnpm --dir app/sentinel-api test
pnpm --dir app/sentinel-core test
pnpm lint
```

### Manual Verification

1. Create a new exam → card shows `–` for Room and Instructor
2. Assign exam to 2 sections with different rooms and instructors
3. Dashboard card shows both rooms comma-separated and both instructors comma-separated
4. Section names on card match assigned sections

---

## Files Touched Summary

| File | Type | Change |
|---|---|---|
| `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` | MODIFY | Add room + instructor correlated subqueries |
| `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts` | MODIFY | Add to `RawExamRecord`, map in `mapExamSummaryResponse` |
| `packages/shared/src/schema/exams/exam-schema.ts` | MODIFY | Add `assignedRoomNames`, `assignedInstructorNames` to schema |
| `packages/shared/src/types/exams/exam.ts` | MODIFY | Add fields to `Exam` type |
| `app/sentinel-core/src/features/exams/_components/cards/exam-card/exam-card-body.tsx` | MODIFY | Fix room display, add instructor row |
| `app/sentinel-core/src/features/exams/_components/cards/exam-list-item.tsx` | MODIFY | Fix room display, add instructor display |
| `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts` | MODIFY | Add assignment data assertions |
| `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.test.ts` | MODIFY | Add mapping assertions |
