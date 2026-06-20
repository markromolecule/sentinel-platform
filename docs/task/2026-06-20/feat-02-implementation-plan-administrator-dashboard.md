# Administrator Dashboard Components Implementation Plan

Implement a fully scoped, high-performance, and beautifully designed administrator dashboard for the `sentinel-core` application. This includes rendering dynamically filtered KPI cards and quick access shortcuts based on the user's role and academic scoping (department for superadmin, course for admin).

## 1-3-1 Rule Analysis

### Viable Options

#### Option 1: Minimalist Stats Overview with Unscoped Counters (Simple/Fast)
- **Description**: Render static or unscoped counts of users, classrooms, courses, and sections across the entire institution. Provide generic text links to other sub-pages.
- **Tradeoff**: Very simple to build with minimal React Query fetches, but violates the core specification to filter metrics by department for superadmins and course for admins.

#### Option 2: Dynamically Scoped KPI Overview & Card-Free Quick Shortcuts Grid (Robust/Premium) [RECOMMENDED]
- **Description**:
  - Integrate `useAcademicScope` to retrieve the active user's role (`admin` or `superadmin`), `assignedDepartmentId`, and `assignedCourseId`.
  - For `superadmin`: Fetch users (role `student`), classrooms, sections, and courses filtered by `assignedDepartmentId`. Display these counts (students, classrooms, sections, programs) using the `KpiCarouselWidget`.
  - For `admin`: Fetch users (role `student`) and sections filtered by `assignedCourseId`. Display these counts (students, sections) in the dashboard overview.
  - Build a custom `AdminShortcutsWidget` component rendering high-fidelity, micro-animated shortcuts for Exams, Question Bank, Enrollment Request, Report & Analytics, and Messages.
- **Tradeoff**: Requires conditional queries and thorough mocking of React Query hooks and academic scoping in tests, but provides a highly secure, functional, and responsive control panel.

#### Option 3: Tabbed Panel Command Center with Embedded Activity Logs (Creative/Complex)
- **Description**: Group the KPI cards and shortcuts into separate tabs ("Overview", "Shortcuts", "Quick Analytics"). Add a secondary widget below displaying the most recent system logs under the administrator's department/course.
- **Tradeoff**: Extremely comprehensive, but increases layout complexity and goes beyond the requested scope of simple overview cards and shortcuts.

### Selected Option
We select **Option 2** as it perfectly fulfills the role-based data filtering requirement, matches the design language of the support dashboard, and organizes features into clean, modular, and testable components.

---

## User Review Required

> [!IMPORTANT]
> The dynamic dashboard metrics depend on the logged-in user profile having an assigned `department_id` and/or `course_id`. If a profile lacks these fields, the cards will fall back to displaying `0` or appropriate message.
> 
> The path mappings for the administrator shortcuts are resolved as:
> - **Exams**: `/exams`
> - **Question Bank**: `/question`
> - **Enrollment Request**: `/subjects/requests` (matches `subject-requests` in the page capabilities map)
> - **Report & Analytics**: `/analytics`
> - **Messages**: `/messages`

---

## Open Questions

> [!NOTE]
> 1. **Data Fallback**: In case a `superadmin` or `admin` does not have any department or course assigned to their profile, should we display empty dashboard metrics (0), or should we show institution-wide metrics instead?
> 2. **Shortcuts Layout**: Do you prefer the quick shortcuts widget in a side panel or inside the main grid under the KPI cards? (Recommended: Rendered below the KPI cards in the main flow).

---

## Proposed Changes

### Core Dashboard Feature

#### [NEW] [admin-shortcuts-widget.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/admin-shortcuts-widget.tsx)
- Create the `AdminShortcutsWidget` component that displays direct, card-free, and borderless link panels to Exams, Question Bank, Enrollment Request, Report & Analytics, and Messages.
- Use Lucide icons (`GraduationCap`, `Database`, `ClipboardCheck`, `BarChart3`, `MessageSquare`) with customized hover-translate and scaling animations.
- Document with descriptive JSDoc comments.

#### [NEW] [admin-shortcuts-widget.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/admin-shortcuts-widget.test.tsx)
- Add Vitest unit tests verifying that all five shortcuts render correctly with their corresponding route paths.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/index.ts)
- Export `AdminShortcutsWidget` from the `_components` index file.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/page.tsx)
- Integrate the `useAcademicScope()` hook.
- Implement conditional fetching:
  - If `superadmin`: Query students, classrooms, courses (programs), and sections. Filter sections by department client-side.
  - If `admin`: Query students and sections, filtered by the admin's assigned course ID.
- Map the retrieved counts into `KpiCarouselWidget` configuration arrays.
- Render `KpiCarouselWidget` and `AdminShortcutsWidget` inside the layout container.

#### [MODIFY] [page.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/page.test.tsx)
- Update tests to mock `useAcademicScope`, `useUsersQuery`, `useClassroomsQuery`, `useSectionsQuery`, and `useCoursesQuery`.
- Assert correct rendering of the dashboard overview and greeting for both `admin` and `superadmin` roles.

---

## Verification Plan

### Automated Tests
- Execute all dashboard component and page tests:
  `pnpm --dir app/sentinel-core test`
- Ensure all Vitest assertions pass successfully.

### Manual Verification
- Login to the admin dashboard with a `superadmin` profile and verify the counts represent department metrics.
- Login with an `admin` profile and verify the counts represent course metrics.
- Click each shortcut to confirm correct routing redirection.
