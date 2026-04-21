# Classroom Management Implementation Plan

## Objective
Introduce a classroom management flow that becomes the instructor-facing source of truth for:
- approved offered subject to section grouping
- classroom naming and ownership
- classroom student enrollment using claimed accounts only
- exam creation and assignment through classrooms instead of direct subject and section selection

This implementation is scoped end to end:
- backend data model and APIs
- shared contracts and service clients
- instructor web pages and forms
- exam flow adjustments
- student attempt safeguards related to turned-in exams

## Finalized Decisions For V1
- A classroom is based on the existing `class_groups` record.
- One classroom maps to exactly one approved subject offering and one section.
- One exam maps to exactly one classroom.
- Only claimed student accounts can be enrolled into a classroom.
- The implementation will preserve legacy exam subject and section fields as derived compatibility fields during the transition.

## Current Repo State
- `app/sentinel-api/src/modules/core/classroom/` exists but is currently scaffolded and empty.
- The repo already has `class_groups`, `class_roles`, `enrollments`, and subject offering relationships in Prisma.
- Student enrollment already uses `classGroupId`.
- The exam flow still uses `subjectId` and `sectionIds` in shared schema and frontend form state.
- `subject_offering_id` already exists in Prisma and is already linked to `class_groups`.
- The student exam flow still needs a safeguard for already turned-in attempts to prevent duplicate entry.
- The current exam module still owns classroom-adjacent concerns that should move behind classroom-driven contracts:
  - exam create and edit payloads still accept `subjectId`, `section`, `sectionId`, and `sectionIds`
  - exam write services still derive persistence directly from subject and section fields
  - exam read models still expose assigned sections as a first-class exam concern
  - frontend exam forms still source approved subjects and sections directly instead of consuming classrooms
  - builder setup state still persists subject and section metadata as the primary assignment context

---

## Phase 0 — Student Attempt Guardrail

### Goal
Prevent students from starting or resuming an exam if their latest attempt is already turned in or completed.

### Backend Scope
- Trace the exam access or session-start path that creates or resumes attempts.
- Add a server-side check for already completed or turned-in attempts.
- Return a stable error or status payload the frontend can use to block duplicate entry.

### Frontend Scope
- Update the student exam page to respect the backend result.
- Prevent duplicate exam launch and show the correct state if the exam is already turned in.
- Reuse existing status presentation if possible.

### Validation
- student cannot create a second active attempt after turn-in
- refreshed page still shows correct turned-in state
- existing valid exam-start flow remains unchanged for first-time attempts

### Approval Gate
Stop after this phase.
Report:
- backend files changed
- frontend files changed
- tests run
- manual flow checked

Ask: `Phase 0 is complete. Proceed to Phase 1?`

---

## Phase 1 — Data Model And Backend Foundation

### Goal
Turn the existing `class_groups` domain into the classroom foundation and link exams to classrooms.

### Database Scope
- Extend `class_groups` with classroom-facing metadata:
  - `class_name`
  - `updated_at`
  - `updated_by`
- Add `class_group_id` to `exams`.
- Add foreign key and indexes needed for classroom-based exam lookup.
- Backfill `exams.class_group_id` where it can be resolved from existing subject, section, term, and institution data.
- Keep legacy columns and compatibility reads intact.

### Prisma And Migration Scope
- update `packages/db/prisma/schema.prisma`
- add migration
- check whether any mirrored SQL under web migrations also needs alignment
- ensure the migration is safe for existing data

### Backend Domain Scope
- define classroom DTOs in `app/sentinel-api/src/modules/core/classroom/classroom.dto.ts`
- define classroom service orchestration in `app/sentinel-api/src/modules/core/classroom/classroom.service.ts`
- define classroom routes in `app/sentinel-api/src/modules/core/classroom/classroom.routes.ts`
- register the classroom router in `app/sentinel-api/src/app.ts`

### API Endpoints For This Phase
- `GET /classrooms`
- `GET /classrooms/:id`
- `POST /classrooms`
- `PATCH /classrooms/:id`

### Core Rules
- classroom create configures an existing instructor-accessible `class_group`
- classroom create requires `classGroupId` and `className`
- classroom rename only changes classroom metadata
- classroom list is scoped to the requesting instructor
- classroom detail includes metadata, scope summary, and student count

