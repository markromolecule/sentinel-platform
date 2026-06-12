# Context: Essay Grading Rubric Refactoring (June 13)

This document outlines the detailed specifications, layout requirements, and architectural plans for refactoring the Essay Question grading and rubric workflows across the Sentinel monorepo. It serves as a comprehensive context guideline for LLMs and developers.

---

## 1. Background & Objectives

Currently, Essay questions in Sentinel are treated as requiring manual review by instructors. However:
- The system lacks a structured, standardized grading rubric, leading to subjectivity in manual grading.
- Automated AI-assisted grading (via Gemini) needs a consistent, well-defined rubric structure to evaluate essay submissions objectively.
- There is no central reference page for instructors or students to view the grading standards.

### Key Goals:
1. **Define a Standardized Rubric:** Create a non-editable, standardized essay grading rubric embedded as core business logic in the shared package. It must not be customizable/editable per question, ensuring consistent standards across all exams.
2. **Align Guide Page Layout:** Redesign the current Instructor Guide page [guide/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/guide/page.tsx) layout to match the clean, unified layout shell used on pages like [subjects/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/page.tsx).
3. **Showcase the Rubric:** Create a dedicated display on the Instructor Guide page showing the criteria, point distributions, and feedback expectations for the essay grading rubric.
4. **Refactor Grading Pipeline:** Integrate this rubric into the question builder preview, the AI-assisted grading prompts, and the manual grading interface.

---

## 2. Standardized Essay Rubric Specification

The rubric evaluates student essays across **5 Core Criteria**, each rated on a **0 to 4 point scale**.

| Criterion | Weight | Max Points | Description |
| :--- | :--- | :--- | :--- |
| **Content & Substance** | 30% | 4 | Depth of analysis, relevance of content to the prompt, and detail. |
| **Structure & Organization** | 20% | 4 | Clarity of thesis, logical flow, transitions, and paragraph structure. |
| **Argumentation & Support** | 20% | 4 | Strength of claims, reasoning, and evidence/examples provided. |
| **Style & Tone** | 15% | 4 | Consistency of formal tone, word choice, and clarity of expression. |
| **Grammar & Conventions** | 15% | 4 | Adherence to spelling, punctuation, grammar, and syntax standards. |

### Performance Levels
- **4 Points (Excellent):** Exceptional quality, fully meets and exceeds all criteria expectations.
- **3 Points (Good):** High quality, meets all criteria with only minor, negligible flaws.
- **2 Points (Satisfactory):** Average quality, meets basic criteria requirements but lacks depth.
- **1 Point (Needs Improvement):** Substandard quality, fails to meet multiple basic requirements, incoherent.
- **0 Points (No Attempt / Off-topic):** Empty submission or completely unrelated response.

---

## 3. Proposed Code & Architecture Changes

### Central Shared Rubric Definition
To prevent duplication, define the rubric metadata and calculation logic in the shared package:
- **New File:** [essay-rubric.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/exams/essay-rubric.ts)
- **Exports:**
  - `ESSAY_RUBRIC_CRITERIA`: Metadata array defining keys, names, weights, descriptions, and level texts.
  - `calculateEssayWeightedScore(scores: Record<string, number>, maxPoints: number): number`: Calculates the overall weighted score normalized to the question's total points (e.g., `(sum of (score * weight) / 4) * maxPoints`).
  
- **Schema Updates:** Update [question-content-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/builder/question-content-schema.ts) and [assessment-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/assessment-schema.ts) to support the standardized essay rubric properties, ensuring Zod validators can parse and validate structured criteria evaluations.

### Instructor Guide Page Layout Refactor
Modify the Instructor Guide page [guide/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/guide/page.tsx):
- **Layout Alignment:** Remove custom outer paddings and headers. Use the standard layout layout pattern visible in [subject-page-shell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-page-shell.tsx), utilizing `@sentinel/ui`'s `PageHeader` and `Separator` components.
- **Rubric Table:** Append a responsive, styled rubric visualization section detailing criteria, weights, and point descriptions to guide instructors.

### Question Builder & Previews
- **Form Refactoring:** Update the essay form builder component [essay-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-forms/essay-form.tsx). Remove the custom/generic "Rubric" text box, and replace it with a read-only informational banner/preview stating that the Standardized Essay Rubric will be applied.
- **Preview Refactoring:** Update [essay-preview.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/views/preview/essay-preview.tsx) to render the standardized rubric criteria and weights instead of displaying custom free-form rubric strings.

### Grading & AI Integration
- **OpenAPI Schema:** Define a schema for structured AI grading output, ensuring that evaluations return a breakdown of scores per rubric criterion.
- **Prompt Adjustments:** Update [definitions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/gemini/services/prompt-builder/definitions.ts) instructions for `ESSAY` question types to enforce prompt compliance with the new rubric parameters.
- **Grading Detail Interface:** Update the manual grading logic and interfaces (e.g., [get-grading-students.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/get-grading-students.ts)) to display the criteria breakdown and allow manual score adjustments using the 5-criteria sliders/inputs.

---

> [!IMPORTANT]
> The rubric must be strictly non-editable in the UI. All calculations must be performed on the backend/shared codebase using the hardcoded weights, maintaining grade objectivity and preventing integrity exploits.

> [!TIP]
> Ensure all calculations round to the nearest two decimal places to handle points precisely.