# Implementation Plan - Minor UI Logic Issues

Summary: Fix the June 30 minor UI and logic issues across `sentinel-core`, `sentinel-support`, `sentinel-web`, and the shared calendar/subject-offering data paths without introducing schema changes.

---

## Pre-Planning Checklist

- [ ] Read and summarize the task input in one sentence.
- [ ] Scan relevant source files to understand existing patterns in offered subjects, support management pages, dashboard sidebars, and calendar flows.
- [ ] Identify all touched files, services, and DB tables:
      `subject_offerings`, `class_groups`, `class_roles`, `classroom_instructor_assignments`, `courses`, `subject_classifications`, `calendar_events`, and enrollment request queries.
- [ ] Determine if a Prisma migration is needed.
      **Migration required:** No - all requested fixes are query, UI, and interaction changes against existing schema.

---

## 1-3-1 Rule

### Viable Options

#### Option 1: Targeted fixes with small local helpers (Recommended)

- Keep changes close to each feature area: adjust the offered-subject query, support page state, dashboard sidebars, and calendar visibility/UI with focused tests.
- _Tradeoff:_ Leaves some duplication in the dashboard and calendar UIs, but keeps risk low and matches the repo's current structure.

#### Option 2: Shared-component refactor for dashboard and calendar experiences

- Extract shared announcement sidebar and admin calendar dialog building blocks across `sentinel-core`, `sentinel-support`, and `sentinel-web`.
- _Tradeoff:_ Improves reuse, but expands the scope beyond a minor-fixes pass and raises regression risk across three apps at once.

#### Option 3: Backend-first correctness pass with minimal frontend polish

- Focus on fixing data correctness in subject offerings and calendar audience filtering, and apply only the smallest UI changes needed to remove visible errors.
- _Tradeoff:_ Safer on data integrity, but underdelivers on the requested pagination, calendar UX, and dashboard presentation improvements.

### Best Option

**Option 1** is the best fit. It addresses every reported issue directly, respects the existing app-local patterns in this monorepo, avoids unnecessary abstraction work, and gives us room to add focused Vitest coverage where behavior is actually changing.

### Concrete Next Steps

1. Fix subject offering assignment visibility so only active instructor/classroom relationships are surfaced.
2. Repair support page state and table/facet wiring for course creation, subject classifications, and enrollment requests.
3. Update the dashboard announcement sidebars to show three entries plus a faded fourth preview.
4. Tighten calendar role-audience visibility in the API and streamline the add-event dialog UX in core/support while mirroring the core calendar UI in web.
5. Add and run focused Vitest coverage for the touched hooks, services, and UI components.

---

## Phase 1: Offered Subject Assignment Visibility

**Goal:** Ensure the offered-subject list in `sentinel-core` only shows currently assigned instructors and relevant classroom availability.

- [x] Modify `app/sentinel-api/src/modules/core/subject-offerings/data/get-subject-offerings.ts` to restrict instructor aggregation to active `classroom_instructor_assignments` and valid instructor role links for the current class groups.
- [x] Modify `app/sentinel-api/src/modules/core/subject-offerings/data/get-subject-offerings.ts` to return the classroom or class-group metadata needed to distinguish available classrooms from stale historical assignments.
- [x] Modify `app/sentinel-api/src/modules/core/subject-offerings/helper/map-subject-offering-response.ts` to normalize only the active instructor/classroom state consumed by the frontend.
- [x] Modify `app/sentinel-core/src/app/(protected)/subjects/_components/tables/subject-offering-columns.tsx` to render the current assignment state clearly, using the active instructor/classroom values from the response.
- [x] Review `app/sentinel-core/src/app/(protected)/subjects/_components/views/offered-subjects-list.tsx` and `app/sentinel-core/src/app/(protected)/subjects/offered/page.tsx` to ensure the updated data shape is displayed without stale fallback labels.
- [x] Write or extend tests in `app/sentinel-api/src/modules/core/subject-offerings/helper/map-subject-offering-response.test.ts`.
- [x] Write or extend tests in `app/sentinel-core/src/app/(protected)/subjects/offered/page.test.tsx`.
      **Migration required:** No - query and mapper changes only.

---

## Phase 2: Support Page Interaction and Table Fixes

**Goal:** Restore support-role course creation, clean up subject classification pagination UI, and remove the broken enrollment-request institution filter error.

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/courses/_hooks/use-courses-page-state/index.ts` to initialize `selectedInstitutionId` from the support user's academic scope when available.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/courses/_components/dialogs/add-course-dialog.tsx` so the add button remains permission-driven and only disabled when no effective institution can be resolved.
- [x] Review `app/sentinel-support/src/app/(protected)/(support)/courses/_components/views/courses-view.tsx` to keep the add-course action aligned with the updated scoped institution behavior.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/subjects/classifications/_components/views/subject-classifications-view.tsx` to improve the pagination footer layout and align it with the repo's existing table/pagination presentation patterns.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/subjects/requests/_components/columns.tsx` to define a hidden `institution` column compatible with the existing institution facet and filter sync.
- [x] Review `app/sentinel-support/src/app/(protected)/(support)/subjects/requests/_components/enrollment-requests-list.tsx` and `app/sentinel-support/src/app/(protected)/(support)/subjects/requests/_components/enrollment-request-facets.ts` so the institution facet targets a real column and no longer throws `Column with id 'institution' does not exist`.
- [x] Write or extend tests in `app/sentinel-support/src/app/(protected)/(support)/courses/_hooks/use-courses-page-state/index.test.ts`.
- [x] Extend `app/sentinel-support/src/app/(protected)/(support)/subjects/classifications/_hooks/use-subject-classifications-page-state/index.test.ts` to cover the pagination-state and scoped-filter behavior affected by the footer changes.
- [x] Create `app/sentinel-support/src/app/(protected)/(support)/subjects/requests/_components/enrollment-requests-list.test.tsx` to verify the institution facet no longer targets a missing column.
- [x] Create `app/sentinel-support/src/app/(protected)/(support)/subjects/requests/_components/columns.test.tsx` to verify the hidden `institution` column is defined and filterable.
      **Migration required:** No - page-state, table-column, and layout fixes only.

