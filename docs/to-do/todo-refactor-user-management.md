# To-Do: Refactor User Management (Courses & Departments)

This document outlines the tasks required to add Course support to User Management and align the database schema/API.

## 1. Database & Schema Updates
- [ ] Update `packages/db/prisma/schema.prisma`:
    - [ ] Add `department_id` (UUID, optional) to `user_profiles`.
    - [ ] Add `course_id` (UUID, optional) to `user_profiles`.
    - [ ] Add `course_id` (UUID, optional) to `instructors` (for consistency with students).
    - [ ] Add relations for these new fields.
- [ ] Run `pnpm x prisma migrate dev --name add_dept_course_to_profiles`

## 2. Backend API Updates
- [ ] Update User DTOs in `app/sentinel-api/src/modules/users/user.dto.ts` to include `departmentId` and `courseId`.
- [ ] Update `app/sentinel-api/src/modules/users/data/create-user.ts`:
    - [ ] Store `department_id` and `course_id` in `user_profiles`.
    - [ ] If role is student/instructor, also store in respective tables.
    - [ ] Update return object to include course name.
- [ ] Update `app/sentinel-api/src/modules/users/data/update-user.ts`:
    - [ ] Handle updates for `department_id` and `course_id` in `user_profiles`.
    - [ ] Sync changes to student/instructor records.
- [ ] Update `app/sentinel-api/src/modules/users/data/get-users.ts`:
    - [ ] Join with `courses` table to get course name.
    - [ ] Include course name in the response.

## 3. Shared Library Updates
- [ ] Update `User` and `UserFormValues` types/schemas in `packages/shared`.

## 4. Frontend UI Updates
- [ ] Update `app/sentinel-core/src/app/(protected)/(admin)/users/_components/columns.tsx`:
    - [ ] Add "Course" column.
- [ ] Update `app/sentinel-core/src/app/(protected)/(admin)/users/_components/user-form-fields.tsx`:
    - [ ] Add `course` dropdown field using `useCoursesQuery`.
    - [ ] Implement logic to disable Course dropdown if Department is not selected.
    - [ ] Filter courses based on the selected Department.

## 5. Verification
- [ ] Create a new user (Student) with Department and Course.
- [ ] Create a new user (Instructor) with Department and Course.
- [ ] Edit an existing user to change their Course.
- [ ] Verify that the User Table displays the correct Course name.
- [ ] Verify that Course dropdown is disabled when Department is empty.
