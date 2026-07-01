# feat-001 — Profile Page & Dynamic Headers

**One-line summary:** Replace all mock-data profile dropdowns and static header labels with live user data, build a reusable UserSearchBar component that navigates to the messages page, and deliver a fully functional Account Preferences / Profile page for every app/role.

---

## Background

The codebase currently has:

| Area                                                 | Problem                                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `StudentHeader.tsx`                                  | Initials & name pulled from `MOCK_STUDENT` constant                           |
| `InstructorProfileDropdown.tsx`                      | Initials & name pulled from `MOCK_PROCTOR` constant                           |
| `DashboardProfileDropdown.tsx` (core/support shared) | Uses `useUser()` — already live, but "Account preferences" item has no `href` |
| `student/profile/page.tsx`                           | All fields sourced from `MOCK_STUDENT`                                        |
| `SupportHeader`                                      | Hard-codes the string `"Support Portal"`                                      |
| Profile routes for instructor / core / support       | Do not exist yet                                                              |

---

## User Review Required

> [!IMPORTANT]
> **Profile page scope per role** — The context doc says "profile page / account preferences". This plan creates one unified `/profile` page per app (student, instructor, core admin, support agent) that shows personal info + a password-change card. If the intended scope is different (e.g. a modal sheet instead of a full page), please clarify before execution.

> [!WARNING]
> **Search-bar placement** — The search bar is described as being reachable from "the user icon area". This plan adds it to the header profile-dropdown area (desktop) and the mobile menu for each portal. If a standalone search page is preferred, flag it.

> [!IMPORTANT]
> **`updateUser` PATCH payload** — The existing `updateUser` service sends a `PATCH /users/:id` that currently only accepts `UserFormValues` fields. Updating a profile (firstName, lastName) from the UI will reuse this endpoint. Confirm the endpoint can accept partial updates for first/last name without requiring role/status/department.

---

## Open Questions

1. Should the **avatar** be a real uploaded image (supabase storage) or keep the initials-based circular avatar?
   → This plan keeps initials; if image upload is needed, it becomes a separate phase.
2. Should the user **search bar** be visible to all roles (student, instructor, admin, support) or only certain roles?
   → This plan adds it to all logged-in headers.
3. For `sentinel-core` and `sentinel-support`, is the profile page a new route under `(protected)/profile` or a settings drawer?
   → This plan creates a new route `(protected)/profile/page.tsx` in each app.

---

## Proposed Changes

### Phase 1 — Fix Student & Instructor Profile Dropdowns (sentinel-web)

**Goal:** Replace `MOCK_STUDENT` and `MOCK_PROCTOR` with live `useProfileQuery` data in all sentinel-web headers and wire up the profile/account-preferences links.

#### [MODIFY] [instructor-profile-dropdown.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/sidebar/instructor/instructor-profile-dropdown.tsx)

- Remove import of `MOCK_PROCTOR`.
- Import `useProfileQuery` from `@sentinel/hooks`.
- Read `profile?.firstName`, `profile?.lastName`, `profile?.email` and render initials/name/email dynamically.
- Add `href="/instructor/profile"` to the "Account preferences" `DropdownMenuItem` (wrap in `Link` + `asChild`).
- Handle loading state with the existing `InstructorProfileDropdownFallback`.

#### [NEW] [(instructor)/profile/page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/profile/page.tsx>)

- Source all fields from `useProfileQuery()`.
- Sections: **Personal Information** (firstName, lastName, email, employeeNo, department, institution) + **Security** (change password via `useUpdatePasswordMutation`).
- Same card-layout pattern as `student/profile/page.tsx`.
- Toast feedback on success/error via `sonner`.

#### [MODIFY] [StudentHeader.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/sidebar/student/StudentHeader.tsx)

- Remove import of `MOCK_STUDENT`.
- Import `useProfileQuery` from `@sentinel/hooks`.
- Render initials, full name, and email dynamically in the desktop user dropdown and mobile sheet.

#### [MODIFY] [student/profile/page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/profile/page.tsx>)

- Remove `MOCK_STUDENT`.
- Source all fields from `useProfileQuery()`.
- Wire the Security card to call `useUpdatePasswordMutation`.
- Add toast feedback on success/error via `sonner`.

**Tests:**

- `[x]` Write `instructor-profile-dropdown.test.tsx` — assert real name/email rendered, MOCK_PROCTOR not used, "Account preferences" link points to `/instructor/profile`.
- `[x]` Write `student-header.test.tsx` — assert real name/email from `useProfileQuery`, MOCK_STUDENT not used.
- `[x]` Write `student-profile-page.test.tsx` — assert `useProfileQuery` called, fields displayed.

**Migration required:** No.

---

### Phase 2 — Fix Support Header Institution (sentinel-support)

**Goal:** Replace the hard-coded `"Support Portal"` text in `SupportHeader` with the logged-in user's institution, following the same pattern already used by `AdminHeader` in `sentinel-core`.

#### [MODIFY] [support-header.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/support/support-header.tsx)

