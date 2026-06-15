# Instructor Subject Enrollment Backend Connection Plan

This document outlines the approach to connecting the instructor's subject enrollment feature to the backend, enabling real data mutation and fetching.

## 1-3-1 Rule Analysis: Backend Integration Options

### The Problem

The instructor's `AddSubjectDialog` currently mock-saves data to a local Zustand store (`useSubjectStore`). We need to:

1. Connect the enrollment mutation to the backend to persist real data.
2. Fetch the available master subjects made by the admin so instructors can select them.
3. Fetch only the enrolled subjects for the table columns to display.

### Option 1: Dedicated Custom Endpoints for Instructor Subjects

Create specific Hono endpoints `GET /instructor/subjects` and `POST /instructor/subjects/enroll` in `sentinel-api`.

- **Pros:** Encapsulates the complex logic of checking `class_groups` and `class_roles` specific to instructors. Easy to lock down with middleware.
- **Cons:** Requires creating a couple of new controllers and services and types in `sentinel-api`.

### Option 2: Reuse Existing Master Subject & Generic Endpoints

Use the existing `GET /subjects` endpoint to fetch master subjects. Then, for enrollment, hit generic atomic endpoints such as `POST /class-groups` and `POST /class-roles` directly from the frontend.

- **Pros:** Reduces code duplication in the API by assembling smaller atomic API calls on the frontend or backend service layer.
- **Cons:** Frontend has to make multiple round trips to create a class group and assign a class role, risking partial failures (no transaction safety from the frontend). It also mixes concerns in the React components.

### Option 3: Backend Transaction Endpoint (Single-Request)

Add a single RPC-style endpoint `POST /enrollments/enroll` (or similar) in `sentinel-api` that handles finding/creating the `class_groups` based on `subject_id`, `section_id`, etc., and assigning the user to `class_roles` in **one database transaction** using Prisma/Kysely. The fetch endpoint `GET /enrollments/enrolled` would join `subjects` with `class_groups` and `class_roles` for the current user.

- **Pros:** High data integrity, atomic transactions, minimal network overhead, follows RESTful logic for domain operations.
- **Cons:** Slightly more complex backend database query combining multiple tables.

### The Best Option: **Option 3**

**Why:** Adding dedicated transaction-backed endpoints avoids orchestrating multi-step inserts from the frontend, ensuring data integrity across `class_groups` and `class_roles`. The endpoints are strongly typed, secure, and keep presentation logic clean.
**Next Steps:** Proceed with creating the `POST /enrollments/enroll` and `GET /enrollments/enrolled` routes in the backend, adding service hook functions in `@sentinel/hooks`, and replacing local states in `@sentinel-web/src/app/(protected)/(instructor)/subjects`.

---

## To-Do List

- [ ] **1. API Route Creation (`app/sentinel-api/src/...`)**
    - [ ] Implement `GET /enrollments/enrolled` to fetch subjects linked to the instructor's user ID via `class_roles` and `class_groups`.
    - [ ] Implement `POST /enrollments/enroll` to run a database transaction creating a `class_groups` row (if it doesn't exist) and inserting the instructor into `class_roles`.

- [ ] **2. Services & Hooks Integration (`packages/services` & `packages/hooks`)**
    - [ ] Add `enrollInstructorSubject` and `getEnrolledSubjects` functions in `@sentinel/services/src/api/subjects.ts`.
    - [ ] Add `useEnrollSubjectMutation` and `useEnrolledSubjectsQuery` React Query hooks in `@sentinel/hooks/src`.

- [ ] **3. Web Frontend Integration (`app/sentinel-web/...`)**
    - [ ] Update `use-add-subject-form.ts` to use `useEnrollSubjectMutation` instead of Zustand `useSubjectStore`.
    - [ ] Update `use-subjects-list.ts` to use `useEnrolledSubjectsQuery` instead of the local store filter.
    - [ ] Ensure `add-subject-dialog.tsx` uses the fetched master subjects (`useSubjectsQuery()`) for choices correctly.
