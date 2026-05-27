# Refactor Plan: Instructor Subject Components

This plan outlines the modularization of `SubjectActionsCell` and `SubjectFormFields` to follow a strict separation of concerns, improve performance with memoization, and enhance code maintainability.

## 1. SubjectActionsCell Refactoring

- [ ] **Create `use-unenrollment.ts` hook**
    - Move `allSections` normalization logic here.
    - Move `selectedSectionIds` state and `toggleSection`/`toggleAll` handlers.
    - Encapsulate the `useUnenrollSubjectMutation` and handle success/error toasts.
- [ ] **Extract `UnenrollSubjectDialog.tsx`**
    - Create a clean presentational component for the unenrollment dialog.
    - Inputs: `subject`, `allSections`, `selectedIds`, `handlers`, `isPending`.
- [ ] **Simplify `SubjectActionsCell.tsx`**
    - Should only contain the `DropdownMenu` and the new `UnenrollSubjectDialog`.

## 2. SubjectFormFields Refactoring

- [ ] **Create `use-subject-form-options.ts` hook**
    - Consolidate all `useWatch` calls for `subject_code`, `department_id`, `course_id`, `year_level`.
    - Compute `validDepartments`, `validCourses`, `validYearLevels`, and `validSections`.
    - Move `toggleSection` and `toggleAllSections` form-helper logic here.
- [ ] **Extract `SubjectMetadataSelectors.tsx`**
    - A specialized component for the 3-column grid (Department, Course, Year Level).
- [ ] **Refine `SubjectFormFields.tsx`**
    - Use the new hook for data.
    - Render modular sub-components for the selectors and the `FilterableCheckboxGroup`.

## 3. General Improvements

- [ ] **Add strict memoization** (`useMemo`, `useCallback`) to all filtering and handler logic to prevent unnecessary re-renders in the complex form.
- [ ] **Verify accessibility**: Ensure the newly extracted components maintain correct `aria` labels and focus management.
