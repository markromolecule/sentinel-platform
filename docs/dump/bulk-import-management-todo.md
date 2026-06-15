# TO-DO: Student Management Bulk Import Management (Instructor Refactor)

This to-do plan outlines the steps for resolving the instructor bulk import issues and aligning it with the successful patterns used in the admin whitelist import.

## [Instructor] Bulk Import Refactor

- [ ] **Data Fetching Fixes**:
    - [ ] Refactor `useManualEntry` hook:
        - [ ] Replace mock `useSubjectStore` data with real **`useEnrolledSubjectsQuery`**.
        - [ ] Filter for "APPROVED" subjects only.
        - [ ] Update `handleSubjectSelect` to set `term` (e.g., "S1 2025-2026") and `section` (defaults to first available) from the subject data.
- [ ] **Smart Import Logic (using `xlsx`)**:
    - [ ] Refactor `useStudentEnrollment` hook:
        - [ ] Upgrade parser to use **`xlsx`** for Excel/CSV support.
        - [ ] Implement **Header Aliases** (supporting "Student ID", "SNo", etc.).
        - [ ] Implement **Adaptive Requirements**:
            - [ ] Accept Subject, Section, Term from UI.
            - [ ] Make these columns optional in CSV if provided by UI.
            - [ ] If values are missing in CSV, inject the UI-provided ones.
- [ ] **UI Integration**:
    - [ ] Update `StudentEnrollmentDialog`:
        - [ ] Synchronize UI state from `useManualEntry` with the parsing trigger.
        - [ ] Show a note reminding the user that Subject/Section/Term can be provided via UI or CSV.

## Verification

- [ ] Verify real approved subjects appear in the instructor's dialog.
- [ ] Test bulk import with "minimal" CSV (Student Number and Name only).
- [ ] Test bulk import with "full" CSV (overriding UI selections).
- [ ] Verify cascading population of Section and Term when a Subject is selected.

---

### Phase 1: Research (COMPLETED)

- [x] Analyze `useStudentEnrollment` parsing logic.
- [x] Analyze `useManualEntry` and `useSubjectsList`.
- [x] **New**: Analyzed the successful `useStudentWhitelistBulkImport` in Admin side for reference.

### Phase 2: Implementation Plan (COMPLETED)

- [x] Update [implementation_plan.md](file:///Users/joseph/.gemini/antigravity/brain/8ac72ad8-753a-4182-b9c3-1acb3311999d/implementation_plan.md).
- [x] Provide 1-3-1 options and recommendation.

### Phase 3: Obtain Approval (AWAITING)

- [ ] Wait for user confirmation.
