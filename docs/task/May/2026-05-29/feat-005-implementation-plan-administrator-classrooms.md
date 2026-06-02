# feat-005 — Administrator Classrooms: Offered-Subjects Listing & Section Bulk Import

## Summary

Two discrete improvements to the administrator classroom workflow in `sentinel-core`:

1. **Create-Classroom dialog** — replace the instructor-scoped `useEnrolledSubjectsQuery` with a broader institution-wide subject-offerings query, and upgrade the instructor picker from a plain `<Select>` to a searchable `<Combobox>` so the admin can assign any institution instructor regardless of department.
2. **Section Management bulk import** — add a "Bulk Upload" button to `sentinel-core`'s Section Management page that mirrors the `BulkCreateSectionsDialog` pattern already implemented in `sentinel-support`.

---

## Three Viable Options (1-3-1 Rule)

### Option A — Minimal Patch (simple / fast)
Reuse `useSubjectOfferingsQuery` and `useUsersQuery` (both already export to `@sentinel/hooks`) with no API changes. Swap the two pickers in `create-classroom-dialog.tsx` and copy the `BulkCreateSectionsDialog` verbatim from sentinel-support into sentinel-core.

**Tradeoff:** Fast to ship, but the dialog will fetch ALL offered subjects regardless of status and duplicates a hook file into an app layer.

### Option B — Targeted API query + shared dialog hook (robust / scalable) ✅ Recommended
Add an `adminOfferedSubjectsQuery` hook in `packages/hooks` that calls the existing `GET /subject-offerings` endpoint with `visibility=default` and the institution scope already respected by the backend. Replace the instructor `<Select>` with the existing `<Combobox>` from `@sentinel/ui` wired to `useUsersQuery` with a search term. Extract a `useBulkSectionForm` equivalent in `sentinel-core`'s `_hooks` directory (reusing `useCreateSectionsMutation` from `@sentinel/hooks`).

**Tradeoff:** Slightly more files, but clean separation and fully aligned with existing patterns.

### Option C — New dedicated admin endpoints (creative / over-engineered)
Add new API routes `/admin/classrooms/offered-subjects` and `/admin/sections/bulk` that are role-gated specifically for admins.

**Tradeoff:** Unnecessary because the existing endpoints already handle role scoping; adds maintenance surface with zero real benefit.

**Best Option: B** — leverages existing infra, follows the established `packages/hooks` query pattern, uses the `Combobox` component already in the UI library, and mirrors the proven sentinel-support bulk-import pattern.

---

## Proposed Changes

### Phase 1 — Offered Subjects Query Hook (packages/hooks)

**Goal:** Expose a reusable admin-scoped hook for fetching institution-wide offered subjects.

#### [MODIFY] use-subject-offerings-query.ts
Path: `packages/hooks/src/query/subject-offerings/use-subject-offerings-query.ts`
- No changes needed; hook already accepts `institutionId` and `visibility` params.
- **Verify**: confirm `getSubjectOfferings` service passes all query params including `visibility`.

#### [MODIFY] use-enrolled-subjects-query.ts
Path: `packages/hooks/src/query/subjects/use-enrolled-subjects-query.ts`
- Keep as-is (still used by `sentinel-web` instructor flow).

**Migration required:** No — no schema changes.

---

### Phase 2 — Create-Classroom Dialog Upgrade (sentinel-core)

**Goal:** Replace the instructor-scoped subject picker and plain instructor Select with an institution-wide subject picker and searchable instructor combobox.

#### [MODIFY] create-classroom-dialog.tsx
Path: `app/sentinel-core/src/features/administration/classrooms/_components/create-classroom-dialog.tsx`

- Replace `useEnrolledSubjectsQuery()` with `useSubjectOfferingsQuery({ visibility: 'default' })` from `@sentinel/hooks`.
- Adapt the `subjectOptions` derivation to map `subject_offering_id`, `subject_code`, `subject_title`, `sections[]` from the `SubjectOffering` shape (the sections array is already present in the DTO).
- The existing section picker Select and classroom name Input remain unchanged.
- Add a new optional "Assign Instructor" field using Combobox from `@sentinel/ui`:
  - Wired to `useUsersQuery({ role: 'instructor', institutionId })` with an internal `searchTerm` state.
  - Passes the selected `instructorUserId` to `createClassroomMutation` (the backend `assignClassroomInstructor` flow already handles this post-creation via `ensureClassroomHeadInstructorAssignment`).
  - The field is optional — if left empty the creator themselves remain the head instructor (existing behaviour).

