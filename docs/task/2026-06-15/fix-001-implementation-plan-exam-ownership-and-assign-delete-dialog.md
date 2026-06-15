# fix-001 — Exam Ownership, Private Visibility & Assign Delete Dialog

## Summary

Three related access-control and UX fixes for the examination module:

1. **Ownership enforcement** — When User A creates an exam, User B (another instructor) must not be able to edit, update, or delete it, since only the creator owns it.
2. **Private exam visibility** — When an exam is private (`is_public = false`), User B cannot see it at all — unless User A has explicitly assigned it to User B (via `exam_section_assignments` / `proctor_assignments`).
3. **Delete assignment confirmation dialog** — The assign page currently uses a native `confirm()` browser prompt. Replace it with a proper `AlertDialog` matching the existing delete-dialog pattern used in the rest of the codebase.

---

## 1-3-1 Options Analysis

### Issue 1 & 2 — Ownership & Visibility Enforcement

**Option A — Enforce in Service Layer (Recommended)**
Add an `assertExamOwnership(examId, userId)` guard in `delete-exam.ts` and `update-exam.ts` services that fetches the existing record's `created_by` and throws `HTTP 403` if the caller is not the owner (unless the caller is `superadmin`/`admin`).

- *Tradeoff*: Surgical; aligns with the existing pattern of `assertExamConfigurationMutable()` guards, but requires a DB read.

**Option B — Enforce in Controller Layer**
Re-fetch the exam in each controller and compare `created_by` against `user.id` before delegating to the service.

- *Tradeoff*: Keeps services pure but duplicates DB fetches; breaks separation of concerns.

**Option C — Enforce via DB WHERE clause**
Add `WHERE created_by = $userId` to the `updateExamData` and `deleteExamData` queries, causing a no-op with a 404 instead of a 403.

- *Tradeoff*: Simple, but provides poor error UX; admin bypass requires query-branching.

**Best option: A** — mirrors `requireExamRecord` / `assertExamConfigurationMutable` patterns already in the service layer, provides explicit HTTP 403 error messages, and trivially skips for `superadmin`/`admin` roles.

---

### Issue 3 — Delete Assignment Dialog

**Option A — `AlertDialog` in `exam-section-assignment-list.tsx` (Recommended)**
Introduce a `DeleteAssignmentDialog` component collocated in the assign `_components/` folder and wire it to the existing `handleDelete` flow.

- *Tradeoff*: Consistent with the rest of the codebase (see `exam-card-delete-alert.tsx`, `delete-announcement-dialog.tsx`); requires minimal state management.

**Option B — Reuse `ExamCardDeleteAlert`**
Move `ExamCardDeleteAlert` to a shared location and consume it here.

- *Tradeoff*: Reduces duplication but couples two unrelated features, and the message copy is wrong for assignments.

**Option C — shadcn/Radix `AlertDialog` inline**
Render the `AlertDialog` inline in the column definition.

- *Tradeoff*: Dirty — column defs should not own dialog state.

**Best option: A** — purpose-specific component with the correct copy, consistent with project conventions.

---

## Proposed Changes

### Phase 1 — API: Ownership Guard on Update & Delete

**Goal:** Enforce that only the exam creator (or admin/superadmin) can mutate or delete an exam.

**Migration required:** No — no schema changes. The `created_by` column already exists in the `exams` table.

---

#### [NEW] assert-exam-ownership.ts

```
app/sentinel-api/src/modules/examination/exams/services/assert-exam-ownership.ts
```

- Export `assertExamOwnership(createdBy: string | null | undefined, requestingUserId: string, role?: string | null): void`.
- Throws `HTTP 403 'You do not have permission to modify this exam.'` if `createdBy !== requestingUserId` and role is not `admin`/`superadmin`.

#### [MODIFY] update-exam.ts

```
app/sentinel-api/src/modules/examination/exams/services/update-exam.ts
```

- After fetching the `current` exam record (already happens via `getExamByIdData`), call `assertExamOwnership(current.created_by, userId, role)` using the already-fetched record to avoid an extra DB round-trip.
- The `created_by` column must be selected in `getExamByIdData` — verify or add `'e.created_by'` to its select list.

#### [MODIFY] delete-exam.ts

```
app/sentinel-api/src/modules/examination/exams/services/delete-exam.ts
```

- Add `userId: string` and `role?: string` to function parameters.
- Before deleting, fetch the exam via `getExamByIdData` (or a lighter query) to get `created_by`.
- Call `assertExamOwnership(exam.created_by, userId, role)`.

#### [MODIFY] exam.service.ts

```
app/sentinel-api/src/modules/examination/exams/exam.service.ts
```

- Add `userId: string` and `role?: string` to `ExamService.deleteExam(...)` signature.

#### [MODIFY] delete-exam.controller.ts

```
app/sentinel-api/src/modules/examination/exams/controllers/delete-exam.controller.ts
```

- Resolve `role` via `resolveAssessmentActorRole`.
- Pass `user.id` and `role` to `ExamService.deleteExam(...)`.

---

### Phase 2 — API: Private Exam Visibility Audit & Fix

**Goal:** Confirm that private exams are hidden from non-creator, non-assigned instructors and add a guard on the single-exam GET endpoint if missing.

**Migration required:** No.

---

#### [AUDIT] get-exams.controller.ts

