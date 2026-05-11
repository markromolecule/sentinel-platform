# Tasks: Institution Action Fixes

Tracking file for fixing institution wizard navigation and UI overlap issues as described in [fix-institution-action.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/fix-institution-action.md).

## Phase 1: Analysis & Diagnosis

- [x] Analyze event bubbling in `InstitutionActionsCell` and `DataTable` interaction. <!-- id: 0 -->
- [x] Inspect `InstitutionWizardDialog` header layout and close button positioning. <!-- id: 1 -->
- [x] Verify if `EditInstitutionDialog` also suffers from the navigation issue. <!-- id: 2 -->

## Phase 2: Fix Navigation Issue

- [x] Prevent click event propagation in `InstitutionWizardDialog` to avoid triggering `onRowClick` in `DataTable`. <!-- id: 3 -->
- [x] Ensure `EditInstitutionDialog` and `AlertDialog` in `InstitutionActionsCell` also stop propagation. <!-- id: 4 -->
- [x] Validate that "Next Step" now correctly advances the wizard without navigating to branches. <!-- id: 5 -->

## Phase 3: Fix UI Overlap

- [x] Adjust `InstitutionWizardDialog` header to prevent "Save Draft" button from overlapping with the Dialog close button. <!-- id: 6 -->
- [x] Review "Create Setup Wizard" (if separate) for similar overlap issues. <!-- id: 7 -->
- [x] Ensure the close button is accessible and visually distinct from the "Save Draft" action. <!-- id: 8 -->

## Phase 4: Testing & Verification

- [x] Create/Update tests for `InstitutionActionsCell` to verify event propagation is stopped. <!-- id: 9 -->
- [x] Create/Update tests for `InstitutionWizardDialog` to ensure steps advance correctly. <!-- id: 10 -->
- [x] Perform a final manual verification of the fixes in the support portal. <!-- id: 11 -->
