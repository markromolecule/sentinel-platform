# Header Improvements — June 6, 2026

**Summary:** Redesign the search bar in `sentinel-web` headers to an always-visible centered search bar, fix the static "Support Portal" / "sentinel-core" institution label to be dynamically fetched, resolve the profile dropdown full-name bug (returns "user" instead of the real name) in `sentinel-core` and `sentinel-support`, and replace the initials avatar with a real profile picture (from Supabase OAuth `avatar_url`) across all three apps.

---

## Viable Options Analysis (per 1-3-1 rule)

### Problem A — Search bar redesign (sentinel-web)

**Option 1 — Inline expanded search input in the header center**
Replace the icon-trigger popover with a visible `<input>`/`<div>` with a search icon placed via `absolute left-1/2 -translate-x-1/2` in the header flex container. Dropdown results appear below.
*Tradeoff: Simplest approach; no new components needed. May compete visually with student nav items at smaller widths.*

**Option 2 — Promoted CommandBar using `cmdk` + `Dialog`**
Open a full-screen/modal `CommandDialog` on click, pinned to center. The trigger in the header is a visual search bar placeholder (not interactive text).
*Tradeoff: Excellent UX (like Vercel/Linear). More complex; slightly more JSX.*

**Option 3 — Popover with `align="center"` + fixed trigger width**
Keep Popover pattern but make the trigger look like a wide centered search bar (width-constrained, rounded-full input style) and anchor with `align="center"`.
*Tradeoff: Lowest change surface (reuses existing Popover). Can look forced/narrow on mobile.*

✅ **Best: Option 1** — An inline visible search bar centered in the header is the clearest user expectation for "search bar at center of header". It aligns with how `StudentHeader` already does absolute centering for the nav. No new dependencies. Works across student and instructor headers consistently.

---

### Problem B — Static institution label (sentinel-support / sentinel-core)

**Option 1 — Switch fallback label to empty string / spinner**
When `isLoading`, show nothing or a skeleton. When loaded, show `profile.institution`. Eliminates "Support Portal" static text for support, and the static label bug in core.
*Tradeoff: Clean but loses context during load. `sentinel-support` has a test asserting the "Support Portal" fallback — test must be updated.*

**Option 2 — Keep "Support Portal" / "Sentinel Core" as loading fallback only**
Show static label while loading, then replace with institution name once `profile.institution` is available.
*Tradeoff: Slightly more text to maintain. More user-friendly (less layout shift). Keeps existing behavior intentional — support header already does this but the condition is buggy for core.*

**Option 3 — Add a dedicated `useInstitutionLabel` hook**
Extract the label-resolution logic into a shared hook that returns the right label based on loading state and role.
*Tradeoff: Over-engineered for 3 headers; violates "no new dependencies unless strictly necessary" rule.*

✅ **Best: Option 2** — Keep static label as the loading/fallback state only. `sentinel-core` superadmin and admin headers already correctly use `useProfileQuery`, but the `DashboardProfileDropdown` (shared between admin/superadmin) uses `useUser` (Supabase metadata) which may lack the `institution` field. The support header already has the right conditional but needs a bug fix to ensure the loading skeleton shows a proper fallback. Minimal change surface.

---

### Problem C — Profile dropdown full name bug (sentinel-core / sentinel-support)

**Option 1 — Switch from `useUser` → `useProfileQuery` in `DashboardProfileDropdown`**
Replace the `useUser` hook (which reads `user_metadata?.firstName || 'User'`) with `useProfileQuery`, which returns the full profile object from the Sentinel API (real `firstName`, `lastName`, `avatarUrl`).
*Tradeoff: Most complete fix; gets real data. Adds a network call if not already cached.*

**Option 2 — Patch `useUser` to read from Supabase `user.identities` provider data**
For Google OAuth users, the name is in `user.identities[0].identity_data.full_name`. Extract and parse it.
*Tradeoff: Brittle — depends on Supabase identity structure; doesn't help non-OAuth users with stale metadata.*

