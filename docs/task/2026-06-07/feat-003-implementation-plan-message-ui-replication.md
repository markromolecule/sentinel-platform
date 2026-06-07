# Replicate support messages UI and layout to sentinel-core and sentinel-web

Replicate the polished, full-height split-screen messaging UI and layout from `sentinel-support` into `sentinel-core` (admin/superadmin) and `sentinel-web` (instructor). This includes removing cards/margins, conditionally setting page shell overflow and padding, introducing skeleton loaders, displaying the participant's institution, adding an auto-resizing compose textarea, and implementing the "View Profile" dialog.

---

## 1-3-1 Options

### Option A — Direct replication of components (Surgical alignment)

Copy the optimized messaging components (`MessageList`, `ChatWindow`, `ParticipantProfileDialog`) from `sentinel-support` into `sentinel-core` and refactor `sentinel-web`'s `MessagingPageClient` to use the same component logic and layout.

- **Tradeoff:** Fast and scopes changes locally to each application, eliminating deployment/routing coupling across different apps.

### Option B — Shared workspace library component abstraction

Abstract the messaging components into the shared `packages/ui` library so both `sentinel-core`, `sentinel-web`, and `sentinel-support` import the same underlying componentry.

- **Tradeoff:** Cleanest DRY codebase, but requires heavy refactoring of data flows, hooks interfaces, and Tailwind styling variations across all three applications.

### Option C — Next.js routing proxy / frame embedding

Embed the `sentinel-support` messages page inside `sentinel-core` and `sentinel-web` using an iframe or direct URL routing proxy.

- **Tradeoff:** Zero code duplication, but introduces massive security risks (cross-origin / clickjacking), authentication flow sync complexity, and bad user experience.

---

## Best Option: **Option A — Direct replication of components**

**Why:** The three applications have slightly different page contexts, sidebar setups, and authentication mechanisms. Unified shared components would require complex prop interfaces to handle subtle differences (e.g. permission gates). Option A minimizes testing risk, allows rapid implementation, and keeps modifications scoped to the target apps.

---

## Proposed Changes

### Component 1: `sentinel-core` Messaging UI Replication

#### [MODIFY] [layout.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/layout.tsx>)

- [x] Import `usePathname` from `next/navigation` and `cn` from `@sentinel/ui`.
- [x] Check if the current route is `/messages` (`const isMessages = pathname === '/messages'`).
- [x] Update the `<main>` tag classes to use `isMessages ? 'overflow-hidden p-0' : 'overflow-auto p-6'`.

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/messages/page.tsx>)

- [x] Refactor the page component into `AdminMessagesPageContent` and wrap it in a `Suspense` fallback block inside `AdminMessagesPage` to handle `useSearchParams()` safely.
- [x] Replace the card container layout (`flex h-[calc(100vh-2rem)] flex-col gap-6 p-4 md:p-6` and `bg-background border-border/50 flex flex-1 overflow-hidden rounded-xl border shadow-sm`) with the full height layout `flex h-full overflow-hidden`.
- [x] Pass `isLoading={conversationsQuery.isLoading}` to `<MessageList>` and `isLoading={messagesQuery.isLoading}` to `<ChatWindow>`.
- [x] Include `institution: p.institution ?? null` in the `participants` mapping within the conversation mapping loop.

#### [MODIFY] [message-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/messages/_components/message-list.tsx>)

- [x] Add `isLoading?: boolean` to the `MessageListProps` interface.
- [x] Add the `SkeletonRow` component that renders a pulsing skeleton for conversation list items.
- [x] Update the root container classes to `border-border bg-card h-full shrink-0 flex-col border-r w-full md:w-[320px] lg:w-[380px]` with conditional rendering based on `selectedId`.
- [x] Render 3 `SkeletonRow` components if `isLoading` is true.
- [x] Under the participant name in the list, render the participant's institution name (`participant.institution?.name`) if present.

#### [MODIFY] [chat-window.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/messages/_components/chat-window.tsx>)

- [x] Add `isLoading?: boolean` to the `ChatWindowProps` interface.
- [x] Add `isProfileOpen` state.
- [x] Import `ParticipantProfileDialog` from `./participant-profile-dialog`.
- [x] Render `<ParticipantProfileDialog>` at the bottom of the JSX tree.
- [x] Wire the "View Profile" item in the `DropdownMenu` to call `setIsProfileOpen(true)`.
- [x] Remove the non-functional `Phone` and `Video` buttons from the header.
- [x] Render `participant.institution?.name` in the header under the participant name.
- [x] Replicate the `ChatSkeleton` component and render it when `isLoading` is true.
- [x] Replace the compose message `<Input>` with a `<textarea>` that auto-resizes its height on input up to 128px (4 rows) using a `ref` listener.

