# Analytics Module Redesign — `sentinel-core`

**One-sentence summary:** Redesign the four analytics tabs (Overview, Incidents, Exams, Integrity) inside `sentinel-core` to improve content hierarchy, surface actionable metrics, eliminate static placeholder data, and adopt shadcn/ui chart primitives consistently.

---

## Viable Options (1-3-1 Rule)

### Option A — Incremental In-Place Refactor *(chosen)*
Enhance each existing page and its dedicated components one-by-one. Add missing stat callouts, wire hardcoded values to live queries, introduce detail tables, and apply shadcn `ChartContainer`/`Badge`/`Progress` where missing. No new routes, no schema changes.

**Tradeoff:** Lowest disruption; cannot introduce truly novel layouts without touching every existing component.

### Option B — Full Page Rebuild with New Component Library
Delete all four page files and rewrite them from scratch using a unified analytics design system stored in `_components/design-system/`.

**Tradeoff:** Maximum design freedom but high blast radius — breaks existing tests and increases merge conflicts.

### Option C — Isolated Widget Architecture
Extract every chart/stat block into standalone `<Widget>` components with their own data-fetching, compose pages from widgets only.

**Tradeoff:** Most scalable long-term but requires architectural refactoring across the shared types and hooks layers.

### Why Option A
Option A fits the existing codebase patterns (each page fetches via `useAnalytics*Query`, skeletons managed inline, components shared via `_components/`). It lets us ship incremental improvements without breaking existing tests and avoids unnecessary complexity.

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Should the Exams stat callouts (Completion Efficiency 98.4%, Integrity Benchmark 96.1%, Drop-out Ratio 1.6%) be computed from live API data, or remain as display-only benchmarks?
> Assumption: wire to live data derived from `examCompletionsData`.

> [!IMPORTANT]
> **Q2:** Is there an existing API endpoint that returns top-violating students per incident type, or must a new `/analytics/incidents/top-students` endpoint be scaffolded?
> Assumption: if not available, the Incidents tab detail table will only list incident type breakdown.

> [!NOTE]
> **Q3:** The `IncidentTrendsChart` and `ExamCompletionChart` still use raw `recharts` instead of `ChartContainer` from `@sentinel/ui`. Should they be migrated as part of this plan?
> Assumption: yes — align with the pattern established in `DepartmentIntegrityChart`.

---

## Proposed Changes

### Phase 1 — Overview Tab Redesign

**Goal:** Replace static quick-link cards with a richer Overview that surfaces primary KPIs with live trend badges and a period comparison row.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/page.tsx)
- Add a `period` selector (last 7 / 30 / 90 days) using shadcn `Select` — update `useAnalyticsKPIsQuery` payload accordingly.
- Surface trend direction and change percentage on each KPI card by wiring `change` and `trend` fields through `mapAnalyticsKPIs`.
- Retain the Quick Links grid but demote it visually (label: "Explore Domains").

#### [MODIFY] [map-analytics-kpis.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_utils/map-analytics-kpis.ts)
- Accept an optional `period` parameter.
- Map `change` and `trend` from API summary delta fields (`totalExamsChange`, `totalAttemptsChange`, etc.).
- Add JSDoc on all exported functions.

#### [MODIFY] [analytics-kpi-cards.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/analytics-kpi-cards.tsx)
- Add a fifth KPI slot: "Avg Session Duration" (maps to `summary.avgSessionDuration`).
- Add `aria-label` on trend direction icons for accessibility.

**Migration required:** No

---

### Phase 2 — Incidents Tab Redesign

**Goal:** Add three stat callout cards above the existing charts and introduce an incident breakdown table below, replacing raw recharts with ChartContainer.

#### [MODIFY] [incidents/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/incidents/page.tsx)
- Add three `IncidentStatsCallout` cards (3-col grid): "Total Incidents This Period", "Most Common Violation", "Critical Severity Count".
- Derive values from existing `typeData` and `severityData` query results (no new API call needed).
- Add a `Table` (shadcn) below the charts listing: incident type, count, percentage share — sorted by count descending. Color-coded `Badge` per row: red ≥ 40%, amber 20–39%, green < 20%.

#### [MODIFY] [incident-trends-chart.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/incident-trends-chart.tsx)
- Migrate from raw `recharts` `ResponsiveContainer` to shadcn `ChartContainer` + `ChartTooltip` + `ChartTooltipContent`.
- Add `chartConfig` constant with semantic color tokens.
- Preserve existing `ChartProps` interface.

#### [NEW] [incident-stats-callout.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/incident-stats-callout.tsx)
- Reusable stat callout card: `{ label, value, description, icon, colorClass }`.
- Replaces inline JSX duplication in both Incidents and Exams pages.

**Migration required:** No

---

### Phase 3 — Exams Tab Redesign

