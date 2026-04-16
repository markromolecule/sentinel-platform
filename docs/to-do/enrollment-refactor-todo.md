# Enrollment Migration To-Do Plan

This document tracks the progress of migrating enrollment-related logic from `@app/sentinel-api/src/modules/subjects` to `@app/sentinel-api/src/modules/enrollments`.

## Phase 1: Research & Preparation

- [x] Identify all enrollment-related controllers in `modules/subjects/controllers`
- [x] Identify all enrollment-related data functions in `modules/subjects/data`
- [x] Identify enrollment methods in `SubjectService`

## Phase 2: Schema & DTO Migration

- [ ] Create `modules/enrollments/enrollments.dto.ts`
- [ ] Move enrollment-related schemas from `subject.dto.ts` to `enrollments.dto.ts`
- [ ] Update imports for the shared schemas in the new DTO

## Phase 3: Data & Service Migration

- [ ] Create `modules/enrollments/data` directory
- [ ] Move enrollment data functions to `modules/enrollments/data/`
- [ ] Create `modules/enrollments/enrollments.service.ts`
- [ ] Move enrollment methods from `SubjectService` to `EnrollmentService`
- [ ] Update internal data function imports to point to new locations

## Phase 4: Controller Migration

- [ ] Create `modules/enrollments/controllers` directory
- [ ] Move enrollment controllers to `modules/enrollments/controllers/`
- [ ] Update controller imports to use `EnrollmentService` and `enrollments.dto.ts`

## Phase 5: Routing & API Integration

- [ ] Initialize `modules/enrollments/enrollments.routes.ts`
- [ ] Define routes in `enrollments.routes.ts` (using the new controllers)
- [ ] Remove enrollment routes from `modules/subjects/subject.routes.ts`
- [ ] Register `enrollments.routes.ts` in the main app router (`src/router.ts` or `src/index.ts`)

## Phase 6: Verification & Cleanup

- [ ] Run `pnpm build` or `tsc` to verify no broken imports
- [ ] Verify API endpoints are still functional
- [ ] Remove any dead code or unused imports in `modules/subjects`
