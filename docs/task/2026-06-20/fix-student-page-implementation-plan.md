# Student Portal Issues Resolution Implementation Plan

This implementation plan outlines the steps required to resolve multiple frontend bugs and responsiveness issues in the student portal, including header search bar removal, correct classroom exam card action handling for completed/archived exams, proper tab filtering in history, and responsiveness enhancements on the calendar page.

## Proposed Changes

---

### Student Header Search Bar Removal

#### [MODIFY] [StudentHeader.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/sidebar/student/StudentHeader.tsx)

- Remove `UserSearchBar` import and the `<UserSearchBar>` component instance.

---

### Student Classroom Page Exam Card Buttons and Labels

#### [MODIFY] [exam-card.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/_components/exam-card.tsx>)

- Update `actionLabel` logic to handle `'turned_in'` (equivalent to completed) and `'past_due'` (archived/expired) statuses.
- Update button component so that:
    - If the status is `'turned_in'`, it shows "Review Flow" and redirects directly to the history details page via the attempt's `attemptId`.
    - If the status is `'past_due'`, the button shows "Past Due" and is disabled.
- Update status badge coloring and text mapping to display `'turned in'` (green) and `'past due'` (muted) statuses with proper formatting.

#### [MODIFY] [exam-card.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/_components/exam-card.test.tsx>)

- Add test coverage for `'turned_in'` status (verifying "Review Flow" label, outline variant, and correct href).
- Add test coverage for `'past_due'` status (verifying "Past Due" label, disabled state, and outline variant).

---

### Student History Hook & Tab Filtering

#### [MODIFY] [use-student-history/index.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts>)

- Update `'available'` status filter logic so that it matches and includes `'in-progress'` exams, ensuring active attempts are visible for continuation.

#### [NEW] [index.test.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts>)

- Add unit tests for `useStudentHistory` hook to verify that available, past due, and turned in exams are grouped/filtered properly and `'in-progress'` attempts are included in the available tab.

---

### Calendar Page & Sheet Responsiveness

#### [MODIFY] [day-details-sheet.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.tsx)

- Add responsive padding (`p-6`) to `SheetContent`.
- Remove default padding from `SheetHeader` (`p-0 mb-6`) to align with container contents.
- Adjust the delete note button's visibility class to `opacity-100 sm:opacity-0 sm:group-hover:opacity-100` so touch-screen users can delete notes easily without relying on desktop-only mouse hover states.

#### [NEW] [day-details-sheet.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.test.tsx)

- Create unit tests for `DayDetailsSheet` to verify it correctly renders event details, controls visibility, and invokes action/delete callbacks.

---

### Student 403 Forbidden Access on Assessment Read and History

#### [MODIFY] [assessment-access.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assessment/assessment-access.ts)

- Update `assertAssessmentReadAccess` to check if the user's role is `'student'` and allow access if so, bypassing the `'assessments:view'` permission requirement.

#### [MODIFY] [assessment-access.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assessment/assessment-access.test.ts)

- Add tests to ensure that `assertAssessmentReadAccess` allows a context with `role` set to `'student'` even if it doesn't have the `'assessments:view'` permission.

#### [MODIFY] [get-exam-history.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/history/controllers/get-exam-history.controller.ts)

- Replace strict `role === 'student'` check with checking if the user has a record in the `students` table, resolving the 403 error for dual role (e.g. admin/student) accounts.
- Remove temporary debug log statement.

#### [MODIFY] [get-exam-history-detail.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/history/controllers/get-exam-history-detail.controller.ts)

- Replace strict `role === 'student'` check with checking if the user has a record in the `students` table.

### Student Classroom Page Archived Exam Card Buttons

#### [MODIFY] [exam-card.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/_components/exam-card.tsx>)

- Update `isPastDue` helper to also match `'archived'` status, disabling the action button and setting the label to `'Archived'`.

#### [MODIFY] [exam-card.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/_components/exam-card.test.tsx>)

- Add a unit test to verify that the `'archived'` state disables the button and correctly labels it as `'Archived'`.

---

## Phases of Execution

### Phase 1: Student Header Search Bar Removal

