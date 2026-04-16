# To-Do Plan: Sentinel Support RBAC Module

## Overview

This document outlines the proposed plan for a new RBAC and authority management module in `app/sentinel-support/src/app/(protected)/(support)`. The goal is to give Support a clear, modular UI for managing role-based access, module-level CRUD permissions, and examination-wide settings, while aligning with the current backend patterns already used in `sentinel-api`.

This follows the `1-3-1` rule so the scope and implementation direction can be reviewed before coding begins.

## Current Status

- [x] Phase 1: Discovery, Contract Lock, and Scope Review
- [x] Phase 2: Backend RBAC Foundation
- [x] Phase 3: Shared Types, Services, and Hooks
- [x] Phase 4: Support Navigation and Workspace Shell
- [ ] Phase 5: Roles and Permissions Management UI
- [ ] Phase 6: Assignments and Examination Settings UI
- [ ] Phase 7: Validation, Polish, and Regression Checks

### Current Review Focus

- Review the backend access-control contract and new persistence layer.
- Review the support sidebar entry and route shell structure.
- Review the initial read-only/support-review pages before CRUD editors are added.

## Investigation & 1-3-1 Analysis

### Task: Add a Support-Controlled Access Management Module

**Objective**: Create a new support-facing module that allows authorized Support users to:

- manage roles and permission bundles;
- assign module-level CRUD capabilities;
- map permissions to roles and users;
- control examination global settings from one maintainable workspace.

**Current System Basis**:

- Backend role data already exists through `roles`, `user_roles`, and `class_roles`.
- API access today is mostly enforced through role checks and helpers such as `roleAuthMiddleware` and shared permission assertions in `sentinel-api`.
- The support frontend already follows a consistent pattern using `@sentinel/ui`, `PageHeader`, `DataTable`, dialogs, sheets, and sidebar-driven pages such as Institutions, Departments, Semesters, and Users.

### Option 1: Single RBAC Page With Inline Sections

- **Description**: Build one page such as `/access-control` with stacked cards for Roles, Permissions, Assignments, and Examination Settings.
- **Pros**: Fastest to ship, simple routing, easy to find everything in one page.
- **Cons**: Will become crowded quickly, harder to scale as permissions grow, and less friendly for future audit/history or advanced filtering.

### Option 2: Route-Based Access Control Workspace

- **Description**: Add one parent sidebar item, `Access Control`, with focused subpages for overview, roles, permissions, assignments, and examination settings.
- **Pros**: Most modular, easiest to navigate, fits the current support app pattern, and keeps each responsibility isolated for cleaner CRUD flows and reusable components.
- **Cons**: Slightly more setup across routes, sidebar constants, hooks, and shared components.

### Option 3: Backend-First Refactor With Minimal Frontend

- **Description**: First normalize backend permission endpoints and schemas, then expose only a thin basic frontend for Support.
- **Pros**: Strong backend foundation and lower frontend complexity at the start.
- **Cons**: Slower user-facing value, limited reviewability from the support team, and weak UX for managing many permissions and settings.

### Best Option & Why

**Option 2** is the best fit.

It matches how `sentinel-support` is already organized, gives Support a cleaner navigation model, and creates room for RBAC growth without overloading a single screen. It also lets us reuse the current page shell, tables, dialogs, sheets, and form patterns from existing support pages while layering in backend-driven permission logic.

---

## Proposed Navigation

### Sidebar Addition

- **Section**: `Management`
- **Parent Item**: `Access Control`
- **Primary Route**: `/access-control`

### Proposed Subpaths

- `/access-control`
  Summary dashboard for roles, assignments, permission coverage, and quick actions.
- `/access-control/roles`
  Manage system roles and their descriptions.
- `/access-control/permissions`
  Manage permission definitions by module and action.
- `/access-control/assignments`
  Assign roles and permission overrides to target users or support-managed scopes.
- `/access-control/examination-settings`
  Manage examination global settings controlled by Support.

## UI Direction

- Use existing reusable components from `@sentinel/ui` to keep the support app visually consistent.
- Follow the same page composition used in current support pages:
  `PageHeader` + `Separator` + table/list + dialog/sheet actions.
- Prefer modular, route-scoped components under:
  `app/sentinel-support/src/app/(protected)/(support)/access-control`
- If a new UI primitive is needed, use the same shadcn-style component approach already exposed through your shared UI package.
- Keep the visual language aligned with current support pages instead of introducing a new theme or color system.

---

## Phased Delivery Plan

### Phase 1: Discovery, Contract Lock, and Scope Review

