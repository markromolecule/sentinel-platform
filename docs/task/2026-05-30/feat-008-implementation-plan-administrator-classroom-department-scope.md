# feat-008 — Administrator Classrooms: Department-Scoped Listing with Institution-Wide Instructor Assignment

## Summary

The goal is to tighten the administrator classroom experience in `sentinel-core` so the classroom list only shows classrooms that belong to the administrator's assigned department, while keeping instructor assignment flexible across the full institution.

This means:

1. The classroom list must stay scoped to the current institution and the admin's department, not drift to a parent institution or other departments.
2. The create/assign classroom flow must still allow selecting any instructor from the institution, even if that instructor belongs to a different department.

---

## Three Viable Options (1-3-1 Rule)

### Option A - Frontend-only filter

Keep the API unchanged and filter classrooms in `sentinel-core` after fetching them.

**Tradeoff:** Fast to implement, but it still downloads too much data and leaves the department scope logic split across the UI.

### Option B - Department-aware classroom query with institution-wide instructor search ✅ Recommended

Add a `departmentId` query parameter to the classroom list API, pass the administrator's assigned department from `useAcademicScope()`, and keep the instructor combobox on institution-wide user search.

**Tradeoff:** Slightly more work across API and client layers, but the scope rule is enforced where it belongs and remains easy to test.

### Option C - New admin-specific classroom endpoint

Create a dedicated admin classroom route such as `/admin/classrooms` that hard-codes the department scoping rules.

**Tradeoff:** Clear separation, but unnecessary duplication because the current classroom endpoint can already support the needed scope.

**Best Option: B** - it keeps one classroom source of truth, minimizes duplication, and preserves the existing instructor assignment behavior.

---

## Current State Assessment

### What already works

- `app/sentinel-core/src/features/administration/classrooms/_components/create-classroom-dialog.tsx` already uses `useSubjectOfferingsQuery({ institutionId, visibility: 'default' })`.
- `app/sentinel-core/src/features/administration/classrooms/_components/instructor-search-combobox.tsx` already searches instructors by institution and can exclude already assigned users.
- `app/sentinel-core/src/features/administration/classrooms/_components/assign-classroom-instructor-dialog.tsx` already uses the searchable instructor combobox.
- `app/sentinel-api/src/modules/core/classroom/services/classroom-access-query.service.ts` already filters classroom queries by institution and role access.

### What still needs tightening

- The admin classroom list still depends on a generic `useClassroomsQuery(search)` shape and does not explicitly carry department scope from `useAcademicScope()`.
- The API query currently has no first-class `departmentId` filter, so department scoping is not explicit in the request contract.

---

## Proposed Changes

### Phase 1 - Add department scope to the classroom list API

**Goal:** Make the classroom query explicitly department-aware so the backend can enforce the admin's scope.

#### [MODIFY] classroom.dto.ts

Path: `app/sentinel-api/src/modules/core/classroom/classroom.dto.ts`

- Extend `getClassroomsSchema.request.query` to accept an optional `departmentId` UUID.
- Keep `search` unchanged.
- Document that `departmentId` limits classroom results to one department for scoped admin views.

#### [MODIFY] get-classrooms.controller.ts

Path: `app/sentinel-api/src/modules/core/classroom/controllers/get-classrooms.controller.ts`

- Read `departmentId` from the validated query.
- Pass `departmentId` through to `ClassroomService.getClassrooms(...)`.
- Preserve the existing institution guard and role permission check.

#### [MODIFY] classroom.service.ts

Path: `app/sentinel-api/src/modules/core/classroom/classroom.service.ts`

- Extend the `getClassrooms(...)` call signature to accept `departmentId?: string`.
- Forward `departmentId` to the classroom query service.

#### [MODIFY] instructor-classroom-query.service.ts

Path: `app/sentinel-api/src/modules/core/classroom/services/instructor-classroom-query.service.ts`

- Add `departmentId?: string` to the `getInstructorClassrooms(...)` args.
- Filter the classroom query by `sec.department_id = departmentId` when the value is present.
- Keep instructor, student, and admin access behavior unchanged.

**Migration required:** No - the department relationship already exists on sections/classrooms, so this is a query-scope change only.

---

### Phase 2 - Wire the admin department scope through the frontend

**Goal:** Make the admin classroom page request department-scoped classroom data while leaving instructor assignment institution-wide.

#### [MODIFY] use-classrooms-query.ts

Path: `packages/hooks/src/query/classrooms/use-classrooms-query.ts`

