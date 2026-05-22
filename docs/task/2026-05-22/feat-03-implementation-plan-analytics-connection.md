# Analytics Backend Connection to sentinel-core

Connect the fully-built `sentinel-api` analytics module and the `@sentinel/hooks` / `@sentinel/services` analytics hooks to the `sentinel-core` analytics page, replacing all `MOCK_*` imports with live TanStack Query data.

---

## Summary

The analytics backend (Phase 1-6 of `feat-02`) is **fully implemented and tested**. All six API endpoints are live (`GET /analytics/kpis`, `GET /analytics/incident-severity`, `GET /analytics/incident-type`, `GET /analytics/department-integrity`, `GET /analytics/reports`, `POST /analytics/reports`). The shared hooks in `packages/hooks/src/query/analytics/` and the API service in `packages/services/src/api/analytics.ts` are also complete.

This plan only touches **`app/sentinel-core`** — no backend, no shared package changes are needed.

---

## User Review Required

> [!IMPORTANT]
> The `sentinel-core` analytics page currently uses mock data from `@sentinel/shared/mock-data`. This plan replaces all mock imports on the analytics page with live API calls via the existing hooks. The page component will become `'use client'` (it already is) and will consume the hooks that call the API.

> [!NOTE]
> All analytics hooks (`useAnalyticsKPIsQuery`, `useAnalyticsIncidentSeverityQuery`, `useAnalyticsIncidentTypeQuery`, `useAnalyticsDepartmentIntegrityQuery`, `useAnalyticsReportsQuery`, `useGenerateAnalyticsReportMutation`) are already exported from `@sentinel/hooks` which is re-exported from `@/data` in `sentinel-core`. No new hook or service files need to be created.

> [!NOTE]
> The `AnalyticsKPICards` component props are typed against `AnalyticsKPICardData[]` from `@sentinel/shared/types`. The backend returns `AnalyticsKPIsSummary` (raw numbers). A **mapper** is needed to convert the raw backend KPI fields into the `AnalyticsKPICardData[]` shape the component expects. This mapper lives in a co-located utility file.

---

## Open Questions

> [!IMPORTANT]
> **Institution scoping:** The analytics hooks accept an optional `payload.institution_id`. For admins in sentinel-core, the institution ID comes from the user context (via `useAcademicScope` or `useUser`). The plan assumes `institution_id` is read from the user context and passed to each hook. Confirm this is the correct source.

> [!NOTE]
> **Loading / error states:** The components currently accept static data props. The plan wraps each chart section in a `Skeleton` from `@sentinel/ui` when data is loading, and shows a subtle inline error state on fetch failure. Confirm if a full-page error boundary is preferred instead.

> [!NOTE]
> **`incident-severity-chart.tsx`** exists in `_components/` but is NOT exported in `index.ts` and NOT rendered in `page.tsx`. This plan adds it to both (the hook already exists). Confirm if you'd like it included.

---

## Proposed Changes

### App: `app/sentinel-core` — Analytics Page Connection

---

#### [NEW] `src/app/(protected)/analytics/_utils/map-analytics-kpis.ts`

A pure mapper function that converts the raw `AnalyticsKPIsSummary` from the API into the `AnalyticsKPICardData[]` array the `AnalyticsKPICards` component expects.

Maps:

- `integrityIndex` → `{ id: 'kpi-1', label: 'Integrity Index', value: '${n.toFixed(1)}%' }`
- `totalAttempts` → `{ id: 'kpi-2', label: 'Monitored Sessions', value: totalAttempts }`
- `totalIncidents` → `{ id: 'kpi-3', label: 'Flagged Incidents', value: totalIncidents }`
- `flaggedAttempts` → `{ id: 'kpi-4', label: 'Flagged Attempts', value: flaggedAttempts }`

---

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/page.tsx>)

- Remove all `MOCK_*` imports from `@sentinel/shared/mock-data`
- Import analytics hooks (`useAnalyticsKPIsQuery`, `useAnalyticsIncidentSeverityQuery`, `useAnalyticsIncidentTypeQuery`, `useAnalyticsDepartmentIntegrityQuery`, `useAnalyticsReportsQuery`, `useGenerateAnalyticsReportMutation`) from `@/data`
- Import `useAcademicScope` from `@/hooks` to read `institutionId`
- Call each hook with `{ payload: { institution_id: institutionId } }`
- Use `mapAnalyticsKPIs()` to transform KPI data → `AnalyticsKPICardData[]`
- Wrap chart sections with `Skeleton` from `@sentinel/ui` when `isLoading === true`
- Pass `mutate` from `useGenerateAnalyticsReportMutation` as `onGenerateReport` to `AnalyticsReportsList`

---

#### [MODIFY] [\_components/analytics-reports-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/analytics-reports-list.tsx>)

- Add `onGenerateReport?: (payload: GenerateAnalyticsReportBody) => void` prop
- Use `AnalyticsReport` from `@sentinel/services` as the item type
- Wire the "Generate" button to call `onGenerateReport`

---

#### [MODIFY] [\_components/incident-by-type-chart.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/incident-by-type-chart.tsx>)

- Update prop type to accept `IncidentTypeDistribution[]` from `@sentinel/services` (same shape as current mock type)

---

