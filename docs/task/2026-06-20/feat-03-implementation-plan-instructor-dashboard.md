# Instructor Dashboard Components & API Implementation Plan

Implement a fully scoped, high-performance, and beautifully designed instructor dashboard. This includes retrieving actual database metrics for overview statistics, providing quick access panel links, removing the recent students card, and redesigning the exams section to showcase exam metrics (attempts and incidents) with minimal card-wrapping to maximize visibility and reduce whitespace.

## 1-3-1 Rule Analysis

### Viable Options

#### Option 1: Basic Stats Integration & Compact List (Simple/Fast)
- **Description**: Add a new API endpoint `/users/instructor-dashboard` returning raw stats and recent exams. Update the existing mock hooks to fetch this data. Maintain the card-based layout but remove `RecentStudents` and keep `RecentExams` mostly similar.
- **Tradeoff**: Very simple to build with minimal React Query fetches, but violates the design guidelines to "Avoid wrapping to card / provide better ux / reduce whitespaces".

#### Option 2: Scoped Stats API & Minimalist borderless Grid Layout with Exams Activity & Integrity Monitor (Robust/Premium) [RECOMMENDED]
- **Description**:
  - Implement a new API endpoint `GET /users/instructor-dashboard` returning stats (scoped to the instructor's classrooms, subjects, exams) and recent 5 exams with student attempts and incident counts.
  - Create a React Query hook `useInstructorDashboardQuery` to fetch this data.
  - Redesign the layout: replace bulky widgets with a clean grid. Remove the `RecentStudents` card.
  - Create a card-free `QuickAccess` widget with direct links: Question Bank, Grading, Incident Logs, and Messages.
  - Create `ExamsActivityOverview` replacing `RecentExams`: display exams list using a minimalist list layout (no card borders) with attempt progress, incident count badges, and action shortcuts (Grade, Monitor).
- **Tradeoff**: Requires more coordination across backend data layer, controller, frontend query hooks, and component refactoring, but delivers a premium, highly informative, and visually stunning experience aligned with all project guidelines.

#### Option 3: Real-time Live Proctored Session Carousel & Detailed Stats Panel (Creative/Complex)
- **Description**: Same as Option 2, but adds a live websocket or polling carousel showcasing ongoing proctor sessions, active student feeds, and high-severity alert notifications.
- **Tradeoff**: Outstanding real-time UI, but introduces substantial architectural overhead, websocket dependency, and is beyond the scope of a static dashboard refresh.

### Selected Option
We select **Option 2** as it perfectly solves the requirements, avoids bulky cards, reduces whitespace, and retrieves real, scoped database counts instead of mocks.

---

## User Review Required

> [!IMPORTANT]
> The dynamic dashboard metrics depend on the logged-in user profile having classrooms assigned via `classroom_instructor_assignments` and subjects mapped in `instructor_subjects`.
> 
> The path mappings for the Quick Access links are resolved as:
> - **Question Bank**: `/question/bank`
> - **Grading**: `/exams/grading`
> - **Incident Logs**: `/exams/logs`
> - **Messages**: `/messages`

---

## Open Questions

> [!NOTE]
> 1. **Exams scope**: Should the "Exams Created" count and "Recent Exams" list include all exams in the instructor's institution, or only exams explicitly created by the current instructor (`created_by === userId`)? (Recommended: Only exams created by the current instructor for personal relevance).
> 2. **Integrity threshold**: For the incident counts in the redesigned exams component, do we want to color-code the incident indicators (e.g. red for >= 5 incidents, amber for 1-4, grey for 0)? (Recommended: Yes, to highlight integrity risks).

---

## Proposed Changes

### Backend API (`sentinel-api`)

#### [NEW] [get-instructor-dashboard-data.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/data/get-instructor-dashboard-data.ts)
- Implement `getInstructorDashboardData` using Kysely queries:
  - `totalStudents`: Count of unique students enrolled in active classrooms (`classroom_instructor_assignments` state is `ACTIVE`) taught by the instructor.
  - `totalClassrooms`: Count of active classrooms assigned to the instructor.
  - `totalSubjects`: Count of subjects mapped to the instructor in `instructor_subjects`.
  - `examsCreated`: Count of exams created by the instructor (`created_by = requesterUserId`).
  - `recentExams`: List of the top 5 most recent exams created by the instructor including attempt counts and incident counts.

#### [MODIFY] [user.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/user.dto.ts)
- Add `instructorDashboardSchema` validating the stats and recent exams list.
- Export `GetInstructorDashboardResponse` type.

#### [MODIFY] [user-crud.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/services/user-crud.service.ts)
- Add `getInstructorDashboard` method invoking the data layer fetcher.

#### [MODIFY] [user.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/user.service.ts)
- Add wrapper method `getInstructorDashboard` mapping requests to `UserCrudService`.

#### [NEW] [get-instructor-dashboard.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/controllers/get-instructor-dashboard.controller.ts)
- Create `getInstructorDashboardRoute` and its handler validating instructor role access and returning the stats and recent exams payload.

#### [MODIFY] [user.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/user.routes.ts)
- Mount the `getInstructorDashboardRoute` route.

#### [NEW] [get-instructor-dashboard.controller.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/controllers/get-instructor-dashboard.controller.test.ts)
- Add Vitest tests for testing permissions and verifying successful retrieval of stats and exams payloads.

---

### Frontend Web App (`sentinel-web`)

#### [NEW] [use-instructor-dashboard-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/hooks/query/use-instructor-dashboard-query.ts)
- Add Tanstack Query hook fetching data from `/users/instructor-dashboard`.

#### [MODIFY] [use-proctor-dashboard.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_hooks/use-proctor-dashboard.ts)
- Rewrite to integrate `useInstructorDashboardQuery` and dynamically construct stats mapping with Lucide icons (`Users`, `School`, `BookOpen`, `FileText`), color theme classes, and routes.
- Return loading and query states.

#### [NEW] [exams-activity-overview.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/exams-activity-overview.tsx)
- Redesign `RecentExams` into `ExamsActivityOverview` without heavy card wrappers.
- Render list items with subtle gradient accents, subject details, scheduled dates, attempts completion ratio, and incident alarm badges.

#### [NEW] [exams-activity-overview.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/exams-activity-overview.test.tsx)
- Add Vitest tests checking correct rendering of exam items, progress ratios, and incident counts.

#### [NEW] [quick-access.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/quick-access.tsx)
- Implement `QuickAccess` replacing the current `QuickActions` to render card-free grid links to Question Bank (`/question/bank`), Grading (`/exams/grading`), Incident Logs (`/exams/logs`), and Messages (`/messages`).
- Add hover transitions and modern visual feedback.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/index.ts)
- Export `ExamsActivityOverview` and `QuickAccess`. Delete `recent-exams.tsx` and `recent-students.tsx`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/page.tsx)
- Incorporate loading state spinners.
- Update page markup: remove `RecentStudents`, embed `ExamsActivityOverview` and `QuickAccess`. Apply a clean, minimalist layout spacing to reduce whitespace.

#### [MODIFY] [page.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/page.test.tsx)
- Update page test suites to mock `useProctorDashboard` returning loading, error, and dynamic API states.

---

## Verification Plan

### Automated Tests
- Run backend unit tests:
  `pnpm --dir app/sentinel-api test`
- Run frontend dashboard tests:
  `pnpm --dir app/sentinel-web test`

### Manual Verification
- Log in as an instructor and view the dashboard. Verify that numbers are correct, the recent students card is gone, and the layout looks modern and clean.
- Check each Quick Access shortcut link to ensure it navigates to the correct page.
- Review exam list items and confirm attempts and incident indicators dynamically reflect the backend data.
