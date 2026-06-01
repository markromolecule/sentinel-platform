# Implementation Plan - Identity & Access Layout Refactoring

Change the layout of the Identity & Access management section in `sentinel-core` to use a workspace sidebar shell layout (similar to the Subject and Organization management layouts) and clean up the primary navigation sidebar to remove sub-menu items.

## User Review Required

> [!NOTE]
> This refactoring will affect the navigation for the "Identity & Access" section for all `superadmin` users. Instead of using a multi-level sidebar on the primary application-wide layout, users will see a single clean "Identity & Access" link in the sidebar, which opens a dedicated workspace navigation layout.

## Proposed Changes

### Sentinel-Core Application

---

#### [MODIFY] [core-admin-nav-config.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts)
- Clean up the `administrators` navigation definition by removing its `subItems` array. This simplifies the main navigation sidebar.

#### [NEW] [identity-nav.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(superadmin)/_components/layout/identity-nav.tsx)
- Create a new component that renders the sidebar links for Administrators, Whitelist, and Permissions.

#### [NEW] [identity-workspace-shell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(superadmin)/_components/layout/identity-workspace-shell.tsx)
- Create a shell layout component that embeds `IdentityNav` as a sticky desktop sidebar and a responsive mobile card navigation, wrapping its child content.

#### [NEW] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(superadmin)/_components/layout/index.ts)
- Export layout and nav components from the layout directory.

#### [NEW] [identity-nav.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(superadmin)/_components/layout/identity-nav.test.tsx)
- Add comprehensive Vitest unit tests to cover rendering, routing paths, and active navigation item state styling.

#### [NEW] [layout.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(superadmin)/layout.tsx)
- Add a shared `layout.tsx` file for the `(superadmin)` route group that automatically wraps all superadmin pages (`/administrators`, `/administrators/whitelist`, and `/permissions`) in the new `IdentityWorkspaceShell`.

---

## Phases of Implementation

### Phase 1: Create Workspace Layout & Navigation Components

**Goal:** Implement the new navigation sidebar and layout shell components for the Identity & Access workspace.

- [ ] Create `app/sentinel-core/src/app/(protected)/(superadmin)/_components/layout/identity-nav.tsx`
- [ ] Create `app/sentinel-core/src/app/(protected)/(superadmin)/_components/layout/identity-workspace-shell.tsx`
- [ ] Create `app/sentinel-core/src/app/(protected)/(superadmin)/_components/layout/index.ts`
- [ ] Create unit tests at `app/sentinel-core/src/app/(protected)/(superadmin)/_components/layout/identity-nav.test.tsx`
- [ ] Run `pnpm --dir app/sentinel-core test` and confirm all tests pass successfully
      **Migration required:** No

### Phase 2: Route Group Layout & Sidebar Configuration Cleanup

**Goal:** Apply the workspace shell to the superadmin route group and clean up the application-wide navigation.

- [ ] Create route group layout `app/sentinel-core/src/app/(protected)/(superadmin)/layout.tsx` to wrap child pages in the new workspace shell
- [ ] Modify `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts` to remove subItems under the `administrators` pageId
- [ ] Manually verify pages load correctly with clean, consistent layouts at `/administrators`, `/administrators/whitelist`, and `/permissions`
- [ ] Run full project tests and verify linting to ensure no regressions
      **Migration required:** No

---

## Verification Plan

### Automated Tests
- Execute `pnpm --dir app/sentinel-core test identity-nav.test.tsx` to verify navigation states.
- Run `pnpm --dir app/sentinel-core lint` to ensure typescript/eslint compliance.

### Manual Verification
- Deploy/run `pnpm dev` and inspect the browser:
  - Check that the main sidebar no longer displays accordion-style sub-menus for "Identity & Access".
  - Verify that clicking "Identity & Access" navigates to `/administrators` showing the new workspace layout.
  - Verify clicking "Whitelist" in the workspace sidebar navigates to `/administrators/whitelist`.
  - Verify clicking "Permissions" in the workspace sidebar navigates to `/permissions`.
  - Ensure all layout margins, borders, and sticky behaviors look consistent with subjects and organization pages.