**Goal**: Finalize the RBAC shape before building API routes or pages.

- [ ] Inventory the current authorization logic already used in `sentinel-api`:
      `roles`, `user_roles`, `class_roles`, `roleAuthMiddleware`, and shared permission helpers.
- [ ] Identify which permissions are truly system-level RBAC permissions versus domain-specific checks.
- [ ] Define the first supported permission taxonomy for Support:
      module, action, scope, and optional override behavior.
- [ ] Confirm the initial modules to support in the matrix:
      institutions, departments, semesters, users, examination settings, and future extensibility for other modules.
- [ ] Confirm the first-release boundaries:
      role management, permission management, assignment management, and examination global settings.

**Deliverables**:

- locked permission model;
- phased implementation boundaries;
- confirmed first-release modules and actions.

**Review Checkpoint**:

- Review the RBAC contract before any schema or endpoint implementation starts.

### Phase 2: Backend RBAC Foundation

**Goal**: Build the API and data contract that the Support workspace will consume.

- [ ] Define a normalized RBAC contract for Support management:
      roles, permissions, role-permission mappings, user-role assignments, and support-managed overrides.
- [ ] Add read endpoints for roles, permissions, mappings, assignments, and examination settings.
- [ ] Add create/update/delete endpoints for roles, permissions, mappings, assignments, and examination settings.
- [ ] Ensure all mutations are guarded so only valid Support authority can modify RBAC or global settings.
- [ ] Reuse existing controller/service patterns from `sentinel-api` so the new module stays consistent with the repo.

**Deliverables**:

- typed backend contract;
- secured CRUD endpoints;
- examination settings endpoints wired into the same support-managed module.

**Review Checkpoint**:

- Review endpoint names, DTOs, and authorization rules before frontend integration.

### Phase 3: Shared Types, Services, and Hooks

**Goal**: Create the reusable frontend data layer so the UI can stay thin and modular.

- [ ] Add shared DTOs for roles, permissions, assignment records, permission matrix rows, and examination settings.
- [ ] Add service functions in `packages/services` for list, detail, create, update, and delete flows.
- [ ] Add React Query hooks in `packages/hooks` for all core RBAC resources.
- [ ] Normalize response shapes so the support pages can render tables and forms consistently.

**Deliverables**:

- shared types;
- reusable services;
- query and mutation hooks ready for UI pages.

**Review Checkpoint**:

- Review hook and service naming plus payload structure before page implementation.

### Phase 4: Support Navigation and Workspace Shell

**Goal**: Introduce the new support module entry point and the top-level page structure.

- [ ] Add the new `Access Control` sidebar item under the `Management` section.
- [ ] Add route support for:
      `/access-control`,
      `/access-control/roles`,
      `/access-control/permissions`,
      `/access-control/assignments`,
      `/access-control/examination-settings`.
- [ ] Build the overview page with summary cards, status highlights, and quick links into each subpage.
- [ ] Ensure sidebar active states and subpath behavior match the current support app pattern.

**Deliverables**:

- sidebar integration;
- overview route;
- route skeletons for all RBAC subpages.

**Review Checkpoint**:

- Review navigation labels, route names, and page shell before CRUD screens are added.

### Phase 5: Roles and Permissions Management UI

**Goal**: Deliver the core RBAC authoring screens used to define system access.

- [ ] Create the `roles` management page using reusable table, dialog, and form components.
- [ ] Create the `permissions` management page with module/action grouping for CRUD visibility.
- [ ] Add a clear permission matrix or grouped editing experience for role-permission mapping.
- [ ] Make bulk permission editing efficient but still reviewable before save.

**Deliverables**:

- roles CRUD UI;
- permissions CRUD UI;
- role-permission mapping workflow.

**Review Checkpoint**:

- Review the permission matrix UX and save flow before user assignments are added.

### Phase 6: Assignments and Examination Settings UI

**Goal**: Complete the operational Support workflow for granting access and managing examination-wide controls.

- [ ] Create the `assignments` page for mapping roles and permission overrides to users or supported scopes.
- [ ] Create the `examination-settings` page for support-controlled global examination configuration.
- [ ] Add validation and guardrails to prevent invalid role/permission combinations.
- [ ] Add confirmation flows for destructive or sensitive RBAC changes.

**Deliverables**:

- assignment management UI;
- examination settings management UI;
- protected mutation flow for sensitive actions.

**Review Checkpoint**:

- Review operational workflows and edge-case behavior before polish and testing.

