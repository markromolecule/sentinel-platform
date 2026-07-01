# feat: Collection Sharing & Visibility Model

Implement a sharing mechanism and public/private visibility model for the Question Collection page in Sentinel, supporting granular access rights (Creator vs. Shared/Assigned vs. Public) for viewing, using, editing, updating, and deleting collections.

## User Review Required

> [!IMPORTANT]
> **Permission Matrix Conflict:** The requirements document contains a conflict between the text description and the permission matrix:
>
> 1. Under **Private (default)**, the text states: _"Shared/assigned users can view and use the collection but **cannot** edit, update, or delete it."_
> 2. In the **Permission Matrix** table, the columns for **Edit** and **Update** have a green checkmark (`✅`) for **Shared / Assigned** users.
>
> _Proposed Resolution:_ We assume the Permission Matrix is the source of truth, meaning:
>
> - **Shared / Assigned** users **CAN** edit and update collections they are shared with (but they cannot delete or share them).
> - **Other (Public)** users can view and use public collections but cannot edit, update, delete, or share them.
> - **Creator** has full rights (View, Use, Edit, Update, Delete, Share).

> [!WARNING]
> **Data Scope / Isolation:** Sharing is restricted to users within the same institution (`institutionId`). The lookup for sharing a collection will filter out users not belonging to the current user's institution.

---

## Open Questions

> [!IMPORTANT]
> Should non-creators who are explicitly shared/assigned be allowed to add or remove questions in the collection?
> _Proposed Answer:_ Since they have **Edit** and **Update** permissions (`✅` in the matrix), we will allow them to call `addQuestionsToCollection` and `removeQuestionsFromCollection` endpoints.

---

## Proposed Changes

<!-- NOTE: Supporting tests and a dedicated share dialog/query layer were added where needed to keep the feature cohesive and verifiable end-to-end. -->

### Component 1: Central Database Schema (`packages/db`)

Create a dedicated join table `question_bank_collection_shares` to store explicit user permissions.

#### [NEW] [question_bank_collection_shares](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma)

- [x] Add the join table model `question_bank_collection_shares` mapping to the `public` schema:

    ```prisma
    model question_bank_collection_shares {
      collection_id             String                    @db.Uuid
      user_id                   String                    @db.Uuid
      created_at                DateTime?                 @default(now()) @db.Timestamptz(6)
      question_bank_collections question_bank_collections @relation(fields: [collection_id], references: [collection_id], onDelete: Cascade, onUpdate: NoAction)
      users                     users                     @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: NoAction)

      @@id([collection_id, user_id])
      @@schema("public")
    }
    ```

- [x] Add the back-relation in `question_bank_collections` model:
    ```prisma
    question_bank_collection_shares question_bank_collection_shares[]
    ```
- [x] Add the back-relation in `users` model:
    ```prisma
    question_bank_collection_shares question_bank_collection_shares[]
    ```

**Migration required:** Yes — schema migration to create the table `question_bank_collection_shares`.
_Migration Name:_ `add_question_bank_collection_shares`
_Rollback Note:_ `DROP TABLE IF EXISTS "public"."question_bank_collection_shares";`

---

### Component 2: Shared Schema Definition (`packages/shared`)

Expose database model attributes to the frontend and API layers.

#### [MODIFY] [question-collection-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/question-collection-schema.ts)

- [x] Update `questionCollectionSchema` to include `createdById` and `updatedById`:
    ```typescript
    export const questionCollectionSchema = z.object({
        // ... existing fields ...
        createdBy: z.string().nullable(),
        updatedBy: z.string().nullable(),
        createdById: z.string().uuid().nullable(),
        updatedById: z.string().uuid().nullable(),
    });
    ```

---

### Component 3: Backend API Service & Controllers (`app/sentinel-api`)

Enforce security checks and expose share/unshare endpoints.

#### [NEW] [assert-question-collection-access.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/services/assert-question-collection-access.ts)

