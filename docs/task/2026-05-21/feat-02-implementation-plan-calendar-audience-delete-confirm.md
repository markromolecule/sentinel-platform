# Implementation Plan — Calendar UI Fixes: Audience Options & Delete Confirmation

**Task summary**: Fix the "Add Event" dialog's target audience options to match the canonical role definitions, and add a confirmation dialog before deleting a calendar event across `sentinel-core`, `sentinel-support`, and `sentinel-web`.

---

## Three Viable Options

### Option A — Fix audience options in-place + inline AlertDialog state in sheet components

Add delete confirmation state directly into `event-details-sheet.tsx` and `day-details-sheet.tsx`. Fix `TargetAudience` type and update dropdown values everywhere they are referenced.

**Pros**: Minimal footprint, no new files.
**Cons**: Components become heavier; dialog state clutters the sheet component.

---

### Option B — Fix audience options + extract a reusable `DeleteEventConfirmDialog` component (Recommended)

Extract a dedicated `delete-event-confirm-dialog.tsx` component per app that renders an `AlertDialog` confirm flow. Pass `eventId` and `eventTitle` as props. This keeps the sheet components clean and the delete logic testable.

**Pros**: Clean separation of concerns; reusable confirmation dialog; easy to test; readable sheet component.
**Cons**: One extra file per app (minor).

---

### Option C — Fix audience + consolidate all delete logic into the hook

Handle delete confirmation entirely in the `useAdminCalendar` / page-level hook using a pending-delete state, and just show an `AlertDialog` at the page level.

**Pros**: Zero UI logic in sheet components.
**Cons**: Requires changing hook signatures + page-level JSX for all three apps; overkill for a simple confirmation dialog.

---

## ✅ Recommended: Option B

**Why**: Extracting `DeleteEventConfirmDialog` keeps each concern in its own file, aligns with how existing dialogs (e.g., `EventDialog`) are structured, and allows the confirmation component to be tested independently. The `AlertDialog` component already exists in `@sentinel/ui`, so this requires no new dependencies.

---

## Pre-Planning

- [x] Task summarized in one sentence
- [x] Relevant source files scanned
- [x] Files, services, and types identified
- [x] Migration check: **No migration required** — only UI and shared type changes

---

## Proposed Changes

### Files Touched

| File                                                                                            | App              | Change                                                           |
| ----------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------- |
| `packages/shared/src/types/admin/calendar/index.ts`                                             | shared           | Update `TargetAudience` type to match canonical role definitions |
| `app/sentinel-core/src/app/(protected)/calendar/_components/event-dialog.tsx`                   | sentinel-core    | Update audience `SelectItem` values + labels                     |
| `app/sentinel-core/src/app/(protected)/calendar/_components/event-details-sheet.tsx`            | sentinel-core    | Wire delete button to confirmation dialog                        |
| `app/sentinel-core/src/app/(protected)/calendar/_components/delete-event-confirm-dialog.tsx`    | sentinel-core    | **[NEW]** `AlertDialog`-based delete confirmation                |
| `app/sentinel-core/src/app/(protected)/calendar/_hooks/use-admin-calendar.ts`                   | sentinel-core    | Update `targetAudience` mapping to use new values                |
| `app/sentinel-support/src/app/(protected)/calendar/_components/event-dialog.tsx`                | sentinel-support | Update audience `SelectItem` values + labels                     |
| `app/sentinel-support/src/app/(protected)/calendar/_components/event-details-sheet.tsx`         | sentinel-support | Wire delete button to confirmation dialog                        |
| `app/sentinel-support/src/app/(protected)/calendar/_components/delete-event-confirm-dialog.tsx` | sentinel-support | **[NEW]** `AlertDialog`-based delete confirmation                |
| `app/sentinel-support/src/app/(protected)/calendar/_hooks/use-admin-calendar.ts`                | sentinel-support | Update `targetAudience` mapping to use new values                |
| `app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.tsx`                | sentinel-web     | Wire delete button to confirmation dialog                        |
| `app/sentinel-web/src/features/calendar/components/sheets/delete-event-confirm-dialog.tsx`      | sentinel-web     | **[NEW]** `AlertDialog`-based delete confirmation                |