---

## Phase 3: Dashboard Announcements Sidebar Improvements

**Goal:** Show three dashboard announcements consistently across apps and add a faded fourth preview row.

- [x] Modify `app/sentinel-core/src/app/(protected)/dashboard/_components/dashboard-sidebar.tsx` to fetch four announcements, render the first three normally, and render the fourth as a faded preview.
- [x] Modify `app/sentinel-support/src/app/(protected)/dashboard/_components/dashboard-sidebar.tsx` with the same four-item fetch and faded-preview behavior.
- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/dashboard-sidebar.tsx` with the same four-item fetch and faded-preview behavior.
- [x] Keep the "View all" link and existing loading/empty states intact while updating the sidebar item spacing to reliably show three full rows.
- [x] Extend `app/sentinel-core/src/app/(protected)/dashboard/_components/dashboard-sidebar.test.tsx`.
- [x] Extend `app/sentinel-support/src/app/(protected)/dashboard/_components/dashboard-sidebar.test.tsx`.
- [x] Extend `app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/dashboard-sidebar.test.tsx`.
      **Migration required:** No - frontend query-limit and presentation changes only.

---

## Phase 4: Calendar Visibility, UX, and UI Parity

**Goal:** Enforce correct target-audience visibility by role, improve the add-event dialog UX in core/support, and mirror the core calendar presentation in web.

<!-- NOTE: Added app/sentinel-api/src/modules/general/calendar/data/resolve-calendar-role-audiences.ts to centralize role visibility. Support follows the repo's admin-style access pattern and receives `ALL` + `ADMINS` calendar events. -->

- [x] Modify `app/sentinel-api/src/modules/general/calendar/data/get-calendar-events.ts` to centralize role-to-audience filtering so viewers only receive `ALL` plus the audience allowed for their role.
- [x] Add a small helper near the calendar query layer to map `student`, `instructor`, and admin-style roles to allowed `target_audience` values.
- [x] Extend `app/sentinel-api/src/modules/general/calendar/services/calendar-query.service.test.ts` to cover role-based event visibility inputs.
- [x] Modify `app/sentinel-core/src/app/(protected)/calendar/_components/event-dialog.tsx` to streamline date, start time, and end time entry into a more compact schedule flow and prevent invalid time ranges.
- [x] Modify `app/sentinel-support/src/app/(protected)/calendar/_components/event-dialog.tsx` with the same schedule and target-audience UX improvements.
- [x] Review `app/sentinel-core/src/app/(protected)/calendar/_hooks/use-admin-calendar.ts` and `app/sentinel-support/src/app/(protected)/calendar/_hooks/use-admin-calendar.ts` so the updated dialog payload still maps role audiences correctly.
- [x] Extend `app/sentinel-core/src/app/(protected)/calendar/_hooks/use-admin-calendar.test.ts`.
- [x] Extend `app/sentinel-support/src/app/(protected)/calendar/_hooks/use-admin-calendar.test.ts`.
- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/calendar/page.tsx` to mirror the current `sentinel-core` calendar page structure and visual rhythm while remaining read-only.
- [x] Review the supporting web calendar feature files in `app/sentinel-web/src/features/calendar/` and add or extend tests for the mirrored layout and event rendering behavior.
      **Migration required:** No - uses existing `calendar_events.target_audience` values and existing API contracts.

---

## Phase 5: Validation and Finish Criteria

**Goal:** Verify the fixes through focused automated coverage and a short manual regression pass.

- [x] Run focused API tests for subject offerings and calendar query behavior in `app/sentinel-api`.
- [x] Run focused Vitest suites in `app/sentinel-core` for offered subjects, dashboard sidebar, and calendar hook coverage.
- [x] Run focused Vitest suites in `app/sentinel-support` for courses, subject classifications, enrollment requests, dashboard sidebar, and calendar hook coverage.
- [x] Run focused Vitest suites in `app/sentinel-web` for dashboard sidebar and calendar rendering coverage.
- [ ] Perform manual checks on:
      `sentinel-core` offered subjects, `sentinel-support` course creation, `sentinel-support` subject classifications, `sentinel-support` enrollment requests, all three dashboard sidebars, `sentinel-core` calendar, `sentinel-support` calendar, and `sentinel-web` calendar.
- [x] Confirm no new `.env` variables are required.
- [x] Confirm no breaking API contract changes are introduced for existing consumers.
      **Migration required:** No - verification only.

<!-- NOTE: Focused automated validation completed in this turn. A manual in-browser regression pass was not run here, so the manual-check item remains open. -->

---

## Done Criteria

- [x] Every task references a concrete file or function.
- [x] Each phase includes explicit test work.
- [x] Migration decision is explicit and remains `No`.
- [x] No task is vague; each one maps to a specific behavior change or test target.
- [x] No new dependencies are introduced unless a blocker is discovered during implementation.

---

## Additional Considerations

- [x] Keep JSDoc on any new exported helper or utility added during implementation.
- [x] Add inline comments only where the logic is genuinely non-obvious.
- [x] Preserve current app-local patterns unless a shared helper clearly reduces repeated complexity in the touched scope.
- [x] If role-to-audience filtering behavior for `support` needs a different rule than `admin`/`superadmin`, document that explicitly before implementation.
- [x] Migration rollback note: not applicable, because this plan does not introduce Prisma schema or SQL migration changes.
