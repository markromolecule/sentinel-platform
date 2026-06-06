# feat-002: Messages UI — Institution, Remove Call Icons, View Profile Dialog

**Task summary:** Three targeted improvements to the `/messages` page in `sentinel-support`:
1. Show the participant's **institution** in the conversation list item and chat header.
2. **Remove** the non-functional Phone and Video call buttons from the chat header.
3. Implement a functional **"View Profile" dialog** that shows the participant's full profile (institution, department, courses, student/employee number, status) fetched via `useUserQuery`.

---

## Proposed Changes

### Phase 1 — Extend `ChatUser` type to carry institution

**Goal:** Give the UI type the institution field that the schema already provides, so it can flow through without any additional API calls.

---

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/types/index.ts)

- [x] Add `institution?: { id: string; name: string } | null` to the `ChatUser` interface (line ~526).

---

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/page.tsx)

- [x] In the `participants` mapping (line ~166), add `institution: p.institution ?? null` so the institution from `ConversationSummary` is forwarded to the `ChatUser`.

---

### Phase 2 — Surface institution in the conversation list

**Goal:** Display the participant's institution as a subtitle in the conversation list row, consistent with how the directory view already does it.

---

#### [MODIFY] [message-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/_components/message-list.tsx)

- [x] In the conversation list row (lines ~185-221), add a second line beneath the participant name showing `participant.institution?.name` when present.

---

### Phase 3 — Remove call/video buttons and surface institution in chat header

**Goal:** Clean up the chat header — drop the two unused action buttons and use the freed space to show the participant's institution.

---

#### [MODIFY] [chat-window.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/_components/chat-window.tsx)

- [x] Remove the `Phone` and `Video` Button elements from the header action group (lines ~141-146).
- [x] Remove `Phone` and `Video` from the `lucide-react` import.
- [x] Add institution to the header participant info block, and move status indicator to overlay on the profile avatar icon.

---

### Phase 4 — "View Profile" dialog

**Goal:** Wire the existing "View Profile" dropdown item to open a dialog that lazily fetches and displays the participant's full profile.

---

#### [NEW] participant-profile-dialog.tsx

Path: `app/sentinel-support/src/app/(protected)/messages/_components/participant-profile-dialog.tsx`

- [x] Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `participantId: string | null`
- [x] Use `useUserQuery(participantId ?? '')` with `enabled: !!participantId && open` for lazy fetching.
- [x] Imports from `@sentinel/ui`: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Avatar`, `AvatarFallback`, `AvatarImage`, `Badge`, `Separator`, `Skeleton`.
- [x] Loading state: skeleton layout (avatar circle, name bar, 4 field rows).
- [x] Loaded state: profile card with:
  - Header: large avatar + full name + role Badge + status indicator.
  - Details grid: Institution, Department, Course(s), Student No./Employee No., Email, Status.

---

#### [MODIFY] [chat-window.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/_components/chat-window.tsx)

- [x] Add `isProfileOpen: boolean` state (default `false`).
- [x] Import `ParticipantProfileDialog` from `./participant-profile-dialog`.
- [x] Wire "View Profile" DropdownMenuItem `onClick` to `() => setIsProfileOpen(true)`.
- [x] Render `<ParticipantProfileDialog>` below the main JSX.

---

### Phase 5 — Tests

---

#### [MODIFY] message-list.test.tsx

- [x] Test: institution name is rendered when `institution.name` is set.
- [x] Test: no institution text when `institution` is null/undefined.

#### [NEW] participant-profile-dialog.test.tsx

- [x] Test: dialog is hidden when `open = false`.
- [x] Test: skeleton is rendered while loading.
- [x] Test: user name, institution, department, course display when data loads.
- [x] Test: dialog can be closed via `onOpenChange`.

---

## Verification Plan

### Automated Tests
```bash
pnpm --dir app/sentinel-support test
```

### Manual Verification
1. `/messages` conversation rows show institution beneath participant name (when present).
2. Chat header shows institution beneath status dot.
3. Phone and Video buttons are absent from the header.
4. Clicking the ⋮ menu → View Profile opens a dialog with full participant data.
5. Dialog shows skeleton while loading.

---

## Migration Required
No — institution data is already returned by the existing conversations API.
