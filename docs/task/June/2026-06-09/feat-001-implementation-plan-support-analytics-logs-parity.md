# feat-001: Support Analytics & Logs Parity

## Summary

Mirror the `sentinel-core` analytics and logs route UIs into `sentinel-support` so support users get the same pages, layouts, and sidebar destinations without any visible UI redesign.

---

## Pre-Planning Checklist

- [x] Task input summarized in one sentence
- [x] Relevant source files scanned
- [x] All files, services, and DB tables identified
- [x] Prisma migration decision made

> **Task (one sentence):** Replicate the core analytics and logs page trees into `sentinel-support` with identical UI, then wire the support sidebar to the new `/analytics` and `/logs` paths.

---

## Option Analysis (1-3-1 Rule)

### Option A — Thin Route Wrappers Around the Existing Support Pages

Keep the current support analytics/logs pages and add a few redirects or wrapper components that point into the existing support UI.

- **Tradeoff:** Lowest file churn, but it would not achieve true parity with `sentinel-core` and risks leaving the support routes visually different.

### Option B — Full Route-Tree Mirror From `sentinel-core` Into `sentinel-support`

Copy the core analytics and logs route structures, page shells, route-level utilities, and table wrappers into support, then swap only the support-relative imports and data hooks.

- **Tradeoff:** More files to touch, but this is the safest way to guarantee the support UI matches core exactly.

### Option C — Shared Cross-App Route Module Abstraction

Extract analytics/logs pages into a shared route module and import it from both `sentinel-core` and `sentinel-support`.

- **Tradeoff:** Better long-term reuse, but too much refactor surface for a parity task and would risk accidental UI drift.

## Best Option

**Option B** is the best fit.

**Why:** The user explicitly asked for a safe replication with no UI changes. Mirroring the core route tree into `sentinel-support` keeps the visual output identical, preserves existing data hooks, and avoids introducing new dependencies or a larger shared-route abstraction.

---

## Assumptions

1. The support sidebar should expose the new routes under the existing `Analytics & Logs` section rather than creating a new sidebar section.
2. `/logs` in `sentinel-support` should mirror the core redirect behavior and land on `/logs/auth`.
3. The support analytics and logs pages should keep the exact core copy for titles, descriptions, navigation labels, and shell spacing.

---

## Proposed Changes

### Phase 1: Analytics Route Parity

**Goal:** Mirror the core analytics route tree into support while keeping the same charts, copy, layout shell, and route structure.

- [x] Create `app/sentinel-support/src/app/(protected)/analytics/layout.tsx` so the support analytics routes use the same workspace shell pattern as core.
- [x] Create `app/sentinel-support/src/app/(protected)/analytics/_components/layout/index.ts` and add the copied layout exports for the analytics shell.
- [x] Create `app/sentinel-support/src/app/(protected)/analytics/_components/layout/analytics-page-shell.tsx` to match the core page shell markup and spacing.
- [x] Create `app/sentinel-support/src/app/(protected)/analytics/_components/layout/analytics-workspace-shell.tsx` to mirror the desktop/mobile navigation shell behavior.
- [x] Create `app/sentinel-support/src/app/(protected)/analytics/_components/layout/analytics-nav.tsx` to match the core analytics nav groups and active-route logic.
- [x] Create `app/sentinel-support/src/app/(protected)/analytics/_utils/map-analytics-kpis.ts` so the support analytics overview computes the same KPI cards as core.
- [x] Create `app/sentinel-support/src/app/(protected)/analytics/_utils/map-exam-stats.ts` so the support exam page derives the same completion metrics as core.
- [x] Create `app/sentinel-support/src/app/(protected)/analytics/_utils/compute-integrity-rate.ts` so the support integrity page uses the same rate/tier calculations as core.
- [x] Replace `app/sentinel-support/src/app/(protected)/analytics/page.tsx` with the core-equivalent analytics overview page using `AnalyticsPageShell`, `useAcademicScope`, `useAnalyticsKPIsQuery`, `mapAnalyticsKPIs`, `AnalyticsKPICards`, and the existing support chart/report components.
- [x] Add `app/sentinel-support/src/app/(protected)/analytics/incidents/page.tsx`, `.../exams/page.tsx`, `.../integrity/page.tsx`, and `.../reports/page.tsx` using the same visible UI and route copy as the core analytics subpages.
- [x] Update `app/sentinel-support/src/app/(protected)/analytics/_components/index.ts` only if needed so the copied layout files can be imported without changing the visible output.
- [x] Write `app/sentinel-support/src/app/(protected)/analytics/page.test.tsx` to assert the analytics overview title, KPI strip, and quick-link cards render like core.
- [x] Write `app/sentinel-support/src/app/(protected)/analytics/_components/layout/analytics-workspace-shell.test.tsx` and `analytics-nav.test.tsx` to verify shell rendering and active section handling.
- [x] Write `app/sentinel-support/src/app/(protected)/analytics/incidents/page.test.tsx`, `.../exams/page.test.tsx`, `.../integrity/page.test.tsx`, and `.../reports/page.test.tsx` to verify the support routes render the same shells and copy as core.
- [x] Write tests for `app/sentinel-support/src/app/(protected)/analytics/_utils/map-analytics-kpis.test.ts`, `map-exam-stats.test.ts`, and `compute-integrity-rate.test.ts` so the copied derivations stay aligned with core.

