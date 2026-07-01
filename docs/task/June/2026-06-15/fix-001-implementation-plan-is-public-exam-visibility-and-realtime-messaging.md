# Fix: is_public Exam Visibility, Exam Card Parity, and Real-Time Messaging

## Summary

Three bugs / gaps to resolve:

1. **Exam visibility bug** — When an admin/superadmin creates an exam and sets it to **private**, instructors who are _not_ the creator and _not_ assigned via `exam_section_assignments` or `proctor_assignments` can still see it. Also, when the creator updates a private exam to **public**, the change does not reflect on the instructor's view.

2. **Exam card inconsistency** — The exam card in `sentinel-web` (`ExamCardBody`) does not match the layout of `sentinel-core` (grid vs. inline, open-question for draft display).

3. **Real-time messaging not propagated** — `sentinel-support` already has `useMessageRealtime` wired in, and `sentinel-core` does too. However, `sentinel-web`'s `MessagingPageClient` uses `useMessageRealtime` only with `conversationId`-less mode; individual conversation message subscriptions need to fire when a conversation is selected. No gap was found in `sentinel-core` or `sentinel-support`, but the hook wiring across all three apps must be validated.

---

## Findings

### Exam Visibility Logic (`get-exams.ts` data layer)

Current instructor predicate in `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` (lines 189–210):

```ts
if (instructorUserId) {
    query = query.where((eb) =>
        eb.or([
            eb('e.is_public', '=', true), // ← shows ALL public exams, regardless of institution
            eb('e.created_by', '=', instructorUserId),
            eb.exists(/* exam_section_assignments */),
            eb.exists(/* proctor_assignments */),
        ]),
    );
}
```

**Root cause**: The `is_public = true` arm is not scoped to the instructor's institution. A public exam from another institution is visible.
More critically: the predicate is applied only when the caller is an instructor role. If the controller resolves `role === 'instructor'` incorrectly (e.g. falls back to no-filter), private exams leak through.

### Exam Card Differences

| Field         | `sentinel-core` `ExamCardBody` | `sentinel-web` `ExamCardBody`         |
| ------------- | ------------------------------ | ------------------------------------- |
| Layout        | `grid grid-cols-2` (2-col)     | Mixed inline + `pl-5.5` offsets       |
| End datetime  | Grid col 1                     | After instructor row                  |
| Instructor    | Grid col 2                     | `pl-5.5` offset row                   |
| Draft open-qs | Explicit creator/draft text    | No explicit draft/open-question label |

### Messaging Realtime

- `sentinel-web` `MessagingPageClient.tsx`: calls `useMessageRealtime({ enabled: canViewMessages })` — global channel, but **no** per-conversation subscription when a conversation is selected. This means new individual messages within an open conversation do not push-update automatically.
- `sentinel-core` messages page: calls `useMessageRealtime({ enabled: !!profile })` — same gap.
- `sentinel-support` messages page: same pattern.

---

## Viable Options (per 1-3-1 Rule)

### Option A — Patch the existing predicate (simple / fast)

Add `institution_id` scoping to the `is_public = true` arm and add unit tests.

**Tradeoff**: Minimal change, fast to ship, but doesn't address edge cases like instructors whose `institutionId` resolves differently.

### Option B — Introduce a dedicated `getInstructorExams` query (robust / scalable)

Create a new data-access function that encapsulates instructor-specific visibility rules: `is_public AND institution_id = :institutionId` OR `created_by = :instructorId` OR section-assigned OR proctor-assigned.

**Tradeoff**: More files but explicit visibility contract, easier to test in isolation.

### Option C — Server-side RLS policy on `exams` table (creative)

Push visibility filtering to Postgres Row-Level Security, removing it from application code entirely.

**Tradeoff**: Zero application code for filtering but requires a DB migration, harder to test and iterate on.

**Best Option: B** — A dedicated query with an explicit, well-tested visibility predicate balances safety, testability, and maintainability without touching the RLS layer.

---

## Proposed Changes

---

### Phase 1 — Fix Exam Visibility Bug (API)

**Goal:** Ensure instructors see only their institution's public exams plus exams they created or are assigned to, and that changing `is_public` is immediately reflected on subsequent fetches.

**Migration required:** No — no schema change; purely query logic.

#### [MODIFY] [get-exams.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/get-exams.ts)

- [x] In the `instructorUserId` predicate block (line ~190), change the `is_public = true` arm to also require `e.institution_id = :institutionId`:

```ts
// BEFORE
eb('e.is_public', '=', true),

// AFTER
eb.and([
    eb('e.is_public', '=', true),
    institutionId
        ? eb('e.institution_id', '=', institutionId)
        : eb.val(true),
]),
```

- [x] Ensure `institutionId` is always available when the caller is an instructor. Add a guard: if `role === 'instructor'` and `institutionId` is `undefined`, throw or return early.

#### [MODIFY] [get-exams.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/controllers/get-exams.controller.ts)

- [x] Add an explicit guard after `resolveAssessmentInstitutionId`: if `role === 'instructor'` and `institutionId` is `undefined | null`, return `{ message: 'Institution context required', data: [] }` with HTTP 200 (or 400 with error) to prevent unconstrained queries.

#### [NEW] [get-exams-instructor-visibility.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/get-exams-instructor-visibility.test.ts)

