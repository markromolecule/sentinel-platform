# To-Do Plan: Semester Superadmin Implementation

This to-do list tracks the progress of the Semester (Term) feature implementation.

## Phase 1: Database Setup
- [ ] Modify `packages/db/prisma/schema.prisma` to add `start_date` and `end_date` to `terms` model.
- [ ] Generate and run Prisma migration: `npx prisma migrate dev --name add_dates_to_term`.

## Phase 2: Backend Development (API)
- [ ] Implement `semesters.dto.ts` with Zod validation.
- [ ] Implement `semesters.service.ts` (CRUD functionality).
- [ ] Create `controllers/semesters.controller.ts`.
- [ ] Update `semesters.routes.ts` to hook up the controller.

## Phase 3: Frontend Development (Superadmin)
- [ ] Create `app/sentinel-core/src/app/(protected)/(superadmin)/semesters/page.tsx`.
- [ ] Create `_components/semester-form.tsx` for creation/editing.
- [ ] Create `_hooks/use-semester-query.ts` for fetching.
- [ ] Create `_hooks/use-semester-mutation.ts` for operations.

## Phase 4: Verification & Polish
- [ ] Manually test CRUD operations in the UI.
- [ ] Verify date validation (start date < end date).
- [ ] Ensure styling is consistent with `Departments` and `Courses` pages.
