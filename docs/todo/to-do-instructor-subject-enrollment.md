# Instructor Subject Enrollment Implementation Plan

## Overview

This plan outlines the steps required to implement the Instructor Subject Enrollment feature in `sentinel-web` (`/instructor/subjects`), satisfying the requirement to fetch master subject data, cascade properties (Department, Course, Year Level, Section), and mirror admin grouping structures.

## 1-3-1 Rule Analysis & Options

### Option 1: React Hook Form with Shadcn UI Selects (Recommended)

**Description:** Refactor the instructor's enrollment dialog to use `react-hook-form` and `zod` for state management and validation. We will implement React Query hooks (`useSubjectsQuery`, `useDepartmentsQuery`, `useCoursesQuery`, `useSectionsQuery`) inside `sentinel-web` to fetch real data from the API. When a Subject is selected, the form uses `useWatch` to trigger sequential filtering of Department -> Course -> Year Level -> Sections dropdowns/selectors based on the arrays present on the chosen `MasterSubject`.
**Pros:**

- Highly consistent with modern Next.js/React standard practices (as used in admin portal).
- Extremely predictable state and validation.
- Clean component decomposition.
  **Cons:**
- Requires rewriting the existing `useAddSubject` state hook completely.

### Option 2: Extended Zustand/Native State Model

**Description:** Keep the existing `useAddSubject.ts` hook pattern but extend it heavily. Add new state trackers for `selectedDepartmentId`, `selectedCourseId`, etc. Instead of using `react-hook-form`, manually wire the cascading logic inside `useMemo` hooks.
**Pros:**

- Incremental change from exactly what is written there today.
  **Cons:**
- "Prop drilling" or excessive state values inside a single custom hook.
- Validation becomes manual and tedious.

### Option 3: Multi-Step Wizard

**Description:** Break the enrollment process into steps: (1) Subject, (2) Department & Course, (3) Section & Year Level, using a stepped wizard dialog.
**Pros:**

- Avoids UI clutter for complex dependent data.
  **Cons:**
- Heavier UX friction than a single dialog.
- Harder to map to the admin's single-view approach.

### The Best Option: Option 1

**Why:** Reusing the `react-hook-form` pattern aligns best with the codebase's existing conventions (`subject-form-dialog.tsx` in admin). Because the master subject holds arrays of `departmentIds`, `courseIds`, etc., filtering subsequent dropdowns becomes highly reliable using `useWatch` and avoids unwieldy state bundles.

## To-Do List

- [ ] Create missing React Query hooks in `sentinel-web` (`use-subjects-query`, `use-courses-query`, `use-sections-query`) using the existing `src/data/api/*` implementations.
- [ ] Implement `Zod` validation schema for instructor subject enrollment.
- [ ] Update `add-subject-dialog.tsx` to handle the `react-hook-form` provider context.
- [ ] Create custom dropdown/selector sub-components for cascading Selection:
    - Subject Selector
    - Department Selector (Filtered by Subject)
    - Course Selector (Filtered by Department)
    - Year Level Selector
    - Section Selector
- [ ] Mirror the admin column structure in the instructor's subject table UI viewing page to properly group the enrolled sections.
- [ ] Wire up the submission handler to API layer.

**Note:** Coding will begin only after explicit instruction.