**Option 3 — Populate `user_metadata` on auth in the API**
Update the `onAuthStateChange` or login flow to sync `firstName`/`lastName` from the DB to Supabase `user_metadata`.
*Tradeoff: Systemic fix but involves the API and Supabase admin calls — out of scope for a header bug fix.*

✅ **Best: Option 1** — The `useProfileQuery` hook is already used in many `sentinel-core` pages and returns authoritative data. Switching the `DashboardProfileDropdown` in both `sentinel-core` and `sentinel-support` from `useUser` to `useProfileQuery` is the cleanest, most consistent fix with the existing data layer.

---

### Problem D — Profile avatar from Supabase (all headers)

**Option 1 — Read `avatarUrl` from `useProfileQuery().profile` and render `<Image>`**
The `User` type already exposes `avatarUrl?: string | null`. The DB schema has `avatar_url String?`. Render a `<next/image>` inside the avatar trigger with fallback to initials if `avatarUrl` is null.
*Tradeoff: Zero new data layer work; all data already in the API response. One consistent change across all dropdowns.*

**Option 2 — Read `user.identities[0].identity_data.avatar_url` from Supabase auth**
For Google OAuth users, the picture URL is in Supabase identity data on the client without a network call.
*Tradeoff: Only works for Google OAuth; fails for email/password users.*

**Option 3 — Add a dedicated `useAvatarUrl` hook combining both sources**
Fall back from DB `avatarUrl` to Supabase identity `avatar_url`.
*Tradeoff: Over-engineered for the current scope; adds complexity without clear benefit.*

✅ **Best: Option 1** — `useProfileQuery` already returns `avatarUrl` from the Sentinel API (which handles the OAuth picture sync via the DB column `avatar_url`). Render it in all profile dropdown avatar trigger `<div>`s with `<next/image>` and a graceful initials fallback.

---

## Pre-Planning Checklist

- [x] Task summarized
- [x] Relevant source files scanned
- [x] All files, services, and DB tables identified
- [x] Migration determination: **No migration required** — `avatar_url` column already exists in `packages/db/prisma/schema.prisma` under the `User` model, and `avatarUrl` is already in the `User` type in `packages/shared/src/types/index.ts`.

---

## Files Touched

| File | App | Change |
|---|---|---|
| `app/sentinel-web/src/components/common/user-search-bar.tsx` | web | Redesign: visible centered search bar input |
| `app/sentinel-core/src/components/common/user-search-bar.tsx` | core | Same redesign for consistency |
| `app/sentinel-support/src/components/common/user-search-bar.tsx` | support | Same redesign for consistency |
| `app/sentinel-web/src/components/sidebar/instructor/instructor-header.tsx` | web | Reposition search bar to center slot |
| `app/sentinel-web/src/components/sidebar/student/StudentHeader.tsx` | web | Reposition search bar to center slot |
| `app/sentinel-core/src/components/sidebar/admin/admin-header.tsx` | core | Reposition search bar to center slot |
| `app/sentinel-core/src/components/sidebar/superadmin/superadmin-header.tsx` | core | Add centered search bar (currently missing) |
| `app/sentinel-support/src/components/sidebar/support/support-header.tsx` | support | Fix static fallback, reposition search bar |
| `app/sentinel-web/src/components/sidebar/instructor/instructor-profile-dropdown.tsx` | web | Add avatar image with initials fallback |
| `app/sentinel-web/src/components/sidebar/student/StudentHeader.tsx` | web | Add avatar image with initials fallback (inline dropdown) |
| `app/sentinel-core/src/components/sidebar/common/dashboard-profile-dropdown.tsx` | core | Switch to `useProfileQuery`, add avatar |
| `app/sentinel-support/src/components/sidebar/common/dashboard-profile-dropdown.tsx` | support | Switch to `useProfileQuery`, add avatar |
| `app/sentinel-web/src/components/sidebar/instructor/instructor-profile-dropdown.test.tsx` | web | Add avatar render tests |
| `app/sentinel-core/src/components/sidebar/common/core-dashboard-profile-dropdown.test.tsx` | core | Update mocks, add full-name & avatar tests |
| `app/sentinel-support/src/components/sidebar/support/support-header.test.tsx` | support | Update to cover fixed institution label |
| `app/sentinel-web/src/components/sidebar/student/student-header.test.tsx` | web | Add tests for avatar & full name |

