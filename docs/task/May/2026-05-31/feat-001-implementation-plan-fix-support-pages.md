# Fix Support Pages — Implementation Plan

**Summary:** Fix 5 issues in the `sentinel-support` app: deduplicate role-page permission categories, investigate and correct a multi-role user assignment, relocate the audio calibration page to the telemetry sandbox, refactor the Identity & Access page to use the sidebar-layout shell pattern, and move the Calendar sidebar item + align its UI with `sentinel-core`.

---

## Viable Options Analysis (per the 1-3-1 Rule)

### Issue 4 – Identity & Access Layout Refactor

**Option A — Simple: Adapt the existing page into the `AccessControlGovernanceForm` shell**  
Re-use `AccessControlWorkspaceShell` + `AccessControlNav` from the control module directly in the users page.  
_Tradeoff_: Couples unrelated modules; leaks access-control-specific types into the identity module.

**Option B — Recommended: Create a dedicated `IdentityWorkspaceShell` mirroring the control shell pattern**  
Build `identity-workspace-shell.tsx` + `identity-nav.tsx` inside `users/_components/layout/`, following the same structural pattern as `control-workspace-shell.tsx` and `control-nav.tsx`. Move sub-items (Dean, Support, Whitelist) into the nav, remove them from the global sidebar.  
_Tradeoff_: Slightly more files to create, but properly scoped and fully maintainable.

**Option C — Creative: Promote to a shared `<SectionShell>` in `packages/ui`**  
Extract a generic `SectionShell` component (sidebar + content area) to `@sentinel/ui` so all three pages (control, telemetry, users) can share it.  
_Tradeoff_: Most reusable long-term, but requires touching `packages/ui` which is shared across all apps — higher risk for this fix.

**Best Option: B** — scoped, low-risk, mirrors the exact established pattern already used by the control and telemetry pages, and keeps the identity module self-contained.

---

## Proposed Changes

### Phase 1 — Fix Duplicate Permissions on the Roles Page

**Goal:** Identify and remove duplicate permission entries in the `INSTITUTION` and `USER` categories rendered in the Role Matrix.

**Root-cause area:** The `groupPermissionsByCategoryAndModule` function in `groupers.ts` groups raw `AccessControlPermission[]` from the API. Duplicates would appear if the seeded/API-returned permissions contain duplicate IDs or if the same permission record is included in the category under two different `moduleKey` values. Investigation + deduplication filter needed.

#### [MODIFY] [groupers.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_lib/presenters/groupers.ts>)

- Add a deduplication step by `permission.id` inside `groupPermissionsByCategoryAndModule` (before reducing into categories) using `Map<string, AccessControlPermission>` keyed on `id`.
- Add a deduplication step inside `groupPermissionsBySystemArea` as well.

#### [NEW] [groupers.test.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_lib/presenters/groupers.test.ts>)

- Create `groupers.test.ts` alongside `groupers.ts` with Vitest unit tests covering:
    - Duplicate permission IDs are deduplicated.
    - Categories `INSTITUTION` and `USER` contain no repeated permission IDs after grouping.

**Migration required:** No — frontend-only data transformation fix.

---

### Phase 2 — Investigate & Fix Role Assignment for josephdump6@gmail.com

**Goal:** Confirm the user `josephdump6@gmail.com` holds exactly one `admin` role assignment, removing any erroneous `superadmin` assignment.

**Investigation approach:** Query the `AccessControlAssignment` records via the API (`GET /access-control/assignments`) filtered by email. Identify duplicate or incorrect assignment rows.

#### [MODIFY] [assignment-manager-view.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_components/views/assignment-manager-view.tsx>)

- If a user has more than one assignment visible in the UI, surface a visual warning badge on any assignment where a user appears multiple times, flagging potential duplicates.

#### (Data correction)

- Use the support UI's Delete Assignment flow to remove the `superadmin` assignment for `josephdump6@gmail.com`, leaving only `admin`.
- Document the finding and resolution in the execution log.

**Migration required:** No — data correction only via the existing Delete Assignment UI/API.

---

### Phase 3 — Move Audio Calibration to Telemetry Sandbox

