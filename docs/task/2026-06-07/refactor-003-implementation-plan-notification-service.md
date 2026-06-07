---
trigger: always_on
---

# Refactor Notification Service Implementation Plan

Refactor `sentinel-api`'s `NotificationService` to extract domain-specific notify helpers into specialized modular services, improving maintainability, scalability, and readability.

## Proposed Changes

We will modularize the notification system by splitting `NotificationService` into:
1. `NotificationService` (containing only the core database and scoping operations: `createNotification`, `listNotifications`, `markNotificationRead`, `markAllNotificationsRead`).
2. `ExamNotificationService` (`services/exam-notification.service.ts` for exam assignments).
3. `ClassroomNotificationService` (`services/classroom-notification.service.ts` for classroom assignments).
4. `SubjectRequestNotificationService` (`services/subject-request-notification.service.ts` for instructor subject requests).

This eliminates circular dependencies since `NotificationService` will no longer depend on domain types or sub-services, and the domain-specific notification services will simply consume `NotificationService.createNotification`.

### Notification Module

---

#### [MODIFY] [notification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/notification.service.ts)
- Remove all static `notifyExamAssignment*`, `notifyClassroom*`, and `notifyInstructorSubject*` helper methods.
- Keep only core database CRUD and compatibility operations: `createNotification`, `listNotifications`, `markNotificationRead`, and `markAllNotificationsRead`.

#### [NEW] [exam-notification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/exam-notification.service.ts)
- Create `ExamNotificationService` with methods:
  - `notifyExamAssignmentCreated`
  - `notifyExamAssignmentAccepted`
  - `notifyExamAssignmentRejected`
- Add JSDoc comments to all exported functions.

#### [NEW] [classroom-notification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/classroom-notification.service.ts)
- Create `ClassroomNotificationService` with methods:
  - `notifyClassroomInstructorAssigned`
  - `notifyClassroomAssignmentAcknowledged`
  - `notifyClassroomAssignmentFlagged`
- Add JSDoc comments to all exported functions.

#### [NEW] [subject-request-notification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/subject-request-notification.service.ts)
- Create `SubjectRequestNotificationService` with methods:
  - `notifyInstructorSubjectRequestSubmitted`
  - `notifyInstructorSubjectRequestApproved`
  - `notifyInstructorSubjectRequestRejected`
- Add JSDoc comments to all exported functions.

#### [MODIFY] [notification.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/notification.service.test.ts)
- Move tests for `notifyExamAssignmentCreated` and `notifyClassroomInstructorAssigned` to new test files.
- Keep tests only for the core CRUD operations.

#### [DELETE] [notification-phase6.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/notification-phase6.service.test.ts)
- Delete this file since all phase 6 tests are being moved to the respective new services' tests.

#### [NEW] [exam-notification.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/exam-notification.service.test.ts)
- Unit tests for `ExamNotificationService` (moved from `notification.service.test.ts`).

#### [NEW] [classroom-notification.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/classroom-notification.service.test.ts)
- Unit tests for `ClassroomNotificationService` (moved from `notification.service.test.ts` and `notification-phase6.service.test.ts`).

#### [NEW] [subject-request-notification.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/subject-request-notification.service.test.ts)
- Unit tests for `SubjectRequestNotificationService` (moved from `notification-phase6.service.test.ts`).

### Domain Services (Callers)

---

#### [MODIFY] [create-exam-assignment.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/create-exam-assignment.ts)
- Update import from `NotificationService` to `ExamNotificationService`.
- Call `ExamNotificationService.notifyExamAssignmentCreated`.

#### [MODIFY] [create-exam-assignment.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/create-exam-assignment.test.ts)
- Update imports and mocks to mock `ExamNotificationService` instead of `NotificationService`.

#### [MODIFY] [respond-to-exam-assignment.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/respond-to-exam-assignment.ts)
- Update import from `NotificationService` to `ExamNotificationService`.
- Call `ExamNotificationService.notifyExamAssignmentAccepted` and `ExamNotificationService.notifyExamAssignmentRejected`.

#### [MODIFY] [respond-to-exam-assignment.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/respond-to-exam-assignment.test.ts)
- Update imports and mocks to mock `ExamNotificationService` instead of `NotificationService`.

#### [MODIFY] [classroom-instructor-write.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/services/classroom-instructor-write.service.ts)
- Update import from `NotificationService` to `ClassroomNotificationService`.
- Call `ClassroomNotificationService.notifyClassroomInstructorAssigned`.

