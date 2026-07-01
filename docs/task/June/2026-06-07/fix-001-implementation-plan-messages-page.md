# Fix: Messages Page – sentinel-support

**Summary:** Fix three interconnected bugs on the `/messages` page in `sentinel-support`:

1. **Infinite loop / duplicate conversation creation** triggered by `?userId=` search-param `useEffect` due to an unstable `handleStartConversation` callback.
2. **Wrong conversations shown** — UI renders conversations that belong to other users because `participants[0]` is resolved before the `currentUserId` filter is applied safely.
3. **Messages not loading + conversation duplicating on UI** — the global Supabase realtime subscription (`messages:all:${user.id}`) invalidates queries the current user is not authorized for, causing repeated refetch failures and apparent duplicates in the list.

---

## Options Analysis (per 1-3-1 rule)

### Option A – Patch the page component only (simple/fast)

- Wrap `handleStartConversation` in `useCallback`, add a `hasRunRef` guard to the `useEffect`, and add client-side deduplication before rendering the conversation list.
- **Tradeoff**: Least invasive but only masks root causes; leaves realtime over-broadcasting in place.

### Option B – Fix page + realtime hook + guard conversations list (robust/recommended)

- Stabilize `handleStartConversation` with `useCallback`, add a `hasFiredRef` guard so the `?userId=` effect runs exactly once per navigation, fix the participant mapping logic, and tighten the `useMessageRealtime` global subscription so it only invalidates messages for conversations the current user owns.
- **Tradeoff**: Touches 3 files (page, hook, data layer) but fully eliminates all three bugs.

### Option C – Move deep-link resolution to a server action + query-key scoping

- Handle the `?userId=` redirect server-side in a Server Component and scope every realtime subscription by conversation ID.
- **Tradeoff**: Most correct long-term, but requires refactoring the page from `'use client'` to a hybrid layout which is a large scope change.

**Best Option: B** — it addresses all root causes with surgical edits, no new dependencies, and minimal surface area.

---

## Proposed Changes

### Phase 1 – Stabilize `handleStartConversation` & guard the `?userId=` deep-link effect

#### [MODIFY] page.tsx

`app/sentinel-support/src/app/(protected)/messages/page.tsx`

