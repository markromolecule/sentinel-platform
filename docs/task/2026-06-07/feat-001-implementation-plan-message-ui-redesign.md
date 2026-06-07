# Messages UI Redesign — sentinel-support

**Task summary:** Redesign the `/messages` page in `sentinel-support` so it fills
the available viewport as a true full-height, edge-to-edge messaging shell instead
of being wrapped in a card, and improve the overall UX for the support agent.

---

## 1-3-1 Options

### Option A — Two-column full-height shell (layout-only refactor)

Rework `page.tsx` and its two `_components` to occupy the full height of the
`<main>` area by removing the outer container padding/card wrapper and letting the
panel pair (`MessageList` + `ChatWindow`) stretch edge-to-edge inside the sidebar
inset.

**Tradeoff:** Fast, low-risk, zero routing changes; relies on CSS precision inside
the existing Shadcn `SidebarInset`.

### Option B — URL-driven conversation routing (`/messages/[id]`)

Convert the selected conversation into a URL segment so each chat is a distinct
Next.js route, enabling back/forward navigation, deep links, and SEO.

**Tradeoff:** Better UX long-term but requires refactoring state management to use
`useParams`, adding a new `[id]` route segment, and potentially breaking the
existing `?userId` deep-link flow.

### Option C — CSS-only shell with `position: absolute` overlap panels

Keep the existing component tree but use `position: absolute` / `inset-0` on both
panels so they layer inside the layout without consuming extra vertical space.

**Tradeoff:** Avoids any JS/state changes but is brittle across different sidebar
states and screen sizes, making maintenance harder over time.

---

## Best Option: **Option A — Two-column full-height shell**

**Why:** The card-wrapping problem is purely a layout/CSS concern. Option A solves
it directly at the source — removing the outer `<div>` padding and letting the two
panels grow into the available space. It is the lowest-risk approach, preserves all
existing state logic, and is maintainable. Option B adds routing complexity that is
not required by the goal. Option C is fragile across sidebar-open/closed states.

---

## Proposed Changes

### Phase 1: Layout Shell

**Goal:** Remove the card wrapper and make the messages panel fill the full height of the page.

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/page.tsx>)

- [ ] Remove the outer `<div className="flex h-[calc(100vh-2rem)] flex-col gap-6 p-4 md:p-6">` wrapper that introduces the card padding and vertical gap.
- [ ] Replace with a `<div className="flex h-full flex-col overflow-hidden">` so the panel pair fills the `SidebarInset > main` height automatically.
- [ ] Remove the inner `rounded-xl border shadow-sm` card wrapper (`bg-background border-border/50 ...`).
- [ ] Let `<MessageList>` and `<ChatWindow>` be direct siblings inside the new `h-full flex` container.
- [ ] Update the loading/fallback state containers to use `h-full` instead of `h-[calc(100vh-2rem)]`.

#### [MODIFY] [layout.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/layout.tsx>)

- [ ] Change `<main>` from `overflow-auto p-6` to `overflow-hidden p-0` so the messages page can manage its own internal scrolling.
- [ ] Each other page (`/dashboard`, `/analytics`, etc.) must add its own `p-6` wrapper to compensate — audit all sibling route `page.tsx` files and add `<div className="p-6">` wrapper where missing.

---

### Phase 2: Conversation List Panel

**Goal:** Polish the `MessageList` sidebar panel for correct sizing and better UX.

#### [MODIFY] [message-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/_components/message-list.tsx>)

- [ ] Change root `<div>` to use `shrink-0 w-[320px] lg:w-[380px] flex flex-col h-full border-r` (remove `w-full` which causes it to expand on mobile when chat is hidden).
- [ ] Add `shrink-0` to the header `<div className="border-b p-4">` so it stays pinned.
- [ ] Ensure list body `<div className="flex-1 overflow-y-auto">` properly fills remaining height.
- [ ] Add subtle `transition-colors duration-150` to conversation row `<button>` for polished hover.
- [ ] Add a `isLoading?: boolean` prop to `MessageListProps` and render 3 skeleton rows (`animate-pulse` grey bars) when `isLoading` is `true`.
- [ ] Pass `conversationsQuery.isLoading` as `isLoading` from `page.tsx`.

---

### Phase 3: Chat Window Panel

**Goal:** Polish the `ChatWindow` for correct layout, loading states, and improved input UX.

#### [MODIFY] [chat-window.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/_components/chat-window.tsx>)

- [ ] Confirm root wrapper uses `flex-1 min-w-0 flex flex-col h-full overflow-hidden`.
- [ ] Add `isLoading?: boolean` to `ChatWindowProps` interface.
- [ ] When `isLoading` is `true`, render 4 skeleton message bubbles (alternating left/right) instead of the real messages list.
- [ ] Pass `messagesQuery.isLoading` as `isLoading` from `page.tsx`.
- [ ] Improve empty state: swap `<Send>` icon for a `<MessageSquare>` icon with headline "No conversation selected" and subtext.
- [ ] Replace the fixed-height `<Input>` compose field with a `<textarea>` that auto-resizes from 1 to 3 rows using an `onInput` height recalculation, keeping the same `handleSend` / `handleKeyDown` logic.

---

### Phase 4: Tests & Polish

**Goal:** Ensure all tests pass and add regression guards for the card-free layout.

#### [MODIFY] [page.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/page.test.tsx>)

- [ ] Update any snapshot or layout assertions to reflect the removed card wrapper.
- [ ] Add a regression test: query the root element and assert it does **not** have `rounded-xl` in its className.

#### [MODIFY] [message-list.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/_components/message-list.test.tsx>)

- [ ] Add a test: when `isLoading={true}`, verify 3 skeleton elements are rendered.
- [ ] Verify conversation rows render with correct participant names and unread badge counts.

#### Run tests

- [ ] Run `pnpm --dir app/sentinel-support test` and confirm all tests pass with no skipped cases.

---

## Migration Required

**No** — this is a UI-only change. No database schema, Prisma model, or API contract is modified.

---

## Open Questions

> [!IMPORTANT]
> **Q1 — Global `<main>` padding removal:** Removing `p-6` from the protected layout `<main>` affects _all_ pages, not just messages. Do you want each sibling page to add its own `p-6` wrapper, or should we scope the padding removal only to the messages route (e.g., via a route group or a conditional CSS variable)?

> [!IMPORTANT]
> **Q2 — Auto-resize textarea:** The current `<Input>` for composing messages is a single-line field. Switching to a growing `<textarea>` changes the send-bar height dynamically. Is this acceptable, or should the bar remain fixed-height?

---

## Verification Plan

### Automated Tests

```bash
pnpm --dir app/sentinel-support test
```

### Manual Verification

1. Open `/messages` — panel fills viewport with no card border/shadow.
2. Select a conversation — chat window fills right pane edge-to-edge.
3. On mobile (≤ md) — list hides when chat selected; back button works.
4. New message flow (`+` button) — works as before.
5. Deep-link (`?userId=...`) — auto-selects or creates conversation.
6. All other protected pages — still have correct padding.
