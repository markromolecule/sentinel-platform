# feat-001: Sentinel-Core Subject Classification Inheritance Controls

Read and summarize the task input in one sentence: update `sentinel-core` subject classifications so inherited records from the parent scope are visible, clearly labeled as `Local` or `Inherited`, and restricted so inherited records can be offered but not edited or deleted.

---

## Relevant Findings

- `app/sentinel-core/src/app/(protected)/subjects/classifications/page.tsx` already reads subject classifications with `useSubjectClassificationsQuery(...)` and passes edit, delete, and offer capabilities into the list UI.
- `app/sentinel-core/src/app/(protected)/subjects/_components/cards/subject-classification-card.tsx` already renders `InheritanceStatusBadge` and hides edit/delete buttons when `isParentOwnedRecord(classification)` is true.
- `app/sentinel-core/src/app/(protected)/subjects/classifications/[id]/page.tsx` already disables the manage action for inherited records while still allowing `Offer Subjects`.
- `app/sentinel-api/src/modules/core/subject-classification/services/get-subject-classifications.service.ts` is inheritance-aware, but its parent-institution branch uses `getSubjectClassificationsData(...)` directly rather than `loadEffectiveRows(...)`, which is the likeliest gap if inherited parent classifications are not showing in `sentinel-core`.
- Likely touched DB tables: `subject_classifications`, `subject_classification_subjects`, `subject_classification_courses`, `subjects`, and `institutions`.
- Prisma migration needed: No. This work is behavior and query-resolution only; no schema change is implied by the request.

---

## Viable Options

### Option 1: UI-only hardening in sentinel-core

Update only the `sentinel-core` list/card/detail components to show explicit `Local` / `Inherited` states and lock edit/delete for inherited records, assuming the API already returns every inherited classification needed.

Tradeoff: fastest path, but it does not solve missing inherited parent classifications if the backend scope resolution is the real gap.

### Option 2: Normalize inheritance resolution in the subject-classification API, then tighten sentinel-core UI controls

Adjust the subject-classification service so parent-scope reads also resolve effective inherited rows, then make the list card and detail screens consistently show status and block edit/delete while keeping offer enabled.

Tradeoff: slightly broader change than UI-only, but it matches the likely root cause and keeps inheritance behavior consistent across consumers.

### Option 3: Add a dedicated API flag or endpoint for “effective classifications”

Introduce a separate backend query mode or route for inherited/effective subject classifications, then opt `sentinel-core` into that new contract and update the UI controls accordingly.

Tradeoff: most explicit API design, but it adds avoidable surface area and more migration/testing overhead than the existing codebase likely needs.

---

## Best Option

**Option 2** is the best fit because the current code already has most of the UI restrictions in place, and the highest-risk gap is data completeness for parent-scope inheritance resolution. Fixing the service path first preserves a single inheritance model for subject classifications, keeps the frontend simple, and avoids introducing a new endpoint just to work around an incomplete effective-row read.

Concrete numbered next steps:

1. Confirm and correct the parent-scope resolution path in `GetSubjectClassificationsService.getSubjectClassifications(...)` so parent institutions receive inherited/effective classification rows, not only raw institution-local rows.
2. Standardize how `sentinel-core` list and detail views derive inherited state, preferring a single helper check across card and page components.
3. Make the card and details UI always surface `Local` or `Inherited` status clearly while ensuring inherited records retain `Offer` access but lose `Edit` and `Delete`.
4. Add focused Vitest coverage for API inheritance resolution, page permission wiring, and card action visibility.

---

## Proposed Changes

### Phase 1: Verify and Correct Effective Subject Classification Reads

**Goal:** Ensure `sentinel-core` receives inherited subject classifications for the active institution scope, including parent-scope scenarios that currently may bypass effective-row merging.

- [x] Review and update `app/sentinel-api/src/modules/core/subject-classification/services/get-subject-classifications.service.ts` so the parent-visible branch resolves effective inherited classifications consistently with `loadEffectiveRows(...)` semantics instead of relying only on raw `getSubjectClassificationsData(...)` results.
- [x] Confirm whether `app/sentinel-api/src/modules/core/subject-classification/services/get-subject-classifications.service.ts` should preserve branch visibility for parent institutions while still including inherited parent records, and document that decision inline with a concise comment if the merge logic is non-obvious.
- [x] Verify `app/sentinel-api/src/modules/core/subject-classification/helper/subject-classification-mapper.ts` preserves `inheritance_status`, `is_inherited`, `is_local`, `origin_institution_id`, and `effective_institution_id` for every resolved record shape used by the service.
- [x] Add or update Vitest coverage in `app/sentinel-api/src/modules/core/subject-classification/subject-classification.read-scope.test.ts` to prove a parent institution can read inherited subject classifications from its own effective scope.
- [x] Add or update Vitest coverage in `app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.test.ts` to validate pagination and mapped inheritance metadata after the service-level change.
      **Migration required:** No — query resolution and mapper behavior only.

