# Implementation Plan — Search Bar & Avatar Follow-ups

This plan addresses feedback regarding the search bar width, recent searches, and resolving the profile picture issue when the database `avatar_url` is null but OAuth metadata contains it.

---

## User Review Required

> [!NOTE]
> Recent searches will be stored locally in `localStorage` per client application. Clicking a recent search will route directly to the message/conversation view.

---

## Proposed Changes

### 1. API Service (Identity / Users Formatting)

#### [MODIFY] [get-user.formatters.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/data/get-user/get-user.formatters.ts)

- Add `getAvatarFromMetadata` utility function to extract `avatar_url` or `picture` from the raw Supabase user metadata.
- Fallback to metadata avatar when `record.avatar_url` is null.

#### [MODIFY] [get-users.formatters.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/data/get-users/get-users.formatters.ts)

- Add the same `getAvatarFromMetadata` utility function and fallback behavior to `formatUserRecord`.

### 2. Frontend Applications (Search Bar Improvements)

#### [MODIFY] [user-search-bar.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/common/user-search-bar.tsx)

- Increase trigger width classes from `w-48 md:w-64` to `w-64 md:w-96`.
- Update `<PopoverContent className="w-80 p-0">` to `<PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0">` so it spans the full width of the search trigger.
- Implement `localStorage`-based recent searches storage.
- If `searchQuery` is empty, show the "Recent Searches" list (if any exist) with a "Clear" button, otherwise show the "Type at least 2 characters to search..." helper text.

#### [MODIFY] [user-search-bar.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/components/common/user-search-bar.tsx)

- Apply the same width adjustments, Radix trigger width adaptation, and "Recent Searches" history logic.

#### [MODIFY] [user-search-bar.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/common/user-search-bar.tsx)

- Apply the same width adjustments, Radix trigger width adaptation, and "Recent Searches" history logic.

---

## Verification Plan

### Automated Tests

- Run `pnpm --dir app/sentinel-api test` to confirm identity/users formatters behave correctly.
- Update `user-search-bar.test.tsx` in `app/sentinel-web` to cover the "Recent Searches" rendering and clearing behavior.
- Run `pnpm --dir app/sentinel-web test` to verify.

### Manual Verification

- Open the search bar in the browser, verify its wider layout.
- Click a search result, reopen the search bar, and confirm the selected user appears under "Recent Searches".
- Click the "Clear" button and ensure history is cleared.
