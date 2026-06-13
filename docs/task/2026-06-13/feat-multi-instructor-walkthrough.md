# Walkthrough: Multiple Instructor Assignment, Avatars, and Room/Sections

This document describes the walkthrough and manual verification of the multiple proctor/instructor assignment feature, rendering of instructor avatars, scheduled rooms, and section lists in the assignments table, and the premium multi-instructor selection UX during exam creation.

## Changes Completed

### 1. Shared Schemas & Constants

- Modified [exam-assignment-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-assignment-schema.ts) to support optional `avatarUrl` on actors and `roomName` & `sectionNames` on exam summaries.
- Modified [exam-create-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-create-schema.ts) to support optional `instructorIds` array on creation payload.
- Modified [exam-constants.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/constants/exams/exam-constants.ts) to initialize default values with `instructorIds: []`.

### 2. Backend API

- Modified Kysely query in [get-exam-assignments.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/data/get-exam-assignments.ts) and services to retrieve `avatar_url`, join scheduled `rooms`, and subquery/aggregate assigned section names.
- Modified [create-exam-assignment.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/create-exam-assignment.ts) to disable the active proctor assignment conflict check, enabling multiple proctor assignments per exam.
- Added unit and integration test assertions verifying database support for multiple active instructor proctors.

### 3. Frontend UI & Table

- Added new `Room` and `Sections` columns to the assignments table in [columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/exams/assign/_components/columns.tsx>).
- Updated the `assignedInstructor` cell to render instructor avatar photos with fallback initials.
- Re-implemented the instructor selection component [instructor-field.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields/instructor-field.tsx) as a searchable multi-select checkbox list with dismissible badge chips.
- Modified [use-exam-create-form.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/config/_hooks/use-exam-create-form.ts) to submit proctor assignments sequentially for all selected instructors.

---

## Verification Results

### Automated Test Runs

- Ran Vitest unit tests in `sentinel-api` workspace: all relevant tests passed.
- Ran Vitest unit tests in `sentinel-core` workspace: all 317 tests passed.

### Manual Walkthrough Verification

The browser subagent successfully completed the verification workflow:

1. Logged in to the Sentinel Core administrator portal.
2. Opened the **Create Exam** dialog.
3. Created an exam named **"System Verification Exam"** scheduled for **ROOM501** and target classroom **"GEETH01X INF232"**.
4. Selected two instructors, **Keanna Mae Cloma** and **Michael Galo**, from the searchable checkbox list.
5. Submitted the form successfully.
6. Checked the **Assignments** page and verified that:
    - Two separate assignment rows appeared for the exam.
    - One was assigned to **Keanna Mae Cloma** and the other to **Michael Galo**.
    - The scheduled room **"ROOM501"** and section **"INF232"** were displayed correctly on each row.
    - User initials fallback / avatar components rendered properly on each row.

### Recording of Browser Flow

The full verification process can be viewed in the recorded video below:

![Create Exam Multi-Instructor E2E Verification](/Users/joseph/.gemini/antigravity-ide/brain/102f5a4c-911c-419d-84ad-09619f0cf21f/create_exam_multi_instructor_1781345594413.webp)

And here is the visual proof that the instructor avatars display correctly on the assignments table once their `avatar_url` fields are populated:

![Instructor Avatars rendering on Table](/Users/joseph/.gemini/antigravity-ide/brain/102f5a4c-911c-419d-84ad-09619f0cf21f/instructor_avatars_1781346438787.png)
