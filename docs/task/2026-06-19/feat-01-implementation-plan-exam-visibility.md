# Exam Visibility & Permission Model Implementation Plan

This plan outlines the steps to implement the Private/Assigned/Public visibility and permission logic for Exams and Question Bank Collections, as detailed in `docs/context/June/June 19/private-relationship-exam.md`.

## 1-3-1 Analysis

### Options

**Option 1: Direct Mapping (`exam_shares` Table)**
**Approach:** Create an `exam_shares` table containing `exam_id` and `user_id` to track explicit assignments, matching the existing `question_bank_collection_shares` table.
**Tradeoff:** Simple and highly consistent with the existing collection sharing logic, but requires a new table.

**Option 2: JSONB Array (`shared_with_user_ids`)**
**Approach:** Add a JSONB array column to the `exams` table to store assigned user IDs.
**Tradeoff:** Faster to implement with no new tables, but lacks relational integrity (foreign keys) and is harder to index/query efficiently.

**Option 3: Polymorphic `resource_shares` Table**
**Approach:** Create a generic `resource_shares` table with `resource_type` (e.g., 'EXAM', 'COLLECTION'), `resource_id`, and `user_id`. Refactor collections to use this.
**Tradeoff:** Extremely scalable and DRY, but requires significant refactoring of existing collection sharing logic and complex database constraints.

### Best Option

**Option 1** is the best choice. It maintains consistency with the existing database schema (which already uses `question_bank_collection_shares`) and avoids the complexity and risk of a polymorphic refactor (Option 3), while ensuring strong relational integrity (unlike Option 2).

## Next Steps & Open Questions

- [ ] **Open Question**: Does the `exam_shares` table name sound right, or do you prefer `exam_assignments`?
- [ ] **Open Question**: Confirm if we should cascade delete shares when an exam or user is deleted (standard behavior).

---

## Phase 1: Database Schema

**Goal:** Create the `exam_shares` table to support assigning users to private exams.

- [ ] Implement `packages/db/prisma/schema.prisma` — Add `exam_shares` model and relations.
- [ ] Run `pnpm db:migrate dev --name add_exam_shares`
      **Migration required:** Yes — to add the new `exam_shares` table.

## Phase 2: Exam Visibility & Sharing API

**Goal:** Provide endpoints to share exams and ensure list/detail endpoints respect visibility rules.

- [ ] Implement `app/sentinel-api/src/modules/examination/exams/services/share-exam.service.ts` — Create `exam_shares` records (owner only).
- [ ] Write tests at `app/sentinel-api/src/modules/examination/exams/services/share-exam.service.test.ts`
- [ ] Implement `app/sentinel-api/src/modules/examination/exams/services/unshare-exam.service.ts` — Remove `exam_shares` records.
- [ ] Write tests at `app/sentinel-api/src/modules/examination/exams/services/unshare-exam.service.test.ts`
- [ ] Implement `app/sentinel-api/src/modules/examination/exams/controllers/exam-sharing.controller.ts` — Define `POST /:id/shares` and `DELETE /:id/shares/:userId`.
- [ ] Write tests at `app/sentinel-api/src/modules/examination/exams/controllers/exam-sharing.controller.test.ts`
- [ ] Implement `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` — Update list queries to return exams if (user is owner) OR (is_public = true AND same institution) OR (user is in exam_shares).
- [ ] Implement `app/sentinel-api/src/modules/examination/exams/data/get-exam-detail.ts` — Enforce access control: block if private and not assigned/owner.

## Phase 3: Collection Visibility Alignment

**Goal:** Ensure Question Bank Collections follow the exact same visibility logic.

- [ ] Implement `app/sentinel-api/src/modules/content/question-collection/data/get-collections.ts` — Update queries to return collections if (user is owner) OR (is_public = true AND same institution) OR (user is in question_bank_collection_shares).
- [ ] Implement `app/sentinel-api/src/modules/content/question-collection/data/get-collection-detail.ts` — Block access if private and not assigned/owner.
- [ ] Write tests at `app/sentinel-api/src/modules/content/question-collection/tests/collection-sharing.test.ts`
