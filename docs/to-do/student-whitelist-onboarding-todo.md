# Student Whitelist Onboarding Work Plan

## Objective

Implement a student whitelist flow that adds an extra verification layer during onboarding without breaking the current academic model for:

- regular students under a primary program
- irregular students taking subjects outside their primary program
- general subjects offered across multiple departments/courses

The intended behavior is:

- a student may onboard only if their submitted identity matches a whitelist record
- the whitelist represents the student's official primary academic home
- actual subject-taking remains controlled by enrollments and offered subjects, not by the whitelist alone

---

## 1. Architectural Analysis (1-3-1 Rule)

### The Problem

The current onboarding flow writes directly into `students` after checking only whether the `student_number` is already used. It does not validate the student against a pre-approved whitelist and it currently stores only one `department_id` and one `course_id` on the student record.

That creates a gap for:

- identity verification during onboarding
- program-controlled student approval before account activation
- irregular students who may take subjects outside their primary course
- general subjects handled by instructors outside the student's home department

### Three Viable Options

#### Option 1: Reuse the `students` Table as the Whitelist Source

- **Description:** Treat existing `students` rows as the whitelist. Admins would pre-create `students` rows before onboarding, and onboarding would only "claim" the matching record.
- **Pros:** Minimal new schema work. Uses existing `student_number`, `department_id`, and `course_id` fields.
- **Cons:** Mixes two different states into one table: pre-approved identity records and fully onboarded live student records. This will make ownership, imports, lifecycle state, and auditing messy very quickly. It also makes it harder to distinguish "allowed to onboard" from "already onboarded and active in the system."

#### Option 2: Create a Dedicated Central `student_whitelist` Table

- **Description:** Add a new table dedicated to onboarding verification. Admins manage whitelist rows for their scoped programs, while onboarding validates against this table before creating or updating the real `students` record.
- **Pros:** Clean separation of concerns. The whitelist becomes an identity gate, while `students`, `enrollments`, `class_groups`, and `subject_offerings` continue to represent actual academic activity. This is the safest long-term model for duplicates, imports, audits, and role-based ownership.
- **Cons:** Requires a schema migration, new admin UI, new backend endpoints, and onboarding refactor work.

#### Option 3: Make Superadmin Own a Master Import-Only Whitelist

- **Description:** Only superadmin can upload and maintain the whitelist, while admins merely consume it during onboarding review or read-only verification.
- **Pros:** Strong central control and easier governance if academic data is centrally maintained by one office.
- **Cons:** Creates an operational bottleneck. It does not fit the current organization well if program chairs are the people closest to the student lists. It also slows corrections and increases dependency on one high-level role for routine academic maintenance.

### The Best Option: Option 2 (Dedicated Central `student_whitelist` Table)

**Why:** Option 2 gives the cleanest model and the least long-term confusion:

- whitelist data stays separate from live student records
- admins can manage records in their scoped programs
- superadmin can still see the combined list and override when needed
- duplicate prevention can be enforced centrally at the database layer
- irregular students and general-subject cases remain an enrollment problem, not a whitelist problem

**Recommendation / Next Steps:**
Proceed with a dedicated `student_whitelist` table plus onboarding verification against that table. Keep the whitelist tied to the student's primary academic home, and continue using subject offerings, class groups, and enrollments for actual subject participation.

---

## 2. Target Business Rules

### Whitelist Ownership

- `Admin` is the day-to-day owner of whitelist records within their scoped program/course.
- `Superadmin` has combined visibility across programs and can audit, import, and override records.
- `Instructor` does not manage whitelist records.

### Whitelist Meaning

- A whitelist row means: "This student is officially recognized under this primary institution/department/course and may complete onboarding if their submitted identity matches."
- A whitelist row does **not** mean: "This student is already enrolled in all subjects for this program."

### Duplicate Prevention

- Use a single central whitelist table shared by all authorized admins.
- Enforce uniqueness with `UNIQUE (institution_id, student_number)` if student numbers are only unique within an institution.
- Do **not** include `course_id` in the uniqueness key, otherwise the same student could be duplicated when shifting programs or being encoded under the wrong course once.

### Irregular Students

- Keep one primary/home program on the whitelist and on the live student profile.
- Allow subject-taking outside the primary course/department through enrollments and offered subjects.
- Do not create multiple whitelist identities for the same student just because they take cross-program subjects.

### General Subjects

- General subjects should remain modeled as offered subjects that can target multiple departments/courses/sections.
- An instructor may handle students outside the instructor's home course **if** they are assigned to the relevant offered subject/class group.
- Instructor access should be constrained by assigned offerings/class groups, not by the student's whitelist course.