---

## Phase 1: Redesign Search Bar to Centered Visible Input

**Goal:** Replace the icon-only popover trigger with a centered visible search bar in the header across all apps.

**Context:**
- Current `UserSearchBar` renders a ghost icon `<Button>` that opens a `<Popover>` with a `<Command>`. The trigger is placed in the right-side action group.
- Goal is to render a clickable/focused input that is **centered in the header** (matching how `StudentHeader` centers its nav with `absolute left-1/2 -translate-x-1/2`).
- The popover-based search results UX can be retained; only the trigger must change to a full visible search bar input style.

### Tasks

- [x] Modify `app/sentinel-web/src/components/common/user-search-bar.tsx`
  - Replace the `<Button variant="ghost" size="icon">` trigger with a full search bar `<div>` styled as `flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground cursor-pointer w-48 md:w-64`
  - Retain the `<Search className="h-4 w-4" />` icon inside the div on the left
  - Add a `<span>Search users...</span>` placeholder text
  - Keep `<PopoverContent>` and `<Command>` internals unchanged
  - Add a `className?: string` prop to `UserSearchBarProps` interface to allow per-call overrides

- [x] Modify `app/sentinel-core/src/components/common/user-search-bar.tsx`
  - Apply the same trigger redesign as above

- [x] Modify `app/sentinel-support/src/components/common/user-search-bar.tsx`
  - Apply the same trigger redesign as above

- [x] Modify `app/sentinel-web/src/components/sidebar/instructor/instructor-header.tsx`
  - Remove `<UserSearchBar>` from the right-side `<div className="flex items-center gap-4">`
  - Add an absolutely centered slot: `<div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">` containing `<UserSearchBar redirectPath="/instructor/messages" />`

- [x] Modify `app/sentinel-web/src/components/sidebar/student/StudentHeader.tsx`
  - Remove `<UserSearchBar redirectPath="/student/message" />` from the right actions `<div>`
  - Replace the existing `<nav className="absolute left-1/2 ...">` center slot with a two-part center: nav links on the left and the search bar on the right of the center region — or place `<UserSearchBar>` directly in the center absolute slot below the nav on `md:` breakpoint
  - Preferred: keep the nav in the center, place `<UserSearchBar>` as a new absolute center element visible only on `md:` and shift it to `right-1/4` or use a flex group in the center

- [x] Modify `app/sentinel-core/src/components/sidebar/admin/admin-header.tsx`
  - Remove `<UserSearchBar>` from right group
  - Add centered absolute slot `<div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">` with `<UserSearchBar redirectPath="/messages" />`

- [x] Modify `app/sentinel-core/src/components/sidebar/superadmin/superadmin-header.tsx`
  - Add import for `UserSearchBar` from `@/components/common/user-search-bar`
  - Add centered absolute slot with `<UserSearchBar redirectPath="/messages" />`
  - (SuperAdmin header currently has no search bar — add it here for parity)

- [x] Modify `app/sentinel-support/src/components/sidebar/support/support-header.tsx`
  - Remove `<UserSearchBar>` from right group
  - Add centered absolute slot `<div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">` with `<UserSearchBar redirectPath="/messages" />`

- [x] Write Vitest tests in `app/sentinel-web/src/components/common/user-search-bar.test.tsx`
  - Add test: renders search bar with placeholder text "Search users..."
  - Add test: renders as a visible element (not hidden behind icon)

**Migration required:** No

---

## Phase 2: Fix Institution Label — Dynamic Fetch in sentinel-support and sentinel-core

**Goal:** The `sentinel-support` `SupportHeader` and `sentinel-core` `SuperAdminHeader` / `AdminHeader` must show the user's institution name fetched from `useProfileQuery`, not a static string. The static fallback is only shown while loading.

