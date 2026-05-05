# Telemetry UI Refactor Roadmap

This roadmap outlines the plan to refactor the Telemetry page to match the structure, layout, and component patterns of the Control module.

## 1. Goal

Refactor `app/sentinel-support/src/app/(protected)/(support)/telemetry` to follow the workspace-style layout used in `app/sentinel-support/src/app/(protected)/(support)/control`.

## 2. Phased Breakdown

### Phase 1: Layout & Infrastructure

Establish the workspace shell and navigation components.

- [ ] **[NEW]** `_components/layout/telemetry-nav.tsx`: Sidebar navigation for telemetry sections.
- [ ] **[NEW]** `_components/layout/telemetry-workspace-shell.tsx`: Main shell containing the sidebar and content area.
- [ ] **[NEW]** `_components/layout/telemetry-page-shell.tsx`: Header component for titles, descriptions, and actions.
- [ ] **[NEW]** `_components/governance/telemetry-governance-form.tsx`: Orchestrator component to manage views and routing.

### Phase 2: View Modularization

Extract and adapt existing telemetry logic into standalone views.

- [ ] **[MODIFY]** `_components/views/operations-view.tsx`: Move and refactor existing operations logic.
- [ ] **[MODIFY]** `_components/views/rules-view.tsx`: Move and refactor existing rules logic.
- [ ] **[MODIFY]** `_components/views/sandbox-view.tsx`: Move and refactor existing sandbox logic.
- [ ] **[MODIFY]** `_components/views/health-view.tsx`: Move and refactor existing health logic.
- [ ] **[DELETE]** `_components/shared/settings-nav.tsx`: Remove old local navigation.
- [ ] **[DELETE]** `_components/telemetry-settings-form.tsx`: Replaced by `TelemetryGovernanceForm`.

### Phase 3: Route Migration

Implement the sub-routing structure to match the Control module.

- [ ] **[NEW]** `app/sentinel-support/src/app/(protected)/(support)/telemetry/layout.tsx`: Root layout for the telemetry workspace.
- [ ] **[MODIFY]** `app/sentinel-support/src/app/(protected)/(support)/telemetry/page.tsx`: Entry point rendering the governance form.
- [ ] **[NEW]** `app/sentinel-support/src/app/(protected)/(support)/telemetry/rules/page.tsx`: Sub-page for rules.
- [ ] **[NEW]** `app/sentinel-support/src/app/(protected)/(support)/telemetry/sandbox/page.tsx`: Sub-page for sandbox settings.
- [ ] **[NEW]** `app/sentinel-support/src/app/(protected)/(support)/telemetry/health/page.tsx`: Sub-page for system health.

### Phase 4: State Management & UX

Ensure consistent state handling and visual polish.

- [ ] Implement cross-section state persistence for "Unsaved Changes" if required.
- [ ] Standardize loading states using `AccessControlLoadingState`.
- [ ] Standardize error handling using `AccessControlErrorState`.

## 3. Data Layer

No schema changes are required for this UI refactor. All data fetching will continue to use existing hooks (`useTelemetrySettingsQuery`, `useTelemetryHealthQuery`).

## 4. Testing Strategy

### Automated Tests

- [ ] **[NEW]** `_components/layout/telemetry-nav.test.tsx`: Test navigation clicks and active states.
- [ ] **[MODIFY]** `telemetry/page.test.tsx`: Update page-level tests to reflect the new structure.

### Manual Verification

1.  Verify sidebar navigation correctly pushes to sub-routes.
2.  Confirm the "Unsaved Changes" badge and "Discard" button behave correctly when switching sections.
3.  Ensure the "Sync Settings" action persists changes correctly.
4.  Check responsiveness across different screen sizes.
