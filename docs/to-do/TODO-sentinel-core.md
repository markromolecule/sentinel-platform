# Sentinel Core Refactoring TODO

## 1. Initial Research & Planning

- [x] Identify modules to refactor:
    - [x] Institutions
    - [x] Departments
    - [x] Courses
    - [x] Sections
    - [x] Subjects
    - [x] User Managements / Administrator Managements
- [x] Understand current loading/empty state implementation
- [x] Align on component folder structure: `dialogs`, `forms`, `tables`, `views`

## 2. Refactoring - Institutions

- [x] Create folder structure in `(superadmin)/institutions/_components`
- [x] Move dialogs to `_components/dialogs`
- [x] Move table/columns to `_components/tables`
- [x] Create `_components/views`
- [x] Extract `InstitutionsEmptyState` to `_components/views/institutions-empty-state.tsx`
- [x] Update `InstitutionsList` in `_components/views/` (or similar)
- [x] Update `index.ts` (barrel) for `_components`
- [x] Fix `page.tsx` to handle loading state before showing empty state
- [x] Update all imports for `institutions`

## 3. Refactoring - Departments

- [x] Create folder structure in `(superadmin)/departments/_components`
- [x] Move dialogs to `_components/dialogs`
- [x] Move table/columns to `_components/tables`
- [x] Create `_components/views`
- [x] Extract `DepartmentsEmptyState` to `_components/views/departments-empty-state.tsx`
- [x] Update `index.ts` (barrel) for `_components`
- [x] Fix `page.tsx` loading logic
- [x] Update all imports for `departments`

## 4. Refactoring - Courses

- [x] Create folder structure in `(superadmin)/courses/_components`
- [x] Move dialogs to `_components/dialogs`
- [x] Move table/columns to `_components/tables`
- [x] Create `_components/views`
- [x] Extract `CoursesEmptyState` to `_components/views/courses-empty-state.tsx`
- [x] Update `index.ts` (barrel) for `_components`
- [x] Fix `page.tsx` loading logic
- [x] Update all imports for `courses`

## 5. Refactoring - Sections

- [x] Create folder structure in `(admin)/sections/_components`
- [x] Move dialogs to `_components/dialogs`
- [x] Move table/columns to `_components/tables`
- [x] Create `_components/views`
- [x] Extract `SectionsEmptyState` to `_components/views/sections-empty-state.tsx`
- [x] Update `index.ts` (barrel) for `_components`
- [x] Fix `page.tsx` loading logic
- [x] Update all imports for `sections`

## 6. Refactoring - Subjects

- [x] Create folder structure in `(admin)/subjects/_components`
- [x] Move dialogs to `_components/dialogs`
- [x] Move table/columns to `_components/tables`
- [x] Create `_components/views`
- [x] Extract `SubjectsEmptyState` to `_components/views/subjects-empty-state.tsx`
- [x] Update `index.ts` (barrel) for `_components`
- [x] Fix `page.tsx` loading logic
- [x] Update all imports for `subjects`

## 7. Refactoring - User & Admin Management

- [x] Create folder structure in `(admin)/users/_components`
- [x] Create folder structure in `(superadmin)/administrators/_components`
- [x] Reorganize components and update imports for both
- [x] Extract empty states
- [x] Fix loading logic in both pages

## 8. Final Verification

- [ ] Verify each module's loading/empty transitions
- [ ] Check console for any import errors
- [x] Ensure barrel exports are working as intended
