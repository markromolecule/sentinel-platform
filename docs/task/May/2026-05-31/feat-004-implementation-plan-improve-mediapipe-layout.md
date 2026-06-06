# Implementation Plan - Improve MediaPipe Sandbox and Audio Calibration Layout

This plan outlines the design and implementation steps for refactoring the Support Telemetry dashboard inside the `sentinel-support` application. It splits the long, monolithic MediaPipe Sandbox settings into a beautiful, high-efficiency tabbed interface and maximizes the workspace space for the Audio Anomaly Calibration tool by migrating it to a widescreen two-column grid.

## User Review Required

> [!NOTE]
> All changes are restricted entirely to the frontend layout layers in the `sentinel-support` app. There are no backend mutations, API contract updates, or database schema/Prisma migrations required.

## Proposed Changes

### Telemetry Support Components

---

#### [MODIFY] [sandbox-view.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/telemetry/_components/views/sandbox-view.tsx>)

- Refactor the stacked vertical layout into a premium, responsive tabs system using `@sentinel/ui`'s `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent`.
- Provide three clean tabs with distinct metadata and inline icons:
    1. **Calibration Workspace** (`workspace`): Holds the `SandboxLauncher`, live preview signals summary, and the launcher dialog setup.
    2. **Feature Overrides** (`controls`): Holds the global sandbox toggles, camera overlays, and checkup/exam execution properties.
    3. **Analysis Thresholds** (`thresholds`): Holds numeric inputs for confidence constraints, sample cadence, and gaze thresholds.
- Maintain seamless propagation of parent properties, draft state actions, and telemetry calibration runtime hook triggers.

#### [MODIFY] [audio-calibration-form.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/telemetry/_components/audio/audio-calibration-form.tsx>)

- Lift the `max-w-3xl` size limit of the calibration container to allow modern, high-density telemetry dashboards.
- Refactor form controls into an elegant, two-column grid layout on larger viewports:
    - **Left Hand Side (General Settings)**:
        - Global Sensitivity Multiplier (Slider with inline description).
        - Consecutive Frame Threshold and Cooldown Period (side-by-side numerical text inputs).
        - Enabled Anomaly Types (Checkbox matrix wrapped in a subtle background panel).
    - **Right Hand Side (Fine-Tuning Thresholds)**:
        - Individual Anomaly Threshold controls inside a sleek styled sub-card.
        - Improve threshold sliders by showing base values, effective values, and category-focused badges using HSL tailored colors.
- Maintain full hook-form integration, validation schemas, and reset procedures.

---

## Verification Plan

### Automated Tests

Run the entire sentinel-support Vitest suite to ensure that all hook triggers, form validations, and draft synchronizations are error-free:

```bash
pnpm --dir app/sentinel-support test
```

### Manual Verification

- Deploy/start the sentinel dev server.
- Navigate to `/telemetry/sandbox` and confirm the new tabs operate seamlessly without layout shifts.
- Navigate to `/telemetry/audio-calibration` and verify that the settings page stretches gracefully to leverage full horizontal screen width, organizing controls into separate, beautiful columns.
