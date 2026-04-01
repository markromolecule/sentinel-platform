# User Management Multi-Course Work Plan

## Objective
Implement the requested Admin and Superadmin user-management updates so that:

- Instructors can be assigned to multiple courses.
- Admin user-management tables show `department_code` instead of `department_name`.
- Superadmin administrator management includes course assignment while keeping administrators limited to a single course.

## Options Considered (1-3-1 Rule)

### Option 1: Frontend-only patch
- Update the tables and forms visually, but keep the backend on a single-course model.
- Pros: Fastest to ship.
- Cons: Does not satisfy the multi-course instructor requirement and would create UI/API mismatch.

### Option 2: End-to-end user module update (Recommended)
- Update shared schemas, API payloads, user data access, and forms/tables together.
- Pros: Meets all three requirements consistently for create, invite, edit, and list flows.
- Cons: Touches more layers and requires a lightweight relational addition for instructor courses.

### Option 3: Split admin and instructor behavior into separate ad hoc payloads
- Add custom handling only where needed per screen.
- Pros: Smaller immediate blast radius.
- Cons: Increases maintenance cost and creates divergent user-management behavior.

## Recommendation
Proceed with **Option 2** so the admin and superadmin workflows stay consistent and the instructor multi-course requirement is implemented correctly.

## To-Do List

### Phase 1: Shared Contracts
- [ ] Extend the user form schema to support `courseIds` for instructors while preserving single-course handling for students and administrators.
- [ ] Update shared user types and API mapping to expose department codes and course collections.

### Phase 2: Backend User Module
- [ ] Add relational persistence for instructor-to-course assignments.
- [ ] Update create, invite, edit, get-one, and get-many user flows to read/write instructor course assignments.
- [ ] Return `department_code` in user-management responses and keep administrator course assignment single-select.

### Phase 3: Frontend User Management
- [ ] Update admin user-management forms so instructors can select multiple courses.
- [ ] Update administrator-management forms so admins can select exactly one course.
- [ ] Update both management tables to show department codes and the relevant course labels.

### Phase 4: Verification
- [ ] Run targeted typecheck or lint coverage for the touched user-management files.
- [ ] Manually confirm create/edit flows for student, instructor, and administrator payload shapes.