- [x] Import `useCallback` from React at the top of the file.
- [x] Wrap `handleStartConversation` in `useCallback` so its reference is stable across renders.
- [x] Add a `hasFiredDeepLinkRef = useRef(false)` guard inside the component to ensure the `?userId=` `useEffect` fires **once per page load**.
- [x] Update the `useEffect` dependency array to reference the stable `handleStartConversation` (already referenced, now won't cause a loop).
- [x] Set `hasFiredDeepLinkRef.current = true` after the effect body runs, and gate execution with `if (hasFiredDeepLinkRef.current) return`.
- [x] Write test: `page.test.tsx` — verify that calling the effect twice with the same `targetUserId` only calls `createDirectConversation` once.

**Migration required:** No — UI-only change.

---

### Phase 2 – Fix participant display logic (wrong user shown in conversation list)

#### [MODIFY] page.tsx

`app/sentinel-support/src/app/(protected)/messages/page.tsx`

- [x] In the `mappedConversations` mapping block, verify that `currentUserId` is always resolved before the sort — remove the `'user-1'` fallback that can cause wrong filtering while loading.
- [x] Ensure the `isLoading` guard at line 131 prevents rendering until both `profile` and `conversations` are available, so `currentUserId` is never a placeholder.
- [x] Add a defensive `if (!currentUserId) return null` early-return after the loading guard so conversations never render with placeholder user data.

#### [MODIFY] message-list.tsx

`app/sentinel-support/src/app/(protected)/messages/_components/message-list.tsx`

- [x] Add a safety guard: if `conversation.participants.length === 0`, skip rendering that conversation item instead of crashing on `participants[0].name`.
- [x] Write test: `message-list.test.tsx` — verify that a conversation with zero participants renders nothing, not a crash.

**Migration required:** No — UI-only change.

---

### Phase 3 – Fix realtime subscription to prevent unauthorized query invalidation

#### [MODIFY] use-message-realtime.ts

`packages/hooks/src/use-message-realtime.ts`

**Root cause:** The global `messages:all:${user.id}` Supabase channel subscribes to **all** `messages` table changes without a server-side filter by user. When another conversation's message is inserted, the hook fires `invalidateQueries` for that `conversationId`. If the current user is not a participant, the re-fetch returns a 403, but React Query keeps stale data in cache and the conversations list re-renders — making it appear as if a duplicate conversation appeared.

**Fix approach:**

- [x] In the `else` branch (global subscription, no `conversationId`), remove the `invalidateQueries` call for `MESSAGES_QUERY_KEYS.messages(payloadConversationId)` on arbitrary conversation IDs.
- [x] Only invalidate the conversations **list** (`MESSAGES_QUERY_KEYS.conversations()`), which re-fetches the server-filtered list (already filtered by `userId` in `getConversationsData`). This is safe and correct.
- [x] The specific conversation messages should only be invalidated when the hook is used **with a `conversationId`** — the targeted branch already does this correctly.
- [x] Add a JSDoc comment explaining the security rationale for not invalidating arbitrary conversation message caches.
- [x] Write test in `use-message-realtime.test.ts` — add a case verifying that a payload with an unknown `conversationId` does **not** trigger `invalidateQueries` for that specific message key when no `conversationId` is passed to the hook.

**Migration required:** No — hook-only change.

---

### Phase 4 – Add server-side regression tests & inline documentation

#### [MODIFY] get-conversations.ts

`app/sentinel-api/src/modules/general/messages/data/get-conversations.ts`

- [x] Add an inline comment on the `.where('cp.user_id', '=', userId)` clause: `// Scoped to current user only — prevents cross-user data leaks` to clarify intent for future maintainers. No logic change needed — the query is already correct.

#### [MODIFY] message-query.service.test.ts

`app/sentinel-api/src/modules/general/messages/services/message-query.service.test.ts`

- [x] Add a regression test: `listConversations` with `userId = userA` must NOT return conversations that `userB` participates in but `userA` does not.
- [x] Add a regression test: `listConversationMessages` with an unauthorized `userId` must throw a 403 `HTTPException`.

**Migration required:** No — no schema changes.

---

## Verification Plan

### Automated Tests

```bash
# Run messages hook tests
pnpm --dir packages/hooks test -- --testPathPattern="use-message-realtime"

# Run API service tests
pnpm --dir app/sentinel-api test -- --testPathPattern="message-query.service"

# Run full test suite
pnpm test
```

### Manual Verification Steps

1. Log in as **User A**, navigate to `/messages?userId=<user-b-id>` — should open a conversation with User B once, not loop or create duplicates.
2. Log in as **User C** (not a participant in A-B conversation) — messages page should show only User C's conversations. No foreign conversations should appear.
3. While User A sends a message to User B, verify that **User C's** messages page does not show a new conversation or error toast.
4. Reload `/messages?userId=X` multiple times rapidly — only one conversation should be created.

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Should the `hasFiredDeepLinkRef` reset if the user navigates away and back to `/messages?userId=X` in the same session (e.g., via `router.push`)? Currently it would not re-fire. If re-firing is desired, the ref should be reset in a `useEffect` cleanup that depends on `targetUserId`.

> [!NOTE]
> **Q2:** The `runtime.lastError: Could not establish connection. Receiving end does not exist.` error in the issue is a **Chrome extension conflict**, NOT a Supabase error. It typically comes from a browser extension trying to communicate with a page that lacks the expected extension context. No code change is required — it is safe to ignore in development.

---

**Migration required:** No Prisma migration needed for any phase.