```
app/sentinel-api/src/modules/examination/exams/controllers/get-exams.controller.ts
```

- Verify that `instructorUserId` is always correctly passed as `user.id` for instructor callers.
- The current instructor filter in `get-exams.ts` (lines 215–234) already checks: `is_public = true`, OR `created_by = instructorUserId`, OR assigned via `exam_section_assignments`, OR assigned via `proctor_assignments`.
- If the filter is confirmed correct — document and close. If a gap exists — fix the controller invocation.

#### [MODIFY] get-exam.controller.ts (if gap found)

```
app/sentinel-api/src/modules/examination/exams/controllers/get-exam.controller.ts
```

- For the single-exam `GET /:id` endpoint, add a private-exam visibility check: if `exam.isPublic === false` AND `user.id !== exam.created_by` AND user is not assigned to the exam — throw `HTTP 404` (not 403, to avoid information leakage).

---

### Phase 3 — UI: Delete Assignment Confirmation Dialog

**Goal:** Replace the native `confirm()` in `exam-section-assignment-list.tsx` with a styled `AlertDialog`.

**Migration required:** No.

---

#### [NEW] delete-assignment-dialog.tsx

```
app/sentinel-core/src/app/(protected)/exams/assign/_components/delete-assignment-dialog.tsx
```

- `'use client'` directive.
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `assignmentId: string`, `examId: string`, `classroomName: string`.
- Internally calls `useDeleteExamSectionAssignmentMutation`.
- Renders `AlertDialog` > `AlertDialogContent` > `AlertDialogHeader` > `AlertDialogTitle` + `AlertDialogDescription` (includes `classroomName` for context).
- Footer with `AlertDialogCancel` and `AlertDialogAction` with `bg-destructive` class and `disabled={mutation.isPending}` while loading.
- Calls `onOpenChange(false)` on success with a `toast.success` notification.

#### [MODIFY] exam-section-assignment-list.tsx

```
app/sentinel-core/src/app/(protected)/exams/assign/_components/exam-section-assignment-list.tsx
```

- Remove `useDeleteExamSectionAssignmentMutation` from this component (mutation ownership moves to the dialog).
- Add state: `deleteTarget: { id: string; classroomName: string } | null`.
- Replace `confirm()` in `handleDelete` with `setDeleteTarget({ id: assignmentId, classroomName: resolvedName })`.
- Render `<DeleteAssignmentDialog>` below the `DataTable`, bound to `deleteTarget` state and `examId`.

---

## Verification Plan

### Automated Tests

```bash
pnpm --dir app/sentinel-api test
```

New test file:
- `app/sentinel-api/src/modules/examination/exams/services/assert-exam-ownership.test.ts`
  - Owner passes the guard.
  - Non-owner instructor throws `HTTP 403`.
  - `admin` role bypasses the check.
  - `superadmin` role bypasses the check.
  - `null` / `undefined` `created_by` throws `HTTP 403`.

Existing tests that must still pass:
- `get-exams.test.ts` / `get-exams-instructor-visibility.test.ts`
- `create-exam-assignment.controller.test.ts`
- `exam-section-assignment-list.test.tsx`

### Manual Verification

1. **Ownership guard — Update:** Log in as User B; open an exam created by User A; save → expect `403`. Log in as User A; save → expect success.
2. **Ownership guard — Delete:** Log in as User B; delete User A's exam → expect `403`. Log in as User A; delete → success.
3. **Private exam visibility:** Create private exam as User A; log in as User B — exam hidden. Assign User B via the assign page; log in as User B — exam visible.
4. **Delete dialog:** Assign page → click trash icon → `AlertDialog` appears (no browser `confirm()`). Cancel → no deletion. Confirm → assignment deleted, toast shown, table updates.

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Should the ownership guard on **update** also block metadata changes (title, dates) when the exam is `published`, or only block question/config changes (which `assertExamConfigurationMutable` already handles)?

> [!IMPORTANT]
> **Q2:** Phase 2 private visibility filter is already enforced at the DB query level. Should a 404 guard also be added to the single `GET /:id` endpoint for private exams, or is the list-level filter sufficient?

> [!NOTE]
> **Q3:** Mutation ownership in the delete dialog: the dialog owns the mutation call. The list component sets the target state and opens the dialog. Is this preferred, or should the list component remain the mutation owner and the dialog be purely presentational (accepting an `onConfirm` callback)?

---

## Execution Log

- [x] Phase 1 API ownership guard implemented in `assert-exam-ownership.ts`, `update-exam.ts`, `delete-exam.ts`, `exam.service.ts`, and `delete-exam.controller.ts`.
- [x] Phase 2 private visibility audit completed; `get-exams.controller.ts` already passed the instructor user id through correctly, and `get-exam.controller.ts` now blocks private exam leakage for non-creator, non-assigned instructors.
- [x] Phase 3 assignment delete dialog implemented in `delete-assignment-dialog.tsx` and wired into `exam-section-assignment-list.tsx`.
- [x] New ownership guard test added at `app/sentinel-api/src/modules/examination/exams/services/assert-exam-ownership.test.ts`.
- [x] Focused verification passed for `assert-exam-ownership.test.ts` and `exam-section-assignment-list.test.tsx`.
- [x] Full `pnpm --dir app/sentinel-api test` run attempted, but the environment could not reach the configured Supabase/Postgres and Redis services, so database-backed tests failed independently of this change.
