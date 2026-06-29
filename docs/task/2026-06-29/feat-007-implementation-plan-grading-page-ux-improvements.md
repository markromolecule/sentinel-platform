# Implementation Plan: Grading Page UX Improvements

**Task Summary:** Overhaul the grading page (exam detail view) to replace section-based card layout with a single paginated `DataTable`, convert the section filter from a dropdown to a facet filter near the search bar, connect the search bar to the backend, change the Export to Excel button color to a soft Excel green, and keep everything on one flat table instead of wrapping per-section cards.

---

## Scope

### Files Touched

| File | Change Type |
|------|-------------|
| `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/page.tsx` | MODIFY |
| `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/_components/grading-student-list.tsx` | MODIFY |
| `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/_components/grading-student-list.test.tsx` | MODIFY |
| `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/_hooks/use-grading-detail.ts` | MODIFY |
| `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/_hooks/use-grading-detail.test.tsx` | MODIFY |
| `packages/services/src/api/grading.ts` | MODIFY |

**Migration required:** No — no schema changes are involved.

---

## Phase 1: Backend — Add `search` Query Param to `getGradingStudents`

**Goal:** Allow the frontend to pass a name/studentId search string to the API so filtering happens server-side.

- [ ] Modify `grading.dto.ts` — add optional `search: z.string().optional()` field to `getGradingStudentsSchema.request.query`
  - File: `app/sentinel-api/src/modules/examination/grading/grading.dto.ts`

- [ ] Modify `buildGetGradingStudentsQuery` in `data/get-grading-students.ts` — accept `search?: string` in `GetGradingStudentsDataArgs` and apply `where` clause:
  ```ts
  if (search) {
      query = query.where((eb) =>
          eb.or([
              eb(sql<string>`trim(concat(up.first_name, ' ', up.last_name))`, 'ilike', `%${search}%`),
              eb('st.student_number', 'ilike', `%${search}%`),
          ])
      );
  }
  ```
  - File: `app/sentinel-api/src/modules/examination/grading/data/get-grading-students.ts`

- [ ] Modify `GetGradingStudentsArgs` in `services/get-grading-students.ts` — add `search?: string`, pass it to `getGradingStudentsData`
  - File: `app/sentinel-api/src/modules/examination/grading/services/get-grading-students.ts`

- [ ] Modify `getGradingStudentsRouteHandler` in `controllers/get-grading-students.controller.ts` — destructure `search` from validated query and pass it to `GradingService.getGradingStudents`
  - File: `app/sentinel-api/src/modules/examination/grading/controllers/get-grading-students.controller.ts`

- [ ] Modify `GradingService.getGradingStudents` in `grading.service.ts` — accept and forward `search`
  - File: `app/sentinel-api/src/modules/examination/grading/grading.service.ts`

- [ ] Write tests for `buildGetGradingStudentsQuery` with `search` param
  - File: `app/sentinel-api/src/modules/examination/grading/data/grading-visibility.test.ts`

- [ ] Write tests for `getGradingStudents` service with `search` param
  - File: `app/sentinel-api/src/modules/examination/grading/services/get-grading-students.test.ts`

---

## Phase 2: Services — Add `search` Param to Frontend API Client

**Goal:** Thread the `search` query param through `packages/services` so the frontend can call it.

- [ ] Modify `GetGradingStudentsParams` in `packages/services/src/api/grading.ts` — add `search?: string`
- [ ] Modify `buildGradingQueryString` to include `search` when present
  - File: `packages/services/src/api/grading.ts`

---

## Phase 3: Frontend Hook — Server-Side Search & Pagination

**Goal:** Update `useGradingDetail` to accept a `search` string, pass it through to the API, and expose pagination-ready flat student data.

- [ ] Modify `useGradingDetail` in `_hooks/use-grading-detail.ts`:
  - Accept `search?: string` as a parameter
  - Include `search` in `queryKey` so React Query refetches on change
  - Pass `search` to `getGradingStudents(..., { sectionId, search })`
  - Return `students` as a flat array (it already is — no structural change needed)
  - File: `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/_hooks/use-grading-detail.ts`

- [ ] Update `use-grading-detail.test.tsx` to cover `search` param pass-through
  - File: `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/_hooks/use-grading-detail.test.tsx`

