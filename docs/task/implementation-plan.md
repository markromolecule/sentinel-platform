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

- [x] **Debug 404 Error**: Verify the frontend API call path for `subject-classification`. Audit `app/sentinel-api/src/app.ts` and `subject-classification.routes.ts`. (Swapped route registration order in app.ts)
- [x] **Fix Admin Visibility**: Check permissions in `get-subject-classifications.controller.ts` and ensure the `Admin` role has the `subjects:view` permission. (Updated controller to handle institutionId query for support/superadmin and ensured Admin uses context institutionId)
- [x] **Vitest**: Create/Update tests for `SubjectClassificationService` and controllers. (Verified service retrieval with reproduction tests)

### Phase 2: Classroom Instructor Duplication

- [x] **API Deduplication**: Modify `ClassroomService` (or relevant repository) to ensure instructor lists are deduplicated based on `userId`. (Fixed in `classroom-instructor-management.service.ts` using SQL grouping and bool_or)
- [x] **Web Component Update**: Update `classroom-instructor-section.tsx` to handle the cleaned data. (Deduplication moved to API layer as per Option 2)
- [x] **Vitest**: Add tests to ensure no duplicate instructors are returned by the API. (Verified with reproduction test)

### Phase 3: Exam Dialog UI Issue

- [x] **UI Refactor**: Adjust `classroom-field.tsx` in `sentinel-web/src/features/exams`. (Refactored `ExamMetadataFormLayout` to use a more stable 2-column grid system)
- [x] **Visual Polish**: Ensure the classrooms list doesn't overlap outside the dialog boundaries. (Updated grid to lg:grid-cols-2 with explicit gap-x-12 and lg:border-l)

### Phase 4: Bulk Upload - Departments (Standardized)
- [x] **API**: Implement `bulkCreateDepartments` in `DepartmentService`.
- [x] **API**: Create `create-bulk-departments.controller.ts`.
- [x] **API**: Register `/bulk` route in `departments.routes.ts`.
- [x] **Web**: Create `BulkCreateDepartmentsDialog` & integration.
- [x] **Vitest**: Add tests for bulk creation logic.

### Phase 5: Bulk Upload - Sections (Standardized)
- [x] **API**: Ensure `createBulkSections` exists in `SectionService`.
- [x] **API**: Create `create-bulk-sections.controller.ts` (if missing).
- [x] **API**: Register `/bulk` route in `sections.routes.ts`.
- [x] **Web**: Create `BulkCreateSectionsDialog` & integration.
- [x] **Vitest**: Add tests for bulk creation logic.

---

## 3. Technical Notes & Database

- [x] **Prisma Migration**: Check if any schema changes are needed (Verified: existing schema supports all bulk fields).
- [x] **Comments**: Ensure all new service methods and controllers are documented with JSDoc style comments.
- [x] **Permissions**: Ensure `support` and `superadmin` roles have the necessary permissions for bulk operations. (Updated `packages/shared/src/constants/permissions.ts`)

## 4. Progress Monitoring

- [x] **Initial Planning**
- [x] **API Fixes (Phase 1 & 2)**
- [x] **Web UI Fixes (Phase 3)**
- [x] **Bulk Features (Phase 4 & 5)**
- [x] **Final QA & Testing** (Technical notes and permissions verified)
