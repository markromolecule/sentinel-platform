# Implementation Plan - Refactor Subject-Related Backend Services

Refactor the subject-related backend services (`SubjectService`, `SubjectOfferingsService`, and `SubjectClassificationService`) by extracting operational logic into modular files under their respective `services/` directories and establishing the main service files as clean delegating facades.

---

## 1-3-1 Alternatives Analysis

### Viable Options

#### Option 1: Full Modularization of all three services (Recommended)

Extract read, write, and manage operations into individual modular service classes under the `services/` directory of each module. Update the main entry point files (`subject.service.ts`, `subject-offerings.service.ts`, `subject-classification.service.ts`) to be clean facades delegating to the new services.
_Tradeoff:_ High refactoring footprint across the three modules, but fully aligns with the repository's modular service layer standard, makes files readable (<200 lines), and keeps interface backward-compatible.

#### Option 2: Extract only the largest methods (Hybrid)

Only extract the largest methods, such as `createSubjectOfferingsFromClassification` and the inheritance-based read methods, keeping smaller CRUD operations inline in the main files.
_Tradeoff:_ Faster to implement and fewer files created, but leaves the main service files partially cluttered and inconsistent in architecture.

#### Option 3: Remove class facades entirely and call modular services directly in controllers

Eliminate the class entry points (`SubjectService`, `SubjectOfferingsService`, `SubjectClassificationService`) completely and rewrite all controllers, routers, and test suites to import the new granular services directly.
_Tradeoff:_ Eliminates an extra layer of delegation, but dramatically increases the code changes in controllers and breaks backward compatibility.

### Chosen Option

**Option 1** is selected. It fully modularizes the logic, makes unit testing specific sub-actions cleaner, keeps files extremely small, and maintains backward compatibility for calling components (like controllers and existing tests) by preserving the class-based delegation facade.

---

## Proposed Changes

### Subjects Component

#### [NEW] [get-subjects.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/services/get-subjects.service.ts)

- Implements `GetSubjectsService` containing:
    - `getSubjects` method (loads subjects from DB and paginates using `paginateItems`).

#### [NEW] [manage-subjects.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/services/manage-subjects.service.ts)

- Implements `ManageSubjectsService` containing:
    - `createSubject` (delegates to `SubjectCrudService.createSubject` and triggers `ActivityNotificationService`).
    - `updateSubject` (delegates to `SubjectCrudService.updateSubject` and triggers `ActivityNotificationService`).
    - `deleteSubject` (delegates to `SubjectCrudService.deleteSubject` and triggers `ActivityNotificationService`).
    - `deleteSelectedSubjects` (delegates to `SubjectCrudService.deleteSelectedSubjects` and triggers `ActivityNotificationService`).
    - `buildSubjectLabel` (private helper method).

#### [MODIFY] [subject.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.service.ts)

- Preserve signature of `SubjectService` class.
- Delegate all static methods to `GetSubjectsService` and `ManageSubjectsService`.

---

### Subject Offerings Component

#### [NEW] [get-subject-offerings.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/services/get-subject-offerings.service.ts)

- Implements `GetSubjectOfferingsService` containing:
    - `getSubjectOfferings` (loads offerings, validates compat, and paginates).
    - `getSubjectOfferingById` (loads single offering record by ID).

#### [NEW] [create-subject-offering.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/services/create-subject-offering.service.ts)

- Implements `CreateSubjectOfferingService` containing:
    - `createSubjectOffering` (validates term and subject scopes, maps values, inserts record, and configures class groups/assignments).
    - Helper functions `ensureClassGroupsForSubjectOfferings`.

#### [NEW] [create-subject-offerings-from-classification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/services/create-subject-offerings-from-classification.service.ts)

- Implements `CreateSubjectOfferingsFromClassificationService` containing:
    - `createSubjectOfferingsFromClassification` (handles bulk offering creation, checks duplicate strategy, verifies scopes, inserts records, maps assignments).
    - Helper functions `isClassificationSubjectForOffering`, `uniqueIds`, and `assertSubjectOfferingAssignmentsVisible`.