---

## Phases

### Phase 1: Fix Shared `TargetAudience` Type

**Goal**: Align the shared type with canonical role definitions from `fix-calendar.md`.

- [ ] In `packages/shared/src/types/admin/calendar/index.ts`, update the `TargetAudience` type from `'all' | 'students' | 'proctors' | 'specific_group'` to `'institution' | 'administrator' | 'instructor' | 'student'`
    - `institution` → targets ALL users under the branch (maps to `CalendarEventAudience = 'ALL'`)
    - `administrator` → targets admins/superadmin/support only (maps to `'ADMINS'`)
    - `instructor` → targets instructors only (maps to `'INSTRUCTORS'`)
    - `student` → targets students only (maps to `'STUDENTS'`)
- [ ] Write a `*.test.ts` (type-level / value-check) or update existing constant references to ensure no compile errors

**Migration required**: No

---

### Phase 2: Update the "Add Event" Dialog Audience Select in `sentinel-core`

**Goal**: The `EventDialog` in `sentinel-core` shows the correct, business-aligned audience options.

- [ ] In `app/sentinel-core/src/app/(protected)/calendar/_components/event-dialog.tsx`:
    - Replace the `targetAudience` default state from `'all'` to `'institution'`
    - Replace all four `<SelectItem>` values with:
        - `value="institution"` → label `Institution (All Users)`
        - `value="administrator"` → label `Administrators Only`
        - `value="instructor"` → label `Instructors Only`
        - `value="student"` → label `Students Only`
    - Update the `handleOpenChange` reset to use `'institution'` as the default
- [ ] In `app/sentinel-core/src/app/(protected)/calendar/_hooks/use-admin-calendar.ts`, update the `targetAudience` → `CalendarEventAudience` mapping in `handleAddEvent`:
    - `'institution'` → `'ALL'`
    - `'administrator'` → `'ADMINS'`
    - `'instructor'` → `'INSTRUCTORS'`
    - `'student'` → `'STUDENTS'`
- [ ] Update the reverse mapping in `useMemo` (mapping `CalendarEventAudience` back to `TargetAudience` for display):
    - `'ALL'` → `'institution'`
    - `'ADMINS'` → `'administrator'`
    - `'INSTRUCTORS'` → `'instructor'`
    - `'STUDENTS'` → `'student'`
- [ ] Write test in `use-admin-calendar.test.ts` verifying the audience mapping is correct in both directions

**Migration required**: No

---

### Phase 3: Update the "Add Event" Dialog Audience Select in `sentinel-support`

**Goal**: The `EventDialog` in `sentinel-support` shows the correct audience options (mirror of Phase 2).

- [ ] In `app/sentinel-support/src/app/(protected)/calendar/_components/event-dialog.tsx`:
    - Apply the same audience `SelectItem` changes as Phase 2 (`sentinel-core`)
- [ ] Verify `use-admin-calendar.ts` in sentinel-support shares the same hook or has its own copy:
    - If it is a separate file, apply the same mapping changes
    - If it re-exports from sentinel-core, no additional changes needed
- [ ] Write/update tests in `use-admin-calendar.test.ts` for sentinel-support if a separate hook exists

**Migration required**: No

---

### Phase 4: Add Delete Confirmation Dialog in `sentinel-core`

**Goal**: Clicking the trash icon on an event card opens an `AlertDialog` asking the user to confirm before deletion.

- [ ] Create `app/sentinel-core/src/app/(protected)/calendar/_components/delete-event-confirm-dialog.tsx`:
    - Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `eventTitle: string`, `onConfirm: () => void`, `isDeleting?: boolean`
    - Render `AlertDialog` from `@sentinel/ui` with:
        - Title: `"Delete Event"`
        - Description: `"Are you sure you want to delete \"${eventTitle}\"? This action cannot be undone."`
        - Cancel button: closes dialog
        - Confirm/Delete button: calls `onConfirm()`, shows loading state if `isDeleting`