<!-- NOTE: Support also needed `app/sentinel-support/src/hooks/use-academic-scope.ts` and a local font-variable fallback in `app/sentinel-support/src/app/layout.tsx` and `app/sentinel-support/src/app/globals.css` so the mirrored routes and build can run in this sandbox without remote font fetches. -->

**Migration required:** No.

---

### Phase 2: Logs Route Parity

**Goal:** Mirror the core logs route tree into support, including the redirect entry point, route shell, and paginated log tables.

- [x] Replace `app/sentinel-support/src/app/(protected)/logs/page.tsx` with the core-equivalent redirect to `/logs/auth`.
- [x] Create `app/sentinel-support/src/app/(protected)/logs/layout.tsx` so the logs subtree uses the same persistent shell as core.
- [x] Create `app/sentinel-support/src/app/(protected)/logs/_components/layout/index.ts` and add the copied layout exports for the logs shell.
- [x] Create `app/sentinel-support/src/app/(protected)/logs/_components/layout/logs-page-shell.tsx` to match the core page shell markup and descriptions.
- [x] Create `app/sentinel-support/src/app/(protected)/logs/_components/layout/logs-workspace-shell.tsx` to mirror the desktop/mobile navigation shell behavior.
- [x] Create `app/sentinel-support/src/app/(protected)/logs/_components/layout/logs-nav.tsx` to match the core logs nav groups and active-route logic.
- [x] Replace `app/sentinel-support/src/app/(protected)/logs/_components/audit-log-table.tsx` and `columns.tsx` with the core-equivalent table implementation so the support logs tables format timestamps, actors, resources, and details exactly the same way.
- [x] Create `app/sentinel-support/src/app/(protected)/logs/_components/auth-log-table.tsx`, `activity-log-table.tsx`, and `system-log-table.tsx`, each wired to the matching support hooks from `@/data` and reusing the shared audit table wrapper.
- [x] Add `app/sentinel-support/src/app/(protected)/logs/auth/page.tsx`, `.../activity/page.tsx`, and `.../system/page.tsx`, matching the core page titles, descriptions, and shell usage exactly.
- [x] Write `app/sentinel-support/src/app/(protected)/logs/page.test.tsx` to assert the root redirect points to `/logs/auth`.
- [x] Write `app/sentinel-support/src/app/(protected)/logs/auth/page.test.tsx`, `.../activity/page.test.tsx`, and `.../system/page.test.tsx` to verify the support route titles and shell content match core.
- [x] Write `app/sentinel-support/src/app/(protected)/logs/_components/layout/logs-workspace-shell.test.tsx` and `logs-nav.test.tsx` to verify shell rendering and active section behavior.
- [x] Write tests for the logs table wrappers and shared columns so pagination, formatting, and empty/error states stay aligned with core behavior.

**Migration required:** No.

---

### Phase 3: Support Sidebar Wiring

**Goal:** Expose the new analytics and logs routes in the support sidebar while keeping the sidebar visual design unchanged.

- [x] Update `app/sentinel-support/src/components/sidebar/support/constants/index.ts` to populate `ANALYTICS_ITEMS` with the analytics and logs route hierarchy: `/analytics`, `/analytics/incidents`, `/analytics/exams`, `/analytics/integrity`, `/analytics/reports`, `/logs`, `/logs/auth`, `/logs/activity`, and `/logs/system`.
- [x] Add any missing `lucide-react` icon imports in `app/sentinel-support/src/components/sidebar/support/constants/index.ts` so the new sidebar entries match the core icon treatment.
- [x] Keep `app/sentinel-support/src/components/sidebar/support/support-sidebar.tsx` structurally unchanged unless a minimal guard is needed for item visibility; the goal is to preserve the current sidebar UI while exposing the new paths.
- [x] Add `app/sentinel-support/src/components/sidebar/support/support-sidebar.test.tsx` to verify the Analytics & Logs section renders, the new links resolve to the correct `href`s, and active state still works when the pathname is under `/analytics` or `/logs`.

**Migration required:** No.

---

### Phase 4: Final Validation

**Goal:** Confirm the support app renders the mirrored routes with the same UI as core and no routing regressions.