**Goal:** Remove the search bar on the student page header.

- [x] Remove `UserSearchBar` import and component from [StudentHeader.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/sidebar/student/StudentHeader.tsx)
- [x] Run `pnpm --dir app/sentinel-web test` to verify header tests pass

**Migration required:** No

---

### Phase 2: Exam Card Buttons and Labels

**Goal:** Correctly display the status, button state, and action links for completed/turned in and past due exams.

- [x] Modify [exam-card.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/_components/exam-card.tsx>) to handle `'turned_in'` and `'past_due'` statuses, linking `'turned_in'` directly to history details
- [x] Add test cases to [exam-card.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/_components/exam-card.test.tsx>)
- [x] Run `pnpm --dir app/sentinel-web test` and confirm all tests pass

**Migration required:** No

---

### Phase 3: Exam History Tab Filtering

**Goal:** Ensure `'in-progress'` exams are displayed in the available tab and fix tab filtering logic.

- [x] Update [use-student-history/index.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts>) to include `'in-progress'` exams in `'available'` status filter
- [x] Create unit tests at [index.test.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts>)
- [x] Run `pnpm --dir app/sentinel-web test` to confirm tests pass

**Migration required:** No

---

### Phase 4: Calendar Page & Sheet Dialog Responsiveness

**Goal:** Optimize flexbox layouts, container padding, and delete button visibility for touch screen and responsive devices.

- [x] Modify [day-details-sheet.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.tsx) to add layout padding and make the delete button touch-friendly
- [x] Create unit tests at [day-details-sheet.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.test.tsx)
- [x] Run `pnpm --dir app/sentinel-web test` and ensure all tests in the workspace pass
- [x] Run `pnpm format` to apply formatting

**Migration required:** No

---

### Phase 5: Resolve Student 403 Forbidden Access on Exams Route

**Goal:** Ensure students can query their exams and single exam status by allowing student role in dynamic read checks.

- [x] Modify `assertAssessmentReadAccess` in [assessment-access.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assessment/assessment-access.ts) to permit Hono context with `student` role.
- [x] Add unit tests in [assessment-access.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assessment/assessment-access.test.ts) to verify this behavior.
- [x] Run `pnpm --dir app/sentinel-api test src/modules/examination/assessment/assessment-access.test.ts` and confirm they pass.
- [x] Modify `getExamHistoryRouteHandler` in [get-exam-history.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/history/controllers/get-exam-history.controller.ts) to check for a student profile instead of strict role name and remove the debug log.
- [x] Modify `getExamHistoryDetailRouteHandler` in [get-exam-history-detail.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/history/controllers/get-exam-history-detail.controller.ts) to check for a student profile.

**Migration required:** No

---

### Phase 6: Resolve Archived Exam Card Open Redirect

**Goal:** Ensure archived exams show as disabled and do not allow students to open/attempt them.

- [x] Modify [exam-card.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/_components/exam-card.tsx) to handle `'archived'` status.
- [x] Add a unit test in [exam-card.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/_components/exam-card.test.tsx).
- [x] Run `pnpm --dir app/sentinel-web test` to verify all frontend tests pass.

**Migration required:** No

---

## Verification Plan

### Automated Tests

- Run `pnpm --dir app/sentinel-web test` to run the component and hook unit tests.
- Run `pnpm --dir app/sentinel-api test src/modules/examination/assessment/assessment-access.test.ts` to run assessment access tests.
- Run `pnpm lint` and `pnpm format:check` to ensure no linting/formatting errors are introduced.

### Manual Verification

- Navigate to `/student/classroom/[id]` and verify that completed/turned in exams show "Review Flow" and link to history details, and past due exams show "Past Due" (disabled).
- Navigate to `/student/exam` and verify that the "Available" tab shows upcoming, available, and any active in-progress exams without throwing 403 Forbidden errors.
- Click the tabs "Past due" and "Turned in" and verify they filter and display correct history records without 403 errors.
- Open `/student/calendar` on mobile screen simulation, open details sheet, and verify layout spacing, padding, and that the delete button is visible on touch/responsive layouts.