#### [MODIFY] [\_components/department-integrity-chart.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/department-integrity-chart.tsx>)

- Update prop type to accept `DepartmentIntegrityMetric[]` from `@sentinel/services` (same shape as current mock type)

---

#### [MODIFY] [\_components/incident-severity-chart.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/incident-severity-chart.tsx>)

- Update prop type to accept `IncidentSeverityDistribution[]` from `@sentinel/services`
- Export from `_components/index.ts` and render in `page.tsx`

---

#### [MODIFY] [\_components/index.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/index.ts>)

- Add `export * from './incident-severity-chart'`

---

#### [MODIFY] [analytics.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/analytics.test.tsx>)

- Add `vi.mock('@/data', ...)` to mock all six analytics hooks
- Return minimal stub data matching API response shapes
- Remove all `MOCK_*` import references
- Assert KPI labels and stub values render correctly
- Assert chart components render with stub data
- Assert `AnalyticsReportsList` renders stub report rows

---

## Verification Plan

### Automated Tests

```bash
# Run sentinel-core tests
pnpm --dir app/sentinel-core test

# Full lint and format check
pnpm lint && pnpm format:check
```

### Manual Verification

1. Start dev server: `pnpm dev`
2. Log in as admin in `sentinel-core`, navigate to `/analytics`
3. Confirm KPI cards show live values (not `94.2%`, `1,842`, `107`, `320h` mock values)
4. Confirm charts render live data from the API
5. Confirm reports list loads and paginates correctly
6. Trigger "Generate Report" — confirm new row appears after mutation invalidation

---

## Phased Execution Roadmap

### Phase 1: KPI Mapper Utility

**Goal:** Create a pure mapper function converting `AnalyticsKPIsSummary` to `AnalyticsKPICardData[]`.

- [x] Create `src/app/(protected)/analytics/_utils/map-analytics-kpis.ts`
    - Implement `mapAnalyticsKPIs(data: AnalyticsKPIsSummary): AnalyticsKPICardData[]`
    - Add JSDoc to the exported function
- [x] Write unit test at `src/app/(protected)/analytics/_utils/map-analytics-kpis.test.ts`
    - Assert all four card IDs are present
    - Assert `integrityIndex` formats as a percentage string
    - Assert `totalAttempts` maps to card id `kpi-2`
- [x] Run `pnpm --dir app/sentinel-core test` — tests must pass

**Migration required:** No

---

### Phase 2: Update Analytics Page with Live Hooks

**Goal:** Replace all mock data in `page.tsx` with live TanStack Query hook calls.

- [x] Modify `src/app/(protected)/analytics/page.tsx`
    - Remove all `MOCK_*` imports from `@sentinel/shared/mock-data`
    - Import analytics hooks from `@/data`
    - Import `useAcademicScope` from `@/hooks` to read `institutionId`
    - Call each hook with `{ payload: { institution_id: institutionId } }`
    - Use `mapAnalyticsKPIs()` to transform KPI response
    - Wrap chart sections with `Skeleton` when `isLoading === true`
    - Pass mutation `mutate` as `onGenerateReport` to `AnalyticsReportsList`
- [x] Run `pnpm --dir app/sentinel-core test`

**Migration required:** No

---

### Phase 3: Update Chart Components for API Types

**Goal:** Update component prop types to use `@sentinel/services` types instead of local/mock types.

- [x] Modify `_components/analytics-reports-list.tsx`
    - Add `onGenerateReport` prop, use `AnalyticsReport` from `@sentinel/services`
    - Wire "Generate" button to `onGenerateReport`
- [x] Modify `_components/incident-by-type-chart.tsx`
    - Prop type: `IncidentTypeDistribution[]` from `@sentinel/services`
- [x] Modify `_components/department-integrity-chart.tsx`
    - Prop type: `DepartmentIntegrityMetric[]` from `@sentinel/services`
- [x] Modify `_components/incident-severity-chart.tsx`
    - Prop type: `IncidentSeverityDistribution[]` from `@sentinel/services`
- [x] Modify `_components/index.ts`
    - Add `export * from './incident-severity-chart'`
- [x] Run `pnpm --dir app/sentinel-core test`

**Migration required:** No

---

### Phase 4: Update Analytics Smoke Tests

**Goal:** Update `analytics.test.tsx` to mock hooks instead of consuming mock constants.

- [x] Modify `src/app/(protected)/analytics/analytics.test.tsx`
    - Add `vi.mock('@/data', ...)` returning stub data for all hooks
    - Remove all `MOCK_*` references
    - Assert KPI card labels and stub values render correctly
    - Assert charts render with stub data without errors
    - Assert reports list renders stub rows
- [x] Run `pnpm --dir app/sentinel-core test` — all tests must pass

**Migration required:** No

---

### Phase 5: Final Verification

**Goal:** Confirm full integration with a running API.

- [x] Run `pnpm test` — full suite must pass
- [x] Run `pnpm lint && pnpm format:check` — no errors
- [x] Navigate to `/analytics` as a logged-in admin — confirm live KPI data
- [x] Confirm all charts show live API data (not mock values)
- [x] Confirm reports list loads paginated rows
- [x] Confirm "Generate Report" triggers POST and new record appears

**Migration required:** No