#### [MODIFY] assign-classroom-instructor-dialog.tsx
Path: `app/sentinel-core/src/features/administration/classrooms/_components/assign-classroom-instructor-dialog.tsx`

- Upgrade Select to Combobox with a local `searchTerm` state, filtering `availableInstructors` client-side by name/email (or pass `search` to `useUsersQuery`).
- No API changes required.

#### [NEW] instructor-search-combobox.tsx
Path: `app/sentinel-core/src/features/administration/classrooms/_components/instructor-search-combobox.tsx`
- Encapsulates the Combobox + `useUsersQuery` wiring so it can be shared between `create-classroom-dialog.tsx` and `assign-classroom-instructor-dialog.tsx`.

**Migration required:** No — all data already available via existing endpoints.

---

### Phase 3 — Bulk Section Import in sentinel-core

**Goal:** Add a "Bulk Upload" button to the sentinel-core Section Management page identical in UX to the sentinel-support version.

#### [NEW] use-bulk-section-form.ts
Path: `app/sentinel-core/src/app/(protected)/sections/_hooks/use-bulk-section-form.ts`
- Mirror of `sentinel-support`'s `use-bulk-section-form.ts`.
- Uses `useCreateSectionsMutation` from `@sentinel/hooks`.
- The admin context has `institutionId` from session context — auto-populate and hide the institution picker (admins are scoped to one institution).
- State: `departmentId`, `courseId`, `input`, `preview`.

#### [NEW] bulk-create-sections-dialog.tsx
Path: `app/sentinel-core/src/app/(protected)/sections/_components/dialogs/bulk-create-sections-dialog.tsx`
- Mirrors `sentinel-support`'s `BulkCreateSectionsDialog`.
- Omits the institution picker (admin is already institution-scoped).
- Exposes a DialogTrigger button "Bulk Upload" with the Upload lucide icon.
- Internally uses `useBulkSectionForm` from the hook above.

#### [MODIFY] index.ts
Path: `app/sentinel-core/src/app/(protected)/sections/_components/index.ts`
- Export `BulkCreateSectionsDialog`.

#### [MODIFY] page.tsx (Sections)
Path: `app/sentinel-core/src/app/(protected)/sections/page.tsx`
- Import and render `BulkCreateSectionsDialog` inside the `PermissionGate permission={hasPermission('sections:create')}` block alongside `AddSectionDialog`.

**Migration required:** No — `POST /sections/bulk` endpoint already exists and handles admin scoping.

---

## API Impact

| Endpoint | Change |
|---|---|
| `GET /subject-offerings` | None — already institution-scoped for admins |
| `POST /classrooms/:id/instructors` | None — already used by assign flow |
| `POST /sections/bulk` | None — already exists |

No breaking changes. No new environment variables.

---

## Verification Plan

### Automated Tests

- [ ] Write unit test for `InstructorSearchCombobox` — renders available instructors, filters on input (co-located `*.test.tsx`)
- [ ] Write unit test for `BulkCreateSectionsDialog` in sentinel-core — previews rows, submit fires mutation (co-located `*.test.tsx`)
- [ ] Write unit test for `useBulkSectionForm` in sentinel-core — parses CSV text, resets on success

```bash
pnpm --dir app/sentinel-api test
pnpm --dir app/sentinel-core test
```

### Manual Verification

1. Open sentinel-core → Classrooms → Create Classroom
   - Confirm subject picker shows ALL institution offered subjects (not just instructor-enrolled).
   - Confirm instructor search combobox filters by typing name or email.
   - Confirm classroom creation succeeds with an assigned instructor from a different department.
2. Open sentinel-core → Section Management
   - Confirm "Bulk Upload" button is visible when `sections:create` permission is granted.
   - Paste CSV rows, verify preview updates in real time.
   - Submit and confirm sections appear in the table.