#### [MODIFY] [classroom-instructor-write.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/services/classroom-instructor-write.service.test.ts)
- Update imports and mocks to mock `ClassroomNotificationService` instead of `NotificationService`.

#### [MODIFY] [classroom-assignment-response.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/services/classroom-assignment-response.service.ts)
- Update import from `NotificationService` to `ClassroomNotificationService`.
- Call `ClassroomNotificationService.notifyClassroomAssignmentAcknowledged` and `ClassroomNotificationService.notifyClassroomAssignmentFlagged`.

#### [MODIFY] [classroom-assignment-response.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/services/classroom-assignment-response.service.test.ts)
- Update imports and mocks to mock `ClassroomNotificationService` instead of `NotificationService`.

#### [MODIFY] [instructor-subject-requests-write.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/instructor-subject-requests/services/instructor-subject-requests-write.service.ts)
- Update import from `NotificationService` to `SubjectRequestNotificationService`.
- Call `SubjectRequestNotificationService.notifyInstructorSubjectRequestApproved` and `SubjectRequestNotificationService.notifyInstructorSubjectRequestRejected`.

#### [MODIFY] [instructor-subject-requests-write.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/instructor-subject-requests/services/instructor-subject-requests-write.service.test.ts)
- Update imports and mocks to mock `SubjectRequestNotificationService` instead of `NotificationService`.


## Phase 1: Modularize Domain Notification Services
Goal: Extract domain notification helpers into their respective service files and write corresponding unit tests.

- [x] Create `app/sentinel-api/src/modules/general/notification/services/exam-notification.service.ts`
- [x] Create `app/sentinel-api/src/modules/general/notification/services/classroom-notification.service.ts`
- [x] Create `app/sentinel-api/src/modules/general/notification/services/subject-request-notification.service.ts`
- [x] Create `app/sentinel-api/src/modules/general/notification/services/exam-notification.service.test.ts`
- [x] Create `app/sentinel-api/src/modules/general/notification/services/classroom-notification.service.test.ts`
- [x] Create `app/sentinel-api/src/modules/general/notification/services/subject-request-notification.service.test.ts`
- [x] Run `pnpm --dir app/sentinel-api test notification` to verify the new services and their tests pass successfully.

**Migration required:** No.

## Phase 2: Clean Up Core Notification Service
Goal: Remove the domain notification helper methods from the main NotificationService and update its tests.

- [x] Modify `app/sentinel-api/src/modules/general/notification/notification.service.ts` to remove all helper methods.
- [x] Modify `app/sentinel-api/src/modules/general/notification/notification.service.test.ts` to remove the helper tests.
- [x] Delete `app/sentinel-api/src/modules/general/notification/notification-phase6.service.test.ts`.
- [x] Run `pnpm --dir app/sentinel-api test notification` to verify that NotificationService works correctly and all unit tests pass.

**Migration required:** No.

## Phase 3: Update Callers and Mocks
Goal: Update business-logic service files and test mocks to use the new domain notification services directly.

- [x] Modify `app/sentinel-api/src/modules/examination/assign/services/create-exam-assignment.ts` & `create-exam-assignment.test.ts`
- [x] Modify `app/sentinel-api/src/modules/examination/assign/services/respond-to-exam-assignment.ts` & `respond-to-exam-assignment.test.ts`
- [x] Modify `app/sentinel-api/src/modules/core/classroom/services/classroom-instructor-write.service.ts` & `classroom-instructor-write.service.test.ts`
- [x] Modify `app/sentinel-api/src/modules/core/classroom/services/classroom-assignment-response.service.ts` & `classroom-assignment-response.service.test.ts`
- [x] Modify `app/sentinel-api/src/modules/core/instructor-subject-requests/services/instructor-subject-requests-write.service.ts` & `instructor-subject-requests-write.service.test.ts`
- [x] Run `pnpm --dir app/sentinel-api test` to confirm everything builds and passes.

**Migration required:** No.

## Done Criteria

- `NotificationService` only exposes the four core CRUD/compatibility operations.
- Three new domain notification service classes are created under `services/`.
- All JSDocs are added to the exported functions of the new services.
- Caller files and test mocks are completely updated and contain no references to the deleted helpers on `NotificationService`.
- No circular dependencies exist.
- All vitest tests in `sentinel-api` pass without error.
