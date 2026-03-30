# To-Do: Instructor Subject Management Refactor

## Phase 1: Backend Implementation (Search)
- [ ] Update `subject.dto.ts` to include `search` query param in `getEnrolledSubjectsSchema`.
- [ ] Update `get-enrolled-subjects.ts` (API Data Layer) to filter by `subject_code` and `subject_title`.
- [ ] Update `SubjectService` to pass the search term to the data layer.
- [ ] Update `get-enrolled-subjects.controller.ts` to extract the `search` param from the request query.

## Phase 2: Frontend Implementation (Search & Components)
- [ ] Update `useEnrolledSubjectsQuery` (Hooks) to accept a `search` parameter and update query keys.
- [ ] Update `use-subjects-list.ts` (Instructor Hook) to handle the search state and pass it down.
- [ ] Create `subjects-list.tsx` in `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/`.
- [ ] Refactor `page.tsx` to use `SubjectsList`, `useDebounce`, and the new search state.
- [ ] Ensure `SubjectsTable` correctly handles facets and filtering.

## Phase 3: Verification & Cleanup
- [ ] Verify search functionality on the instructor dashboard.
- [ ] Verify facets (Department/Course) filtering.
- [ ] Clean up any stale mock data or unused components.
