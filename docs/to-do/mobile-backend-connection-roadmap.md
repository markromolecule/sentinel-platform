# Sentinel Mobile ↔ Backend Connection Roadmap

> **Architect Note:** This document is the production-ready implementation roadmap for connecting `sentinel-mobile` to the shared `supabase` and `sentinel-api` backend — mirroring the `sentinel-web` student experience on native iOS/Android.

---

## Background & Context

`sentinel-mobile` currently runs entirely on **mock/static data** (`/data/*.ts`). The `sentinel-web` app is fully wired to the real backend via:

- `@sentinel/services` → `createApiClient` (authenticated HTTP client)
- `@sentinel/hooks` → `AuthProvider`, `ApiProvider`, all shared query/mutation hooks
- Supabase for session management and auth state

The mobile app **already has** partial scaffolding:

- `lib/supabase.ts` — **empty file** (no client initialized)
- `data/classrooms.ts` — mock data only
- `app/(auth)/login.tsx` — UI present but `onSubmit` is a `console.log` stub
- `app/_layout.tsx` — no `QueryClientProvider`, `AuthProvider`, or `ApiProvider`

The shared `@sentinel/hooks` package already exports `AuthProvider`, `ApiProvider`, `useLoginMutation`, `useLogoutMutation`, `useSignUpMutation`, and `useClassroomsQuery` — all reusable on mobile without modification.

---

## 3 Viable Options

### Option A — Gradual Adapter Layer

Build a mobile-specific adapter in `sentinel-mobile/lib/` that wraps the shared providers. Migrate screens one by one from mock data to live hooks. Keep mock data as fallbacks during transition.

**Pros:** Low disruption, safe rollback.  
**Cons:** Leaves mock data in the codebase, risks inconsistency between screens.

### Option B — Full Provider Integration (Shared-First) ✅ RECOMMENDED

Wire `AuthProvider`, `ApiProvider`, and `QueryClientProvider` directly into `_layout.tsx` — exactly mirroring how `sentinel-web/providers.tsx` works. Then replace mock data usage in screens with the shared hooks from `@sentinel/hooks`.

**Pros:** Maximum code reuse, single source of truth, future features come for free, cleanest architecture.  
**Cons:** More upfront work. Requires `@sentinel/hooks` and `@sentinel/services` to be listed as workspace dependencies in `sentinel-mobile/package.json`.

### Option C — Duplicate Data Layer

Copy API calls from `@sentinel/services` directly into mobile-specific data files. No shared hooks.

**Pros:** No cross-package coupling.  
**Cons:** Violates DRY, causes double-maintenance burden, defeats the monorepo model entirely. **NOT recommended.**

---

## Recommendation: Option B — Full Provider Integration

This is the correct approach for a monorepo. The shared hooks package was specifically designed for reuse across `sentinel-web` and `sentinel-mobile`. Option B is the only approach that fulfills the stated goal: _"use the same backend as sentinel-web... since we are using a monorepo structure."_

---

## Implementation Roadmap

---

### Milestone 0 — Prerequisites & Environment

- [x] Verify `@sentinel/hooks` and `@sentinel/services` are listed in `sentinel-mobile/package.json` dependencies as workspace packages (e.g. `"@sentinel/hooks": "workspace:*"`)
- [x] Verify `@tanstack/react-query` is listed in `sentinel-mobile/package.json`
- [x] Create `app/sentinel-mobile/.env` with the required environment variables:
    - `EXPO_PUBLIC_API_URL` (pointing to `sentinel-api`, e.g. `http://localhost:3001`)
    - `EXPO_PUBLIC_SUPABASE_URL`
    - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [x] Cross-check `.env` keys against `app/sentinel-api/.env.example` and `app/sentinel-web/.env.example` to ensure consistency
- [x] Run `pnpm install` from monorepo root to link workspace packages

---

### Milestone 1 — Supabase Client

> **File:** `app/sentinel-mobile/lib/supabase.ts`