**Context:**
- `sentinel-support/support-header.tsx`: Has a conditional `profile?.institution ? … : 'Support Portal'`. However, it falls through to "Support Portal" even when loaded if the `support` role user doesn't have `institution` in their profile. The fix is to only show "Support Portal" during loading, and show `profile.institution` (or nothing if genuinely absent) when loaded.
- `sentinel-core` admin/superadmin headers: Already use `useProfileQuery` and show `profile?.institution`. These look correct already — but tests should be added to confirm.
- **No sentinel-core institution label regression** — both admin and superadmin headers currently display `profile.institution` correctly; verify with tests.

### Tasks

- [x] Modify `app/sentinel-support/src/components/sidebar/support/support-header.tsx`
  - Change the conditional logic from: `profile?.institution ? (show it) : (show 'Support Portal')` to: `isLoading ? (show 'Support Portal') : profile?.institution ? (show it) : null`
  - This ensures "Support Portal" only appears while loading (skeleton behavior), and disappears when loaded if the support user has no institution (edge case)

- [x] Update `app/sentinel-support/src/components/sidebar/support/support-header.test.tsx`
  - Add test: shows nothing (or no institution span) when loaded but `profile.institution` is absent/null
  - Keep existing tests (loading shows "Support Portal"; loaded with institution shows institution name)

- [x] Verify `app/sentinel-core/src/components/sidebar/superadmin/superadmin-header.tsx` — institution display is correct (already `useProfileQuery` + conditional)
  - Write a new test file `app/sentinel-core/src/components/sidebar/superadmin/superadmin-header.test.tsx`
  - Test: renders institution name when profile loaded
  - Test: renders nothing for institution when loading

- [x] Verify `app/sentinel-core/src/components/sidebar/admin/admin-header.tsx` — same as superadmin
  - Write a new test file `app/sentinel-core/src/components/sidebar/admin/admin-header.test.tsx`
  - Test: renders institution name when profile loaded
  - Test: renders nothing for institution when loading

**Migration required:** No

---

## Phase 3: Fix Profile Dropdown Full Name — Replace `useUser` with `useProfileQuery`

**Goal:** Both `sentinel-core` and `sentinel-support` `DashboardProfileDropdown` components currently resolve the user's name from `user.user_metadata?.firstName || 'User'`, which returns "User" when `user_metadata` is not populated (email/password login or stale metadata). Switch to `useProfileQuery` which fetches the authoritative name from the Sentinel API.

**Context:**
- `sentinel-core/src/components/sidebar/common/dashboard-profile-dropdown.tsx`: uses `useUser` → `user.user_metadata?.firstName || 'User'`
- `sentinel-support/src/components/sidebar/common/dashboard-profile-dropdown.tsx`: identical
- `useProfileQuery()` returns `{ profile: User | null, isLoading: boolean }` where `profile.firstName` and `profile.lastName` are from the DB
- The `DashboardProfileDropdown` needs to:
  1. Import and call `useProfileQuery` from `@sentinel/hooks`
  2. Remove import of `useUser` from `@/hooks/use-user`
  3. Derive `firstName`, `lastName`, `email` from `profile` (not `user.user_metadata`)
  4. Guard with `isLoading` and show `<DashboardProfileDropdownFallback />` during load

### Tasks

- [x] Modify `app/sentinel-core/src/components/sidebar/common/dashboard-profile-dropdown.tsx`
  - Remove `import { useUser } from '@/hooks/use-user'`
  - Add `import { useProfileQuery } from '@sentinel/hooks'`
  - Replace `const { data: user } = useUser()` with `const { profile, isLoading } = useProfileQuery()`
  - Replace `if (!user) return null` with `if (isLoading) return <DashboardProfileDropdownFallback />`
  - Replace `const firstName = user.user_metadata?.firstName || 'User'` with `const firstName = profile?.firstName ?? ''`
  - Replace `const lastName = user.user_metadata?.lastName || ''` with `const lastName = profile?.lastName ?? ''`
  - Replace `const email = user.email || ''` with `const email = profile?.email ?? ''`
  - Guard: if `!profile` (loaded but no profile), also return `null`
  - Add JSDoc on the `DashboardProfileDropdown` function