---

## 3. Proposed Data Model

### New Table: `student_whitelist`

- [ ] Add `whitelist_id` UUID primary key.
- [ ] Add `institution_id`.
- [ ] Add `department_id`.
- [ ] Add `course_id`.
- [ ] Add `student_number`.
- [ ] Add `last_name`.
- [ ] Optionally add `first_name` for admin review and human clarity.
- [ ] Add `status` enum or text field such as `ACTIVE`, `INACTIVE`, `ARCHIVED`.
- [ ] Add `claimed_user_id` nullable field to link the whitelist row to the authenticated user once onboarding succeeds.
- [ ] Add `claimed_at` nullable timestamp.
- [ ] Add standard audit fields: `created_at`, `updated_at`, `created_by`, `updated_by`.
- [ ] Add `UNIQUE (institution_id, student_number)`.

### Optional Future Table: `student_program_history` or `student_term_programs`

- [ ] Defer unless needed immediately.
- [ ] Use this later if the product needs to formally track program shifts over time without overwriting the primary program row.

### Existing Tables Remain the Source for Live Academic Activity

- `students`: primary active student profile
- `subject_offerings`: what is opened to departments/courses/sections/year levels
- `class_groups`: concrete class instances
- `enrollments` / `class_roles` / `enrollment_requests`: actual subject/class participation

---

## 4. Implementation Plan (To-Do Workflow)

### Phase 1: Finalize Scope and Rules

- [x] Confirm that `Admin` is the default whitelist owner and `Superadmin` is the override owner.
- [x] Confirm the duplicate rule: `UNIQUE (institution_id, student_number)`.
- [x] Confirm whitelist matching criteria during onboarding:
    1. `student_number`
    2. `last_name`
    3. `institution_id`
    4. `department_id`
    5. `course_id`
- [x] Confirm whether `last_name` matching should be exact, normalized case-insensitive, or whitespace-insensitive.
      Approved rule: combine case-insensitive and whitespace-insensitive normalization for `last_name` matching.
- [x] Confirm whether `first_name` is informational only or also part of the match.
      Approved rule: `first_name` is informational only and is not part of the onboarding whitelist match.

### Phase 2: Database Migration

- [x] Update [`schema.prisma`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma) to add `student_whitelist`.
- [ ] Add indexes for:
    - [x] `(institution_id, student_number)` unique
    - [x] `department_id`
    - [x] `course_id`
    - [x] `claimed_user_id`
- [x] Generate and review the Prisma migration.
- [x] Regenerate database/Kysely types after the migration.

### Phase 3: Backend Whitelist CRUD (`sentinel-api`)

- [x] Create whitelist DTOs and validation schemas.
- [ ] Create admin-scoped endpoints for:
    - [x] list whitelist entries
    - [x] create whitelist entry
    - [x] update whitelist entry
    - [ ] archive/deactivate whitelist entry
    - [x] bulk import whitelist entries
          Dedicated backend batch endpoint now accepts parsed rows from CSV/Excel uploads, performs server-side duplicate and scope validation, and supports registrar-style masterlists using `Student ID`, `Student Name`, optional `Course`, and optional `Status` columns.
- [ ] Add authorization rules:
    - [x] admin can manage records only within assigned scope
    - [x] superadmin can view/manage all records
- [x] Add duplicate conflict handling that returns useful UI-friendly errors.

### Phase 4: Onboarding Verification Refactor (`sentinel-api`)

