# Exams Module Refactor — To-Do Plan

> Generated: 2026-03-18 | Status: **Planning**

---

## Goal

Refactor the `features/exams` module to simulate the full exam flow (exam page → builder page → publishing/saving) using mock data from `packages/shared`, without real services, stores, or data-access layers. Keep all UI components intact.

---

## 1. Fix DB Package Build Error

- [ ] Rebuild `packages/db` dist to fix the truncated/corrupted `dist/index.js` (esbuild error at line 1041)
  - Run `pnpm --filter @sentinel/db build` from the monorepo root to regenerate the dist

---

## 2. Clean Up Exams Feature — Remove Unnecessary Layers

Per the user's request: remove `_services`, `_stores` (root), `_data`, and simplify `_hooks`.

### 2a. Delete layers that are no longer needed
- [ ] Delete `features/exams/_services/` (get-exams-service.ts, create-exam-service.ts)
- [ ] Delete `features/exams/_data/` (get-exams.ts, create-exam.ts)
- [ ] Delete `features/exams/_stores/` (root folder, currently empty)
- [ ] Delete `features/exams/_hooks/use-exams/` — replace with direct mock usage

### 2b. Move mock data to `packages/shared`
- [ ] Move `features/exams/_mock/exams.ts` mock data to `packages/shared/src/mock-data/`
  - Add `MOCK_EXAMS` export to `packages/shared/src/mock-data/index.ts`
- [ ] Move `features/exams/_mock/questions.ts` to `packages/shared/src/mock-data/`
  - Add `MOCK_EXAM_QUESTIONS` export to index
- [ ] Move `features/exams/_mock/mock-data.ts` to `packages/shared/src/mock-data/`
- [ ] Move `features/exams/_mock/question-meta.ts` to `packages/shared/src/mock-data/`
- [ ] Delete `features/exams/_mock/` after migration

### 2c. Simplify `_hooks`
- [ ] Rewrite `features/exams/_hooks/use-proctor-exams.ts` to use mock data directly
  - Remove dependency on `useExams` (which uses `getExamsService`)
  - Import `mockExams` from `@sentinel/shared/mock-data` (via `MockData`)
- [ ] Delete `features/exams/_hooks/use-exams/` directory

---

## 3. Simplify the Builder Module

- [ ] Keep `builder/_components/` as-is (all UI components preserved)
- [ ] Keep `builder/_stores/use-exam-builder-store.ts` (used by `use-exam-create-form`)
- [ ] Delete `builder/_types/` if empty / only has non-component types
- [ ] Delete `builder/_constants/` if empty

---

## 4. Simplify the Config Module

- [ ] Keep `config/_components/` as-is (all UI components preserved)
- [ ] Keep `config/_hooks/use-exam-create-form.ts` — already uses store+mock approach (no real service call)
- [ ] Review and optionally simplify `config/_hooks/use-exam-config-form.ts`
- [ ] Delete `config/_hooks/` empty sub-dirs if any

---

## 5. Update the Feature Entry Point

- [ ] Update `features/exams/index.ts` to remove exports for deleted layers:
  - Remove: `_hooks/use-proctor-exams` (will be updated)
  - Remove: `_hooks/use-exams`
  - Remove: `config/_hooks/use-exam-config-form` (keep for now if used)
  - Remove: `_mock/exams` (moved to shared)
  - Remove: `_services/get-exams-service`
  - Remove: `_services/create-exam-service`
  - Add: updated `_hooks/use-proctor-exams` export

---

## 6. Update `_components/index.ts`

- [ ] Verify `_components/index.ts` still works after mock/service removals
- [ ] No UI components should be changed or broken

---

## 7. Verify Page Files Are Unaffected

- [ ] `app/(protected)/(proctor)/exams/page.tsx` — imports `useProctorExams` and `ExamCard`, both preserved
- [ ] `app/(protected)/(proctor)/exams/[id]/builder/page.tsx` — imports builder components, preserved

---

## 8. Verify Build & Dev Server

- [ ] Run `pnpm dev` and confirm no TypeScript errors in the exams module
- [ ] Manually navigate to `/exams` and confirm the exam list renders with mock data
- [ ] Click "Create Exam" → verify dialog opens → fill form → verify redirect to `/exams/[id]/builder`
- [ ] Verify builder page loads

---

## Notes

- **1-3-1 Rule**: For each change (1 feature), we must not break more than 3 files, and each file change should be 1 clear concern.
- **Shared types**: `Exam`, `ExamQuestion`, `QuestionType`, etc. remain in `packages/shared/src/types/exams/exam.ts` — no changes needed.
- **Shared constants**: `EXAM_CREATE_FORM_DEFAULTS`, `examCreateFormSchema` remain in `packages/shared/src/constants/exams/` and `packages/shared/src/schema/` — no changes needed.