#### [NEW] [update-delete-subject-offering.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/services/update-delete-subject-offering.service.ts)

- Implements `UpdateDeleteSubjectOfferingService` containing:
    - `updateSubjectOffering` (updates assignments, offering values, and class groups).
    - `deleteSubjectOffering` (deletes offering by ID).
    - `deleteSubjectOfferings` (bulk deletes offerings).

#### [MODIFY] [subject-offerings.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.service.ts)

- Preserve signature of `SubjectOfferingsService` class.
- Delegate all static methods to `GetSubjectOfferingsService`, `CreateSubjectOfferingService`, `CreateSubjectOfferingsFromClassificationService`, and `UpdateDeleteSubjectOfferingService`.

---

### Subject Classifications Component

#### [NEW] [get-subject-classifications.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/services/get-subject-classifications.service.ts)

- Implements `GetSubjectClassificationsService` containing:
    - `getSubjectClassifications` (loads classification cards and paginates).
    - `getSubjectClassification` (loads classification by ID, resolves parent scopes).
    - Helper `getParentVisibleInstitutionIds`.

#### [NEW] [manage-subject-classification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/services/manage-subject-classification.service.ts)

- Implements `ManageSubjectClassificationService` containing:
    - `createSubjectClassification` (creates card and updates assignments).
    - `updateSubjectClassification` (updates classification info and mappings).
    - `deleteSubjectClassification` (deletes card and assignments).

#### [MODIFY] [subject-classification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.ts)

- Preserve signature of `SubjectClassificationService` class.
- Delegate all static methods to `GetSubjectClassificationsService` and `ManageSubjectClassificationService`.

---

## Execution Checklist

### Phase 1: Refactor SubjectService

**Goal:** Modularize subjects main service file.

- [x] Create [get-subjects.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/services/get-subjects.service.ts).
- [x] Create [manage-subjects.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/services/manage-subjects.service.ts).
- [x] Modify [subject.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.service.ts) to delegate to the new services.
- [x] Run test suite `pnpm --dir app/sentinel-api test src/modules/core/subjects/subject.service.test.ts` and verify it passes.

**Migration required:** No

### Phase 2: Refactor SubjectOfferingsService

**Goal:** Modularize subject offerings main service file.

- [x] Create [get-subject-offerings.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/services/get-subject-offerings.service.ts).
- [x] Create [create-subject-offering.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/services/create-subject-offering.service.ts).
- [x] Create [create-subject-offerings-from-classification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/services/create-subject-offerings-from-classification.service.ts).
- [x] Create [update-delete-subject-offering.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/services/update-delete-subject-offering.service.ts).
- [x] Modify [subject-offerings.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.service.ts) to delegate to the new services.
- [x] Run test suite `pnpm --dir app/sentinel-api test src/modules/core/subject-offerings/services/bulk-create-subject-offerings-from-classification.test.ts` and verify it passes.

**Migration required:** No

### Phase 3: Refactor SubjectClassificationService

**Goal:** Modularize subject classifications main service file.

- [x] Create [get-subject-classifications.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/services/get-subject-classifications.service.ts).
- [x] Create [manage-subject-classification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/services/manage-subject-classification.service.ts).
- [x] Modify [subject-classification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.ts) to delegate to the new services.
- [x] Run test suite `pnpm --dir app/sentinel-api test src/modules/core/subject-classification/subject-classification.service.test.ts` and verify it passes.

**Migration required:** No

---

## Verification Plan

### Automated Tests

- Run all related test suites:
    ```bash
    pnpm --dir app/sentinel-api test src/modules/core/subjects/subject.service.test.ts
    pnpm --dir app/sentinel-api test src/modules/core/subject-classification/subject-classification.service.test.ts
    pnpm --dir app/sentinel-api test src/modules/core/subject-offerings/services/bulk-create-subject-offerings-from-classification.test.ts
    ```

### Manual Verification

- Start the server (`pnpm dev`) and compile the api package (`pnpm --dir app/sentinel-api build`) to confirm everything builds and typechecks cleanly with no errors.
