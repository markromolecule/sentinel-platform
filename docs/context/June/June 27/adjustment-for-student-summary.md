# Adjustment for Student Summary Report (Instructor View)

This document outlines the requirements and specific tasks to polish and improve the student's individual exam attempt report page (`/exams/reports/[examId]/[attemptId]`) viewed by instructors. The goal is to align its layout, navigation, and presentation with the main exam detailed report workspace.

---

## 1. Sidebar Layout & Shell Integration

### Current Issue:
The individual student attempt report page is currently wrapped by the global `ExamsWorkspaceShell` which renders the general **Exams** module sidebar navigation (Dashboard, Assign, Grading, Reports, etc.). It lacks the context of the specific report it belongs to.

### Requirements:
- **Exclude Exams Module Sidebar**:
  - Update `getManagedSection` in [exams-workspace-shell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-workspace-shell.tsx) to return `null` for route patterns matching individual student reports (e.g. `/exams/reports/[examId]/[attemptId]`). This will prevent the generic Exams module navigation sidebar from rendering.
- **Render Report Sections Sidebar**:
  - In [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx), layout the page using the standard report layout split: a vertical sticky sidebar on the left and the main report details on the right.
  - The left sidebar must display the **Report Sections** navigation matching the layout of the main exam report workspace:
    - **Overview**
    - **Attempt Summary**
    - **Action Queue**
  - **Sidebar Navigation Behavior**:
    - Since the user is viewing a specific student's attempt, clicking any of these sidebar buttons should navigate back to the corresponding section of the parent exam report page:
      - Clicking **Overview** routes to `/exams/[examId]/report?section=overview`
      - Clicking **Attempt Summary** routes to `/exams/[examId]/report?section=attempts`
      - Clicking **Action Queue** routes to `/exams/[examId]/report?section=queue`

---

## 2. Navigation Polish & Breadcrumb Cleanup

### Current Issue:
- The page renders a redundant top breadcrumb (`Reports / {examTitle} / {studentName}`) that consumes valuable vertical space.
- The "Back to Summary" button redirects to the parent report page `/exams/[examId]/report`, which defaults to the **Overview** section instead of returning the user to their starting point (the attempts list).

### Requirements:
- **Remove Redundant Breadcrumbs**:
  - Delete the breadcrumb element at the top of the content area in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx).
- **Targeted Back Navigation**:
  - Update the "Back to Summary" button link to navigate to `/exams/[examId]/report?section=attempts`.
- **Handle Section Routing**:
  - Modify the main report page at [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.tsx) to read the active section query parameter on initialization (using Next.js `useSearchParams`). If `section` is set to `attempts` or `queue`, set the initial state of `activeSection` accordingly. Wrap page components in a `<Suspense>` boundary where appropriate to handle search parameters during SSR.

---

## 3. Tabular Questions List (Convert Cards to Tables)

### Current Issue:
The questions list in [attempt-report-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/attempt-report-view.tsx) is currently rendered as a long sequence of stacked card components ([attempt-report-question-card.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/_components/attempt-report-question-card.tsx)). This layout is vertical-heavy and makes side-by-side scanning of student and correct answers tedious for instructors.

### Requirements:
- **Implement Table Structure**:
  - Re-engineer the questions list rendering in [attempt-report-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/attempt-report-view.tsx) to utilize a cohesive table layout using the standard UI components imported from `@sentinel/ui` (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`).
- **Table Columns Design**:
  - **#**: Sequential question index (e.g. `1`, `2`, `3`).
  - **Question**: The prompt text. If a question is linked to a reading passage, display a clean toggle or sub-row that expands to show the passage details inline.
  - **Type**: Badge representing the question type (e.g., Multiple Choice, Essay, short_answer).
  - **Student Answer**: The student's submitted response.
  - **Correct Answer**: The reference correct answer (or grading guide notes for manual/essay items).
  - **Score**: The awarded score / max score (e.g. `4.5 / 5.0 pts`).
  - **Overrides** (Only shown when `editable` is true): Render inline override inputs (number input for score, textarea/input for reasons) or an action to edit overrides in an expanded panel.
- **Aesthetic Refinement**:
  - Ensure the table has clean cell borders, appropriate text alignment, proper padding, and uses the workspace design tokens (Inter/Outfit typography, muted-foreground headings, and custom status badge styling).

---

##  acceptance Criteria Checklist

| Requirement | Description |
|---|---|
| **Shell Sidebar Exclude** | Navigating to `/exams/reports/[examId]/[attemptId]` hides the default Exams module navigation rail. |
| **Report Sidebar Render** | Left-hand navigation displays "Report Sections" sidebar instead. |
| **Sidebar Links** | Clicking Overview/Attempts/Queue routes to `/exams/[examId]/report?section=[section_name]`. |
| **Breadcrumb Removal** | The top navigation breadcrumb text has been removed. |
| **Back Button Target** | "Back to Summary" button redirects to `/exams/[examId]/report?section=attempts`. |
| **Default Tab Selection** | Returning to the report page with `?section=attempts` correctly mounts with the "Attempt Summary" section open. |
| **Question Table** | Questions list renders as a responsive, scannable table instead of individual cards. |
| **Editable Overrides** | Inline grade override forms and textareas are cleanly integrated into the table layout when the view is editable. |