### Validation
- migration applies cleanly
- classroom endpoints respect instructor scope
- unauthorized classroom access is rejected
- existing non-classroom features still compile against the updated schema

### Approval Gate
Stop after this phase.
Report:
- migration and schema changes
- backend endpoints completed
- compatibility considerations
- tests run

Ask: `Phase 1 is complete. Proceed to Phase 2?`

---

## Phase 2 — Classroom Student Management APIs

### Goal
Make classroom detail the instructor’s real place for roster management while reusing existing enrollment logic.

### Backend Scope
- add classroom roster read support
- either include roster in `GET /classrooms/:id` or provide `GET /classrooms/:id/students`
- reuse existing student enrollment preview and enroll logic with `classGroupId`
- avoid duplicating whitelist and claim validation logic
- keep claimed-account-only enforcement on the server

### Expected Data Returned
- classroom metadata
- subject offering information
- section information
- student roster
- total enrolled count
- derived scope labels for UI

### Integration Scope
- verify the current `/enrollments/enroll/students`
- verify the current `/enrollments/enroll/students/preview`
- ensure classroom pages can call these without inventing a second enrollment flow

### Validation
- preview still marks claimed, unclaimed, already enrolled, and not whitelisted students correctly
- classroom roster reflects successful enrollments
- department and course mismatch rules still work

### Approval Gate
Stop after this phase.
Report:
- roster endpoints added or adjusted
- reused existing enrollment logic
- response contract finalized
- tests run

Ask: `Phase 2 is complete. Proceed to Phase 3?`

---

## Phase 3 — Instructor Classroom Management UI

### Goal
Add a dedicated classroom management experience in the instructor web app.

### Frontend Scope
Create:
- `app/sentinel-web/src/app/(protected)/(instructor)/classrooms/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/classrooms/[id]/page.tsx`

Add support for:
- classroom list page
- create classroom dialog
- classroom detail page
- classroom roster management
- search and empty states
- sidebar navigation entry

### UI Behavior
- the classroom list shows:
  - class name
  - subject code and title
  - section name
  - student count
  - exam count if available
- the create dialog lets the instructor:
  - choose from approved subject offerings
  - choose one section
  - assign a class name
- the classroom detail page becomes the main place to:
  - view classroom info
  - add students
  - preview uploads
  - manually enroll claimed students

### Reuse Expectations
- reuse `useEnrolledSubjectsQuery`
- reuse existing student enrollment dialog logic where practical
- reuse existing preview and enrollment UX patterns instead of inventing a second student import flow

### Navigation Scope
- add `Classrooms` to the instructor sidebar
- keep current `Students` page during transition
- treat classroom detail as the preferred enrollment destination

### Validation
- classroom page loads with real data
- create classroom works from approved offering and section data
- detail page shows roster and supports student enrollment
- sidebar navigation highlights correctly

### Approval Gate
Stop after this phase.
Report:
- pages and components added
- navigation changes
- shared UI reused
- tests run
- manual UX checks performed

Ask: `Phase 3 is complete. Proceed to Phase 4?`

---

## Phase 4 — Exam Flow Migration To Classroom-Based Assignment

### Goal
Refactor exam creation and editing so classrooms replace direct subject and section assignment.

### Shared Contract Scope
Update shared schema and types so the exam flow supports:
- `classroomId`
- `classroomName`

Keep compatibility fields during transition:
- `subjectId`
- `subject`
- `section`
- `sectionIds`

### Backend Scope
- accept `classroomId` in create and update exam payloads
- resolve subject offering, subject, section, and institution from the classroom
- set derived legacy fields for compatibility
- update exam read models to include classroom metadata

### Exam Module Cleanup Scope
- narrow the exam module so it focuses on exam lifecycle only:
  - exam metadata and scheduling
  - exam configuration
  - exam builder content
  - publishing and status changes
  - grading, history, and monitoring reads
- stop treating subject, section, department, course, and year-level selection as exam module responsibilities
- make classroom the only assignment source for exam creation and editing
- remove direct exam-module dependence on instructor enrolled-subject selection once classroom APIs are available
- replace section-assignment orchestration with classroom resolution and derived compatibility fields