- Import `useProfileQuery` from `@sentinel/hooks`.
- Replace the hard-coded `<span>Support Portal</span>` with a conditional render of `profile.institution` (mirrors `admin-header.tsx` pattern exactly).

#### [MODIFY] [dashboard-profile-dropdown.tsx — support copy](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/common/dashboard-profile-dropdown.tsx)

- Add `href="/profile"` (with `asChild` + `Link`) to the "Account preferences" `DropdownMenuItem`.

#### [NEW] [(protected)/profile/page.tsx — support](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/profile/page.tsx>)

- Page shows: firstName, lastName, email, role, institution.
- Security card for password change via `useUpdatePasswordMutation`.
- Use `useProfileQuery`.

**Tests:**

- `[x]` Write `support-header.test.tsx` — assert `useProfileQuery` called, institution rendered, "Support Portal" string absent.
- `[x]` Write `support-profile-page.test.tsx` — assert profile fields rendered from real query.

**Migration required:** No.

---

### Phase 3 — Wire Core Admin Profile Page (sentinel-core)

**Goal:** Wire the existing "Account preferences" `DropdownMenuItem` to a new profile page. The `AdminHeader` institution display is already implemented — just verify completeness.

#### [MODIFY] [dashboard-profile-dropdown.tsx — core copy](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/components/sidebar/common/dashboard-profile-dropdown.tsx)

- Add `href="/profile"` (with `asChild` + `Link`) to the "Account preferences" `DropdownMenuItem`.

#### [NEW] [(protected)/profile/page.tsx — core](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/profile/page.tsx>)

- Page shows: firstName, lastName, email, role, institution, and a Security card.
- Use `useProfileQuery` + `useUpdatePasswordMutation`.
- Same card-layout as the student profile page.

**Tests:**

- `[x]` Write `core-profile-page.test.tsx` — assert profile fields sourced from `useProfileQuery`.
- `[x]` Write `core-dashboard-profile-dropdown.test.tsx` — assert "Account preferences" href is `/profile`.

**Migration required:** No.

---

### Phase 4 — Shared UserSearchBar Component

**Goal:** Build a reusable `UserSearchBar` using a Shadcn `Command` popover that lets the logged-in user search for another user by name and navigates to the messages page with that user pre-selected.

#### Options Analysis (1-3-1 Rule)

**Option A — Feature-local component per app (simple/fast)**
Each app has its own `UserSearchBar` in `src/components/common/`.
_Tradeoff:_ Fast to ship but duplicates query logic across three apps.

**Option B — Shared component in `packages/ui` (robust/scalable)**
A headless search primitive in `packages/ui` that all apps import.
_Tradeoff:_ Cleaner long-term but `packages/ui` has no API awareness and would need to accept many callbacks.

**Option C — Shared hook + app-specific component (recommended)**

- A shared `useUserSearch` hook in `packages/hooks/src/query/users/` that wraps debounced `getUsers`.
- Each app has a thin `UserSearchBar` component that uses the hook and handles its own routing.
  _Tradeoff:_ Reuses query logic without coupling UI to routing; fits the existing architecture perfectly (mirrors `useProfileQuery` / `useUserQuery` pattern).

**Best option: C** — matches how all other query hooks are structured in the monorepo. Keeps `packages/ui` free of API dependencies and lets each app own its navigation.

---

#### [NEW] [use-user-search.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/users/use-user-search.ts)

```ts
/**
 * Debounced user search hook.
 * Wraps useUsersQuery with a 300ms debounce applied to the search string.
 *
 * @param query - The raw search string typed by the user.
 * @param options - Optional role filter.
 */
export function useUserSearch(query: string, options?: { role?: string[] });
```

- Uses the existing `useDebounce` from `@sentinel/hooks` (300 ms).
- Calls `useUsersQuery` with `{ search: debouncedQuery, ...options }` — only enabled when query length >= 2.
- Returns `{ users, isLoading, isError }`.
- Export from `packages/hooks/src/query/users/index.ts`.

#### [MODIFY] [users/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/users/index.ts)

- Add `export * from './use-user-search';`

#### [NEW] [user-search-bar.tsx — sentinel-web](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/common/user-search-bar.tsx)

- Shadcn `Command` component rendered inside a `Popover` triggered by a `Search` icon button.
- Accepts a `redirectPath` prop (e.g. `"/student/message"` or `"/instructor/messages"`).
- On user selected → `router.push(\`${redirectPath}?userId=${user.id}\`)`.
- Desktop only (hidden on mobile via `hidden sm:flex`).
- Shows user avatar initials, full name, and role in the list.

#### [NEW] [user-search-bar.tsx — sentinel-core](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/components/common/user-search-bar.tsx)

- Same pattern; redirects to `/messages?userId={id}`.

#### [NEW] [user-search-bar.tsx — sentinel-support](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/common/user-search-bar.tsx)

- Same pattern; redirects to `/messages?userId={id}`.

#### [MODIFY] Headers — add UserSearchBar

