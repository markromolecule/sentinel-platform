# Exam Builder Page Refactoring To-Do Plan

This document outlines the systematic refactoring of the `ExamBuilderPage` component located at `app/(protected)/(instructor)/exams/[id]/builder/page.tsx`, adhering to the `.agents/workflows/refactor-web-components.md` and related `.agents/rules/web` guidelines.

## 1-3-1 Analysis

**1 Problem/Goal:**
The `ExamBuilderPage` is currently a monolithic component containing too much logic intertwined with the UI. It violates the Single Responsibility Principle by handling routing, state management (extracting ID, search params, managing multiple local states for UI toggles), and executing complex domain logic (creating, duplicating, saving questions). It needs to be refactored to be modular, scalable, and readable.

**3 Options:**

- **Option A: Full Component Split with Inline Logic.** Split the UI into smaller sub-components inside `page.tsx`, but keep the state and data handlers at the top of the file and drill them down as props.
- **Option B: Move to Global Store.** Move all local UI states (`isTypeSelectorOpen`, `activeQuestionType`, `editingQuestion`) into the existing `useExamStore` Zustand store and read them directly in the UI components.
- **Option C: Extract Controller Hook (Container/Presentational Pattern).** Create a collocated custom hook (`useExamBuilder`) in `_hooks/use-exam-builder/` to encapsulate all the local UI states, route parameters, and interaction handlers. The `page.tsx` becomes purely presentational.

**1 Recommendation:**
**Option C** is the recommended approach. It perfectly aligns with the `.agents/workflows/refactor-web-components.md` step 2 ("Extract data fetching and state management logic into custom hooks") and adheres strictly to the defined `project-structure.md` for route domains.

---

## Refactoring To-Do List

- [x] **Step 1: Create Hook Structure**
    - Create the required directories for the Custom Hook: `app/(protected)/(instructor)/exams/[id]/builder/_hooks/use-exam-builder/`.
    - Create `index.ts` for the hook implementation.
    - Create `_types.ts` for any localized types related to the hook (if needed).

- [x] **Step 2: Extract Logic into `useExamBuilder`**
    - Move state declarations (`isTypeSelectorOpen`, `activeQuestionType`, `editingQuestion`) to the hook.
    - Move Next.js hooks (`useParams`, `useSearchParams`, `useRouter`) to the hook.
    - Move `useExamStore` logic and action aggregations (`handleCreateQuestion`, `handleDuplicateQuestion`, `handleEditQuestion`, `handleUpdateQuestion`, `handleDeleteQuestion`, `handleBackFromBuilder`, `handleSave`, `handlePublish`) into the hook.
    - Add an initialization `useEffect` to `loadExam(id)` inside the hook.
    - Return all necessary state and functions in a clean, typed object from the hook.

- [x] **Step 3: Refactor UI Component (`page.tsx`)**
    - Import and consume `useExamBuilder` cleanly inside `ExamBuilderContent`.
    - Remove all inline handler definitions and complex state management.
    - Ensure the JSX mainly reads props destructured from the hook.
    - (Optional) Extract the localized UI sub-pieces into `_components/` if the render tree is still too long (`ExamHeader`, `ExamDescription`, etc.). For now, keeping them simple in the presenter is sufficient as they are small blocks.

- [x] **Step 4: Verify Formatting and Typing**
    - Double check compliance with `.agents/rules/web/components.md`.
    - Double check default export vs named exports (use default export for `page.tsx`).
    - Verify styling relies on Tailwind CSS classes.

- [x] **Step 5: Testing & Validation**
    - Run linting: `cd app/sentinel-web && pnpm lint`.
    - Verify no build or type errors.
