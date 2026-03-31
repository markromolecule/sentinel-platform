# Subject-Term Management Tasks

## 1. Research & Planning

- [x] Investigate current `Subject` and `Term` models.
- [x] Investigate `SubjectForm` and `SubjectFormFields`.
- [x] Create Implementation Plan.
- [x] Receive User Approval on Plan.

## 2. Database & Schema

- [x] Modify `schema.prisma` to add `term_id`, `is_opened`, and offering dates to `subjects`.
- [ ] Run `pnpm prisma migrate dev` to apply changes. `Blocked: schema engine could not complete against the configured DB from this environment.`
- [x] Run `pnpm prisma generate` to update client.

## 3. Shared Types & Schema

- [x] Update `SubjectSchema.ts` with new fields.
- [x] Update `SubjectInput` and `Subject` types in `@sentinel/shared`.

## 4. Backend Service Updates

- [x] Update `getSubjects` to include new fields.
- [x] Update `createSubject` to handle new fields.
- [x] Update `updateSubject` to handle new fields.

## 5. Frontend UI Implementation

- [x] Update `SubjectFormFields` to include:
    - [x] Term selector (using `useSemestersQuery`).
    - [x] "Is Opened" Switch.
    - [x] Start and End Date pickers.
- [x] Update `useAddSubjectForm` and `useEditSubjectForm` hooks to handle the new form values.
- [x] Verify UI layouts in `AddSubjectDialog` and `EditSubjectDialog`.

## 6. Verification & Polishing

- [ ] Test the full CRUD flow for a subject with term associations.
- [ ] Verify "irregular student" use case (subject being opened for a term that is not its natural semester).
- [ ] Create Walkthrough.