- [instructor-header.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/sidebar/instructor/instructor-header.tsx) — render `<UserSearchBar redirectPath="/instructor/messages" />` between notification and profile icons.
- [StudentHeader.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/sidebar/student/StudentHeader.tsx) — render `<UserSearchBar redirectPath="/student/message" />`.
- [admin-header.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/components/sidebar/admin/admin-header.tsx) — render `<UserSearchBar redirectPath="/messages" />`.
- [support-header.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/support/support-header.tsx) — render `<UserSearchBar redirectPath="/messages" />`.

#### [MODIFY] Messages pages — read `?userId` query param

Each messages page reads `useSearchParams().get('userId')` and calls `useCreateDirectConversationMutation` on mount to pre-open a conversation:

- `app/sentinel-web/src/app/(protected)/student/message/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/messages/page.tsx`
- `app/sentinel-core/src/app/(protected)/messages/page.tsx`
- `app/sentinel-support/src/app/(protected)/messages/page.tsx`

**Tests:**

- `[x]` Write `use-user-search.test.ts` — assert debounce applied, `getUsers` called with search param, disabled when query < 2 chars.
- `[x]` Write `user-search-bar.test.tsx` (sentinel-web) — assert Popover opens, list renders users, on select calls `router.push` with correct path.

**Migration required:** No.

---

### Phase 5 — Export Housekeeping & Index Updates

**Goal:** Ensure all new hooks and components are properly exported so imports resolve cleanly across the monorepo.

- `[x]` Add `useUserSearch` export to `packages/hooks/src/query/users/index.ts`
- `[x]` Verify `packages/hooks/src/query/index.ts` re-exports the `users` barrel
- `[x]` Add `UserSearchBar` to `sentinel-web/src/components/common/index.ts`
- `[x]` Add `UserSearchBar` to `sentinel-core/src/components/common/index.ts`
- `[x]` Add `UserSearchBar` to `sentinel-support/src/components/common/index.ts`
- `[x]` Run `pnpm --filter @sentinel/hooks build` — confirm zero TypeScript errors
- `[x]` Run `pnpm --filter sentinel-web build` — confirm zero TypeScript errors
- `[x]` Run `pnpm lint` — confirm no new lint violations

**Migration required:** No.

---

## File Change Summary

| File                                         | App / Package    | Action                                   |
| -------------------------------------------- | ---------------- | ---------------------------------------- |
| `.../instructor-profile-dropdown.tsx`        | sentinel-web     | MODIFY — real data, profile link         |
| `.../instructor/profile/page.tsx`            | sentinel-web     | NEW                                      |
| `.../StudentHeader.tsx`                      | sentinel-web     | MODIFY — real data, search bar           |
| `.../student/profile/page.tsx`               | sentinel-web     | MODIFY — real data, password mutation    |
| `.../instructor-header.tsx`                  | sentinel-web     | MODIFY — add search bar                  |
| `.../web/user-search-bar.tsx`                | sentinel-web     | NEW                                      |
| `.../support-header.tsx`                     | sentinel-support | MODIFY — dynamic institution, search bar |
| `.../support/dashboard-profile-dropdown.tsx` | sentinel-support | MODIFY — add profile link                |
| `.../support/profile/page.tsx`               | sentinel-support | NEW                                      |
| `.../support/user-search-bar.tsx`            | sentinel-support | NEW                                      |
| `.../admin-header.tsx`                       | sentinel-core    | MODIFY — add search bar                  |
| `.../core/dashboard-profile-dropdown.tsx`    | sentinel-core    | MODIFY — add profile link                |
| `.../core/profile/page.tsx`                  | sentinel-core    | NEW                                      |
| `.../core/user-search-bar.tsx`               | sentinel-core    | NEW                                      |
| `packages/hooks/.../use-user-search.ts`      | @sentinel/hooks  | NEW                                      |
| `packages/hooks/.../users/index.ts`          | @sentinel/hooks  | MODIFY — add export                      |
| Message pages (4 files)                      | web/core/support | MODIFY — read `?userId` param            |

---

## Verification Plan

### Automated Tests

```bash
pnpm test
pnpm --filter sentinel-web test
pnpm --filter sentinel-core test
pnpm --filter sentinel-support test
pnpm --filter @sentinel/hooks test
```

### Manual Verification

1. **sentinel-web (student):** Log in as a student → verify initials/name/email in header dropdown are real. Click "Profile" → page shows real data. Change password → toast success/error.
2. **sentinel-web (instructor):** Log in as instructor → real data in dropdown. Click "Account preferences" → `/instructor/profile`. Use search bar → type a name → select user → redirected to messages with conversation pre-opened.
3. **sentinel-core:** Log in as admin → institution shown in header. Dropdown → "Account preferences" → `/profile` page. Search bar functional.
4. **sentinel-support:** Log in as support agent → header shows institution (not "Support Portal"). Dropdown → "Account preferences" → `/profile` page. Search bar functional.

### Breaking Changes

- None expected. `MOCK_STUDENT` and `MOCK_PROCTOR` constants are only removed from the components listed above — they remain in `@sentinel/shared/constants` for any other usages.
- The `?userId` query param on messages pages is purely additive — no existing navigation is removed.