### Phase 7: Validation, Polish, and Regression Checks

**Goal**: Stabilize the module for real use in the support workspace.

- [ ] Verify loading, empty, error, and success states match current support app patterns.
- [ ] Verify desktop and mobile navigation behavior for the new routes.
- [ ] Add targeted backend authorization tests where supported.
- [ ] Add targeted frontend interaction coverage for critical dialogs, forms, and matrix edits where supported.
- [ ] Refine labels, helper copy, and safety messaging for Support users.

**Deliverables**:

- stabilized RBAC module;
- regression coverage for the highest-risk flows;
- polished UX aligned with the rest of `sentinel-support`.

**Review Checkpoint**:

- Final review before merge or phased rollout.

---

## Suggested Review Order

1. Phase 1: Discovery, Contract Lock, and Scope Review
2. Phase 2: Backend RBAC Foundation
3. Phase 3: Shared Types, Services, and Hooks
4. Phase 4: Support Navigation and Workspace Shell
5. Phase 5: Roles and Permissions Management UI
6. Phase 6: Assignments and Examination Settings UI
7. Phase 7: Validation, Polish, and Regression Checks

## Recommended First Implementation Slice

If we want the safest review cycle, the recommended first build slice is:

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4

That gives you a reviewable backend contract and visible navigation shell before we invest in the full CRUD and matrix workflows.

---

## To-Do List

- [ ] **1. Backend RBAC Foundation (`app/sentinel-api/src/modules/...`)**
    - [ ] Inventory the existing permission logic now spread across `roleAuthMiddleware`, shared academic-scope permission helpers, and role-based controllers.
    - [ ] Define a normalized RBAC contract for Support management:
          roles, permissions, role-permission mappings, user-role assignments, and support-managed overrides.
    - [ ] Add read/write endpoints for roles, permissions, mappings, and assignments using the existing API structure and validation style.
    - [ ] Add endpoints for examination global settings so Support can manage them from the same module.
    - [ ] Ensure all mutations are guarded so only valid Support authority can change RBAC or examination settings.

- [ ] **2. Shared Types, Services, and Hooks (`packages/services`, `packages/hooks`, shared types)**
    - [ ] Add typed service functions for roles, permissions, assignments, and examination settings.
    - [ ] Add React Query hooks for list, detail, create, update, and delete flows.
    - [ ] Define frontend-safe DTOs for permission matrix rows, role summaries, assignment records, and settings payloads.

- [ ] **3. Support Frontend Workspace (`app/sentinel-support/src/app/(protected)/(support)/access-control`)**
    - [ ] Add the new sidebar item and subpaths under the Support `Management` section.
    - [ ] Create the overview page with summary cards and quick links to roles, permissions, assignments, and examination settings.
    - [ ] Create `roles` management UI using reusable table, dialog, and form components.
    - [ ] Create `permissions` management UI with module/action grouping for CRUD visibility.
    - [ ] Create `assignments` UI for mapping roles and permission overrides to users or supported scopes.
    - [ ] Create `examination-settings` UI for support-controlled global examination configuration.
    - [ ] Keep all pages simple to scan, consistent in spacing, and easy to navigate on desktop and mobile.

- [ ] **4. Permission Matrix and CRUD Experience**
    - [ ] Model permissions in a way that cleanly supports module-level actions such as `create`, `read`, `update`, `delete`, `manage`, and settings access.
    - [ ] Present permissions in a modular matrix or grouped list that Support can understand without reading backend terms directly.
    - [ ] Make bulk role-permission editing efficient but still reviewable before save.

- [ ] **5. Validation, Safety, and Regression Checks**
    - [ ] Prevent Support from accidentally creating invalid role/permission combinations.
    - [ ] Add form validation, optimistic feedback where appropriate, and clear destructive-action confirmation flows.
    - [ ] Verify sidebar active states, route structure, and loading/error states match current support app patterns.
    - [ ] Add targeted tests for backend authorization rules and critical frontend interaction flows where the repo already supports them.

## Expected Outcome

After implementation, Support will have one dedicated module to manage:

- who can access a module;
- what actions each role can perform;
- who can CRUD specific resources;
- which examination-wide settings can be changed globally.

This should reduce scattered role logic over time and provide a single operational surface for RBAC administration in the system.

## Next Steps

This plan is now phased so you can approve it incrementally.

Recommended review flow:

1. Approve the phase breakdown.
2. Approve the first implementation slice through Phase 4.
3. After that, review Phase 5 and Phase 6 separately before the final polish phase.

No implementation has started yet.
