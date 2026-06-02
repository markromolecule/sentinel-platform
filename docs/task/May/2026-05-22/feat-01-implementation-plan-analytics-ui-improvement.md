# Overhaul & Over-expansion of Administrator Analytics Page

This plan details the UI overhaul and scope expansion of the administrator analytics dashboard in `sentinel-core`. The goal is to provide a premium, visually stunning, and highly informative overview of the sentinel proctoring system's telemetry, incidents, exams, and performance metrics, fully aligned with the active database models and schemas.

---

## 1-3-1 Options Analysis (Global 1-3-1 Rule)

To achieve the highly premium, minimalist, and compact analytics dashboard, we evaluated three architectural design options:

### Option 1: Standard Recharts with Inline Custom Styling

- Direct implementation of recharts components (Bar, Line, Pie, XAxis, Tooltip) inside each local component, styling them with inline HSL colors and inline theme logic.
- **Pros:** Highly customized per-chart configurations.
- **Cons:** Major code duplication; styling code blocks become bloated; hard to maintain consistent spacing, fonts, and dark mode responsiveness.

### Option 2: Utilizing `@sentinel/ui` Charting Wrappers (`<ChartContainer />` + `<ChartTooltip />`) (Recommended)

- Build the new charts using the customized Shadcn charting components located in `packages/ui/src/components/ui/chart.tsx`.
- **Pros:** Standardizes light/dark theme CSS variables, provides unified typography, offers premium animations, and reduces the layout boilerplate significantly. Fully aligns with user's command to "use shadcn components / or the reusable components on shared/ui".
- **Cons:** Requires mapping static configuration objects for legends and labels.

### Option 3: Standard Native HTML Table-Based Analytics

- Visualizing all details through rich minimalist data tables instead of graphics.
- **Pros:** Extremely high data density.
- **Cons:** Visually dry; lacks the premium, wowed-at-first-glance impact requested in design standards.

### Selected Choice & Recommendation

We select **Option 2 (Advanced Shadcn Charting wrappers)**. It is already present in the workspace, integrates seamlessly with Tailwind CSS, and provides unmatched visual aesthetics with minimal code.

---

## User Review Required

> [!NOTE]
> All data and charts in this phase will be driven by rich mock data aligned directly with the active Prisma database models (`flagged_incidents`, `exams`, `exam_attempts`, etc.). This sets the stage for a seamless integration with `sentinel-api` in the next phase.

> [!IMPORTANT]
> **Minimalist Shadcn Charting:** We will utilize the advanced charting wrapper `<ChartContainer />` from `@sentinel/ui` which handles high-quality HSL color mapping, sleek tooltips, and responsive layout styling natively.

## Open Questions

> [!NOTE]
> Are there any specific departments beyond SECA, SBMA, and SASE that should be visualised in the department integrity distribution? (Default: we will align with the academic departments defined in `@sentinel/shared/constants` index).

---

## Proposed Changes

### Shared Package (`packages/shared`)

#### [MODIFY] [types/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/types/index.ts)

- Add explicit type definitions for:
    - `AnalyticsKPICardData` (KPI statistics with values, percentage changes, trends, and icon names).
    - `IncidentSeverityDistribution` (distribution metrics of High, Medium, Low severity incidents).
    - `IncidentTypeDistribution` (incident occurrences by type, mapped directly to `incident_type` Prisma enum values).
    - `DepartmentIntegrityMetric` (academic department integrity metrics showing completed, dropped, and flagged exam sessions).

#### [MODIFY] [mock-data/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mock-data/index.ts)

- Create and export new, rich mock data arrays for:
    - `MOCK_ANALYTICS_KPI_CARDS` (KPI figures like Integrity Index, Suspicious Sessions, Active Exams, Proctor Engagement).
    - `MOCK_INCIDENT_SEVERITY_DISTRIBUTION` (breakdown of High, Medium, Low severity cases).
    - `MOCK_INCIDENT_TYPE_DISTRIBUTION` (aligning with `incident_type` DB enum such as `FACE_NOT_VISIBLE`, `TAB_SWITCH`, `GAZE`, `APP_BACKGROUNDING`).
    - `MOCK_DEPARTMENT_INTEGRITY_DATA` (representing SECA, SBMA, SASE department telemetry).
- Update and align existing `MOCK_REPORTS` and other analytics constants with the `public.analytics_reports` schema definitions.

---

### Sentinel Core App (`app/sentinel-core`)

#### [NEW] [analytics-kpi-cards.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/analytics/_components/analytics-kpi-cards.tsx)

- Create a minimalist component displaying a row of 4 key performance indicator cards with:
    - Micro-trend indicators (green/red badges for upward/downward trends).
    - Elegant modern icons from `lucide-react` (e.g. ShieldAlert, PlayCircle, Users, Clock).
    - Sleek hover animation scale-ups and glassmorphism styling.