- Extend the hook signature to accept an options object such as `{ search?: string; departmentId?: string }`.
- Include `departmentId` in the query key.
- Pass the new parameter to `getClassrooms(...)`.

#### [MODIFY] classrooms.ts

Path: `packages/services/src/api/classrooms.ts`

- Add `departmentId` to the `getClassrooms(...)` argument shape.
- Serialize `departmentId` into the `/classrooms` query string when present.

#### [MODIFY] classrooms-page.tsx

Path: `app/sentinel-core/src/features/administration/classrooms/classrooms-page.tsx`

- Read `assignedDepartmentId` from `useAcademicScope()`.
- Pass `assignedDepartmentId` to `useClassroomsQuery(...)`.
- Keep the create button and permission gate behavior unchanged.
- Keep `CreateClassroomDialog` wired to the current classroom list so configured classroom IDs still exclude already-created class groups.

#### [MODIFY] create-classroom-dialog.tsx

Path: `app/sentinel-core/src/features/administration/classrooms/_components/create-classroom-dialog.tsx`

- Keep `useSubjectOfferingsQuery({ institutionId, visibility: 'default' })` intact so subject offerings remain institution-wide.
- Keep `InstructorSearchCombobox` scoped to the institution, not the department.
- Verify the class creation flow still allows assigning an instructor from another department after classroom creation.

**Migration required:** No - the scope is carried in the request and query layer only.

---

### Phase 3 - Add tests for the new scope contract

**Goal:** Prove the department restriction is applied in the classroom list while instructor assignment remains institution-wide.

#### [NEW] get-classrooms.controller.test.ts

Path: `app/sentinel-api/src/modules/core/classroom/controllers/get-classrooms.controller.test.ts`

- Verify the controller forwards `departmentId` and `search` to `ClassroomService.getClassrooms(...)`.
- Verify the institution guard still blocks requests without an active institution.

#### [NEW] instructor-classroom-query.service.test.ts

Path: `app/sentinel-api/src/modules/core/classroom/services/instructor-classroom-query.service.test.ts`

- Verify classrooms are filtered by `cg.institution_id`.
- Verify `departmentId` adds a `sec.department_id` filter when present.
- Verify the query still returns instructor-accessible classrooms correctly.

#### [NEW] use-classrooms-query.test.ts

Path: `packages/hooks/src/query/classrooms/use-classrooms-query.test.ts`

- Verify the hook includes `departmentId` in its query key.
- Verify `getClassrooms(...)` receives the department option.

#### [MODIFY] classrooms-page.test.tsx

Path: `app/sentinel-core/src/features/administration/classrooms/classrooms-page.test.tsx`

- Verify `useAcademicScope().assignedDepartmentId` is passed into the classroom query.
- Verify the page still renders the create button and classroom list for scoped admins.

#### [MODIFY] create-classroom-dialog.test.tsx

Path: `app/sentinel-core/src/features/administration/classrooms/_components/create-classroom-dialog.test.tsx`

- Verify the subject list remains institution-scoped.
- Verify the instructor combobox still searches the institution-wide instructor pool.
- Verify assigning an instructor from another department still succeeds in the dialog flow.

**Migration required:** No - these are contract and UI behavior tests only.

---

## API Impact

| Endpoint                 | Change                                     |
| ------------------------ | ------------------------------------------ |
| `GET /classrooms`        | Adds optional `departmentId` query support |
| `POST /classrooms`       | No change                                  |
| `GET /subject-offerings` | No change                                  |
| `GET /users`             | No change                                  |

No breaking schema changes are expected. No new environment variables are needed.

---

## Verification Plan

### Automated Tests

- [ ] Run the new/updated classroom controller and service tests in `app/sentinel-api`.
- [ ] Run the updated classroom query hook tests in `packages/hooks`.
- [ ] Run the updated admin classroom page and dialog tests in `app/sentinel-core`.

### Manual Verification

1. Open `sentinel-core` as an administrator.
2. Confirm the classroom list only shows classrooms from the administrator's department.
3. Confirm the search box still filters within the same scoped classroom list.
4. Open Create Classroom and confirm subject offerings still come from the current institution.
5. Search for an instructor from a different department and confirm the instructor can still be assigned.

### Success Criteria

- Classroom list scope is department-specific and institution-safe.
- Instructor assignment still works across department boundaries inside the same institution.
- No schema migration is required.
- Tests cover the new request contract and the frontend wiring.
