# Exam Metadata & Classroom Assignment UX Improvements Implementation Plan

This plan details the implementation of improved subject and classroom assignment workflows for instructors and administrators. It ensures instructors can only select from approved subjects, administrators can search/filter subjects, and classrooms can be filtered by the exam's subject ID on both the client and server.

## 1-3-1 Analysis

### Options

**Option 1: Client-Side Only Filtering and Generic Select Dropdowns**

- **Approach:** Perform all filtering (e.g., matching classrooms to subject IDs, instructors to approved subjects) on the client side without modifying backend APIs. Use standard HTML/CSS styling improvements on the existing select dropdowns.
- **Tradeoff:** Simplest to implement with no API changes, but suffers from poor performance on large datasets (over-fetching classrooms) and does not provide text-searchable filtering for subjects/classrooms.

**Option 2: Full API-level Filtering + Custom Combobox Components**

- **Approach:**
    - Update the `/classrooms` API endpoint, services, and React Query hook to support query-time filtering by `subjectId`.
    - Restrict the instructor create-exam dialog to use `useEnrolledSubjectsQuery()`.
    - Implement searchable `SubjectSearchCombobox` and `RowClassroomCombobox` components using the existing `@sentinel/ui` Base-UI `Combobox` primitives.
- **Tradeoff:** Requires coordinate changes across the API, shared services, hook packages, and both web/core frontend apps, but provides optimal performance, strong data scoping, and premium UX.

**Option 3: Real-Time Dynamic Search Query Handler Integration**

- **Approach:** Create a dynamic query handler hook that automatically resolves dependencies and dynamically registers/queries subjects and classrooms on the fly, storing results in a global Zustand context state.
- **Tradeoff:** Extremely flexible for future features, but introduces high state-management complexity for a simple form filtering requirement.

### Best Option

**Option 2** is the best choice. It directly solves the performance issue by fetching only classrooms assigned to the subject from the database, implements high-quality searchable comboboxes consistent with existing proctor selection components, and enforces secure data scopes for instructors.

---

## User Review Required

> [!IMPORTANT]
> The classrooms query API endpoint `/classrooms` is updated to support an optional `subjectId` query parameter. This change is fully backwards-compatible (if omitted, all active classrooms are returned).

---

## Open Questions

None at this stage. All requirements are clearly mapped to the existing database schema and front-end component patterns.

---

## Proposed Changes

### API / Backend Component

#### [MODIFY] [classroom.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/classroom.dto.ts)

- Add optional `subjectId: z.string().uuid().optional()` to `getClassroomsSchema.request.query` to validate subject filtering requests.

#### [MODIFY] [get-classrooms.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/controllers/get-classrooms.controller.ts)

- Extract `subjectId` from validation query parameters in `getClassroomsRouteHandler` and pass it to `ClassroomService.getClassrooms`.

#### [MODIFY] [classroom.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/classroom.service.ts)

- Update `getClassrooms` service method signature and call to accept and forward `subjectId`.

#### [MODIFY] [instructor-classroom-query.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/services/instructor-classroom-query.service.ts)

- Update `getInstructorClassrooms` to accept `subjectId` in parameters.
- Append `.where('cg.subject_id', '=', subjectId)` to the query query if `subjectId` is provided.

---

### Shared Services and Hooks Component

#### [MODIFY] [classrooms.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/classrooms.ts)

- Update `getClassrooms` service signature parameters to support optional `subjectId` property.
- Append `subjectId` query parameter to `URLSearchParams` inside `getClassrooms`.

#### [MODIFY] [use-classrooms-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/classrooms/use-classrooms-query.ts)

- Extend `UseClassroomsQueryArgs` to include `subjectId?: string`.
- Update `normalizeClassroomQueryArgs` and `useClassroomsQuery` to map and pass the parameter through.

---

### Instructor Web App (sentinel-web) Component

#### [MODIFY] [basic-info-fields.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields.tsx)

- Replace `useSubjectsQuery` hook import with `useEnrolledSubjectsQuery`.
- Fetch instructor-specific approved subjects using `useEnrolledSubjectsQuery()` to restrict the dropdown.

---

### Admin Core App (sentinel-core) Component

#### [NEW] [subject-search-combobox.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields/subject-search-combobox.tsx)

- Create a searchable combobox component utilizing `@sentinel/ui` Combobox elements.
- Accept `value`, `onValueChange`, `subjects`, and `isLoading` props.
- Implement client-side filtering matching on subject code and title.

#### [MODIFY] [basic-info-fields.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields.tsx)

- Replace the primitive `<Select>` dropdown with the new `SubjectSearchCombobox` component.

#### [NEW] [row-classroom-combobox.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/exams/assign/_components/row-classroom-combobox.tsx>)

- Create a searchable, row-level combobox component for selecting classrooms.
- Render classroom name and scope (e.g., section, term) with client-side text filtering.

#### [MODIFY] [new-assignments-builder.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/exams/assign/_components/new-assignments-builder.tsx>)

- Pass `subjectId` to `useClassroomsQuery` so that the hook requests only classrooms corresponding to that subject from the backend.
- Replace the classroom `<Select>` field with `<RowClassroomCombobox>` for a smoother, searchable UX.

---

## Verification Plan

### Automated Tests

- Run backend classrooms query integration test:
    ```bash
    pnpm --dir app/sentinel-api test instructor-classroom-query.service.test.ts
    ```
- Run frontend query hooks tests:
    ```bash
    pnpm --dir packages/hooks test use-classrooms-query.test.ts
    ```
- Run admin basic info fields component tests:
    ```bash
    pnpm --dir app/sentinel-core test basic-info-fields.test.tsx
    ```

### Manual Verification

1. Log in as an **Instructor** on `sentinel-web`, open the "Create Exam" dialog, and verify that the select list shows _only_ subjects assigned/approved to that instructor.
2. Log in as an **Administrator** on `sentinel-core`, open the "Create Exam" dialog, and verify that the subject field is a searchable combobox that filters options as you type.
3. Open the "Assign Classrooms" builder for an exam on `sentinel-core`. Verify that:
    - The query only retrieves classrooms for the exam's subject ID.
    - The classroom selection field is a searchable combobox.