#### [NEW] [incident-severity-chart.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/analytics/_components/incident-severity-chart.tsx)

- Create a sleek Donut/Pie chart to show the proportions of `HIGH`, `MEDIUM`, and `LOW` severity incidents.
- Integrate it with `ChartContainer` and custom tooltip mapping for premium rendering.

#### [NEW] [incident-by-type-chart.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/analytics/_components/incident-by-type-chart.tsx)

- Create a compact horizontal Bar chart showing incident counts by type.
- Match exact incident types from the DB (e.g. `TAB_SWITCH`, `GAZE_TRACKING`) to user-friendly titles via a nice display mapping.

#### [NEW] [department-integrity-chart.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/analytics/_components/department-integrity-chart.tsx)

- Create a minimalist vertical stacked Bar chart showing exam outcomes (Completed vs Flagged vs Dropped) across SECA, SBMA, and SASE departments.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/analytics/_components/index.ts)

- Export the four new analytics components.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/analytics/page.tsx)

- Redesign the layout to orchestrate the entire analytics page:
    - Row 1: `AnalyticsKPICards`
    - Row 2: Grid of `ExamCompletionChart`, `IncidentTrendsChart`, `IncidentSeverityChart`, `IncidentByTypeChart` in a balanced, visually engaging format.
    - Row 3: Grid of `DepartmentIntegrityChart` and the existing `AnalyticsReportsList`.
    - Introduce smooth framer-motion transitions or simple CSS micro-interactions for a highly premium, responsive aesthetic.

---

### Tests

#### [NEW] [analytics.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/analytics/analytics.test.tsx)

- Write a Vitest suite to test rendering of the expanded `AnalyticsPage` and all component parts.
- Verify correct chart data flow and formatting properties.

---

## Verification Plan

### Automated Tests

- Execute Vitest suite:
    ```bash
    pnpm --dir app/sentinel-core test
    ```
- Run formatting and lint checks:
    ```bash
    pnpm format:check && pnpm lint
    ```

### Manual Verification

- Run the monorepo local dev server:
    ```bash
    pnpm --dir app/sentinel-core dev
    ```
- Navigate to `/analytics` in the administrator web app.
- Inspect the KPI cards, interactive charts, and reports list layout.
- Verify smooth interactions, hover effects, tooltips, responsive resizing, and compatibility in dark mode (if applicable).

---

## Phased Execution Roadmap

### Phase 1: Core Shared Types & Mock Data Overhaul

**Goal:** Formulate all data models and rich mock telemetry aligned with the database.

- [x] Modify `packages/shared/src/types/index.ts` to add KPI, severity, incident-type, and department-integrity types.
- [x] Modify `packages/shared/src/types/admin/analytics/index.ts` to export chart-specific parameters.
- [x] Modify `packages/shared/src/mock-data/index.ts` to append standard arrays (`MOCK_ANALYTICS_KPI_CARDS`, `MOCK_INCIDENT_SEVERITY_DISTRIBUTION`, `MOCK_INCIDENT_TYPE_DISTRIBUTION`, `MOCK_DEPARTMENT_INTEGRITY_DATA`).
- [x] Run `pnpm build` across `packages/shared` to verify TypeScript compile success.
      **Migration required:** No.

### Phase 2: Create Modular Analytics Components

**Goal:** Build premium UI components using Tailwind CSS, Radix primitives, and recharts.

- [x] Implement `app/sentinel-core/src/app/(protected)/analytics/_components/analytics-kpi-cards.tsx` showing the 4 KPI cards.
- [x] Implement `app/sentinel-core/src/app/(protected)/analytics/_components/incident-severity-chart.tsx` showing the donut chart.
- [x] Implement `app/sentinel-core/src/app/(protected)/analytics/_components/incident-by-type-chart.tsx` showing the horizontal violations breakdown.
- [x] Implement `app/sentinel-core/src/app/(protected)/analytics/_components/department-integrity-chart.tsx` showing department stats.
- [x] Modify `app/sentinel-core/src/app/(protected)/analytics/_components/index.ts` to export the new modules.
      **Migration required:** No.

### Phase 3: Redesign and Orchestrate the Analytics Dashboard Page

**Goal:** Integrate all components on the main analytics route and perform cosmetic improvements.

- [x] Modify `app/sentinel-core/src/app/(protected)/analytics/page.tsx` with premium layouts and grid configurations.
- [x] Implement dark-mode compatibility, clean typography, hover transitions, and a balanced grid system.
      **Migration required:** No.

### Phase 4: Verification and Code Quality Assurance

**Goal:** Verify everything runs flawlessly and tests pass.

- [x] Implement Vitest file at `app/sentinel-core/src/app/(protected)/analytics/analytics.test.tsx`.
- [x] Run `pnpm --dir app/sentinel-core test` to confirm clean test passes.
- [x] Run `pnpm format` to format the modified workspace files.
      **Migration required:** No.
