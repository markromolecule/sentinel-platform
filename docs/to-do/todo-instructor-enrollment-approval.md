# Instructor Subject Enrollment Approval & Form Enhancements

## 1. Architectural Analysis (1-3-1 Rule)

### The Problem
Currently, when an instructor enrolls in a subject, they are immediately mapped into the `class_roles` table, making them the active instructor for that class group instantaneously. Since the admin needs to review and approve these enrollments, we need a way to track the "Pending" versus "Approved" states. The current database schema does not have a status tracking mechanism for class roles.

### Three Viable Options

#### Option 1: Add a `status` Column to `class_roles`
- **Description:** Run a Prisma migration to add an `approval_status` field (e.g., `PENDING`, `APPROVED`, `REJECTED`) to the `class_roles` table. 
- **Pros:** Keeps the query structurally simple as everything lives in one join table.
- **Cons:** Any existing query fetching `class_roles` will now need to explicitly filter by `status = 'APPROVED'` or risk exposing unapproved, pending instructors to students.

#### Option 2: Create a new `enrollment_requests` Table
- **Description:** Run a Prisma migration to create a dedicated table (e.g., `enrollment_requests`) with fields: `request_id`, `user_id`, `class_group_id`, `status` (PENDING/APPROVED/REJECTED), and timestamps. When an admin approves a request, a transactional endpoint updates the status and inserts the instructor into the live `class_roles` table.
- **Pros:** Extremely safe. It enforces a strict separation of concerns—active instructors stay in `class_roles`, while pending requests live elsewhere. Existing queries remain untouched and performant.
- **Cons:** Requires a database migration and a slightly more complex approval transaction.

#### Option 3: Use App-Level Metadata JSON (No Migration)
- **Description:** Store an array of pending `class_group_id`s directly inside the `users.raw_user_meta_data` JSONB column. 
- **Pros:** Requires absolutely no database schema migrations.
- **Cons:** Extremely inefficient for relational queries (e.g., "fetch all pending requests for a specific department").

### The Best Option: Option 2 (Create a new `enrollment_requests` Table)
**Why:** Option 2 is the most robust and scalable approach. By keeping the `class_roles` table strictly for *approved and active* roles, we avoid accidentally breaking or polluting the existing live educational data with unapproved requests. It provides a clean, auditable trail for the admin to review without risking student-facing bugs.

**Recommendation / Next Steps:** 
We will need to generate a Prisma migration for the `enrollment_requests` table and apply it.

---

## 2. Database Scenario Analysis: Cross-Department Teaching

**Question:** *Can the database handle an instructor from one department (e.g., SBMA) teaching a subject in another department's course (e.g., BSIT Entrepreneurship)? How will the system adapt?*

**Answer:** **Yes, the current database design effortlessly supports this scenario.** 
Here is how the system natively handles it:
- The `instructors` table contains a `department_id` which defines the instructor's *home* department (e.g., SBMA).
- A subject (e.g., Entrepreneurship) belongs to a section under BSIT. This combination forms a unique `class_groups` record.
- The `class_roles` table maps a `user_id` directly to a `class_group`. There is **no database-level constraint** enforcing that the instructor's home `department_id` must match the section/course's `department_id`.
- Therefore, the system natively allows cross-department assignments! We just need to ensure that the frontend Subject List endpoints do not forcibly restrict the instructor to viewing only subjects inside their home department when they are searching for subjects to enroll in.

---

## 3. Implementation Plan (To-Do Workflow)

### Phase 1: Database Migration (Pending User Approval)
- [ ] Update `schema.prisma` to include the `enrollment_requests` table.
- [ ] Run `npx prisma migrate dev` to push the changes.
- [ ] Generate updated Kysely types.

### Phase 2: User Form Enhancements (`sentinel-core`)
- [ ] Modify `user-form-fields.tsx` (Add User Dialog) to conditionally display the `Course` selection dropdown when `watchedRole === "instructor"` (currently limited out to `watchedRole === "student"` only).
- [ ] Ensure that selecting the department properly restricts and shows all related courses beneath that department for the instructor.

### Phase 3: Backend Approval Endpoints (`sentinel-api`)
- [ ] Refactor the current `POST /enrollments/enroll` endpoint to insert into the new `enrollment_requests` table (status: PENDING) instead of directly inserting into `class_roles`.
- [ ] Create `GET /enrollments/requests` endpoint (Admin only) to fetch all pending `enrollment_requests`, filtering by the admin's assigned `department_id` / `institution_id`.
- [ ] Create `POST /enrollments/requests/approve` endpoint to mark the request as APPROVED and insert into `class_roles`.
- [ ] Create `POST /enrollments/requests/reject` endpoint.

### Phase 4: Admin Approval Interface (`sentinel-core`)
- [ ] Update the Admin Sidebar configuration inside `@sentinel-core` to include a new sub-item under "Subject Management" called "Approvals" or "Enrollment Requests".
- [ ] Create the new page at `app/(protected)/(admin)/subjects/approvals/page.tsx`.
- [ ] Implement a data table fetching `useEnrollmentRequestsQuery()`.
- [ ] Implement UI actions (Approve / Reject buttons) triggering mutations to the backend.

> [!IMPORTANT]
> **User Feedback Required:** Before we proceed with writing any code or running Prisma migrations for Phase 1, do you agree with **Option 2** (creating a dedicated `enrollment_requests` table), and should we proceed with executing these to-do items?