---

## Phase 4: Frontend UI — Overhaul `GradingStudentList`

**Goal:** Replace the section-card + custom table pattern with a single reusable `DataTable` from `@sentinel/ui` with faceted section filter, backend-connected search, pagination, and a green Export button.

### 4a — Remove Card Layout, Use `DataTable`

- [ ] Rewrite `grading-student-list.tsx` to:
  - Remove all `Card`, `CardHeader`, `CardContent`, `CardTitle` imports and usage
  - Remove the custom `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableBody>` rendering loop
  - Import and use `DataTable` from `@sentinel/ui`
  - Pass `columns` (existing `studentColumns`) and flat `students` data from `useGradingDetail`
  - Enable built-in pagination (`manualPagination={false}`, default page size 10)
  - File: `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/_components/grading-student-list.tsx`

### 4b — Convert Section Filter to Facet

- [ ] Replace the `<Select>` section dropdown with a `DataTableFacet` facet:
  - Build `sectionFacet: DataTableFacet` object from `availableSections`
  - Pass `facets={[sectionFacet]}` to `DataTable` — the DataTable's built-in faceted filter renders it next to the search bar automatically
  - Remove `sectionId` / `onSectionChange` from props (facet state is managed internally by `DataTable`)
  - Connect `onColumnFiltersChange` callback to derive the selected `sectionId` and call the parent's setter so the backend still receives the filter
  - File: `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/_components/grading-student-list.tsx`

### 4c — Connect Search Bar to Backend

- [ ] Pass `onSearchChange` debounced handler from `page.tsx` down through `GradingStudentList` to `DataTable` via `onSearchChange` prop
  - Use a `300ms` debounce on the search value before updating state
  - Remove client-side `visibleStudents` filtering from `page.tsx` (was doing `studentSearch.trim().toLowerCase()` — now the backend handles it)
  - File: `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/page.tsx`

### 4d — Export Button Color

- [ ] Change the Export to Excel button styling to use a soft Excel green:
  ```tsx
  <Button
      className="border-[#217346] bg-[#217346]/10 text-[#217346] hover:bg-[#217346]/20"
      variant="outline"
      onClick={...}
  >
  ```
  - File: `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/page.tsx`

### 4e — `page.tsx` Simplification

- [ ] Remove `visibleStudents`, `visibleSections`, `studentSections`, `sectionId` state and derived memos from `page.tsx`
  - The `DataTable` + facet now owns section filtering internally
  - Pass only `students` (flat array) and `search` state to `GradingStudentList`
  - File: `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/page.tsx`

- [ ] Update `GradingStudentList` tests to match new props interface
  - File: `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/_components/grading-student-list.test.tsx`

---

## Phase 5: Verify

- [ ] Run `pnpm --dir app/sentinel-api test` — all grading tests pass
- [ ] Run `pnpm --dir app/sentinel-web test` — all grading component/hook tests pass
- [ ] Manual check: search updates the table (debounced, server-side)
- [ ] Manual check: section facet filter appears inline beside the search bar
- [ ] Manual check: pagination renders at the bottom of the table
- [ ] Manual check: Export button has soft green color

---

## Props Interface After Changes

### `GradingStudentListProps` (new)

```ts
interface GradingStudentListProps {
    examId: string;
    students: GradingStudent[];
    isLoading?: boolean;
    searchValue: string;
    onSearchChange: (value: string) => void;
    availableSections: { id: string; name: string }[];
    onSectionChange: (sectionId?: string) => void;
    isSectionsLoading?: boolean;
}
```

> Removed: `sections: GradingStudentSection[]`, `sectionId`, the manual sections array

---

## Notes

- The `DataTable` from `@sentinel/ui` already supports `facets`, `searchValue`, `onSearchChange`, `isLoading`, and `manualPagination` — no modifications to the package needed.
- The `studentColumns` in `_components/student-columns.tsx` are already `ColumnDef<GradingStudent>[]` and can be used directly.
- The section facet uses `columnKey: 'sectionName'` to match the `accessorKey` in `studentColumns`.
- Debounce should be applied in `page.tsx` using a `useCallback` + `setTimeout` approach or a simple local state pattern to avoid the hook dependency on external libraries.