- [x] Modify `app/sentinel-support/src/components/sidebar/common/dashboard-profile-dropdown.tsx`
  - Apply identical changes as the `sentinel-core` version above

- [x] Update `app/sentinel-core/src/components/sidebar/common/core-dashboard-profile-dropdown.test.tsx`
  - Replace `useUser` mock with `useProfileQuery` mock from `@sentinel/hooks`
  - Update test data to use `{ profile: { firstName: 'Admin', lastName: 'User', email: '...' }, isLoading: false }`
  - Add test: renders `<DashboardProfileDropdownFallback />` when `isLoading` is true
  - Add test: renders initials `'AU'` from `profile.firstName[0] + profile.lastName[0]`
  - Add test: renders full name `'Admin User'` in dropdown label

- [x] Write new test file `app/sentinel-support/src/components/sidebar/common/dashboard-profile-dropdown.test.tsx`
  - Mirror the same test structure as `core-dashboard-profile-dropdown.test.tsx`
  - Mock `useProfileQuery` from `@sentinel/hooks`, `useLogoutMutation`, `next-themes`, `next/navigation`
  - Add test: loading state renders fallback
  - Add test: loaded state renders initials and full name

**Migration required:** No

---

## Phase 4: Show Profile Picture / Avatar from Supabase in All Headers

**Goal:** Replace the initials-only avatar `<div>` in every profile dropdown trigger across `sentinel-web`, `sentinel-core`, and `sentinel-support` with a `<next/image>` that displays the user's `avatarUrl` (from `profile.avatarUrl`), with graceful fallback to the colored initials div when `avatarUrl` is null or empty.

**Context:**
- `User.avatarUrl` is already typed in `packages/shared/src/types/index.ts`
- `avatar_url String?` already exists in `packages/db/prisma/schema.prisma`
- For Google OAuth users, Supabase populates `avatar_url` in the auth user metadata (the `picture` claim). This needs to be persisted to the DB `avatar_url` column on sign-up/login — this is likely already handled by the API's user-sync logic. **Verify** in `app/sentinel-api` before assuming.
- The trigger `<div>` in each dropdown is currently: `<div className="bg-primary ... rounded-full">{initials}</div>`
- Replace with: `profile.avatarUrl ? <Image src={profile.avatarUrl} ... /> : <div className="... initials" />`

### Tasks

- [ ] Verify in `app/sentinel-api/src` that `avatar_url` is persisted from Supabase OAuth `user.user_metadata.avatar_url` or `user.identities[0].identity_data.picture` on user creation/sync
  - Search: `grep -r "avatar_url\|picture" app/sentinel-api/src --include="*.ts"` 
  - If **not** persisted: add `avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null` to the user-upsert/create call in the relevant service
  - If **already** persisted: no API change needed — document it in a `<!-- NOTE: -->` comment

- [ ] Modify `app/sentinel-web/src/components/sidebar/instructor/instructor-profile-dropdown.tsx`
  - Import `Image` from `next/image`
  - Replace the `<div className="bg-primary ... rounded-full">{initials}</div>` trigger with:
    ```tsx
    <div className="relative h-8 w-8 cursor-pointer rounded-full overflow-hidden ...">
      {profile?.avatarUrl ? (
        <Image src={profile.avatarUrl} alt={`${profile.firstName} avatar`} fill className="object-cover" />
      ) : (
        <span className="... text-xs font-bold">{initials}</span>
      )}
    </div>
    ```
  - Apply the same pattern to `<InstructorProfileDropdownFallback />` — keep animate-pulse skeleton, no avatar

- [ ] Modify `app/sentinel-web/src/components/sidebar/student/StudentHeader.tsx`
  - Apply identical avatar/fallback pattern to the student dropdown trigger `<div>` (line ~161)
  - The `initials` and `profile` are already available in scope