- [x] Implement the Supabase client for React Native using `@supabase/supabase-js` with `AsyncStorage` as the session persistence layer (replaces `localStorage` which is web-only)
- [x] Use `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `process.env`
- [x] Add `react-native-async-storage/async-storage` to `sentinel-mobile/package.json` if not present, and run `pnpm install`

**Expected shape:**

```ts
// lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    },
);
```

---

### Milestone 2 — API Client

> **File:** `app/sentinel-mobile/lib/api-client.ts` _(new file)_

- [x] Create `lib/api-client.ts` that instantiates `createApiClient` from `@sentinel/services`
- [x] `getToken` must read the session from the Supabase client created in Milestone 1
- [x] Use `EXPO_PUBLIC_API_URL` for `baseUrl`

**Expected shape:**

```ts
// lib/api-client.ts
import { createApiClient } from '@sentinel/services';
import { supabase } from './supabase';

export const apiClient = createApiClient({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
    getToken: async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session?.access_token;
    },
});
```

---

### Milestone 3 — Root Provider Setup

> **File:** `app/sentinel-mobile/app/_layout.tsx`

- [x] Import `QueryClient`, `QueryClientProvider` from `@tanstack/react-query`
- [x] Import `AuthProvider`, `ApiProvider` from `@sentinel/hooks`
- [x] Import `supabase` from `@/lib/supabase`
- [x] Import `apiClient` from `@/lib/api-client`
- [x] Wrap the root `<Stack>` with `QueryClientProvider → AuthProvider → ApiProvider` (in that order, mirroring `sentinel-web/providers.tsx`)
- [x] Do NOT add `'use client'` — this is React Native, not Next.js
- [x] Keep `GestureHandlerRootView` and `SafeAreaProvider` as outermost wrappers

**Note:** The `AuthProvider` from `@sentinel/hooks` has `'use client'` at the top. This is fine — React Native ignores that directive. Confirm this compiles correctly; if not, a mobile-specific thin wrapper may be needed (create `lib/providers/auth-provider-mobile.tsx` that strips the directive via re-export).

---

### Milestone 4 — Auth: Login Screen

> **File:** `app/sentinel-mobile/app/(auth)/login.tsx`

- [x] Import `useLoginMutation` from `@sentinel/hooks`
- [x] Replace the `onSubmit` stub (`console.log(data)`) with a real call to `loginMutation.mutate(data)`
- [x] Handle `onSuccess`: navigate to `/(tabs)/classroom` using `router.replace`
- [x] Handle `onError`: display error message to the user (use a state variable + `<Text>` component)
- [x] Show a loading indicator on the Sign In button while `loginMutation.isPending` is true
- [x] After login, the `AuthProvider` will automatically sync the session via `supabase.auth.onAuthStateChange`

---

### Milestone 5 — Auth: Registration Screen

> **File:** `app/sentinel-mobile/app/(auth)/register.tsx`

- [x] Import `useSignUpMutation` from `@sentinel/hooks`
- [x] Replace any mock submission logic with `signUpMutation.mutate(credentials)`
- [x] Handle `onSuccess`: navigate to a success/verification screen or `/(auth)/login`
- [x] Handle `onError`: display user-friendly error message
- [x] Show loading state during `signUpMutation.isPending`

---

### Milestone 6 — Auth Guard (Index / Splash Screen)

> **File:** `app/sentinel-mobile/app/index.tsx`

- [x] Import `useAuth` from `@sentinel/hooks`
- [x] Replace the hardcoded `router.replace('/(tabs)/classroom')` timeout with a real auth check:
    - If `isLoading` → show splash/loading indicator
    - If `user` exists → `router.replace('/(tabs)/classroom')`
    - If no `user` → `router.replace('/(auth)/login')`
- [x] Remove the hardcoded 500ms `setTimeout` redirect
- [x] This ensures unauthenticated users can never reach the main tabs

---

### Milestone 7 — Classrooms: Live Data

> **Files:** `app/sentinel-mobile/app/(tabs)/classroom/index.tsx`

- [x] Import `useClassroomsQuery` from `@sentinel/hooks`
- [x] Remove any import of `mockClassrooms` from `@/data/classrooms`
- [x] Destructure `{ data, isLoading, isError, refetch }` from the query
- [x] Replace the mock array rendering with the real data from `data?.data` (match the `ApiResponse<T>` shape)
- [x] Handle `isLoading` state with a skeleton/loading component
- [x] Handle `isError` state with a retry UI
- [x] Wire `refetch` to the existing pull-to-refresh `RefreshControl`
- [ ] Delete `app/sentinel-mobile/data/classrooms.ts` once no longer referenced

---

### Milestone 8 — Classroom Detail: Live Data

> **File:** `app/sentinel-mobile/app/(tabs)/classroom/[id]/index.tsx` (or wherever the detail screen lives)

- [x] Import `useClassroomQuery` from `@sentinel/hooks`
- [x] Pass the route param `id` to the query: `useClassroomQuery({ id })`
- [x] Replace mock classroom detail data with live response
- [x] Handle loading and error states

---

### Milestone 9 — Logout

> **Location:** Profile screen or relevant navigation header

- [x] Import `useLogoutMutation` from `@sentinel/hooks`
- [x] Wire logout button's `onPress` to `logoutMutation.mutate()`
- [x] On `onSuccess`: navigate to `/(auth)/login` using `router.replace`
- [x] React Query cache is automatically cleared by `useLogoutMutation`

---

### Milestone 10 — Cleanup & Removal of Mock Data

- [x] Delete `app/sentinel-mobile/data/classrooms.ts` (confirmed no usages)
- [x] Audit `data/onboarding.ts`, `data/calendar.ts`, `data/exams.ts`, `data/history.ts`, `data/questions.ts` — decide which are still needed vs. replaceable with shared hooks
- [x] Check if `@sentinel/hooks` already exposes query hooks for these entities (exams, history, etc.) and create a migration plan for each

---

## Data Layer Evaluation

| Entity     | Mobile Mock File     | Shared Hook Available                        | Action           |
| ---------- | -------------------- | -------------------------------------------- | ---------------- |
| Classrooms | `data/classrooms.ts` | ✅ `useClassroomsQuery`, `useClassroomQuery` | Deleted          |
| Exams      | `data/exams.ts`      | ✅ `packages/hooks/src/query/exams/`         | Replace + Delete |
| History    | `data/history.ts`    | ✅ `packages/hooks/src/query/history/`       | Replace + Delete |
| Calendar   | `data/calendar.ts`   | ❌ Not found in `packages/hooks/src/query/`  | Keep for now     |
| Onboarding | `data/onboarding.ts` | ✅ `packages/hooks/src/query/onboarding/`    | Replace + Delete |
| Questions  | `data/questions.ts`  | ✅ `packages/hooks/src/query/questions/`     | Replace + Delete |

> **No schema changes are required.** The database schema and API are already serving `sentinel-web`. This work is purely a client-side wiring exercise.

---

## Testing Strategy

### Automated Tests

- [ ] Unit test `lib/supabase.ts` — verify client instantiates without throwing (mock env vars)
- [ ] Unit test `lib/api-client.ts` — verify `getToken` returns `access_token` from a mocked supabase session
- [ ] Integration test `useLoginMutation` flow on mobile — mock the `api('/auth/login')` call, verify session sync and navigation
- [ ] Integration test auth guard in `index.tsx` — mock `useAuth` states (loading, authenticated, unauthenticated) and assert correct navigation

### Manual QA Checklist

- [ ] **Login flow**: Enter valid credentials → verify user reaches `/(tabs)/classroom` with real classroom data loaded
- [ ] **Login error**: Enter invalid credentials → verify error message appears, no crash
- [ ] **Registration flow**: Register a new test account → verify user is redirected appropriately
- [ ] **Session persistence**: Kill and reopen the app → verify user remains logged in (AsyncStorage session restored)
- [ ] **Logout**: Tap logout → verify user returns to `/(auth)/login` and classroom data is cleared from cache
- [ ] **Auth guard**: Clear AsyncStorage manually → reopen app → verify redirect to login, not classroom
- [ ] **Classroom data**: Verify live subjects match those shown on `sentinel-web` for the same account
- [ ] **Pull-to-refresh**: Pull down on classroom list → verify fresh data fetched from API

---

## Risk & Dependency Notes

> [!IMPORTANT]
> `@sentinel/hooks/auth-provider.tsx` has `'use client'` at the top. While React Native ignores this directive, confirm the Metro bundler does not error on it. If it does, create a thin re-export wrapper file in `sentinel-mobile/lib/providers/` that imports and re-exports `AuthProvider` without the directive — this is a one-line workaround.

> [!WARNING]
> `@react-native-async-storage/async-storage` must be installed. Supabase requires an explicit `storage` adapter on React Native — the default `localStorage` does not exist in RN environments. Without this, sessions will not persist between app launches.

> [!NOTE]
> The `createApiClient` function in `@sentinel/services` uses the standard `fetch` API, which is available globally in React Native (Expo). No polyfills are needed.
