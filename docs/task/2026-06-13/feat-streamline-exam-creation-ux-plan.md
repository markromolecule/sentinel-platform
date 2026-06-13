# Implementation Plan: Improve UX and Accessibility for Exam Creation

This plan aims to streamline the "Create Exam" modal user interface on the administrator application (`sentinel-core`). It balances the visual columns, introduces real-time search filtering for classrooms, and corrects outdated labels now that the question builder redirect is removed.

## User Review Required

> [IMPORTANT]
> The "Create Exam" form is currently quite tall and visually uneven. We propose moving the **Room** and **Assign to Instructor** fields to the right column. Room availability is dynamically computed based on the selected Schedule times, making this a logical grouping.

## Open Questions

> [NOTE]
> 1. **Column Title:** Do you prefer renaming the right column header from **"Schedule"** to **"Schedule & Location"** (or "Logistics") to reflect the addition of Room and Instructor fields?
> 2. **Selected Classrooms Preview:** Do you want a dedicated list of selected classroom chips at the top of the classroom section, or is checking them in the scrollable list sufficient?

---

## Proposed Changes

### Component: sentinel-core Exam Fields & Layouts

#### [MODIFY] [basic-info-fields.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields.tsx)
- Remove `RoomField` and `InstructorField` from `BasicInfoFields`.
- Keep `BasicDetailsFields` (Title & Description) and `ClassroomField`.
- Retain the section title as "General Info" and description as "Core details for your exam session."

#### [MODIFY] [schedule-fields.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/schedule-fields.tsx)
- Integrate `RoomField` and `InstructorField` under the schedule presets and duration controls.
- Retrieve room selection state (`roomGroups`, `selectedRoomOption`, etc.) via prop parameters or form context.
- Rename the section header or add a subheading to indicate schedule and assignment details.

#### [MODIFY] [exam-create-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/layouts/exam-create-form.tsx)
- Update `footerNote` to: `"The exam will be created on your dashboard. You can add and edit questions at any time."`
- Update `submitLabel` to `"Create Exam"`.
- Pass room-related props down to `ScheduleFields` now that they are rendered in that column.

#### [MODIFY] [classroom-field.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields/classroom-field.tsx)
- Add a search input at the top of the classroom list inside the ScrollArea card:
    - Implement a state variable `searchQuery` and a text input.
    - Filter `classroomOptions` by checking if the search query matches the classroom title, section label, or subject name.
- Improve checked style: highlighted checked rows with a soft brand-colored background (`bg-[#323d8f]/5`).

---

## Verification Plan

### Automated Tests
- Run `pnpm --dir app/sentinel-core test` to execute Vitest suites.
- Verify and update `basic-info-fields.test.tsx` and `room-field.test.tsx` for the new layout positions and inputs.

### Manual Verification
1. Boot the backend server and frontend workspaces using `pnpm dev`.
2. Open the "Create Exam" dialog on `localhost:3002/exams`.
3. Check the layout balance: Column 1 should contain Title, Description, and the Searchable Classrooms; Column 2 should contain Schedule (Starts/Ends, Presets, Duration), Room, and Instructor.
4. Type in the classroom search input to verify filtering is fast and correct.
5. Click "Create Exam" and verify the creation completes and redirects to the dashboard.
