# sentinel-support: Messages, Announcements & Bug Fixes

**Summary:** Add surfaced navigation entries for the existing Messages and Announcements pages in
sentinel-support's sidebar, fix the sidebar rendering performance lag caused by the blocking `useUser`
check in the protected layout, and resolve the broken avatar display in the `UserSearchBar` component
on sentinel-support (which correctly shows on sentinel-core).

---

## User Review Required

> [!IMPORTANT]
> Both the `/messages` and `/announcements` routes already exist in `sentinel-support` with components
> copied from `sentinel-core`. This plan focuses on wiring them into the sidebar navigation (they are
> currently absent from `COMMUNICATION_ITEMS`) and ensuring parity with `sentinel-core` UI.

> [!WARNING]
> The sidebar `COMMUNICATION_ITEMS` constant is currently an **empty array** (`[]`). Adding entries
> will immediately show those items to all support-role users — confirm this is the intended behaviour
> before proceeding.

> [!CAUTION]
> The avatar fix requires comparing how `avatarUrl` flows from the API through `getUsers` →
> `useUserSearch` → `UserSearchBar`. The most likely root cause is that the support app's API client
> uses a **different auth storage key** (`sentinel-support-auth`) from core, which may mean the
> `/users` endpoint returns a different result set or missing `avatar_url`. This needs to be verified
> before the fix is committed.

---

## Open Questions

> [!IMPORTANT]
> 1. Should the **Messages** and **Announcements** sidebar entries go under `COMMUNICATION_ITEMS` or
>    a new `SUPPORT_ITEMS` section in the support sidebar?
> 2. Should the sidebar rendering fix use `Suspense` + skeleton or simply remove the `isLoading`
>    gate from `ProtectedLayout` so the sidebar renders immediately while auth resolves in the
>    background?
> 3. Is the avatar issue specific to the **search results** list, the **recent searches** list, or
>    both?

---

## Proposed Changes

### Phase 1 — Surface Messages & Announcements in the Support Sidebar

**Goal:** Add `Messages` and `Announcements` navigation entries to `COMMUNICATION_ITEMS` in the
support sidebar constants and verify UI parity with sentinel-core pages.

---

#### [MODIFY] [constants/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/support/constants/index.ts)

- Import `MessageSquare` and `Megaphone` icons from `lucide-react`.
- Populate `COMMUNICATION_ITEMS` with:
  - `{ title: 'Messages', url: '/messages', icon: MessageSquare }`
  - `{ title: 'Announcements', url: '/announcements', icon: Megaphone }`

**Tasks:**
- [x] Add `MessageSquare`, `Megaphone` to the lucide-react import in
  `app/sentinel-support/src/components/sidebar/support/constants/index.ts`
- [x] Replace the empty `COMMUNICATION_ITEMS` array with the two new entries
- [x] Confirm `support-sidebar.tsx` already renders the `Communication` section
  (it does — `{ label: 'Communication', items: COMMUNICATION_ITEMS, showSeparator: true }`)

#### [VERIFY] [support-sidebar.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/support/support-sidebar.tsx)

- No changes needed; the `.filter((section) => section.items.length > 0)` guard already handles
  the toggle, so adding items to `COMMUNICATION_ITEMS` will cause the section to render properly.

#### [VERIFY] Messages page parity — [messages/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/page.tsx)

- The file already exists. Verify:
  - `SupportMessagesPage` exports the correct component name.
  - `_components/message-list.tsx` and `_components/chat-window.tsx` are identical to core versions.

#### [VERIFY] Announcements page parity — [announcements/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/announcements/page.tsx)

- The file already exists. Verify `_components/` directory is complete. Note: `columns.test.tsx`
  is present in core but **missing** from sentinel-support.

#### [NEW] `columns.test.tsx` in sentinel-support announcements

- [x] Copy `app/sentinel-core/src/app/(protected)/announcements/_components/columns.test.tsx`
  to `app/sentinel-support/src/app/(protected)/announcements/_components/columns.test.tsx`
- [x] Update any import paths that reference core-specific utilities

**Test Tasks:**
- [x] Verify/write `app/sentinel-support/src/app/(protected)/announcements/_components/columns.test.tsx`
  asserting column definitions render correct headers and cell values
- [x] Run `pnpm --dir app/sentinel-support test` — confirm no regressions

**Migration required:** No — no schema changes.

---

### Phase 2 — Fix Sidebar Rendering Performance Lag

**Goal:** Eliminate the visible delay before sidebar management items appear by removing the
blocking `useUser` / `isLoading` gate from `ProtectedLayout` and replacing it with a
non-blocking skeleton strategy.

