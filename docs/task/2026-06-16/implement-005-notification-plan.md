# Assign Notifications and Question Visibility

## Summary
Implement assignment notifications for exams and question collections, then enforce viewer-scoped question visibility in the question bank and TOS matrix so private, unshared collections from other users stay hidden while self-created and shared questions remain visible.

## Key Changes
- Add additive notification contract support for collection assignments in the shared notification schema.
- Emit a collection-assignment notification when a collection share adds a new user; removing a user from the share list revokes access but does not notify.
- Keep the existing exam-assignment notification path intact and regression-tested.
- Move question visibility into the backend query layer for both the question list and the TOS matrix using the same ownership/public/share/self-created rules.
- No new environment variables and no Prisma migration are required.

### Phase 1: Collection Assignment Notifications
**Goal:** Notify only newly added collection assignees after a successful share update.

- [x] Update `packages/shared/src/schema/notifications/notification-schema.ts` to add a collection-assignment notification action type and collection resource type.
- [x] Add a new API notification service in `app/sentinel-api/src/modules/general/notification/services/question-bank-collection-notification.service.ts` that creates the collection-assignment notification payload.
- [x] Update `app/sentinel-api/src/modules/content/question-collection/controllers/share-question-collection.controller.ts` to diff the previous share set against the submitted `userIds`, commit the replacement share list, and send notifications only to newly added users after the transaction succeeds.
- [x] Write `app/sentinel-api/src/modules/general/notification/services/question-bank-collection-notification.service.test.ts` and extend `app/sentinel-api/src/modules/content/question-collection/controllers/share-question-collection.controller.test.ts` to cover add-only notifications, no notification on removals, and failure handling.
- Migration required: No.

### Phase 2: Exam Assignment Regression Guard
**Goal:** Preserve the existing exam assignment notification behavior while locking it down with tests.

- [x] Verify that `app/sentinel-api/src/modules/examination/assign/services/create-exam-assignment.ts` and `app/sentinel-api/src/modules/examination/assign/services/respond-to-exam-assignment.ts` still invoke `app/sentinel-api/src/modules/general/notification/services/exam-notification.service.ts`.
- [x] Refresh `app/sentinel-api/src/modules/general/notification/services/exam-notification.service.test.ts`, `app/sentinel-api/src/modules/examination/assign/services/create-exam-assignment.test.ts`, and `app/sentinel-api/src/modules/examination/assign/services/respond-to-exam-assignment.test.ts` to lock the assign, accept, and reject notification contract.
- Migration required: No.

### Phase 3: Viewer-Scoped Question Visibility
**Goal:** Hide questions from private, unshared collections of other users in both the question bank and TOS matrix.

- [x] Add a shared visibility helper in `app/sentinel-api/src/modules/content/question/data/question-visibility.ts` and apply it from `app/sentinel-api/src/modules/content/question/data/get-questions.ts` and `app/sentinel-api/src/modules/content/question-bank/data/get-tos-matrix.ts`.
- [x] Pass `user.id` through `app/sentinel-api/src/modules/content/question/controllers/get-questions.controller.ts` and `app/sentinel-api/src/modules/content/question-bank/controllers/get-tos-matrix.controller.ts` so both queries enforce the current user’s visibility context.
- [x] Keep questions visible when they are uncollected, public, owned by the viewer, shared with the viewer, or created by the viewer; hide only questions that fail all visibility checks.
- [x] Write `app/sentinel-api/src/modules/content/question/data/get-questions.test.ts` and `app/sentinel-api/src/modules/content/question-bank/data/get-tos-matrix.test.ts` to cover visible and hidden combinations, including the self-created exception.
- Migration required: No.

## Test Plan
- Run `pnpm --dir app/sentinel-api test` after implementation.
- Add focused Vitest coverage for the new collection notification service and the share controller diff logic.
- Add focused Vitest coverage for the exam assignment notification regression path.
- Add focused Vitest coverage for the question list and TOS matrix visibility predicates.
- Add UI regression coverage only if the new collection notification needs a special consumer-side presentation beyond the existing default notification rendering.

## Assumptions
- “Unassign” means removing a user from the collection share list; no separate unassign endpoint is needed.
- Collection-assignment notifications can use the existing generic notification rendering path without a new inbox category.
- The TOS matrix should reflect the same visibility rules as the question bank list, not institution-wide totals.
- This is an additive contract change only; there is no breaking API migration or schema migration.

<!-- NOTE: I also updated `packages/db/src/generated/types.ts` so the new notification enum values stay aligned with the Kysely database types. No Prisma migration was added. -->