**Goal:** Relocate the `audio-calibration` section from the Access Control workspace into the Telemetry page's sandbox area, so it lives under `/telemetry/sandbox`.

#### [MODIFY] [control-nav.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_components/layout/control-nav.tsx>)

- Remove `audio-calibration` from `ACCESS_CONTROL_NAV_GROUPS` (remove from the `Configure` group).
- Remove `'audio-calibration'` from the `AccessControlSection` union type.

#### [MODIFY] [control-governance-form.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_components/governance/control-governance-form.tsx>)

- Remove the `audio-calibration` case from `SECTION_METADATA`, `activeSection` detection, and `renderView()`.
- Remove the import of `SupportAudioCalibrationView`.

#### [MODIFY] [telemetry/sandbox/page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/telemetry/sandbox/page.tsx>)

- Replace the stub page content with the `SupportAudioCalibrationView` component.
- If the component is tightly coupled to the control module, move it into `telemetry/_components/` first.

#### [DELETE] [control/audio-calibration/page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/audio-calibration/page.tsx>)

- Remove the `audio-calibration` Next.js route from under `/control/` once it is live under `/telemetry/sandbox`.

**Migration required:** No — routing and UI reorganization only.

---

### Phase 4 — Refactor Identity & Access Page to Sidebar Layout

**Goal:** Give the `/users` (Identity & Access) page a left-sidebar layout identical in structure to the Access Control page, and remove the sub-items (`Dean Management`, `Support Management`, `Student Whitelist`) from the global `support-sidebar.tsx`.

#### [NEW] [identity-nav.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/users/_components/layout/identity-nav.tsx>)

- Define `IdentitySection` union type: `'overview' | 'dean' | 'support' | 'whitelist'`.
- Define `IDENTITY_NAV_GROUPS` — `User Management` group with Dean Management, Support Management, Student Whitelist items.
- Export `IdentityNav` component mirroring `AccessControlNav` button styling and active-state pattern.

#### [NEW] [identity-workspace-shell.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/users/_components/layout/identity-workspace-shell.tsx>)

- Mirror `AccessControlWorkspaceShell` — left sticky sidebar (desktop) with `IdentityNav` + mobile fallback.
- Title: `Identity & Access`.

#### [NEW] [identity-page-shell.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/users/_components/layout/identity-page-shell.tsx>)

- Mirror `AccessControlPageShell` — `PageHeader` + `Separator` + content slot.

#### [NEW] [identity-governance-form.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/users/_components/governance/identity-governance-form.tsx>)

- Orchestrator component (mirrors `AccessControlGovernanceForm`) that reads `pathname`, determines `activeSection`, renders the appropriate view inside `IdentityWorkspaceShell`.
- Cases: `dean` → existing dean page content, `support` → existing support page content, `whitelist` → existing whitelist page content, default → current users overview content.

#### [MODIFY] [users/page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/users/page.tsx>)

- Replace the current flat layout with `<IdentityGovernanceForm />`.

#### [MODIFY] [sidebar/support/constants/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/support/constants/index.ts)

- Remove `subItems` from the `Identity & Access` entry in `USER_MANAGEMENT_ITEMS` — Dean, Support, and Whitelist sub-items are now handled by the new `IdentityNav` inside the page layout.

**Migration required:** No — UI restructuring only.

---

### Phase 5 — Move Calendar Sidebar Item & Align Calendar UI

**Goal:** Move the `Calendar` item from the `Communication` group in the global sidebar to the `Overview` group (below the Dashboard item), and build a `/calendar` page in `sentinel-support` that mirrors the `sentinel-core` calendar UI.

#### [MODIFY] [sidebar/support/constants/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/support/constants/index.ts)

- Move the `Calendar` `SidebarItem` from `COMMUNICATION_ITEMS` into `DASHBOARD_ITEMS` (after the `Overview` entry).
- `COMMUNICATION_ITEMS` becomes an empty array; the sidebar already filters out empty sections automatically.

#### [NEW] [(support)/calendar/page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/calendar/page.tsx>)