**Goal:** Wire hardcoded stat callout values to live computed data, add an exam breakdown DataTable, and migrate ExamCompletionChart to ChartContainer.

#### [MODIFY] [exams/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/exams/page.tsx)
- Replace hardcoded `98.4%`, `96.1`, `1.6%` with values from `mapExamStats(examCompletionsData)`.
- Refactor the three callout cards to use `IncidentStatsCallout` component.
- Add a `DataTable` from `@sentinel/ui` below the chart with per-session rows: exam name, completions, drops, date — searchable by exam name.

#### [MODIFY] [exam-completion-chart.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/exam-completion-chart.tsx)
- Migrate from raw `recharts` `ResponsiveContainer` to `ChartContainer` + `ChartTooltip` + `ChartTooltipContent`.
- Add `chartConfig` with semantic color tokens for `completed` and `dropped`.

#### [NEW] [map-exam-stats.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_utils/map-exam-stats.ts)
- Pure function `mapExamStats(data): { completionRate: number; dropRate: number; integrityBenchmark: number | null }`.
- JSDoc on export.

**Migration required:** No

---

### Phase 4 — Integrity Tab Redesign

**Goal:** Add an alert banner for departments below the 85% threshold, a risk-tier legend, and collapsible detail rows for progressive disclosure.

#### [MODIFY] [integrity/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/integrity/page.tsx)
- Add shadcn `Alert` banner above the chart if any department has `integrityRate < 85`. Message: "N department(s) are below the 85% integrity threshold." with scroll-to-table anchor.
- Add a legend row using shadcn `Badge` components: green ≥ 95%, amber 85–94%, red < 85%.
- Add row-level expand/collapse via `useState<string | null>` (selected department ID) showing a placeholder sub-row with incident sub-type breakdown.
- Extract `integrityRate` computation to `computeIntegrityRate` util.

#### [NEW] [compute-integrity-rate.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_utils/compute-integrity-rate.ts)
- Pure function `computeIntegrityRate(completed: number, flagged: number): number` — clamped 0–100.
- Extracted from inline logic in `integrity/page.tsx`.

**Migration required:** No

---

### Phase 5 — Cross-cutting: Tests, a11y, and Index Exports

**Goal:** Ensure all new/modified components have co-located Vitest tests and the barrel exports are updated.

#### [MODIFY] [_components/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/index.ts)
- Export `IncidentStatsCallout`.

#### [NEW] incident-stats-callout.test.tsx
- Render tests: correct label, value, icon render; snapshot.

#### [MODIFY] map-analytics-kpis.test.ts
- Extend coverage for `change` and `trend` field mapping.

#### [NEW] map-exam-stats.test.ts
- Unit tests: zero data, normal data, all-dropped edge case.

#### [NEW] compute-integrity-rate.test.ts
- Unit tests: zero `completed` (no division-by-zero), clamped range, normal case.

#### [MODIFY] Existing page test files
- Update `incidents/page.test.tsx`, `exams/page.test.tsx`, `integrity/page.test.tsx` to cover new sections.

**Migration required:** No

---

## Files Touched Summary

| File | Action |
|---|---|
| `analytics/page.tsx` | Modify — period selector, live trend badges |
| `analytics/_utils/map-analytics-kpis.ts` | Modify — map change/trend fields |
| `analytics/_components/analytics-kpi-cards.tsx` | Modify — 5th KPI, a11y |
| `analytics/incidents/page.tsx` | Modify — stat callouts, detail table |
| `analytics/_components/incident-trends-chart.tsx` | Modify — ChartContainer migration |
| `analytics/_components/incident-stats-callout.tsx` | **New** |
| `analytics/exams/page.tsx` | Modify — live stats, DataTable |
| `analytics/_components/exam-completion-chart.tsx` | Modify — ChartContainer migration |
| `analytics/_utils/map-exam-stats.ts` | **New** |
| `analytics/integrity/page.tsx` | Modify — alert banner, legend, expand rows |
| `analytics/_utils/compute-integrity-rate.ts` | **New** |
| `analytics/_components/index.ts` | Modify — add IncidentStatsCallout export |
| `*/*.test.ts(x)` | New / Modify (Phase 5) |

---

## Verification Plan

### Automated Tests
```bash
pnpm --dir app/sentinel-core test
```
All Vitest tests must pass with no skips or failures.

### Manual Verification
- `/analytics` — period selector changes KPI values, trend badges render.
- `/analytics/incidents` — stat callouts show computed values, detail table is sortable.
- `/analytics/exams` — completion/drop stats are live (not hardcoded), DataTable renders.
- `/analytics/integrity` — alert banner appears when department < 85%, collapse rows work.
- Responsive layout verified at 375px, 768px, 1280px.
- No TypeScript errors: `pnpm --dir app/sentinel-core build` or `tsc --noEmit`.