- [x] Refactor [`onboarding.service.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/onboarding/onboarding.service.ts) so onboarding first looks up a matching whitelist row.
- [x] Normalize student number and last name before matching.
- [ ] Reject onboarding if:
    - [x] no whitelist row exists
    - [x] whitelist row is inactive
    - [x] whitelist row is already claimed by another user
    - [x] submitted institution/department/course do not match the whitelist row
- [ ] On success:
    - [x] update `user_profiles`
    - [x] create the `students` row
    - [x] link the whitelist row to `claimed_user_id`
    - [x] set `claimed_at`
    - [x] assign the student role
- [x] Ensure the claim and student creation happen transactionally.

### Phase 5: Admin Portal UI (`sentinel-core`)

- [x] Add a new module or page for Student Whitelist management.
- [ ] Decide whether this lives:
    - [x] under User Management
    - [ ] or as a separate Student Whitelist module
- [ ] Build a data table with:
    - [x] student number
    - [x] last name
    - [x] first name
    - [x] institution
    - [x] department
    - [x] course
    - [x] claim status
    - [x] claimed user
- [x] Add admin create/edit dialogs.
- [x] Add bulk import support for registrar/program-chair workflows.
- [x] Add search and filters by department/course/status.

### Phase 6: Superadmin Oversight UI

- [x] Add a superadmin view that aggregates whitelist rows across programs.
- [ ] Add review tools for:
    - [x] duplicate detection
    - [x] misassigned program correction
    - [x] reassignment of scope ownership if needed
- [x] Add cross-program visibility without requiring superadmin to own day-to-day maintenance.
      Current implementation uses client-side review buckets and a superadmin-only reassignment action layered onto the shared whitelist table. If we later need audit-grade duplicate workflows, we can add backend review endpoints.

### Phase 7: Align Enrollment Logic for Irregular and General Subjects

- [x] Keep whitelist and student primary course separate from actual subject enrollment.
- [x] Review instructor-facing enrollment/search flows to ensure instructors can work across home-course boundaries when assigned to the offering.
- [x] Verify that subject access is driven by:
    - [x] offered subject targets
    - [x] class group membership
    - [x] approved enrollments / class roles
- [x] Avoid using the student's whitelist course as a hard blocker for all subject participation.
      Current implementation now surfaces offered-subject target departments/courses in enrollment summaries and request reviews, instead of inferring a single academic scope from a student's primary program.

### Phase 8: Frontend Onboarding UX (`sentinel-web`)

- [x] Update onboarding error states so students get clear feedback when verification fails.
- [x] Add specific error messaging for:
    - [x] student number not found
    - [x] last name mismatch
    - [x] department/course mismatch
    - [x] already claimed whitelist record
- [ ] Keep the onboarding form fields unchanged initially unless product wants a guided/locked experience.
- [x] Keep the onboarding form fields unchanged initially unless product wants a guided/locked experience.
- [ ] Optionally add a later enhancement to prefill or lock department/course once the student number is found.
      Current implementation adds clearer whitelist guidance and targeted verification alerts without changing the form flow or auto-locking academic selections.

### Phase 9: Testing and Verification

- [x] Test successful onboarding with exact whitelist match.
- [ ] Test onboarding failure for:
    - [x] wrong student number
    - [x] wrong last name
    - [x] wrong department
    - [x] wrong course
    - [x] archived/inactive whitelist row
    - [x] already claimed whitelist row
- [x] Test duplicate prevention across multiple admins attempting to encode the same student.
- [x] Test superadmin combined visibility across program-owned rows.
- [ ] Test irregular student enrollment into subjects outside the primary course after onboarding.
- [ ] Test general subject handling where the instructor's home department differs from the student's home department.
      Current automated coverage now exists in the DB-backed API tests for onboarding verification and whitelist service visibility/duplicate rules. Irregular/general-subject verification is still pending at the enrollment/query layer.

---

## 5. Suggested Rollout Order

### Sprint 1

- [ ] Finalize ownership and matching rules.
- [ ] Add `student_whitelist` schema and migration.
- [ ] Add read/write API endpoints.

### Sprint 2

- [ ] Build admin whitelist management UI.
- [ ] Add superadmin combined oversight screen.
- [ ] Support bulk import.

### Sprint 3

- [ ] Refactor onboarding to require whitelist verification.
- [ ] Add transaction-safe claiming.
- [ ] Improve onboarding failure UX.

### Sprint 4

- [ ] Review instructor/enrollment flows for irregular and general-subject edge cases.
- [ ] Add regression tests around cross-program subject participation.

---

## 6. Key Risks / Watchouts

- [ ] If onboarding writes to `students` before whitelist verification, duplicate or unauthorized accounts may still be created.
- [ ] If uniqueness includes `course_id`, the same student may be duplicated during shifts or data-entry mistakes.
- [ ] If instructor permissions are tied too tightly to their home course instead of assigned offerings, general-subject teaching will break.
- [ ] If whitelist ownership is split across multiple disconnected storage locations, superadmin visibility and duplicate prevention will become unreliable.

---

## 7. Recommended Starting Point

Start with **Option 2**:

- add a single central `student_whitelist` table
- let `admin` maintain rows within scope
- let `superadmin` view and override everything
- verify against the whitelist inside onboarding before writing `students`
- keep irregular/general-subject behavior in the enrollment/offered-subject layer, not in the whitelist layer

> [!IMPORTANT]
> **User Feedback Required:** Before we start coding or generating migrations, please confirm that you want to proceed with **Option 2**: a dedicated central `student_whitelist` table managed day-to-day by `Admin`, overseen by `Superadmin`, and enforced during onboarding.
