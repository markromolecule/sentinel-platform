# To-Do: Refactor Access Control Roles Page

## Phase 1: Preparation & Research

- [x] Analyze `page.tsx` state and effects to identify logic for extraction.
- [x] Map out component hierarchy for the table matrix.
- [x] Verify existing components in `_components` to avoid duplication.

## Phase 2: Logic Extraction

- [x] Create `useAccessControlRolesState.ts` hook (implemented as `useRoleMatrix.ts`).
    - [x] Move role/permission data fetching logic.
    - [x] Move search and filtering logic.
    - [x] Move draft permission state and auto-save (debounce) logic.
    - [x] Move category collapse state.
- [x] Create `useAccessControlRolesActions.ts` hook (merged into `useRoleMatrix.ts`).

## Phase 3: Component Extraction

- [x] **Tables**
    - [x] Create `RoleMatrixTable.tsx` (main wrapper).
    - [x] Create `MatrixHeader.tsx` (merged into `RoleMatrixTable.tsx`).
    - [x] Create `MatrixBody.tsx` (merged into `RoleMatrixTable.tsx`).
    - [x] Create `MatrixRow.tsx` (merged into `RoleMatrixTable.tsx`).
- [x] **Dialogs**
    - [x] Create `DeleteRoleDialog.tsx` (Extract from `page.tsx`).
- [ ] **Views** (Containers)
    - [ ] Create `RolesHeaderView.tsx` (Optional, currently search bar is in `page.tsx`).

## Phase 4: Integration

- [x] Update `page.tsx` to use the new components and hooks.
- [ ] Ensure all auto-save functionality works as expected.
- [ ] Verify search and category collapsing still work correctly.

## Phase 5: Verification

- [ ] Test role creation and editing.
- [ ] Test permission toggling and auto-save.
- [ ] Test role deletion.
- [ ] Verify responsiveness and scroll behavior (`data-lenis-prevent`).