- [x] Implement robust check:

    ```typescript
    import { type DbClient } from '@sentinel/db';
    import { HTTPException } from 'hono/http-exception';

    export async function assertCollectionAccess(args: {
        dbClient: DbClient;
        collectionId: string;
        userId: string;
        action: 'view' | 'use' | 'edit' | 'update' | 'delete' | 'share';
    }) {
        const collection = await args.dbClient
            .selectFrom('question_bank_collections')
            .select(['created_by', 'is_public'])
            .where('collection_id', '=', args.collectionId)
            .executeTakeFirst();

        if (!collection) {
            throw new HTTPException(404, { message: 'Collection not found.' });
        }

        if (collection.created_by === args.userId) {
            return; // Creator always has full access
        }

        // Actions only creator can perform
        if (args.action === 'delete' || args.action === 'share') {
            throw new HTTPException(403, {
                message: 'Forbidden. Only the creator can perform this action.',
            });
        }

        // Check if user is explicitly shared
        const isShared = await args.dbClient
            .selectFrom('question_bank_collection_shares')
            .where('collection_id', '=', args.collectionId)
            .where('user_id', '=', args.userId)
            .select('user_id')
            .executeTakeFirst();

        if (isShared) {
            return; // Shared users have view, use, edit, and update rights
        }

        // If not shared, check if public (only for view/use actions)
        if (collection.is_public && (args.action === 'view' || args.action === 'use')) {
            return;
        }

        throw new HTTPException(403, {
            message: 'Forbidden. You do not have access to this collection.',
        });
    }
    ```

#### [MODIFY] [get-question-collections.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/data/get-question-collections.ts)

- [x] Inject `userId` argument.
- [x] Add a WHERE clause filtering collections to match visibility rules:
    ```typescript
    query = query.where((eb) =>
        eb.or([
            eb('qc.is_public', '=', true),
            eb('qc.created_by', '=', userId),
            eb.exists(
                eb
                    .selectFrom('question_bank_collection_shares as qcs')
                    .select('qcs.user_id')
                    .where('qcs.collection_id', '=', eb.ref('qc.collection_id'))
                    .where('qcs.user_id', '=', userId),
            ),
        ]),
    );
    ```

#### [MODIFY] [map-question-collection-response.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/services/map-question-collection-response.service.ts)

- [x] Include `createdById` and `updatedById` fields in `mapQuestionCollectionResponse`:
    ```typescript
    createdById: record.created_by,
    updatedById: record.updated_by,
    ```

#### [MODIFY] [get-question-collection-detail.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/services/get-question-collection-detail.service.ts)

- [x] Assert view access before fetching detail:
    ```typescript
    await assertCollectionAccess({
        dbClient: args.dbClient,
        collectionId: args.id,
        userId: args.userId,
        action: 'view',
    });
    ```

#### [MODIFY] [update-question-collection.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/services/update-question-collection.service.ts)

- [x] Assert update access before performing the write operation:
    ```typescript
    await assertCollectionAccess({
        dbClient: args.dbClient,
        collectionId: args.id,
        userId: args.userId,
        action: 'update',
    });
    ```

#### [MODIFY] [delete-question-collection.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/services/delete-question-collection.service.ts)

- [x] Assert delete access (creator-only):
    ```typescript
    await assertCollectionAccess({
        dbClient: args.dbClient,
        collectionId: args.id,
        userId: args.userId,
        action: 'delete',
    });
    ```

#### [MODIFY] [add-questions-to-collection.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/services/add-questions-to-collection.service.ts) & [remove-questions-from-collection.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/services/remove-questions-from-collection.service.ts)

- [x] Accept `userId` in parameters and call `assertCollectionAccess` with action `edit` before adding or removing questions.

#### [NEW] [share-question-collection.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/controllers/share-question-collection.controller.ts)

- [x] Implement `shareQuestionCollectionRoute` (`POST /collections/:id/shares`) and handler.
    - Takes path param `id` and body `{ userIds: string[] }`.
    - Asserts `action: 'share'` (creator only).
    - Deletes all current records in `question_bank_collection_shares` for `collection_id = id` and inserts the new list.
