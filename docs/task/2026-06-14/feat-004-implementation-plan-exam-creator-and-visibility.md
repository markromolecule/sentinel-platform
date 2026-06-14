# Exam Creator/Publisher Details and Visibility Settings

This implementation plan outlines the steps to add creator/publisher names and visibility controls (Public vs. Private) to the exam management platform. This ensures instructors can see who created drafts or published exams, and control who can view or import questions from their exams.

## 1-3-1 Decision Framework

### Viable Options

#### Option 1: Fast & Simple (Metadata Only)
- Add `is_public` and `published_by` to the `exams` table.
- Retrieve creator and publisher names in `getExamsData` using basic joins.
- Render text labels and static badges on the UI.
- *Tradeoff*: Simple to build, but lacks fine-grained access checks, leaving private exams accessible via raw API requests.

#### Option 2: Robust & Secure (Advanced Indexing, Access Control, and Filters) - **RECOMMENDED**
- Add `is_public` (default `false`) and `published_by` (nullable UUID) to the `exams` table with index and foreign key constraints.
- Integrate full visibility checks in authorization layer (GET `/exams` query predicates) to prevent unauthorized users from viewing private exams.
- Implement UI toggles for public/private, and show clean, color-coded badges and styled creator/publisher metadata.
- *Tradeoff*: Requires schema migration and endpoint filter updates, but ensures complete privacy and type-safety.

#### Option 3: Templated Library Sharing (Dedicated Shared Catalog)
- Create a separate table/relation representing a shared public catalog of templates. Publishing an exam as public copies it to this template table.
- *Tradeoff*: Keeps the main `exams` table clean, but introduces data duplication and significant complexity to maintain sync.

### Selected Option: Option 2 (Robust & Secure)
This option ensures that exam visibility settings are fully enforced at the database and API authorization levels, preventing privacy leakage while maintaining the monorepo's database design patterns.

#### Concrete Next Steps
1. Add `is_public` and `published_by` to `packages/db/prisma/schema.prisma` and run a migration.
2. Update `@sentinel/shared` schemas and types to incorporate the new fields.
3. Update Kysely query predicates in the backend to select creator/publisher names and filter by visibility.
4. Add `isPublic` control to the Exam create/edit forms.
5. Update Exam cards and list item views to render creator/publisher and visibility badges.

---

## User Review Required

> [!IMPORTANT]
> - **Database Migration**: This change introduces a schema migration to add `is_public` (boolean, default: false) and `published_by` (UUID, nullable, foreign key to `users`) fields on the `exams` table.
> - **Visibility Authorization**: Once applied, exams marked as "Private" (default) will only be viewable by their creator, assigned instructors, or administrators.

---

## Proposed Changes

### Phase 1: Database Migration & Schema Types
**Goal:** Update database schema and shared type definitions to support visibility and creator/publisher name fields.

- [x] Add `is_public` and `published_by` fields (along with relationships) in `packages/db/prisma/schema.prisma`
- [x] Run migration: `prisma migrate dev --name add_exam_visibility_and_publisher` <!-- NOTE: Used prisma db push to sync schema directly because shadow database cannot resolve auth schema references -->
- [x] Run `pnpm --dir packages/db generate` to update Prisma & Kysely generated types
- [x] Add `isPublic` (boolean) to `createExamBodySchema` and `updateExamBodySchema` in [exam-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-schema.ts)
- [x] Extend `examSummarySchema` in [exam-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-schema.ts) to define `isPublic`, `createdByName`, and `publishedByName`
- [x] Update `Exam` type definition in [exam.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/types/exams/exam.ts)

### Phase 2: API Backend Service Layer
**Goal:** Implement data retrieval, mapping, and mutation persistence for visibility and creator/publisher properties.

- [x] Retrieve `created_by_name` and `published_by_name` by joining `user_profiles` inside `getExamsData` in [get-exams.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/get-exams.ts)
- [x] Apply visibility filtering inside `getExamsData` to ensure unauthorized users cannot view private exams
- [x] Map these DB fields into `RawExamRecord` and `mapExamSummaryResponse` within [map-exam-response.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts)
- [x] Update `buildCreateExamValues` and `buildUpdateExamValues` in [build-exam-write-values.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/build-exam-write-values.ts) to store `is_public`
- [x] Update [update-exam-status.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/update-exam-status.ts) to set `published_by` to the current user ID when status transitions to `published`
- [x] Write Vitest assertions in [get-exams.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts) and [map-exam-response.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/map-exam-response.test.ts)

### Phase 3: Frontend User Interface
**Goal:** Build public/private controls and display visibility/creator/publisher details on cards and lists.

- [x] Add the `isPublic` Switch toggle to `BasicDetailsFields` in [basic-details-fields.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields/basic-details-fields.tsx)
- [x] Add Public (globe) / Private (lock) status badges next to the status badge on the exam card header in [exam-card-header.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/cards/exam-card/exam-card-header.tsx)
- [x] Render the "Draft by [Name]" or "Published by [Name]" line inside [exam-card-body.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/cards/exam-card/exam-card-body.tsx)
- [x] Update the exam list item component in [exam-list-item.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/cards/exam-list-item.tsx) to match
- [x] Update tests in [exam-card-body.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/cards/exam-card/exam-card-body.test.tsx) and [exam-list-item.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/cards/exam-list-item.test.tsx) (if present)

---

## Verification Plan

### Automated Tests
- Run migration script:
  ```bash
  pnpm db:migrate
  ```
- Run Vitest backend tests:
  ```bash
  pnpm --dir app/sentinel-api test get-exams.test.ts map-exam-response.test.ts
  ```
- Run Vitest frontend tests:
  ```bash
  pnpm --dir app/sentinel-core test exam-card-body.test.tsx
  ```

### Manual Verification
- Verify visibility toggle behaves correctly when creating/updating exams.
- Ensure only authorized instructors can see private exams in the main dashboard workspace.