### Existing Exam Module Pieces To Reuse
- keep the current exam builder, question structure, configuration persistence, and status lifecycle logic
- keep room validation and schedule validation inside the exam module
- keep grading, history, monitoring, and student exam reads, but make them classroom-aware
- reuse existing exam detail and list endpoints, updating their response shape to surface classroom metadata first

### Existing Exam Module Pieces To Migrate Or Reduce
- migrate frontend subject and section pickers to a classroom picker
- migrate shared create and update exam schema away from required direct subject and section assignment
- reduce or remove helpers whose only job is mapping enrolled subjects to exam subject-section options
- reduce or remove backend assigned-section write paths that become redundant once one exam maps to one classroom
- reduce or remove legacy section-name and subject-selection plumbing once classroom-based derived fields fully cover compatibility needs

### Frontend Scope
- replace subject and assigned-sections fields in the exam form with a classroom selector
- keep room assignment in place
- update exam create and edit hooks
- update builder setup state to persist classroom-based metadata
- update exam cards and detail headers to show classroom name as the primary assignment label

### Compatibility Scope
- grading pages should continue to work
- monitoring pages should continue to work
- legacy readers should still receive subject and section information derived from the classroom relationship
- exam list filtering should move toward classroom-aware labels, while any temporary subject-based filters remain compatibility-only until they can be removed cleanly

### Validation
- instructor can create an exam from a classroom
- exam detail returns classroom info plus derived subject and section fields
- grading and monitoring still render correctly
- edit exam flow preserves classroom assignment
- the exam module no longer requires direct subject or section selection in its primary create and edit paths
- classroom becomes the only source of audience context for newly created exams

### Approval Gate
Stop after this phase.
Report:
- schema and type changes
- backend exam contract changes
- frontend exam form migration
- exam module cleanup and responsibilities removed
- tests run
- manual exam creation flow checked

Ask: `Phase 4 is complete. Proceed to Phase 5?`

---

## Phase 5 — Cleanup, Compatibility Review, And Rollout Hardening

### Goal
Stabilize the rollout and reduce confusion between old and new classroom-related flows.

### Cleanup Scope
- review whether the standalone instructor students page should become read-only, simplified, or redirected later
- remove any redundant subject-section exam selection helpers that are no longer used
- tighten naming so `classroom` is the UI term and `class_group` stays an internal persistence term
- review whether any docs, guide pages, or empty-state copy need updates
- complete any remaining exam-module cleanup so classroom is the only owner of:
  - offered subject to section grouping
  - classroom naming and ownership context
  - classroom audience scope for new exams
- remove or deprecate exam-module code that still assumes it should manage subjects, sections, departments, courses, or year levels directly
- document which legacy compatibility fields remain intentionally and which helpers or mappings were removed

### Regression Scope
- verify no breakage in:
  - instructor subjects
  - offered subjects
  - student onboarding and whitelist claim flow
  - exam list, grading, history, monitoring
- verify migrated and unmigrated exams can still be read safely

### Final Validation
- run focused API tests
- run focused web tests
- run a manual end-to-end flow:
  - approved subject
  - classroom creation
  - student enrollment
  - exam creation from classroom
  - student exam attempt
  - turned-in duplicate prevention

### Approval Gate
Stop after this phase.
Report:
- remaining cleanup items
- residual risks
- known follow-up items if any
- final validation summary

Ask: `Phase 5 is complete. Proceed to final polish or close the task?`

---

## Implementation Notes
- use `class_groups` as the persistence model and `classroom` as the product-facing term
- do not introduce multi-section classrooms in v1
- do not introduce multi-classroom exam assignment in v1
- do not duplicate student enrollment validation logic
- keep legacy exam fields available until all classroom consumers are fully migrated
- treat the classroom module as the owner of assignment context and audience scope
- treat the exam module as a consumer of classroom context, not the place that chooses subjects, sections, departments, courses, or year levels
- when useful exam-module logic already exists, prefer reusing it and changing its inputs to `classroomId` rather than rebuilding parallel logic

## Acceptance Criteria
- instructors can configure classrooms from approved offered subjects
- instructors can add only claimed students to a classroom
- exam creation uses a classroom instead of direct subject and section selection
- classroom metadata is visible across exam management flows
- turned-in student exams cannot be re-entered or duplicated
- each phase pauses for approval before the next one begins
