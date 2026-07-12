# UX Builder Page Improvements: Import Modal Context

## Goal

Improve the UI, UX, and usability of the **Question Bank Import Modal** used in the exam builder page. 
* This applies identically to both **`sentinel-web`** (student/instructor portal) and **`sentinel-core`** (admin portal).
* Specific files to modify/re-architect:
  * [sentinel-web/question-bank-import-modal.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bank-import-modal.tsx) and its sub-components/hooks under [sentinel-web/question-bank-import-modal/](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bank-import-modal)
  * [sentinel-core/question-bank-import-modal.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/builder/_components/question-bank-import-modal.tsx) and its sub-components/hooks under [sentinel-core/question-bank-import-modal/](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/builder/_components/question-bank-import-modal)

---

## Current State Analysis

The import modal is structured as a two-column layout:
1. **Left Sidebar (`CollectionSidebar`)**: Lists all question bank collections with their names and count of questions.
2. **Right Panel (`QuestionsPanel`)**:
   * **Search Input**: Captures search terms (`searchQuery`).
   * **Type Filter**: A dropdown `Select` listing all possible question types (fetched globally).
   * **Question List**: An infinite scroll list. It utilizes Tanstack's `useInfiniteQuestionsQuery` under the hood. As the user scrolls, an `IntersectionObserver` triggers `fetchNextQuestionsPage()`.
   * **Selection Handling**: Selected items are held in the hook state (`selectedIds`). These selections persist across searches/filters, which is correct. "Select Page" selects only the current loaded chunk in view.
3. **Footer (`ImportModalFooter`)**: Shows the count of selected items and handles cancellation or triggering of the `onImport` callback.

### Limitations in Current UX/UI:
* **Infinite Scroll**: Can feel sluggish and lacks visual milestones. Users cannot tell how many total pages exist or easily jump to a page.
* **Filter Usability**: The question type filter is a dropdown. It does not display counts or dynamically adapt to reflect only the question types *actually available* in the active collection.
* **Loading Indicator**: Shows a plain text "Loading questions..." block in the empty state, rather than a modern spinner or skeleton state.

---

## Proposed Improvements & Specifications

### 1. Usability & Layout Improvements
* Enhance spacing, border styling, and scroll indicators to feel more premium and fit with the Design System.
* Maintain the selection persistence: selecting questions on page 1, navigating to page 2, and filtering by search must NOT lose selections from page 1.
* "Select Page" checkbox should select/deselect all questions currently visible on the active paginated page.

### 2. Connected Offset-Based Pagination
* Replace infinite scroll (`useInfiniteQuestionsQuery`) with offset-based query (`useQuestionsQuery`).
* Pass `page` and `pageSize: 20` to the query.
* Introduce a pagination bar at the bottom of the questions panel using `@sentinel/ui`’s [pagination.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/ui/src/components/ui/pagination.tsx).
* The pagination controls must:
  * Show "Page X of Y".
  * Render "Previous" and "Next" buttons (disabled at limits).
  * Render numbered page links or ellipsis if there are many pages.
  * Reset `currentPage` back to `1` whenever filters (search query, collection ID, selected question type) change.

### 3. Search Integration
* Keep search connected to the backend API (`search` parameter on `/questions`).
* Ensure search triggers page reset (`page = 1`) and uses `useDeferredValue` (already present) to debounce inputs.

### 4. Dynamic Facets Filter for Question Types
* Replace the dropdown `Select` with a row of interactive facet chips placed at the right side of the search bar (sitting side-by-side on larger screens, wrapping on mobile).
* **Dynamic Backend Aggregation**:
  * Implement a new API endpoint `GET /questions/type-counts` (and associated controller, service, data access layer) on the backend (`sentinel-api`).
  * This endpoint must accept query filters (`collectionId`, `search`, `subjectId`, `institutionId`, `status`) and query the database for question type distribution:
    ```sql
    SELECT question_type, COUNT(*) as count 
    FROM question_bank_questions
    WHERE [active_filters_except_question_type]
    GROUP BY question_type
    ```
  * This allows the facet chips to dynamically show counts for each type (e.g. *Multiple Choice (12)*, *True/False (5)*).
* **Facet Rendering**:
  * An "All" facet chip showing the total question count.
  * Chips representing each question type. If a type count is `0`, hide it (or disable it) so that only types "available to offer" in the active context are displayed.
  * Clicking a chip sets the active question type filter, triggers page reset to `1`, and updates the question list.

### 5. Polished Loading & Empty States
* Replace the text loader in `QuestionPanelEmptyState` with a premium spinning loader (e.g. `Loader2` from `lucide-react` with `animate-spin`) or styled circular indicators.
* Ensure layout transitions between loading and loaded states are smooth and don't cause sudden height jumps.

---

## Technical Architecture & File Checklist

### A. Shared & Backend Changes (`packages` & `app/sentinel-api`)

1. **Shared Schemas & Constants**:
   * Add query schema for type counts and add query keys in:
     * [packages/shared/src/schema/exams/question-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/question-schema.ts)
     * [packages/shared/src/constants/exams/exam-constants.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/constants/exams/exam-constants.ts)
2. **Backend API Endpoints**:
   * Create `GET /questions/type-counts` logic:
     * **Controller**: [app/sentinel-api/src/modules/content/question/controllers/get-question-type-counts.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/controllers/get-question-type-counts.controller.ts)
     * **Service**: [app/sentinel-api/src/modules/content/question/services/get-question-type-counts.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/services/get-question-type-counts.service.ts)
     * **Data Access**: [app/sentinel-api/src/modules/content/question/data/get-question-type-counts.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/data/get-question-type-counts.ts)
   * Modify [app/sentinel-api/src/modules/content/question/question.route.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/question.route.ts) to register the new endpoint.
3. **API Client & Query Hooks**:
   * Add client method `getQuestionTypeCounts` to [packages/services/src/api/questions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/questions.ts).
   * Create query hook `useQuestionTypeCountsQuery` in [packages/hooks/src/query/questions/use-question-type-counts-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/questions/use-question-type-counts-query.ts) and export it.

### B. Frontend Changes (To be made in both `sentinel-web` and `sentinel-core`)

1. **Modal Types & Constants**:
   * Update [types.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bank-import-modal/types.ts) to hold page state (`currentPage`, `totalPages`, `setCurrentPage`) and remove infinite scroll variables.
2. **State & Data Hooks**:
   * Update selection hook: [use-question-bank-import-selection.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bank-import-modal/_hooks/use-question-bank-import-selection.ts) to manage `currentPage` state and reset on filter changes.
   * Update data hook: [use-question-bank-import-data.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bank-import-modal/_hooks/use-question-bank-import-data.ts) to query `useQuestionsQuery` and fetch dynamic type counts using `useQuestionTypeCountsQuery`.
   * Update modal bridge hook: [use-question-bank-import-modal.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bank-import-modal/_hooks/use-question-bank-import-modal.ts).
3. **UI Components**:
   * Re-design search and type-filters in [questions-panel.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bank-import-modal/_components/questions-panel.tsx):
     * Move filters inline next to search bar.
     * Render facet chips dynamically.
     * Remove scroll observer logic and inject `@sentinel/ui` pagination component at the bottom.
   * Update loading icon in [question-panel-empty-state.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bank-import-modal/_components/question-panel-empty-state.tsx).