### Phase 2: Align Sentinel-Core List Behavior With Inheritance Rules

**Goal:** Make the `sentinel-core` subject classification list clearly show `Local` or `Inherited` state and enforce the requested action constraints on every card.

- [x] Update `app/sentinel-core/src/app/(protected)/subjects/classifications/page.tsx` to pass only the action handlers that inherited classifications are allowed to use, keeping `Offer` enabled while withholding edit/delete for inherited records through the existing list/card flow.
- [x] Update `app/sentinel-core/src/app/(protected)/subjects/_components/cards/subject-classification-card.tsx` to ensure the status badge visibly communicates `Local` or `Inherited` on every rendered card and that inherited cards cannot expose edit/delete affordances even when the page passes those capabilities.
- [x] Update `app/sentinel-core/src/app/(protected)/subjects/_components/views/subject-classifications-list.tsx` only as needed to preserve consistent behavior across paginated lists and prevent regressions in how actions are forwarded into each card.
- [x] Add or update a component test next to `app/sentinel-core/src/app/(protected)/subjects/_components/cards/subject-classification-card.tsx` as `subject-classification-card.test.tsx` to verify inherited cards show the inherited badge, retain offer, and suppress edit/delete.
- [x] Add or update `app/sentinel-core/src/app/(protected)/subjects/classifications/page.test.tsx` to verify the page still renders mixed local/inherited classifications and wires permissions without re-enabling forbidden inherited actions.
      **Migration required:** No — UI-only behavior update.

### Phase 3: Align Sentinel-Core Details View With The Same Constraints

**Goal:** Keep the subject-classification detail page consistent with the list by clearly labeling inherited state and restricting inherited management actions while preserving offering behavior.

- [x] Update `app/sentinel-core/src/app/(protected)/subjects/classifications/[id]/page.tsx` to confirm the inheritance badge always shows `Local` or `Inherited`, inherited records keep `Offer Subjects`, and inherited records cannot enter edit/manage flows.
- [x] Review `app/sentinel-core/src/app/(protected)/subjects/_hooks/use-subject-classifications-management.ts` and keep it free of any path that could open edit state for inherited classifications once list/detail constraints are tightened.
- [x] Add or update a details-page test next to `app/sentinel-core/src/app/(protected)/subjects/classifications/[id]/page.tsx` as `page.test.tsx` to verify inherited records show the proper status and keep `Offer Subjects` while disabling management.
- [x] Add or update dialog interaction tests for `app/sentinel-core/src/app/(protected)/subjects/_components/dialogs/offer-classification-subjects-dialog.tsx` only if the inherited flow needs explicit coverage to guard against accidental permission regressions.
      <!-- NOTE: No separate dialog-spec test was added because `app/sentinel-core/src/app/(protected)/subjects/classifications/[id]/page.test.tsx` now covers the inherited offer flow and confirms the dialog still opens for inherited records. -->
      **Migration required:** No — page behavior and tests only.

### Phase 4: Verification and Regression Sweep

**Goal:** Validate that inheritance visibility and action constraints work end-to-end in `sentinel-core` without breaking existing classification management.

- [x] Run focused Vitest coverage for `app/sentinel-api/src/modules/core/subject-classification` after the service updates.
- [x] Run focused Vitest coverage for `app/sentinel-core/src/app/(protected)/subjects/classifications` and `app/sentinel-core/src/app/(protected)/subjects/_components/cards`.
- [ ] Manually verify in `sentinel-core` that a local classification shows `Local` plus offer/edit/delete actions, while an inherited classification shows `Inherited` plus offer-only behavior on both list and detail pages.
- [ ] Manually verify a parent-institution user can see inherited classifications that resolve through the parent scope and can open the offer flow without being allowed to edit or delete them.
      <!-- NOTE: Automated verification is complete. Manual browser verification is still pending because no local `sentinel-core` / API instance was running on the expected localhost ports during this execution phase. -->
      **Migration required:** No — verification only.

---

## Breaking API Changes

- None expected if the service continues returning the existing subject classification shape and only fixes missing inherited/effective records.

## Environment Variables

- No new `.env` variables expected.

## Migration Rollback Note

- No database migration is planned, so no rollback script is required.