#### [NEW] [participant-profile-dialog.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/messages/_components/participant-profile-dialog.tsx>)

- [x] Implement the `<ParticipantProfileDialog>` utilizing `@sentinel/hooks`'s `useUserQuery` to fetch and render full user details (avatar, full name, role, status, institution, department, courses, student/employee ID, email).

---

### Component 2: `sentinel-web` Messaging UI Replication

#### [MODIFY] [layout.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/layout.tsx>)

- [x] Import `usePathname` from `next/navigation` and `cn` from `@sentinel/ui`.
- [x] Check if the current route is `/messages` (`const isMessages = pathname === '/messages'`).
- [x] Update the `<main>` tag className to be `isMessages ? 'overflow-hidden' : 'overflow-auto [scrollbar-gutter:stable]'`.
- [x] Update `<PageShell>` wrapper classes to be `isMessages ? 'p-0 h-full gap-0' : 'p-6'`.

#### [MODIFY] [messaging-page-client.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/messaging/messaging-page-client.tsx)

- [x] Import `usePathname` from `next/navigation`.
- [x] Check if the pathname is `/messages` (`const isMessagesRoute = pathname === '/messages'`).
- [x] If `isMessagesRoute` is true, omit the outer `MessagingPageFrame` and replace the grid wrapper with a clean `flex h-full overflow-hidden` container.
- [x] Add a MoreVertical dropdown actions menu in the `ConversationPanel` header.
- [x] Wire the "View Profile" dropdown action to open `<ParticipantProfileDialog>`.
- [x] Replace the `<Textarea>` compose input with a custom `<textarea>` that supports auto-resizing based on scrollHeight up to 128px.
- [x] Import and render `<ParticipantProfileDialog>` at the bottom of the component.

#### [NEW] [participant-profile-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/messaging/components/participant-profile-dialog.tsx)

- [x] Create the `<ParticipantProfileDialog>` for the web workspace, using `@sentinel/hooks`'s `useUserQuery` to retrieve and display the full user profile details.

---

### Component 3: Test Suites Alignment

#### [NEW] [message-list.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/messages/_components/message-list.test.tsx>)

- [x] Implement unit tests for the core `MessageList` to verify skeleton rendering and institution display.

#### [NEW] [participant-profile-dialog.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/messages/_components/participant-profile-dialog.test.tsx>)

- [x] Implement unit tests for the core `ParticipantProfileDialog` to verify it behaves correctly when opening, loading, and displaying user profile metadata.

#### [NEW] [page.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/messages/page.test.tsx>)

- [x] Implement regression tests for the core `page.tsx` messages layout wrapper to assert that card layout components are removed.

#### [MODIFY] [messaging-page-client.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/messaging/messaging-page-client.test.tsx)

- [x] Mock `usePathname` to return `/messages` in unit tests.
- [x] Add test cases to assert clicking "View Profile" triggers the opening of `<ParticipantProfileDialog>`.

#### [MODIFY] [user-search-bar.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/common/user-search-bar.test.tsx)

- [x] Fix the failing pre-existing test `renders as a visible element with styling classes` by splitting the assertion of `container.className` into separate checks for `flex` and `items-center` instead of a contiguous string search.

---

## Verification Plan

### Automated Tests

Run Vitest across the affected workspaces:

```bash
# Test sentinel-support to ensure no regression
pnpm --dir app/sentinel-support test -- --run

# Test sentinel-core to ensure new tests pass
pnpm --dir app/sentinel-core test -- --run

# Test sentinel-web to ensure messaging client and fixed search bar tests pass
pnpm --dir app/sentinel-web test -- --run
```

### Manual Verification

1. Access `/messages` as Admin/Superadmin on `sentinel-core`:
    - Verify layout is full height, edge-to-edge (no cards or margins).
    - Check skeleton loaders while conversations/messages load.
    - Verify participant institution is rendered in the list and header.
    - Verify Video/Phone icons are removed.
    - Trigger the MoreVertical menu → "View Profile" dialog and confirm participant information is loaded lazily and formatted correctly.
    - Ensure the compose message textarea resizes dynamically up to 128px.
2. Access `/messages` as Instructor on `sentinel-web`:
    - Verify layout is full height and edge-to-edge.
    - Verify MoreVertical actions menu → "View Profile" dialog behaves correctly.
    - Verify compose textarea resizes dynamically.
3. Access `/student/message` as Student on `sentinel-web`:
    - Ensure student layout renders correctly and displays standard desktop margins/headers as it did before.

---

## Migration Required

No — Database schema and API contracts are unaffected; data needed is already exposed by active endpoints.
