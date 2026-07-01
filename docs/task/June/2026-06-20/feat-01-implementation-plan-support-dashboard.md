# Support Dashboard Components Implementation Plan

Implement new compact, reliable, and useful components for the support dashboard: a quick shortcuts widget, a telemetry health monitoring widget, and a recent activity log feed widget, using the system data.

## 1-3-1 Rule Analysis

### Viable Options

#### Option 1: Minimalist Navigation Shortcuts & Basic Entity Stats Widget (Simple/Fast)

- **Description**: Build a simple shortcuts grid displaying links to the main support modules (Institutions, Users, Telemetry, Logs, Announcements). For data, display a simple static/cached count of entities (using the already-imported queries for institutions, departments, courses, etc.) in a compact list format.
- **Tradeoff**: Very fast to implement and carries zero risk of API integration issues, but provides limited real-time value and interactive capability to support operators.

#### Option 2: Interactive Operations Board with Real-Time Telemetry Health + Quick Actions panel (Robust/Scalable) [RECOMMENDED]

- **Description**:
    - Build `SupportShortcutsWidget` showing stylized shortcut cards for primary support areas (Institutions, Users, Telemetry, Logs, Announcements, Messages) with hover effects and quick actions.
    - Build `SupportTelemetryHealthWidget` that connects to the `useTelemetryHealthQuery` hook. This widget displays live queue ingestion stats (mode, active, completed, failed, waiting, buffered) with a manual refresh button and clean health indicators.
    - Build `SupportActivityFeedWidget` that connects to the `useActivityLogsQuery` hook to display the 5 most recent system operational logs (actions, actors, timestamps) in a scrollable list.
- **Tradeoff**: Requires mock data and query handling in Vitest, but provides a highly useful, production-grade operations center for support staff.

#### Option 3: Unified "Command Center" Tabbed Widget with Interactive Quick-Forms (Creative)

- **Description**: Create a single large tabbed component (`SupportCommandCenter`) with tabs: "Quick Actions", "Telemetry Status", and "Activity Feed". Inside the "Quick Actions" tab, embed mini inline dialogs/forms to trigger basic tasks (e.g. creating a basic announcement or searching for a user by email directly without leaving the dashboard page).
- **Tradeoff**: Provides an all-in-one desktop experience, but increases layout complexity, violates component single-responsibility, and is less compact on smaller screens.

### Selected Option

We choose **Option 2** (Interactive Operations Board) because it aligns with the existing dashboard architecture, provides real-time information for telemetry and activity logs, and is modular, clean, and highly useful for daily support tasks.

---

## User Review Required

> [!IMPORTANT]
> The proposed widgets require access to the telemetry and activity log hooks from `@sentinel/hooks` (`useTelemetryHealthQuery` and `useActivityLogsQuery`). Ensure the API endpoints `/telemetry/health` and `/logs/activity` are responsive on the active local API server.

---

## Proposed Changes

### Support Dashboard Components

#### [x] [support-shortcuts-widget.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/dashboard/_components/support-shortcuts-widget.tsx>)

- Create a new component `SupportShortcutsWidget` that displays shortcuts to key support pages.
- Add JSDoc comments.

#### [x] [support-shortcuts-widget.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/dashboard/_components/support-shortcuts-widget.test.tsx>)

- Create unit tests for `SupportShortcutsWidget` validating render behavior and navigation link targets.

#### [x] [support-telemetry-health-widget.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/dashboard/_components/support-telemetry-health-widget.tsx>)

- Create a new component `SupportTelemetryHealthWidget` using `useTelemetryHealthQuery`.
- Display status, mode, active, completed, failed, waiting, and buffered counts.
- Add JSDoc comments.

#### [x] [support-telemetry-health-widget.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/dashboard/_components/support-telemetry-health-widget.test.tsx>)

- Create unit tests for `SupportTelemetryHealthWidget` mocking `useTelemetryHealthQuery` states.

#### [x] [support-activity-feed-widget.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/dashboard/_components/support-activity-feed-widget.tsx>)

- Create a new component `SupportActivityFeedWidget` using `useActivityLogsQuery` with a limit of 5.
- Render the recent system operations, actor emails/roles, action details, and timestamps.
- Add JSDoc comments.

#### [x] [support-activity-feed-widget.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/dashboard/_components/support-activity-feed-widget.test.tsx>)

- Create unit tests for `SupportActivityFeedWidget` mocking `useActivityLogsQuery` states.

#### [x] [index.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/dashboard/_components/index.ts>)

- Export the three new widgets from the dashboard `_components` index file.

#### [x] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/dashboard/page.tsx>)

- Update `DashboardPage` to import and render `SupportShortcutsWidget`, `SupportTelemetryHealthWidget`, and `SupportActivityFeedWidget` when the user's role is `'support'`.
- Clean up or organize page layout with a responsive two-column grid.

#### [x] [page.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/dashboard/page.test.tsx>)

- Mock the new widgets and ensure `page.tsx` continues to pass its unit tests with no errors.

---

## Verification Plan

### Automated Tests

- Run tests inside `sentinel-support`:
  `pnpm --dir app/sentinel-support test`

### Manual Verification

- Start the support dashboard in dev mode and verify that the layout and components look premium, responsive, and render correct telemetry health and activity details.