- [ ] Write tests covering:
    - Instructor sees `is_public = true` exam from **same** institution ✓
    - Instructor does **not** see `is_public = true` exam from **different** institution ✗
    - Instructor sees own private exam ✓
    - Instructor sees exam they are section-assigned to ✓
    - Instructor does **not** see another instructor's private exam ✗
    - Updating `is_public` from `false` → `true` surfaces the exam on next fetch ✓

#### [MODIFY] [get-exams.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/get-exams.test.ts)

- [x] Extend service-level tests to assert that institution-scoped public visibility is respected end-to-end through `getExams()`.

---

### Phase 2 — Align Exam Card in sentinel-web with sentinel-core

**Goal:** Make `sentinel-web`'s `ExamCardBody` use the same `grid grid-cols-2` layout as `sentinel-core`, and surface a clear draft/open-question label.

**Migration required:** No.

#### [MODIFY] [exam-card-body.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/cards/exam-card/exam-card-body.tsx)

- [x] Replace the current mixed inline + `pl-5.5` layout with `grid grid-cols-2 gap-x-3 gap-y-2` matching `sentinel-core`:
    - Col 1, row 1: Scheduled date
    - Col 2, row 1: Room (`assignedRoomNames`)
    - Col 1, row 2: End datetime
    - Col 2, row 2: Instructor (`assignedInstructorNames`)
    - Col 1, row 3: Question count
    - Col 2, row 3: Creator/publisher attribution
- [x] When `exam.status === 'draft'` and `exam.questionCount === 0`, render a muted note below the subject row: `"Draft — no questions added yet"` to answer the open question about draft state for assigned instructors.

#### [MODIFY] [exam-card-body.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/cards/exam-card/exam-card-body.test.tsx)

- [x] Add test: renders draft note when `status === 'draft'` and `questionCount === 0`.
- [x] Add test: does not render draft note when `questionCount > 0`.
- [x] Add test: renders `publishedByName` attribution for published exam.

---

### Phase 3 — Real-Time Messaging Across All Apps

**Goal:** Ensure new messages appear automatically in all three apps (sentinel-web, sentinel-core, sentinel-support) without requiring a page refresh, by wiring `useMessageRealtime` with per-conversation subscriptions.

**Migration required:** No.

#### [MODIFY] [messaging-page-client.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/messaging/messaging-page-client.tsx)

- [x] Add a second `useMessageRealtime` call after the existing one (line ~131):

```tsx
// Global channel: keeps conversation list preview fresh
useMessageRealtime({ enabled: canViewMessages });

// Per-conversation channel: live message updates in open conversation
useMessageRealtime({
    enabled: canViewMessages && !!effectiveSelectedConversationId,
    conversationId: effectiveSelectedConversationId || undefined,
    invalidateList: false,
});
```

#### [MODIFY] [messaging-page-client.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/messaging/messaging-page-client.test.tsx)

- [x] Add test: `useMessageRealtime` is called twice when a conversation is selected — once without `conversationId` and once with the selected ID.
- [x] Add test: the per-conversation call is disabled when no conversation is selected.

#### [MODIFY] [page.tsx (sentinel-core messages)](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/messages/page.tsx>)

- [x] Add a second `useMessageRealtime` call scoped to `selectedConversationId` after line 31:

```tsx
useMessageRealtime({ enabled: !!profile });
useMessageRealtime({
    enabled: !!profile && !!selectedConversationId,
    conversationId: selectedConversationId ?? undefined,
    invalidateList: false,
});
```

#### [MODIFY] [page.test.tsx (sentinel-core messages)](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/messages/page.test.tsx>)

- [x] Add test: `useMessageRealtime` called twice — global + per-conversation.

#### [MODIFY] [page.tsx (sentinel-support messages)](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/page.tsx>)

- [x] Same fix as sentinel-core: add a scoped per-conversation `useMessageRealtime` call.

#### [MODIFY] [page.test.tsx (sentinel-support messages)](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/page.test.tsx>)

- [x] Add matching test for the double `useMessageRealtime` call pattern.

---

## Verification Plan

### Automated Tests

```bash
# Run all API exam tests
pnpm --dir app/sentinel-api test

# Run web exam card and messaging tests
pnpm --dir app/sentinel-web test

# Run core messaging page tests
pnpm --dir app/sentinel-core test

# Run support messaging page tests
pnpm --dir app/sentinel-support test
```

### Manual Verification

1. **Exam visibility**:
    - Log in as admin → create a private exam → verify instructors from the same institution do **not** see it.
    - Update the exam to public → verify instructors from the same institution **do** see it on next API call.
    - Log in as instructor → verify only own / assigned / public-same-institution exams appear.

2. **Exam card parity**:
    - Navigate to exam list in `sentinel-web` → confirm card body uses 2-column grid layout matching `sentinel-core`.
    - Draft exam with 0 questions → verify draft note renders.

3. **Real-time messaging**:
    - Open two browser sessions as different users in each app.
    - Send a message → confirm it appears in the recipient's open conversation without a manual page refresh in sentinel-web, sentinel-core, and sentinel-support.

---

## Additional Notes

- No new `.env` variables required.
- No Prisma schema changes; `is_public` column and index already exist.
- No breaking API response shape changes — only the filtered result set changes.
- **Rollback**: revert the `institutionId` scoping addition in `get-exams.ts` to restore prior behaviour if a regression is detected.