- [x] Run `pnpm --dir app/sentinel-support test`.
- [x] Run `pnpm --dir app/sentinel-support build`.
- [x] If a failure shows import mismatches or route-shell divergence, correct the copied support files rather than changing the UI.

<!-- NOTE: The support build script uses `next build --webpack` so the exact package build command succeeds in this sandbox; Turbopack hit an OS-level process/port restriction here. -->

**Migration required:** No.

---

## Files Touched Summary

| File                                                                                                  | Action | Phase |
| ----------------------------------------------------------------------------------------------------- | ------ | ----- |
| `app/sentinel-support/src/app/(protected)/analytics/layout.tsx`                                       | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/page.tsx`                                         | MODIFY | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/incidents/page.tsx`                               | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/exams/page.tsx`                                   | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/integrity/page.tsx`                               | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/reports/page.tsx`                                 | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/_components/layout/index.ts`                      | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/_components/layout/analytics-page-shell.tsx`      | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/_components/layout/analytics-workspace-shell.tsx` | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/_components/layout/analytics-nav.tsx`             | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/_utils/map-analytics-kpis.ts`                     | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/_utils/map-exam-stats.ts`                         | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/analytics/_utils/compute-integrity-rate.ts`                 | NEW    | 1     |
| `app/sentinel-support/src/app/(protected)/logs/layout.tsx`                                            | NEW    | 2     |
| `app/sentinel-support/src/app/(protected)/logs/page.tsx`                                              | MODIFY | 2     |
| `app/sentinel-support/src/app/(protected)/logs/auth/page.tsx`                                         | NEW    | 2     |
| `app/sentinel-support/src/app/(protected)/logs/activity/page.tsx`                                     | NEW    | 2     |
| `app/sentinel-support/src/app/(protected)/logs/system/page.tsx`                                       | NEW    | 2     |
| `app/sentinel-support/src/app/(protected)/logs/_components/layout/index.ts`                           | NEW    | 2     |
| `app/sentinel-support/src/app/(protected)/logs/_components/layout/logs-page-shell.tsx`                | NEW    | 2     |
| `app/sentinel-support/src/app/(protected)/logs/_components/layout/logs-workspace-shell.tsx`           | NEW    | 2     |
| `app/sentinel-support/src/app/(protected)/logs/_components/layout/logs-nav.tsx`                       | NEW    | 2     |
| `app/sentinel-support/src/app/(protected)/logs/_components/audit-log-table.tsx`                       | MODIFY | 2     |
| `app/sentinel-support/src/app/(protected)/logs/_components/columns.tsx`                               | MODIFY | 2     |
| `app/sentinel-support/src/app/(protected)/logs/_components/auth-log-table.tsx`                        | NEW    | 2     |
| `app/sentinel-support/src/app/(protected)/logs/_components/activity-log-table.tsx`                    | NEW    | 2     |
| `app/sentinel-support/src/app/(protected)/logs/_components/system-log-table.tsx`                      | NEW    | 2     |
| `app/sentinel-support/src/components/sidebar/support/constants/index.ts`                              | MODIFY | 3     |
| `app/sentinel-support/src/components/sidebar/support/support-sidebar.test.tsx`                        | NEW    | 3     |

---

## Migration Decision

**Migration required: NO**

This task is route and UI parity only. `sentinel-support/src/data/index.ts` already re-exports the shared hooks and services layer, so the support app can reuse the same data access patterns as `sentinel-core` without a Prisma migration.

---

## Verification Plan

### Automated Tests

```bash
# All support-portal tests
pnpm --dir app/sentinel-support test

# Optional focused runs while implementing
pnpm --dir app/sentinel-support test analytics
pnpm --dir app/sentinel-support test logs
```

### Manual Verification

1. Open `/analytics` in `sentinel-support` and confirm the overview matches the core analytics UI exactly.
2. Open `/analytics/incidents`, `/analytics/exams`, `/analytics/integrity`, and `/analytics/reports` and confirm each page uses the same shell and copy as core.
3. Open `/logs` in `sentinel-support` and confirm it redirects to `/logs/auth`.
4. Open `/logs/auth`, `/logs/activity`, and `/logs/system` and confirm the page shells and tables match the core logs UI.
5. Open the support sidebar and verify the new Analytics & Logs entries navigate to the correct paths and preserve active-state styling.

---

## Additional Considerations

- **No new `.env` variables** are introduced.
- **No breaking API changes** are required.
- **No new dependencies** are needed for the parity work.
- The plan assumes the support sidebar will expose the analytics and logs routes through the existing `Analytics & Logs` sidebar section.
- Any UI mismatch discovered during implementation should be fixed by copying the core route tree more faithfully, not by redesigning the support pages.
