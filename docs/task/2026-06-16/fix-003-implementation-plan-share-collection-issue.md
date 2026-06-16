# fix: Collection Sharing - Creator Access & Web/Core Parity

Fix the database query mapping bug where the collection creator's `userId` was not destructured in the query data layer (causing the creator to lose access to their own private collections). Simultaneously, implement permission checks and the share collection dialog in `sentinel-core` to ensure complete parity with `sentinel-web`.

## User Review Required

> [!IMPORTANT]
> **Creator Identification:** We ensure `collection.createdById` matches the authenticated `currentUser.id` to identify ownership and grant full access.
> 
> **Web / Core Parity:** The collection list, card, list item, and share dialog from `sentinel-web` will be duplicated or implemented in `sentinel-core` to ensure admins/instructors in both apps have the identical, secure visibility experience.

---

## Open Questions

None. The requirements from [issue-share-collection.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/June/June%2015/issue-share-collection.md) are fully defined and trace back to the original visibility matrix.

---

## Proposed Changes

### Component 1: Backend API Query Destructuring (`app/sentinel-api`)

Fix the missing `userId` destructuring in `getQuestionCollectionsData`.

#### [MODIFY] [get-question-collections.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/data/get-question-collections.ts)

- [x] Add `userId` to the destructured arguments list in `getQuestionCollectionsData`:
  ```typescript
  export async function getQuestionCollectionsData({
      dbClient,
      institutionId,
      userId,
      filters,
  }: GetQuestionCollectionsDataArgs) {
  ```

---

### Component 2: Sentinel-Core Frontend Visibility & Parity (`app/sentinel-core`)

Align `sentinel-core` UI with `sentinel-web` permission rules.

#### [MODIFY] [_types/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/bank/collections/_types/index.ts)

- [x] Add `createdById` and `updatedById` fields to the local `Collection` interface:
  ```typescript
  export interface Collection {
      id: string;
      name: string;
      description?: string | null;
      lastUpdated: string;
      questionCount: number;
      isPublic: boolean;
      createdById?: string | null;
      updatedById?: string | null;
  }
  ```

#### [MODIFY] [use-collection-management.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/bank/collections/_hooks/use-collection-management.ts)

- [x] Map the new fields in `mappedCollections`:
  ```typescript
  createdById: collection.createdById,
  updatedById: collection.updatedById,
  ```

#### [MODIFY] [question-bank-collections-page-content.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/bank/collections/_components/views/question-bank-collections-page-content.tsx)

- [x] Retrieve `user` from `useAuth()`.
- [x] Maintain state for `collectionToShare` and render `<ShareCollectionDialog>` at the bottom of the page layout.
- [x] Pass `currentUserId={user?.id ?? null}` and `onShare={setCollectionToShare}` to `CollectionList`.

#### [MODIFY] [collection-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/bank/collections/_components/views/collection-list.tsx)

- [x] Update `CollectionListProps` to accept optional `currentUserId: string | null` and `onShare: (collection: Collection) => void`.
- [x] Pass these properties down to `CollectionCard` and `CollectionListItem`.

#### [MODIFY] [collection-card.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/bank/collections/_components/views/collection-card.tsx)

- [x] Update card props to accept `currentUserId` and `onShare`.
- [x] Implement ownership logic:
  - `const isCreator = collection.createdById === currentUserId;`
  - Load shared users for verification using `useQuestionBankCollectionSharesQuery(shouldLoadShares ? collection.id : undefined)`.
- [x] Update dropdown options menu:
  - `"Share Collection"`: Only show if `isCreator`.
  - `"Edit Collection"`: Show if `isCreator` or explicitly shared.
  - `"Delete Collection"`: Only show if `isCreator`.

<!-- NOTE: Updated the existing core collection-card test to mock the new permission query and keep the regression coverage aligned with the component change. -->

#### [MODIFY] [collection-list-item.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/bank/collections/_components/views/collection-list-item.tsx)

- [x] Apply the same prop changes and conditional rendering logic as `CollectionCard`.

#### [NEW] [share-collection-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/bank/collections/_components/dialogs/share-collection-dialog.tsx)

- [x] Implement a page-local `ShareCollectionDialog` modal matching `sentinel-web`'s design.

---

## Verification Plan

### Automated Tests

Verify backend controller & data layers correctly filter collections.

```bash
# Run backend tests
pnpm --dir app/sentinel-api test

# Run frontend tests
pnpm --dir app/sentinel-core test
pnpm --dir app/sentinel-web test
```

<!-- NOTE: The workspace-level test suites above hit unrelated live-database/integration failures in this environment, so the modified files were verified with targeted Vitest runs instead. -->

<!-- NOTE: The share collection dialog now uses an institution-wide users query so admins and superadmins remain searchable for assignment, while the default users endpoint behavior stays role-scoped for the rest of the app. -->

#### New/Updated Tests
- [x] Create `get-question-collections.controller.test.ts` in `app/sentinel-api/src/modules/content/question-collection/controllers` asserting the creator of private collections can retrieve them in the list.

### Manual Verification

1. **Bug Verification:**
   - Log in to `sentinel-web` as Creator A. Create a Private collection.
   - Verify the collection displays on the dashboard.
2. **Core/Web Parity Verification:**
   - Log in to `sentinel-core` as Creator A.
   - Verify that your Private collection appears.
   - Confirm you can see "Share Collection" and "Delete Collection" in the card actions dropdown.
   - Log in to `sentinel-core` as Admin B (non-creator, not shared). Confirm that Creator A's private collection is hidden.
