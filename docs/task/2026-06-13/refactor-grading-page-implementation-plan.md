# Refactor Grading Attempt Page

Refactor the manual essay grading page at `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/page.tsx` to break it into modular, maintainable, and type-safe files.

## Proposed Changes

### Sentinel Web Components & Hook (`app/sentinel-web`)

#### [NEW] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_constants/index.ts)

- [x] Define default configuration constants like `GRADING_ATTEMPT_QUERY_KEY` and fallback scores.

#### [NEW] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_types/index.ts)

- [x] Define `CriteriaScores`, `QuestionEvaluationState`, `EvaluationsState`, and `ScoreSummary` types.

#### [NEW] [_types.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_hooks/use-grading-attempt/_types.ts)

- [x] Define types specific to the parameters and return contract of `useGradingAttempt`.

#### [NEW] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_hooks/use-grading-attempt/index.ts)

- [x] Implement `useGradingAttempt` to encapsulate grading query, mutation, local states, and handlers.

#### [NEW] [index.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_hooks/use-grading-attempt/index.test.ts)

- [x] Unit test suite for `useGradingAttempt` to verify initial states, score calculation, and mutations.

#### [NEW] [_types.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_components/_types.ts)

- [x] Define properties for all sub-components.

#### [NEW] [grading-loading.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_components/grading-loading.tsx)

- [x] Renders the loading skeleton.

#### [NEW] [grading-error.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_components/grading-error.tsx)

- [x] Renders the grading error card.

#### [NEW] [grading-header.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_components/grading-header.tsx)

- [x] Renders page header with back button and grading submit action.

#### [NEW] [grading-score-highlights.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_components/grading-score-highlights.tsx)

- [x] Renders summary metrics cards (Objective, Essay, Final scores, attempt status).

#### [NEW] [grading-question-pane.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_components/grading-question-pane.tsx)

- [x] Renders the left pane containing essay prompt, prompt switcher, student answer, and feedback text area.

#### [NEW] [grading-rubric-pane.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_components/grading-rubric-pane.tsx)

- [x] Renders the right pane with criteria sliders (0-4) and overall feedback text area.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/page.tsx)

- [x] Clean up file, utilizing hook and component modular imports.

## Verification Plan

### Automated Tests

- [x] Run `pnpm --dir app/sentinel-web test` to verify Vitest tests.

### Manual Verification

- [x] Render page and ensure UI/UX matches the original state exactly and functions correctly.