- [ ] In `app/sentinel-core/src/app/(protected)/calendar/_components/event-details-sheet.tsx`:
    - Add local state: `pendingDeleteId: string | null` and `pendingDeleteTitle: string`
    - Replace the direct `onDeleteEvent(event.id)` call with `setPendingDeleteId(event.id)` and `setPendingDeleteTitle(event.title)`
    - Render `<DeleteEventConfirmDialog>` conditionally at the bottom of the component
    - On confirm, call `onDeleteEvent(pendingDeleteId)` and reset `pendingDeleteId` to `null`
- [ ] Write tests for `DeleteEventConfirmDialog` component (renders correctly, fires `onConfirm`, cancel closes)

**Migration required**: No

---

### Phase 5: Add Delete Confirmation Dialog in `sentinel-support`

**Goal**: Mirror of Phase 4 for the support portal.

- [ ] Create `app/sentinel-support/src/app/(protected)/calendar/_components/delete-event-confirm-dialog.tsx` with the same props and structure as the sentinel-core version
- [ ] In `app/sentinel-support/src/app/(protected)/calendar/_components/event-details-sheet.tsx`, apply the same pending-delete state and wiring as Phase 4
- [ ] Write component tests

**Migration required**: No

---

### Phase 6: Add Delete Confirmation Dialog in `sentinel-web`

**Goal**: The student and instructor calendar `DayDetailsSheet` also asks for confirmation before deleting a personal note.

- [ ] Create `app/sentinel-web/src/features/calendar/components/sheets/delete-event-confirm-dialog.tsx`:
    - Same props and structure as above, styled to match sentinel-web's theme (blue primary accent `#323d8f`)
- [ ] In `app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.tsx`:
    - Add local state: `pendingDeleteId: string | null` and `pendingDeleteTitle: string`
    - Replace the direct `onDeleteEvent(event.id)` call with `setPendingDeleteId(event.id)` and `setPendingDeleteTitle(event.title)`
    - Render `<DeleteEventConfirmDialog>` conditionally at the bottom
    - On confirm, call `onDeleteEvent(pendingDeleteId)` and clear the state
- [ ] Write component tests

**Migration required**: No

---

## Verification Plan

### Automated Tests

```bash
# Run all affected test suites
pnpm --dir app/sentinel-api test calendar
pnpm --dir app/sentinel-core test
pnpm --dir app/sentinel-support test
pnpm --dir app/sentinel-web test

# Formatting
npx prettier --check \
  packages/shared/src/types/admin/calendar/index.ts \
  "app/sentinel-core/src/app/(protected)/calendar/_components/event-dialog.tsx" \
  "app/sentinel-core/src/app/(protected)/calendar/_components/event-details-sheet.tsx" \
  "app/sentinel-core/src/app/(protected)/calendar/_components/delete-event-confirm-dialog.tsx" \
  "app/sentinel-support/src/app/(protected)/calendar/_components/event-dialog.tsx" \
  "app/sentinel-support/src/app/(protected)/calendar/_components/event-details-sheet.tsx" \
  "app/sentinel-support/src/app/(protected)/calendar/_components/delete-event-confirm-dialog.tsx" \
  "app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.tsx" \
  "app/sentinel-web/src/features/calendar/components/sheets/delete-event-confirm-dialog.tsx"
```

### Manual Verification

1. Open the calendar in `sentinel-core` or `sentinel-support`. Click "Add Event". Verify the Target Audience dropdown shows: **Institution (All Users)**, **Administrators Only**, **Instructors Only**, **Students Only**.
2. Create an event targeting "Instructors Only". Confirm it saves correctly and the audience tag appears on the event card.
3. Hover over any event card and click the trash icon. Verify an `AlertDialog` appears with the event title and a "Delete" and "Cancel" button.
4. Click **Cancel** — dialog closes, event remains. Click **Delete** — event is removed from the calendar.
5. In `sentinel-web` as a student/instructor, click the trash icon on a personal note. Verify the same confirmation dialog appears before deletion.