- Create the sentinel-support calendar page.
- Mirror the `AdminCalendarPage` from `sentinel-core`: `PageHeader`, `Separator`, `CalendarGrid`, `CalendarHeader`, `EventDialog`, `EventDetailsSheet`.

#### [NEW] [calendar/\_hooks/use-support-calendar.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/calendar/_hooks/use-support-calendar.ts>)

- Adapt `useAdminCalendar` from `sentinel-core` targeting the same API endpoints. Extract shared logic to `packages/hooks` if it doesn't exist there yet.

#### [NEW] [calendar/\_components/](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/calendar/_components/>)

- Copy/adapt `CalendarGrid`, `CalendarHeader`, `EventDialog`, `EventDetailsSheet` from `sentinel-core/calendar/_components/` into sentinel-support's calendar directory.
- If these components are already in `packages/ui`, import them directly instead.

**Migration required:** No — UI and routing only.

---

## Files Touched Summary

| File                                                         | Action                | Phase |
| ------------------------------------------------------------ | --------------------- | ----- |
| `control/_lib/presenters/groupers.ts`                        | Modify                | 1     |
| `control/_lib/presenters/groupers.test.ts`                   | New                   | 1     |
| `control/_components/views/assignment-manager-view.tsx`      | Modify                | 2     |
| `control/_components/layout/control-nav.tsx`                 | Modify                | 3     |
| `control/_components/governance/control-governance-form.tsx` | Modify                | 3     |
| `telemetry/sandbox/page.tsx`                                 | Modify                | 3     |
| `control/audio-calibration/page.tsx`                         | Delete                | 3     |
| `users/_components/layout/identity-nav.tsx`                  | New                   | 4     |
| `users/_components/layout/identity-workspace-shell.tsx`      | New                   | 4     |
| `users/_components/layout/identity-page-shell.tsx`           | New                   | 4     |
| `users/_components/governance/identity-governance-form.tsx`  | New                   | 4     |
| `users/page.tsx`                                             | Modify                | 4     |
| `sidebar/support/constants/index.ts`                         | Modify (Phases 4 & 5) | 4 + 5 |
| `(support)/calendar/page.tsx`                                | New                   | 5     |
| `calendar/_hooks/use-support-calendar.ts`                    | New                   | 5     |
| `calendar/_components/` (4 files)                            | New                   | 5     |

---

## Open Questions

> [!IMPORTANT]
> **Phase 3 — Audio Calibration cut-over**: Should the `/control/audio-calibration` route be removed immediately (hard cut-over) or kept as a redirect to `/telemetry/sandbox` for a transition period?

> [!IMPORTANT]
> **Phase 5 — Calendar data source**: Should `useSupportCalendar` use the same backend calendar API as `sentinel-core`, or does the support app target a separate endpoint? Confirm if `useAdminCalendar` can be lifted into `packages/hooks`.

> [!NOTE]
> **Phase 2 — Data correction**: This may be a one-time manual correction through the existing Delete Assignment UI. Confirm whether any code change is needed or if it's purely a data-ops fix.

---

## Verification Plan

### Automated Tests

```bash
pnpm --filter sentinel-support test
```

- **Phase 1**: `groupers.test.ts` must pass (deduplication assertions).
- **Phase 4**: Existing `users/page.test.tsx` must still pass after the shell refactor.

### Manual Verification

- **Phase 1**: Open `/control/roles` — confirm no duplicate permission rows in `INSTITUTION` and `USER` categories.
- **Phase 2**: Open `/control/assignments` — confirm `josephdump6@gmail.com` appears only once with role `admin`.
- **Phase 3**: Open `/telemetry/sandbox` — Audio Calibration UI renders. Open `/control` — `Audio Calibration` is gone from the left sidebar.
- **Phase 4**: Open `/users` — left sidebar renders with Dean, Support, Whitelist nav items. Sub-pages render inside the workspace shell. Global sidebar `Identity & Access` entry has no sub-items.
- **Phase 5**: `Calendar` appears under Overview in the global sidebar. Open `/calendar` — UI matches `sentinel-core` calendar (grid, header, event dialog, event details sheet).
