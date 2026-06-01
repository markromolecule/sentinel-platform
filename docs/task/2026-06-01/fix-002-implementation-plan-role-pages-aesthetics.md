# Support Access Control Layout & Dialog Aesthetics — Implementation Plan

**Summary:** Resolve routing 404s, align sidebar layout architecture, and upgrade the Access Control forms, dialogs, and views from outdated square components (`rounded-none`) to a modern, premium rounded interface matching the visual aesthetics of the rest of the Sentinel platform.

---

## Viable Options Analysis (per the 1-3-1 Rule)

### Design Decision: Global Sidebar vs. Page-Level Tabbed Navigation

* **Option A — Synchronized Sidebar and Page-Level Tabs**  
  Keep sub-items in the global sidebar and try to coordinate their active state with page-level horizontal tabs.  
  *Tradeoff:* High maintenance cost, complex URL state synchronization, and redundant navigation.
  
* **Option B — Singular Navigation Hub via Page-Level Tabs (Recommended)**  
  Remove `subItems` from the global sidebar `Access Control` item, making it a clean single-destination nav button. The inner page routes are managed by horizontal tabs inside `AccessControlWorkspaceShell`.  
  *Tradeoff:* Simplifies sidebar hierarchy, aligns with other key modules like Telemetry and Identity & Access.
  
* **Option C — Complete removal of Page-Level tabs**  
  Rely exclusively on global sidebar sub-items for Access Control navigation.  
  *Tradeoff:* Breaks layout consistency across the Support application and makes page views feel less integrated.

**Selected Option:** **Option B**. This offers the cleanest user experience, aligns with standard layout architecture patterns already used in Telemetry, and eliminates complex path-tracking in the global sidebar.

---

## Proposed Changes

### Phase 1: Sidebar Layout & Support Routing

**Goal:** Align sidebar navigation with page-level tabs and resolve 404 routing errors on the role matrix view.

- [x] Modify [constants index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/support/constants/index.ts) to remove the `subItems` array from the `Access Control` configuration block under `CONFIGURATION_ITEMS`.
- [x] Create [role-matrix page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/role-matrix/page.tsx) [NEW] to export `AccessControlRoleMatrixPage` which mounts `<AccessControlGovernanceForm />`.
- [x] Run `pnpm --dir app/sentinel-support test` to confirm all navigation/layout tests pass.

**Migration required:** No — frontend routing and sidebar structure adjustments.

---

### Phase 2: Refactoring Dialog Views Aesthetics

**Goal:** Remove square styling (`rounded-none`) and upgrade DialogContent, input fields, select items, and buttons in all dynamic role, permission, and assignment dialogs.

- [x] Modify [role-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_components/roles/role-form.tsx) to replace `rounded-none` on `DialogContent`, `Input`, `Textarea`, parent roles scroll area, border blocks, and footer buttons.
  - Apply premium, modern borders (`border-muted/30 hover:border-primary/30 transition-colors`), sleek drop shadows (`shadow-2xl`), and elegant border-radius (`rounded-xl` for DialogContent, `rounded-lg` for inputs/buttons).
  - Add smooth focus states (`focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40`).
- [x] Modify [permission-editor-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_components/permissions/permission-editor-dialog.tsx) to implement identical premium UI/UX upgrades on DialogContent, inputs, textarea, focus states, and action buttons.
- [x] Modify [assignment-editor-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_components/permissions/assignment-editor-dialog.tsx) to remove `rounded-none` and apply cohesive rounded styling on `DialogContent`, target role select trigger, select content, scroll area viewport, search inputs, and buttons.
- [x] Run `pnpm --dir app/sentinel-support test` to verify no regressions in control schemas.

**Migration required:** No — UI presentation refactoring only.

---

### Phase 3: Upgrading Page Grid Views & Alert Dialogs Aesthetics

**Goal:** Polishing page-level actions, search fields, table badges, and alert-dialog confirmation cards for a premium end-to-end UX.

- [x] Modify [role-management-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_components/views/role-management-view.tsx) to:
  - Replace `rounded-none` on active parent actions "New Role" button, SearchBar element, custom/system badges, action cell buttons (edit/delete).
  - Upgrade delete confirmation `AlertDialogContent` and its cancel/confirm action buttons to use modern rounded classes (`rounded-xl` / `rounded-lg`) instead of square.
- [x] Modify [permission-registry-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_components/views/permission-registry-view.tsx) to remove all `rounded-none` styles from the parent actions button, SearchBar, empty states, and permission revoke `AlertDialogContent` with its footer buttons.
- [x] Modify [assignment-manager-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_components/views/assignment-manager-view.tsx) to remove `rounded-none` on the actions button, row table badges (such as "Duplicate"), and filters.
- [x] Run `pnpm --dir app/sentinel-support test` to verify all 81 tests pass successfully.

**Migration required:** No — view polishing and structural layout refinement.

---

## Files Touched Summary

| File | Action | Phase |
|---|---|---|
| `app/sentinel-support/src/components/sidebar/support/constants/index.ts` | Modify | Phase 1 |
| `app/sentinel-support/src/app/(protected)/(support)/control/role-matrix/page.tsx` | New | Phase 1 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/roles/role-form.tsx` | Modify | Phase 2 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/permissions/permission-editor-dialog.tsx` | Modify | Phase 2 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/permissions/assignment-editor-dialog.tsx` | Modify | Phase 2 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/role-management-view.tsx` | Modify | Phase 3 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/permission-registry-view.tsx` | Modify | Phase 3 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/assignment-manager-view.tsx` | Modify | Phase 3 |

---

## Open Questions

> [!NOTE]
> **Border Radius Specifications**: We plan to use `rounded-xl` (12px) for main dialog containers/cards, and `rounded-lg` (8px) for buttons, text inputs, textareas, and option blocks to match the calendar/guides page styles. Let us know if you prefer a different rounding token.

---

## Verification Plan

### Automated Tests
- Run the full suite of frontend tests to confirm no regressions are introduced in layouts or views:
  ```bash
  pnpm --dir app/sentinel-support test
  ```

### Manual Verification
- **Sidebar Check**: Confirm that `Access Control` in the main sidebar renders as a single button, and clicking it navigates to `/control` correctly.
- **Routing Check**: Navigate to `/control/role-matrix` directly or via the page tab and verify that the page renders without a 404.
- **UI Dialogs Check**: Click "New Role", "New Permission", and "New Assignment" and inspect the dialog design:
  - Verify that all square buttons and borders are gone, replaced by beautiful rounded shapes.
  - Verify focus rings are smooth, buttons react dynamically on hover, and form validations function flawlessly.
