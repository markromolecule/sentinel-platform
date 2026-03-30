# To-Do: Instructor Subject Unenrollment UX Refactor

## Phase 1: Research & Discovery
- [x] Analyze `MasterSubjectActionsCell.tsx` for parity.
- [x] Verify `unenrollInstructorSubjectData` backend logic.
- [ ] Check if `class_group_id` should be used instead of `subject_id` for "multi-course" scenarios.

## Phase 2: Component Refactor
- [ ] Create `SubjectActionsCell.tsx` in `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/`.
- [ ] Implement `DropdownMenu` with "Copy Code", "Copy ID", and "Unenroll".
- [ ] Implement `Dialog` for unenrollment confirmation (shadcn).
- [ ] Update `columns.tsx` to use the new `SubjectActionsCell`.

## Phase 3: Backend Logic Refinement
- [ ] If required, update `unenrollInstructorSubjectData` to handle specific course/section unenrollment (pending user feedback on "multiple courses" intent).
- [ ] Ensure transactional integrity (Kysely sql raw or similar if needed).

## Phase 4: Verification
- [ ] Test unenrollment for subjects assigned to a single course.
- [ ] Test unenrollment for subjects assigned to multiple courses.
- [ ] Verify UI consistency with the Admin Subjects page.
