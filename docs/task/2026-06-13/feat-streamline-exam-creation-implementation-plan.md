# Implementation Plan: Streamline Administrator Exam Creation & Instructor Assignment

Streamline the exam creation workflow on the administrator panel (`sentinel-core`) by eliminating the redirect to the question builder and allowing administrators to optionally assign the exam to an instructor directly from the creation form.

## Pre-Planning

- **Task Summary:** Modify the admin exam creation form to include an instructor assignment dropdown, run sequential creation/assignment actions upon submission, and remain on the exams dashboard (without redirecting to builder).
- **Relevant Files:**
    - `packages/shared/src/schema/exams/exam-create-schema.ts`
    - `packages/shared/src/constants/exams/exam-constants.ts`
    - `packages/hooks/src/query/exams/use-assign-exam-mutation.ts`
    - `packages/hooks/src/query/exams/index.ts`
    - `app/sentinel-core/src/features/exams/config/_hooks/use-exam-create-form.ts`
    - `app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields.tsx`
- **Database Tables:** `proctor_assignments`, `exams` (no schema change)
- **Migration Required:** No

---

## 1-3-1 Solution Options

### Option 1: Client-Side Sequential Mutations (Recommended)

Add an optional `instructorId` field to the shared client-side form schema. Upon form submission, create the exam, retrieve the returned exam's ID, and trigger the existing proctor assignment endpoint `/examination/assign` sequentially. Remove the redirection to the question builder.

- **Tradeoff:** Cleanest fit with existing APIs and avoids any backend modifications, but introduces sequential requests where the second request could theoretically fail (handled via error toasts).

### Option 2: Combined Backend Exam & Assignment Endpoint

Extend the POST `/exams` endpoint to accept an optional `instructorId`. Modify the API service logic to create both the exam and the proctor assignment within the same database transaction.

- **Tradeoff:** Ensures absolute backend atomicity for creation and assignment, but requires modifying backend DTO validation, transaction code, services, and multiple controller tests.

### Option 3: Post-Creation Dialog Wizard

Keep the current exam creation flow intact (without redirecting to builder) and open a secondary modal dialog after creation asking the administrator if they would like to assign an instructor to the exam.

- **Tradeoff:** Keeps the creation form simpler, but introduces extra UI states, popups, and user interaction steps.

### Chosen Option

We select **Option 1**. It leverages the monorepo's fully featured, existing proctor assignment services and endpoints. It isolates changes to the client-side configuration, schema, and core UI, avoiding high-overhead modifications to the Hono API DTO schemas.

---

## Proposed Changes

### Phase 1: Shared Schema & Constants Setup

**Goal:** Extend the shared exam creation form schema and defaults to support an optional instructor identifier.

- [x] Modify [exam-create-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-create-schema.ts) to add an optional UUID `instructorId` field:
    ```ts
    instructorId: z.string().uuid({ message: 'Select a valid instructor.' }).optional(),
    ```
- [x] Modify [exam-constants.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/constants/exams/exam-constants.ts) to add `instructorId: undefined` to the returned default values in `getExamCreateFormDefaults`.
- [x] Write a unit test in `packages/shared/src/schema/exams/exam-create-schema.test.ts` (or existing tests) to verify validation of the schema with and without `instructorId`.

**Migration required:** No

---

### Phase 2: React Query Hook for Assignment Mutation

**Goal:** Implement a reusable TanStack Query mutation hook for proctor assignments.

- [x] Create a new file [use-assign-exam-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/exams/use-assign-exam-mutation.ts) to wrap the `assignExam` service:

    ```ts
    import { useMutation, useQueryClient } from '@tanstack/react-query';
    import { assignExam } from '@sentinel/services';
    import { useApi } from '../../api-provider';

    export function useAssignExamMutation() {
        const apiClient = useApi();
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (payload: { examId: string; assigneeId: string }) =>
                assignExam(apiClient, payload),
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: ['exam-assignments'],
                });
            },
        });
    }
    ```

- [x] Export the new hook from [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/exams/index.ts).
- [x] Write a unit test file `packages/hooks/src/query/exams/use-assign-exam-mutation.test.ts` to mock the API call and verify cache invalidation on success.

**Migration required:** No

---

### Phase 3: Form Layout & Submission Logic in sentinel-core

**Goal:** Modify the administrator's exam form submission logic to execute assignment and remove builder redirection.

- [x] Modify [use-exam-create-form.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/config/_hooks/use-exam-create-form.ts):
    - Import and call `useAssignExamMutation`.
    - In `onSubmit`, execute `const createdExam = await createExamMutation.mutateAsync(...)`.
    - If `data.instructorId` is present, call `await assignExamMutation.mutateAsync({ examId: createdExam.id, assigneeId: data.instructorId })`.
    - Remove the `useExamStore.getState().setSetupDraft(...)` store update and `router.push(...)` redirecting to builder.
    - Keep `form.reset(getExamCreateFormDefaults())` and `onClose()`.
- [x] Write unit tests in `app/sentinel-core/src/features/exams/config/_hooks/use-exam-create-form.test.ts` to mock the creation/assignment mutations and verify the lack of builder redirect.

**Migration required:** No

---

### Phase 4: UI Dropdown Component Integration

**Goal:** Add the instructor selection dropdown to the exam creation form.

- [x] Modify [basic-info-fields.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields.tsx):
    - Import `useUsersQuery` from `@sentinel/hooks`.
    - Retrieve instructors list using `const { data: users = [], isLoading } = useUsersQuery({ role: 'instructor' })`.
    - Add a form dropdown selector "Assign to Instructor (Optional)" listing all instructors.
- [x] Write a component unit test in `app/sentinel-core/src/features/exams/_components/forms/fields/basic-info-fields.test.tsx` to verify the rendering of the instructor selection dropdown.

**Migration required:** No

---

## Verification Plan

### Automated Tests

- Run `pnpm --dir packages/hooks test` to execute hooks test suites.
- Run `pnpm --dir app/sentinel-core test` to verify layout and form hooks.
- Run `pnpm lint` and `pnpm format:check` to ensure code styles comply with repo guidelines.

### Manual Verification

1. Boot the backend server and frontend workspaces using `pnpm dev`.
2. Access `sentinel-core` on `localhost:3002/exams`.
3. Open the "Create Exam" dialog and verify that a new field labeled "Assign to Instructor" displays.
4. Fill in the fields, select an instructor, and submit.
5. Verify the modal closes, a success toast displays, and the page is refreshed without redirecting to `/exams/[id]/builder`.
6. Visit the Assignments page to verify that the exam proctor assignment is successfully registered for the proctor.
