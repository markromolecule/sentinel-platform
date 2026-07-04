# Implementation Plan: Administrator View Subject Offering Details

Detail the requirements, database query mappings, API contracts, frontend services, and UI components for enabling administrators to view the complete metadata of an offered subject, including the instructor(s) assigned to the subject's classrooms.

---

## 1-3-1 Rule Options Analysis

### Viable Options to Solve the Problem

#### Option 1: Slide-over Drawer / Detail Sheet (Recommended)

- **Description**: Add a "View Details" action to the actions menu and make the Subject Code clickable. When clicked, load the full metadata and assigned instructors using a new query hook, displaying them in a right-aligned slide-out `Sheet` (re-using the pattern from `QuestionPreviewSheet`).
- **Tradeoff**: Offers a highly premium, context-preserving user experience without interrupting the table navigation, but has slightly less screen space than a dedicated full-page view.

#### Option 2: Center Modal Dialog

- **Description**: Implement the detailed metadata and instructor list inside a standard centered modal `Dialog` component (like `AssignSubjectToInstructorDialog`).
- **Tradeoff**: Very simple to layout and implement, but completely blocks the view of the main offered subjects table.

#### Option 3: Dedicated Next.js Page Route

- **Description**: Implement a new route at `/subjects/offered/[id]/page.tsx` containing the detailed metadata, assigned instructors, and related classrooms.
- **Tradeoff**: Provides bookmarkable, shareable URLs and maximum layout space, but introduces page transition overhead and extra boilerplate code.

### Selected Best Option

We choose **Option 1 (Slide-over Drawer / Detail Sheet)** as the best option. Slide-out sheets are already established in the codebase for detailed read-only previews (e.g. `QuestionPreviewSheet`), keeping the interface fast and lightweight while allowing the administrator to inspect multiple offerings without losing search/pagination states.

---

## User Review Required

> [!IMPORTANT]
> The single subject offering retrieval will include a nested subquery fetching all assigned instructors across the offering's sections. There are no breaking changes or migration requirements.

---

## Open Questions

> [!NOTE]
> None. The requirement specifies that administrators should view the metadata of the offered subject, including the assigned instructor(s). We will resolve all active instructors assigned to the sections of the offered subject.

---

## Proposed Changes

### Phase 1: Database Query & Backend DTOs (`packages/shared` & `app/sentinel-api`)

**Goal:** Expose the assigned instructors list in the subject offering queries and create the schema definition.

- [x] Modify `packages/shared/src/types/index.ts` to add `SubjectOfferingInstructor` interface and `instructors?: SubjectOfferingInstructor[]` to the `SubjectOffering` interface.
- [x] Modify `app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.dto.ts` to define `subjectOfferingInstructorSchemaOpenApi` and add `instructors` array to `subjectOfferingSchemaOpenApi`.
- [x] Modify `app/sentinel-api/src/modules/core/subject-offerings/data/get-subject-offering-by-id.ts` to fetch assigned instructors using a subquery aggregating the assigned instructors (from both `class_roles` and `classroom_instructor_assignments`) across all sections of the subject offering.
- [x] Modify `app/sentinel-api/src/modules/core/subject-offerings/data/get-subject-offerings.ts` to also fetch instructors in the list query.
- [x] Modify `app/sentinel-api/src/modules/core/subject-offerings/helper/map-subject-offering-response.ts` to map the `instructors` field using a helper function `toInstructorArray`.
- [x] Write unit test in `app/sentinel-api/src/modules/core/subject-offerings/helper/map-subject-offering-response.test.ts` to verify mapping of instructors list.

**Migration required:** No — querying existing relations and tables.

---

### Phase 2: Backend API Controller (`app/sentinel-api`)

**Goal:** Create the single subject offering detail retrieval endpoint.

- [x] Create `app/sentinel-api/src/modules/core/subject-offerings/controllers/get-subject-offering.controller.ts` to handle `GET /subject-offerings/:id` with permission check `subject_offerings:view`.
- [x] Register the new route in `app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.routes.ts`.
- [x] Write unit tests for the controller in `app/sentinel-api/src/modules/core/subject-offerings/controllers/get-subject-offering.controller.test.ts`.

**Migration required:** No.

---

### Phase 3: Frontend Client Services & Query Hooks (`packages/services` & `packages/hooks`)

**Goal:** Implement API service call and React Query hooks.

- [x] Modify `packages/services/src/api/subject-offerings.ts` to add `getSubjectOffering(apiClient, id)` API service function.
- [x] Create `packages/hooks/src/query/subject-offerings/use-subject-offering-query.ts` hook wrapping `getSubjectOffering`.
- [x] Export `useSubjectOfferingQuery` in `packages/hooks/src/query/subject-offerings/index.ts` and `packages/hooks/src/index.ts`.
- [x] Create Vitest unit test in `packages/hooks/src/query/subject-offerings/use-subject-offering-query.test.ts` to verify cache loading and endpoint calls.

**Migration required:** No.

---

### Phase 4: UI Components & Offered Subjects Page (`app/sentinel-core`)

**Goal:** Implement the slide-out sheet and wire up details viewing in the offered subjects listing.

- [x] Create `app/sentinel-core/src/app/(protected)/subjects/_components/dialogs/subject-offering-details-sheet.tsx` displaying status, metadata (departments, courses, term, etc.), sections, and a detailed list of assigned instructors with their name/email.
- [x] Modify `app/sentinel-core/src/app/(protected)/subjects/_components/tables/subject-offering-columns.tsx` to add `onViewDetails` to column arguments and make the Subject Code cell clickable.
- [x] Modify `app/sentinel-core/src/app/(protected)/subjects/_components/tables/_components/subject-offering-actions-menu.tsx` to add a "View Details" dropdown action.
- [x] Modify `app/sentinel-core/src/app/(protected)/subjects/_components/tables/subject-offering-actions-cell.tsx` to support the "View Details" click.
- [x] Modify `app/sentinel-core/src/app/(protected)/subjects/_components/views/offered-subjects-list.tsx` (not needed; handled state in parent page.tsx)
- [x] Modify `app/sentinel-core/src/app/(protected)/subjects/offered/page.tsx` to bind the new columns configuration with `onViewDetails` and mount `SubjectOfferingDetailsSheet`.
- [x] Verify that all UI elements build cleanly.

**Migration required:** No.

---

## Verification Plan

### Automated Tests

- Run backend tests to verify get subject offering controller:
    ```bash
    pnpm --dir app/sentinel-api test src/modules/core/subject-offerings/controllers/get-subject-offering.controller.test.ts
    ```
- Run query hook tests:
    ```bash
    pnpm --dir packages/hooks test src/query/subject-offerings/use-subject-offering-query.test.ts
    ```
- Run frontend components build/typecheck:
    ```bash
    pnpm --dir app/sentinel-core build
    ```

### Manual Verification

1. Log in as an administrator.
2. Navigate to **Offered Subjects**.
3. Click on a subject code or select **View Details** from the action dropdown menu of an offered subject.
4. Verify the slide-out sheet opens showing the offered subject's full metadata.
5. Assign an instructor to the subject using the "Assign to Instructor" dialog.
6. Re-open the detail view and confirm the instructor's name and email appear under the assigned instructors section.
