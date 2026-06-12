---
trigger: always_on
---

# Instructor Layout Refactor Implementation Plan

## Summary

Refactor the `sentinel-web` instructor experience so `Exams` and `Question Bank` use page-owned navigation like `Subjects`, while removing nested sub-items from the global instructor sidebar. This is a UI-only change, so no Prisma migration is required.

## Relevant Files

- `app/sentinel-web/src/components/sidebar/instructor/constants/index.ts`
- `app/sentinel-web/src/components/sidebar/instructor/hooks/use-instructor-nav.ts`
- `app/sentinel-web/src/components/sidebar/instructor/instructor-sidebar.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/subjects/layout.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-page-shell.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-nav.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-workspace-shell.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/exams/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/layout.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/page.tsx`

## Phase 1: Map the route ownership

**Goal:** Confirm which routes keep shared chrome and which routes should own local navigation.

- [x] Review `app/sentinel-web/src/app/(protected)/(instructor)/exams/page.tsx`, `assign/page.tsx`, and `grading/page.tsx` to verify the current navigation entry points.
- [x] Review `app/sentinel-web/src/app/(protected)/(instructor)/question/page.tsx`, `question/bank/page.tsx`, `collections/page.tsx`, and `tos/page.tsx` to verify the current navigation entry points.
- [x] Compare the current subject shell in `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-workspace-shell.tsx` and `subject-nav.tsx` to reuse the same layout model.
- [x] Confirm that this refactor is UI-only and does not require a Prisma migration, backend route change, or schema update.
- [x] Draft the exam and question-bank nav state map, including any query-string-driven states that must remain deep-link safe.

**Migration required:** No. The task only changes page layout and sidebar navigation.

## Phase 2: Build the Exams local shell

**Goal:** Move exam sub-navigation into the exams route group and keep the shell consistent with the subject layout.

- [x] Add `app/sentinel-web/src/app/(protected)/(instructor)/exams/layout.tsx` so every exam sub-page shares one wrapper.
- [x] Add `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-nav.tsx` to render the local exams navigation.
- [x] Add `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-workspace-shell.tsx` to handle desktop and mobile layout behavior.
- [x] Add `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-page-shell.tsx` for the page header, separator, and content spacing pattern.
- [x] Preserve the current exam destinations, including any query-string-based views such as assign and grading.
- [x] Add `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-nav.test.tsx` to cover active-state rendering and link targets.

**Migration required:** No. There is no DB or API impact.

## Phase 3: Build the Question Bank local shell

**Goal:** Move question-bank sub-navigation into the `question` route group and keep its content pages focused.

- [x] Add `app/sentinel-web/src/app/(protected)/(instructor)/question/layout.tsx` so all question routes share one wrapper.
- [x] Add `app/sentinel-web/src/app/(protected)/(instructor)/question/_components/layout/question-bank-nav.tsx` to render the local question-bank navigation.
- [x] Add `app/sentinel-web/src/app/(protected)/(instructor)/question/_components/layout/question-bank-workspace-shell.tsx` to mirror the subject-style responsive shell.
- [x] Add `app/sentinel-web/src/app/(protected)/(instructor)/question/_components/layout/question-bank-page-shell.tsx` for consistent header and spacing behavior.
- [x] Keep `QuestionBankPageContent` and `QuestionBankCollectionsPageContent` focused on content, dialogs, tables, and hooks instead of route chrome.
- [x] Add `app/sentinel-web/src/app/(protected)/(instructor)/question/_components/layout/question-bank-nav.test.tsx` to cover the all-questions, collections, and TOS destinations.

**Migration required:** No. This is a frontend layout-only change.

## Phase 4: Flatten the global instructor sidebar

**Goal:** Remove nested children from the global sidebar so Exams and Question Bank stop duplicating their local navigation there.

- [x] Update `app/sentinel-web/src/components/sidebar/instructor/constants/index.ts` to remove the `children` arrays from the `Exams` and `Question Bank` items.
- [x] Update `app/sentinel-web/src/components/sidebar/instructor/hooks/use-instructor-nav.ts` so it only tracks top-level active state for Exams and Question Bank.
- [x] Update `app/sentinel-web/src/components/sidebar/instructor/instructor-sidebar.tsx` so the sidebar renders a flatter management section without nested exam or question-bank items.
- [x] Add or update `app/sentinel-web/src/components/sidebar/instructor/instructor-sidebar.test.tsx` so it verifies the two sections still render and no longer expose child menu items.
- [x] Add or update any sidebar item tests needed to keep active-state behavior stable after the menu flattening.

**Migration required:** No. The sidebar change is purely client-side.

## Phase 5: Wire pages to the new shells

**Goal:** Wrap every affected page in the new local shell and keep page content unchanged.

- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/exams/page.tsx` to use the new exams shell.
- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/page.tsx` to use the same exams shell.
- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/page.tsx` to use the same exams shell.
- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/question/page.tsx` and `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/page.tsx` so question-bank routes use the new local shell consistently.
- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/page.tsx` and `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/page.tsx` to render inside the same question-bank layout.
- [x] Add or update page-level render tests for the affected routes so the new shell does not break headers, spacing, or content mounting.

**Migration required:** No. Route composition only.

## Phase 6: Validate spacing, responsiveness, and deep links

**Goal:** Make sure the refactor feels intentional on desktop and mobile and does not break navigation paths.

- [x] Verify the new shells preserve the spacing rhythm used by the subject layout, especially the page header and separator spacing.
- [x] Verify the mobile navigation presentation remains usable without the old sidebar children.
- [x] Verify the desktop shell does not clip tables, dialogs, or wide content in question bank pages.
- [x] Verify exam deep links still resolve correctly, including the assign and grading states.
- [x] Run focused tests for the touched sidebar and layout components, then run lint or formatting on the modified files.

**Migration required:** No. Final verification only.

## Done Criteria

- The global instructor sidebar no longer shows nested sub-items for `Exams` or `Question Bank`.
- The `Exams` and `Question Bank` page groups each own their sub-navigation inside a route-level shell.
- The new shells match the `Subjects` layout pattern for spacing and responsiveness.
- Existing routes and deep links continue to work.
- No Prisma, API, or backend change is introduced.
