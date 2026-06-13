# Walkthrough: Room Availability & Exam/Question Bank Access for Administrators

We have successfully implemented and verified all features and requirements outlined in the implementation plan: room availability lifecycle sync, replication of the Exams and Question Bank portals in `sentinel-core`, permission upgrades to dynamic Hono-context-based RBAC, hiding the room field for instructors, adding room assignment popups for administrators, and sharing of question bank collections.

## Changes Made

### 1. Database Schema Migration
- Added the `exam_category` enum (`CLASSROOM`, `MAJOR`) and an optional `exam_category` column with a default of `CLASSROOM` to the `exams` model.
- Deployed the migration and regenerated the Prisma Client and Kysely types.

### 2. API Modifications for Exam Category & Scoping
- Updated Zod validation schemas (`exam-schema.ts` and `exam.dto.ts`) to validate the new `examCategory` field.
- Updated database write builders (`build-exam-write-values.ts`) and response mappers (`map-exam-response.ts`) to read/write `exam_category`.
- Modified `get-exams.ts` and `get-exams.controller.ts` to scope exam queries by the administrator's `department_id` when the user has the `admin` role, while `superadmin` retains cross-tenant/cross-department view capabilities.

### 3. Dynamic Permission Enforcements
- Modified Hono API controllers across the `exams`, `question-bank`, `question-collection`, and `question` modules to pass the Hono context `c` instead of static role strings to `assertAssessmentAccess()` and `assertAssessmentReadAccess()`.
- Enforced dynamic permissions (`assessments:view`, `assessments:manage`) matching the role's assigned permissions in the database.

### 4. Automatic Room Status Synchronization
- Created the `recalculateRoomStatus` helper service (`recalculate-room-status.ts`) that dynamically evaluates a room's status based on scheduled, non-completed, non-archived exams.
- Integrated the status recalculation trigger into:
  - `create-exam.ts` (inside database transaction)
  - `update-exam.ts` (upon room or scheduling change)
  - `update-exam-status.ts` (upon transitions to `COMPLETED` or `ARCHIVED`)
  - `delete-exam.ts` (prior to deleting the exam record)

### 5. Sharing Question Collections
- Updated `getCollections` service and controller to allow instructors to see their own collections or collections marked as `isPublic` within their institution.
- Added a public sharing toggle switch to the `EditCollectionDialog` in the frontend.

### 6. Sentinel-Core Replication & Form Revisions
- Registered capabilities (`exams`, `question-bank`) and corresponding sidebar navigation links inside the `Management` section of the administrator portal.
- Replicated feature components and screens from `sentinel-web` into `sentinel-core`, resolving paths, utilities, and `cn` imports.
- Updated `sentinel-web` exam basic info form fields to completely hide the `RoomField` for instructors.
- Built a new `AssignRoomDialog` component and integrated it into the exam action list table in `sentinel-core`, allowing admins to assign rooms to `MAJOR` exams.

---

## Verification Results

### 1. Automated Unit Tests
All backend unit, service, and contract tests were run and validated using Vitest:
- **Total Tests Passed:** 807 tests (179 test files)
- **Failing/Skipped Tests:** 0

### 2. Monorepo Build Check
A full production build check was run through Turborepo:
- **Build Outcome:** Successful build for all 10 packages/apps including `sentinel-core`, `sentinel-web`, and `sentinel-api`.
- **Prettier Format Check:** Successfully verified that all code matches the project styling conventions.