**Root cause:**
[`layout.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/layout.tsx)
gates the **entire layout** (including sidebar) behind `useUser().isLoading`. This means the
sidebar is not rendered at all until the Supabase auth call resolves, causing the visual delay.
On sentinel-core, the layout does not block on `isLoading` in the same way — the profile dropdown
handles its own loading state via `DashboardProfileDropdownFallback`.

---

#### [MODIFY] [layout.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/layout.tsx)

- Remove the `if (isLoading) return <spinner>` guard that prevents the sidebar from rendering.
- Render `SidebarProvider` + `SuperAdminSidebar` + `SupportHeader` immediately.
- Push user-dependent loading state down into child components.

**Tasks:**
- [x] In `app/sentinel-support/src/app/(protected)/layout.tsx`, remove the `isLoading` early-return
  block (current lines 11–17).
- [x] Remove the `useUser` import and hook call if no longer needed in the layout; confirm that
  auth protection is handled exclusively by `proxy.ts` middleware (RBAC redirect is done server-side).
- [x] Verify that `SupportHeader` → `DashboardProfileDropdown` (loaded via `next/dynamic` with
  `loading: () => <DashboardProfileDropdownFallback />`) already handles the loading state.
- [x] Verify sidebar items are all static constants and do not depend on auth state.

**Test Tasks:**
- [x] Add `app/sentinel-support/src/app/(protected)/layout.test.tsx` — test that the layout renders
  the sidebar and header immediately without waiting for auth, mirroring `layout.test.tsx` in
  sentinel-core's `(protected)` route.
- [x] Run `pnpm --dir app/sentinel-support test` to confirm all tests pass.

**Migration required:** No — no schema or API changes.

---

### Phase 3 — Fix Avatar Not Showing in `UserSearchBar` (sentinel-support)

**Goal:** Display the correct profile picture avatar in the `UserSearchBar` search results and
recent searches on sentinel-support, matching the behaviour on sentinel-core.

**Root cause investigation:**

The two `user-search-bar.tsx` files are **byte-for-byte identical** (both 13,627 bytes), so the
bug is upstream. The likely candidates are:

1. **API auth context difference:** The support app uses `storageKey: 'sentinel-support-auth'`
   in `proxy.ts`, whereas the API client in packages relies on the Supabase session cookie. If
   the session cookie is not forwarded correctly to the client-side API call, the `/users` endpoint
   may return users without `avatar_url`.

2. **`next.config.ts` image domain:** Both apps already whitelist `*.supabase.co` and
   `lh3.googleusercontent.com`. The `user-search-bar.tsx` uses plain `<img>` tags (not Next
   `<Image>`), so this is ruled out.

3. **`getAvatarFromMetadata` fallback:** `formatUserRecord` checks
   `record.avatar_url ?? getAvatarFromMetadata(record.raw_user_meta_data)`. If the `/users` GET
   returns `avatar_url: null` and `raw_user_meta_data` doesn't contain `avatar_url`/`picture`
   for support-context requests, the field will be `null`.

4. **`localStorage` stale data:** Recent searches are persisted to `localStorage` as plain JSON.
   If an earlier version of the code stored users without `avatarUrl`, the `recentSearches` array
   will show initials instead of images until the user is re-searched. This is likely the cause
   for the recent-searches panel and can be fixed with a migration/versioning guard.

---

#### [INVESTIGATE] API `/users` endpoint

- [x] Confirm `formatUserRecord` in
  `app/sentinel-api/src/modules/identity/users/data/get-users/get-users.formatters.ts`
  maps `avatar_url` correctly — verify the SQL query in `get-users` selects
  `auth.users.avatar_url` or `raw_user_meta_data` for all auth contexts.
- [x] Add a temporary `console.log` or unit test assertion in
  `packages/hooks/src/query/users/use-user-search.ts` to confirm `avatarUrl` is non-null in the
  API response when the user has a profile picture on sentinel-core.

#### [MODIFY] [user-search-bar.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/common/user-search-bar.tsx)

- [x] Add a `localStorage` version key (`sentinel_recent_searches_v2`) to invalidate stale cached
  entries that were persisted without `avatarUrl`. In `addRecentSearch`, write to the new key; in
  `useEffect`, read from the new key and discard the old one.
- [x] Confirm `recentUser.avatarUrl` is preserved correctly before calling `addRecentSearch()`.
- [x] If the API bug is confirmed, surface a fallback: when `user.avatarUrl` is `null` but the
  raw API response contains `avatar_url`, map it explicitly in the `recentUser` object.

**Test Tasks:**
- [x] Create `app/sentinel-support/src/components/common/user-search-bar.test.tsx`:
  - Assert that when `avatarUrl` is provided, an `<img>` element is rendered in search results.
  - Assert that when `avatarUrl` is `null`, the initials fallback div is rendered.
  - Assert that `addRecentSearch` stores `avatarUrl` in the new versioned `localStorage` key.
- [x] Update `packages/hooks/src/query/users/use-user-search.test.ts` to assert the hook returns
  `avatarUrl` in user objects.
- [x] Run `pnpm --dir app/sentinel-support test` and `pnpm test` to confirm all tests pass.

**Migration required:** No — the `avatar_url` column already exists in the DB schema.

---

## Verification Plan

### Automated Tests

```bash
# Run sentinel-support tests
pnpm --dir app/sentinel-support test

# Run shared hooks tests
pnpm --dir packages/hooks test

# Run full monorepo test suite
pnpm test
```

### Manual Verification

1. **Phase 1 — Sidebar Navigation:**
   - Log in as a `support` role user.
   - Confirm **Messages** and **Announcements** appear under the Communication section in the sidebar.
   - Click each link; confirm the page loads without errors.
   - Visually compare the Messages and Announcements pages to their sentinel-core counterparts for
     UI parity.

2. **Phase 2 — Sidebar Performance:**
   - Hard-refresh the support portal.
   - Confirm the sidebar skeleton/icons appear immediately, without a blank period before
     management items render.
   - Compare load feel with sentinel-core sidebar (which does not block on `isLoading`).

3. **Phase 3 — Avatar Fix:**
   - In the support portal header, click the search bar and search for a user who has a profile
     picture (e.g. via Google OAuth).
   - Confirm the avatar image renders in the search results list.
   - Select that user to add them to recent searches; re-open the search bar and confirm the avatar
     appears in the People row.
   - Confirm the same user's avatar still renders correctly on sentinel-core (no regression).
