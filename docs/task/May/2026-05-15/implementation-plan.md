# Implementation Plan - Support Page Re-design & Filtering Enhancements

This document outlines the plan to re-design the support pages in `sentinel-support`, focusing on unifying the filtering logic, removing the legacy `TemplateContextToolbar`, and aligning the facets with institution and parent institution inheritance logic.

## 1. Problem Analysis & Options (1-3-1 Rule)

### 1.1 Problem Statement

The current support management pages (Departments, Courses, Subjects, etc.) use a fragmented filtering system. A "Parent Template Context" toolbar exists separately from the main data table's faceted filters. This creates a disjointed user experience and redundancy in the UI. Furthermore, the facets are currently client-side only, which doesn't fully leverage the institution-based data fetching logic provided by the backend.

### 1.2 Viable Options

**Option 1: Integrated DataTable Facets (Recommended)**

- **Description**: Remove the `TemplateContextToolbar` entirely. Move the institution selection into a dedicated "Institution" facet within the `DataTable`. Use the `onColumnFiltersChange` event to capture institution selection and trigger a re-fetch from the API (API-level filtering).
- **Facets**: Update facets to include metadata (e.g., "Branch" or "Template") and align with the inheritance status (Inherited, Local, Overridden).
- **Pros**: Seamless and modern UX, standardizes filtering patterns, reduces UI clutter, and directly integrates with the API logic.
- **Cons**: Requires careful wiring of `DataTable` filters to the page's query state.

**Option 2: Sidebar Filter Panel**

- **Description**: Replace the toolbar with a collapsible sidebar on the right side of the page that contains all filters (Institution, Search, Origin, etc.).
- **Pros**: Provides more space for complex filtering and allows for a "Premium" dashboard feel.
- **Cons**: Significant layout changes across all support pages; might be overkill for the current number of filters.

**Option 3: Integrated Page Header Filter**

- **Description**: Move the institution selection and context badges into the `PageHeader` as a secondary row or right-aligned control.
- **Pros**: Keeps the context visible at the top of the page without taking up table-specific toolbar space.
- **Cons**: Header becomes cluttered; filtering logic remains separated from the table's search and facets.

### 1.3 Recommendation

**Option 1** is chosen as it provides the most cohesive and efficient UX. It transforms the `DataTable` into a powerful, single-source-of-truth component for both searching and filtering (at both client and API levels), which aligns with the "premium" design standards of the project.

---

## 2. Implementation To-Do List

### Phase 1: Foundation & Shared Logic

- [x] **Refactor `DataTable` Integration**: Update the page hooks to support synchronizing `columnFilters` from the `DataTable` with the API query state (e.g., `selectedInstitutionId`).
- [x] **Enhance `Institution` Facet**: Create or update the logic to provide institution options for facets, including branch/template indicators.
- [x] **Shared Hooks**: Create/Update shared hooks in `sentinel-support` to handle the unified filtering logic across multiple pages.

### Phase 2: Department Management Re-design

- [x] **UI Refactor**: Remove `TemplateContextToolbar` from `app/sentinel-support/src/app/(protected)/(support)/departments/page.tsx`.
- [x] **Integrated Filtering**: Move institution selection into `DepartmentsList` facets.
- [x] **State Management**: Update `SupportDepartmentsPage` to use the facet selection for `useDepartmentsQuery`.
- [x] **Vitest**: Create unit tests for the updated department page state and filtering logic.

### Phase 3: Course & Subject Management Re-design

- [x] **Courses View**: Apply Option 1 to `CoursesView`. Integrate `selectedInstitutionId` into the table facets.
- [x] **Subjects View**: Apply Option 1 to `SubjectsView`. Ensure subject classifications are correctly handled during institution changes.
- [x] **Subjects Offered View**: Apply Option 1 to `SubjectsOfferedView` (located in `subjects/offered`).
- [ ] **Vitest**: Create unit tests for course and subject hooks.

### Phase 4: Sections Management Re-design

- [x] **Sections View**: Apply Option 1 to `SectionsView`. Ensure `departments` and `courses` dependencies are correctly updated when the institution context changes.
- [x] **UI Polish**: Ensure the "Add Section" and "Bulk Create" buttons align with the new unified filter layout.
- [ ] **Vitest**: Create unit tests for section filtering and data loading.

### Phase 5: Final Polish & UX Enhancements

- [x] **Design Consistency**: Ensure all management pages follow the same premium aesthetic (vibrant colors, glassmorphism hints where appropriate).
- [x] **Remove Facet Icons**: Removed icons from the institution facets for a more formal look as per user request.
- [ ] **Micro-animations**: Add subtle transitions when filters are applied or data is loading.
- [ ] **Empty States**: Ensure `DataTable` empty states are descriptive and helpful based on the active filters.
- [ ] **Final QA**: Verify that the institution/parent institution inheritance logic is preserved and correctly reflected in the UI.

---

## 3. Technical Notes

- **Prisma Migration**: No schema changes are required for this redesign.
- **API Consistency**: The existing backend services (e.g., `DepartmentService.getDepartments`) already support `institutionId` and `search` parameters, which will be leveraged.
- **Comments**: All refactored hooks and components will include JSDoc comments explaining the unified filtering mechanism.
- **Test Strategy**: Focus on verifying that selecting an institution in the table facet correctly triggers the API call with the corresponding ID.

---

## 4. Progress Monitoring

- [x] **Phase 1: Foundation**
- [x] **Phase 2: Departments**
- [x] **Phase 3: Courses & Subjects**
- [x] **Phase 4: Sections**
- [ ] **Phase 5: Polish & QA**
