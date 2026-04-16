# Admin & Superadmin Route Restructuring To-Do

## Context

Restructuring the `(protected)` route group to unify shared tools (Dashboard, Calendar, etc.) and correctly assign `Departments` and `Courses` to Superadmin management.

## 1-3-1 Rule Analysis: Route Architecture

1. **Objective**:
   Unify common management routes under singular URLs (e.g., `/dashboard`) to reduce code duplication and provide a consistent user experience across different roles.

2. **Three Viable Options**:
    1. **Segregated Routes (Current)**:
        - Keep `admin/dashboard` and `superadmin/dashboard`.
        - _Pros_: Explicit separation. _Cons_: Duplicated route logic and fragmented URLs.
    2. **Route Groups with Shared Pages (Recommended)**:
        - Rename to `(admin)` and `(superadmin)`.
        - Move common routes (Dashboard, Calendar, Announcements, Messages, Analytics, Logs, Guides) to `(protected)/`.
        - Use role-switching logic in `page.tsx`.
        - _Pros_: Unified URLs, shared infrastructure, clean organization.
    3. **Role-Prefixed Parallel Routes**:
        - Use Next.js parallel routes `@admin` and `@superadmin` in a shared `dashboard/layout.tsx`.
        - _Pros_: Powerful Next.js feature. _Cons_: Higher complexity and cognitive overhead for this specific use case.

3. **Recommendation**:
   **Option 2 (Route Groups with Shared Pages)** is the best fit. It simplifies the URL structure to standard paths like `/dashboard` while allowing the codebase to remain organized by role using the `(group)` folders for unique features.

---

## Execution Checklist

### Phase 1: Preparation & Renaming

- [ ] **1. Rename Folders**: Rename `admin` → `(admin)` and `superadmin` → `(superadmin)`.
- [ ] **2. Move Management Entities**: Relocate `departments/` and `courses/` from `(admin)/` to `(superadmin)/`.

### Phase 2: Centralizing Shared Pages

- [ ] **1. Move Pages Up**: Relocate the following from `(admin)/` to `(protected)/`:
    - `dashboard/`, `calendar/`, `announcements/`, `messages/`, `analytics/`, `logs/`, `guides/`.
- [ ] **2. Implement Component Switching**: Update `page.tsx` in these folders to handle role-based rendering.
    - _Note_: Ensure imported components follow `PascalCase` as per global naming rules.

### Phase 3: Validation & Cleanup

- [ ] **1. Navigation Update**: Update sidebar links to point to the new unified routes (e.g., `/dashboard` instead of `/admin/dashboard`).
- [ ] **2. Verification**:
    - [ ] Run `pnpm build` to check for route conflicts.
    - [ ] Run `pnpm lint` to ensure import consistency.

---

## Progress Log

- **2024-03-20**: Initial analysis and plan creation. (1-3-1 COMPLETE)
- **2024-03-20**: Renamed directories to `(admin)` and `(superadmin)`.
- **2024-03-20**: Moved `departments` and `courses` to `(superadmin)`.
- **2024-03-20**: Centralized shared management pages to root `(protected)`.
- **2024-03-20**: Implemented role-based unified dashboard and shared layout.
- **2024-03-20**: Fixed global absolute imports and resolved route conflicts.
- **2024-03-20**: Verified build success with `pnpm build`.
- [x] Phase 1: Folder restructuring
- [x] Phase 2: Shared page migration
- [x] Phase 3: Validation & Cleanup

> [!IMPORTANT]
> This change affects the URL structure for all administrative staff. Ensure that any deep links or external redirects are updated to the new unified paths.
