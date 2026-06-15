# Implementation Plan - Sentinel Web Fixes & Enhancements

This document outlines the plan to resolve reported issues in `sentinel-web` and `sentinel-api`, and to implement new bulk upload features for departments and sections.

## 1. Problem Analysis & Options (1-3-1 Rule)

### 1.1 Problem Statement

The application is experiencing routing errors (404) for subject classifications, data duplication in classroom instructor lists, and UI layout issues in the exam creation dialog. Additionally, there is a requirement for bulk uploading departments and sections to improve administrative efficiency.

### 1.2 Viable Options

**Option 1: Minimal Surgical Fixes**

- **Fixes**: Correct the API endpoint paths in the frontend, add a simple `uniqBy` filter in the classroom UI, and adjust the CSS `overflow` property for the exam dialog.
- **Bulk Upload**: Implement basic array-based endpoints in the API and simple file-input buttons in the Web UI.
- **Pros**: Fast to implement, low impact on existing architecture.
- **Cons**: Doesn't address the root cause of data duplication or provide a robust import UX.

**Option 2: Service-Layer Standardization (Recommended)**

- **Fixes**: Standardize API routing in `app.ts`, move deduplication logic to the API Service layer (ensuring consistency across Web/Mobile), and refactor the Exam Dialog to use a more flexible UI pattern (e.g., Popover or Command menu).
- **Bulk Upload**: Create dedicated bulk services in the API with proper validation and transaction support. Build a reusable `BulkUploadButton` in the Web UI.
- **Pros**: Solves issues for all platforms (Mobile included), improves code maintainability, and provides a premium feel.
- **Cons**: Requires more time for refactoring and testing.

**Option 3: Full Feature Overhaul**

- **Fixes**: Same as Option 2, plus a full audit of all "Classification" endpoints for permission consistency.
- **Bulk Upload**: Add a full "Import Wizard" with data mapping, preview, and error reporting.
- **Pros**: Best possible UX and long-term stability.
- **Cons**: High effort, potentially delaying other critical tasks.

### 1.3 Recommendation

**Option 2** is chosen as it provides a robust solution that fixes the root causes (especially the duplication issue affecting both Web and Mobile) without the high overhead of a full wizard-style import system.

---

## 2. Implementation To-Do List

### Phase 1: API Debugging & Subject Classification Fixes

- [ ] **Debug 404 Error**: Verify the frontend API call path for `subject-classification`. Audit `app/sentinel-api/src/app.ts` and `subject-classification.routes.ts`.
- [ ] **Fix Admin Visibility**: Check permissions in `get-subject-classifications.controller.ts` and ensure the `Admin` role has the `subjects:view` permission or equivalent.
- [ ] **Vitest**: Create/Update tests for `SubjectClassificationService` and controllers.
    - Path: `app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.test.ts`

### Phase 2: Classroom Instructor Duplication

- [ ] **API Deduplication**: Modify `ClassroomService` (or relevant repository) to ensure instructor lists are deduplicated based on `userId`.
- [ ] **Web Component Update**: Update `classroom-instructor-section.tsx` to handle the cleaned data.
- [ ] **Vitest**: Add tests to ensure no duplicate instructors are returned by the API.

### Phase 3: Exam Dialog UI Issue

- [ ] **UI Refactor**: Adjust `classroom-field.tsx` in `sentinel-web/src/features/exams`. Ensure the `ScrollArea` and parent containers handle overflow correctly. Consider moving the selection to a Popover if the list is long.
- [ ] **Visual Polish**: Ensure the classrooms list doesn't overlap outside the dialog boundaries.

### Phase 4: Bulk Upload for Departments

- [ ] **API - Service**: Implement `bulkCreateDepartments` in `DepartmentService`.
- [ ] **API - Controller**: Create `create-bulk-departments.controller.ts`.
- [ ] **API - Route**: Register the `/bulk` route in `departments.routes.ts`.
- [ ] **Web - UI**: Add a "Bulk Upload" button to the Departments management page.
- [ ] **Vitest**: Add tests for bulk creation logic.

### Phase 5: Bulk Upload for Sections

- [ ] **API - Service**: Ensure `createBulkSections` in `SectionService` is fully optimized.
- [ ] **API - Controller**: Verify/Enhance `create-bulk-sections.controller.ts`.
- [ ] **Web - UI**: Add a "Bulk Upload" button to the Sections management page.
- [ ] **Vitest**: Add tests for bulk creation logic.

---

## 3. Technical Notes & Database

- [ ] **Prisma Migration**: Check if any schema changes are needed (likely not for these fixes, but will verify during bulk upload implementation).
- [ ] **Comments**: Ensure all new service methods and controllers are documented with JSDoc style comments.
- [ ] **Permissions**: Ensure `support` and `superadmin` roles have the necessary permissions for bulk operations.

## 4. Progress Monitoring

- [ ] **Initial Planning**
- [ ] **API Fixes (Phase 1 & 2)**
- [ ] **Web UI Fixes (Phase 3)**
- [ ] **Bulk Features (Phase 4 & 5)**
- [ ] **Final QA & Testing**