- [x] Implement `getQuestionCollectionSharesRoute` (`GET /collections/:id/shares`) and handler.
    - Asserts `action: 'view'`.
    - Returns a list of users shared with the collection, including `user_id`, `first_name`, `last_name`, and `email`.

#### [MODIFY] [question-collection.route.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/question-collection.route.ts)

- [x] Register both new endpoints.

---

### Component 4: Shared Frontend Services & Hooks (`packages/services`, `packages/hooks`)

Expose frontend queries and mutations.

#### [MODIFY] [question-bank.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/question-bank.ts)

- [x] Update `QuestionBankCollectionRecord` to include `createdById` and `updatedById`.
- [x] Add `shareQuestionBankCollection(apiClient, id, payload)` service API call.
- [x] Add `getQuestionBankCollectionShares(apiClient, id)` service API call.

#### [NEW] [use-question-bank-collection-shares-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/question-bank/use-question-bank-collection-shares-query.ts)

- [x] Implement a query hook to load user records currently shared.

#### [NEW] [use-share-question-bank-collection-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/question-bank/use-share-question-bank-collection-mutation.ts)

- [x] Implement a mutation hook calling `shareQuestionBankCollection`.

---

### Component 5: Frontend UI Components (`app/sentinel-web`)

#### [NEW] [share-collection-dialog.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/_components/dialogs/share-collection-dialog.tsx>)

- [x] Create a `ShareCollectionDialog` modal.
    - Queries shared users via `useQuestionBankCollectionSharesQuery`.
    - Renders a multi-select user search dropdown using `useUsersQuery` (scoped to matching institution instructors).
    - Displays currently shared users with an option to remove them.
    - Submits mutations via `useShareQuestionBankCollectionMutation`.

#### [MODIFY] [collection-card.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/_components/views/collection-card.tsx>) & [collection-list-item.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/_components/views/collection-list-item.tsx>)

- [x] Inject `currentUserId` (from `useAuth()`) to determine permissions.
- [x] Conditionally show options in the actions dropdown:
    - `"Share Collection"`: Only visible if `collection.createdById === currentUserId`.
    - `"Delete Collection"`: Only visible if `collection.createdById === currentUserId`.
    - `"Edit Collection"`: Visible if `collection.createdById === currentUserId` or is in the shared list.
- [x] Add `"Share Collection"` menu item that opens the dialog.

#### [MODIFY] [question-bank-collections-page-content.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/_components/views/question-bank-collections-page-content.tsx>)

- [x] Add state for `collectionToShare` and render `<ShareCollectionDialog>`.

---

## Verification Plan

### Automated Tests

We will write unit tests using Vitest to verify all aspects of the sharing model.

```bash
# Run backend tests
pnpm --dir app/sentinel-api test

# Run frontend tests
pnpm --dir app/sentinel-web test
```

#### Test Cases

1. **Access Enforcement (Backend):**
    - Assert `assertCollectionAccess` throws `403` for non-creator attempting to delete a collection.
    - Assert non-creator who is not shared throws `403` when viewing a private collection.
    - Assert non-creator who is explicitly shared can view/edit a private collection.
    - Assert public user can view/use but not edit a public collection.
2. **Shares API:**
    - Assert creator can successfully share a collection with user IDs.
    - Assert GET `/shares` returns correct list.
3. **UI Permission Rules (Frontend):**
    - Assert "Share" and "Delete" dropdown choices are omitted when current user is not the creator.

### Manual Verification

1. **Creator Dashboard Flow:**
    - Log in as Instructor A. Create a collection, mark it Private.
    - Click "Share Collection" in actions dropdown. Search and add Instructor B.
2. **Assigned Instructor Flow:**
    - Log in as Instructor B. Verify the collection is listed.
    - Open it and edit details (allowed). Confirm deletion is blocked/hidden.
3. **Other Instructor (Private):**
    - Log in as Instructor C. Verify Instructor A's private collection is not listed and accessing its URL directly returns Forbidden.
4. **Other Instructor (Public):**
    - Instructor A changes visibility of collection to Public.
    - Instructor C logs in, can view and import the collection. Verify editing/deleting is disabled.