- [ ] Modify `app/sentinel-core/src/components/sidebar/common/dashboard-profile-dropdown.tsx`
  - After Phase 3 changes, `profile` is available from `useProfileQuery`
  - Apply the same avatar/fallback pattern to the `<DropdownMenuTrigger>` content
  - Import `Image` from `next/image`

- [ ] Modify `app/sentinel-support/src/components/sidebar/common/dashboard-profile-dropdown.tsx`
  - Apply the same avatar/fallback pattern as the core version

- [ ] Configure `next.config` in `sentinel-core` and `sentinel-support` to allow external image domains for Supabase avatar URLs
  - Check existing `next.config.ts` / `next.config.js` for both apps
  - Add Supabase storage domain (e.g., `*.supabase.co`) to `images.remotePatterns` if not already present
  - Check `sentinel-web`'s config too — it may already have this

- [ ] Update `app/sentinel-web/src/components/sidebar/instructor/instructor-profile-dropdown.test.tsx`
  - Add test: renders `<img>` when `profile.avatarUrl` is provided
  - Add test: falls back to initials when `profile.avatarUrl` is null

- [ ] Update `app/sentinel-core/src/components/sidebar/common/core-dashboard-profile-dropdown.test.tsx`
  - Add test: renders `<img>` when `profile.avatarUrl` is provided

- [ ] Update `app/sentinel-support/src/components/sidebar/common/dashboard-profile-dropdown.test.tsx`
  - Add test: renders `<img>` when `profile.avatarUrl` is provided

- [ ] Update `app/sentinel-web/src/components/sidebar/student/student-header.test.tsx`
  - Add test: renders `<img>` with `profile.avatarUrl` in student dropdown
  - Add test: renders initials fallback when `avatarUrl` is null

**Migration required:** No — `avatar_url` column already exists in DB schema.

---

## Done Criteria

- [ ] All `UserSearchBar` triggers across all 3 apps are visible centered search-bar inputs, not icon-only buttons
- [ ] `sentinel-support` `SupportHeader` shows institution name when loaded; shows "Support Portal" only while loading
- [ ] `sentinel-core` admin and superadmin headers show institution name from `useProfileQuery` (verified with tests)
- [ ] `sentinel-core` and `sentinel-support` `DashboardProfileDropdown` shows real full name from `useProfileQuery`, not "User"
- [ ] All profile dropdown avatar triggers across all 3 apps render the `avatarUrl` image when available, initials otherwise
- [ ] All Vitest tests pass with `pnpm --dir app/sentinel-web test`, `pnpm --dir app/sentinel-core test`, `pnpm --dir app/sentinel-support test`
- [ ] No new dependencies introduced
- [ ] `next.config` image domains updated if Supabase URLs not already whitelisted

---

## Additional Considerations

- **No breaking API changes** — no new routes; only front-end hook/component changes.
- **No new `.env` variables** needed.
- **No migration rollback** needed — schema already has `avatar_url`.
- **`DashboardProfileDropdownFallback`** in both core and support must be updated to show a pulsing avatar shell (matches current behavior).
- **`next/image` domains**: If `*.supabase.co` or `lh3.googleusercontent.com` (Google photos) are not in `remotePatterns`, the image will throw a Next.js config error. Must be verified before Phase 4 implementation.
- **Student header center slot**: The student header already uses `absolute left-1/2 -translate-x-1/2` for the nav. Moving the search bar to center requires either grouping it with the nav or creating a second center absolute container at `md:` widths. A flex row `gap-4` with nav links + search bar in the same center container is cleanest.
- **Mobile behavior**: The centered search bar should be `hidden md:flex` — on mobile the icon-button behavior can be retained via a separate `<Button>` trigger for smaller screens if desired, or simply hidden (using existing mobile sheet menu).

---

## Reference Docs

- [System Overview](../../architecture/system-overview.md)
- [Agent Rules Overview](../../agents/rules-overview.md)
- [Agent Workflows Overview](../../agents/workflows-overview.md)
