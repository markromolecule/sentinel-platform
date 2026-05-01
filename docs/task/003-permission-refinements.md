# Task: Permission Refinements

This task involves refining permissions to enable specific workflows, particularly allowing instructors to republish (reschedule) archived exams and fixing locking issues.

## Goals

- [x] Enable instructors to republish/reschedule archived exams.
- [x] Rescheduling an archived exam now returns it to **Draft** status instead of Published.
- [x] Refine the RBAC sync logic to ensure system roles are always up-to-date with their blueprints.
- [x] Simplify the **Create Exam Dialog** (compact, modular, reduced text, Shadcn).
- [x] Fix the issue where saving a rescheduled exam as draft would fail with a "Locked" error.
- [x] Fix the issue where saving builder workspace or updating configuration would fail for rescheduled/previously published exams.

## Implementation Details

### 1. Permission Assignment & Sync

- Added `examinations:bypass_publish_lock` to the `instructor` role blueprint.
- Updated `syncSystemRolePermissions` to ensure system roles always receive blueprint permissions, even if mappings already exist. This allows instructors to bypass the lock on previously published/archived exams.

### 2. Status & Lock Management (Backend)

- **Lock Bypass**: Integrated `canBypassLock` across all relevant update paths:
    - `ExamService.updateExam` (General updates)
    - `BuilderService.saveBuilderWorkspace` (Question/Structure updates)
    - `ConfigurationService.updateExamConfiguration` (Settings updates)
- **Status Reset**:
    - Updated `updateExamStatus` and `updateExam` services to explicitly set `published_at` to `null` when an exam transitions back to `DRAFT`.
    - This ensures that once an exam returns to Draft, it is no longer considered "Published" by the locking logic.

### 3. UI Refinements (Frontend)

- **ExamEditForm**: Changed the rescheduling logic to set the status to `draft` instead of `published`. This allows instructors to re-configure the exam (e.g., for retakers) before publishing again.
- **ExamCreateDialog**: Simplified texts, reduced whitespace, and cleaned up the modular structure.
- **ExamMetadataFormLayout**: Reduced padding and adjusted spacing for a more compact feel.

### 4. Workflow Verification

- **Rescheduling**: Archived exams now show "Reschedule". Clicking it opens the edit form. Saving transitions the exam to **Draft** and clears its `published_at` date.
- **Mutable Drafts**: The "Locked" error no longer appears when saving these drafts because `published_at` is cleared and instructors have the bypass permission for the transition.

## Summary of Changes

- **Shared**: Updated `SYSTEM_ROLE_BLUEPRINTS` in `packages/shared/src/constants/permissions.ts`.
- **API**:
    - Updated `syncSystemRolePermissions` in `app/sentinel-api/src/modules/security/roles/data/sync-system-role-permissions.ts`.
    - Updated `updateExamStatus` and `updateExam` services to handle `published_at` clearing.
    - Added `canBypassLock` support to `BuilderService` and `ConfigurationService`.
    - Updated controllers for `update-exam`, `save-builder-workspace`, and `update-exam-configuration` to check and pass bypass permissions.
- **Web**:
    - Simplified `ExamCreateDialog`.
    - Updated `useExamEditForm` status logic.
    - Reduced text complexity in `ExamCreateForm`.
