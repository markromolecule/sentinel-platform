# Plan: Instructor Subject Request Defaults

This document outlines the plan for improving the "Request Offered Subject" workflow by pre-filling the instructor's department and course from their profile.

## Objectives
- Dynamically fetch and set the instructor's department and course as defaults when a subject is selected.
- Ensure the ability to select outside the home department for general/cross-department subjects.

## Implementation Details

### 1. Pre-filling from Profile
- Use `useProfileQuery` in `useAddSubjectForm` to obtain the current instructor's data.
- Add an effect to set `department_id` and `course_id` when `subject_offering_id` is changed, provided the instructor's values are valid for that offering.

### 2. Flexible Filtering
- Refactor `useSubjectFormFiltering` to ensure `validDepartments` and `validCourses` correctly identify all available options for a `SubjectOffering`.
- If an instructor is from IT but Wants to offer a Nursing section of a General Subject, the system should allow selecting "Nursing" if sections exist for it.

### 3. UI Improvements
- Keep the dropdowns enabled but pre-selected with the profile defaults.
- Allow the instructor to manually override these defaults to cater to other departments.

## Note on General Subjects
The user will create a separate plan for identifying general subjects (e.g., Entrepreneurship).
