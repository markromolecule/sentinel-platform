---
title: "Passage and Question Rendering Verification in Mobile Exam Session"
type: context
status: ready
created: "2026-09-14"
tags: [context, verification, sentinel-mobile, exam-session, passage, question-rendering]
feature: "passage-and-question-rendering-verification"
---

# Passage and Question Rendering Verification in Mobile Exam Session

## 1. Overview & Objective

- **Problem Statement:** The developer observed that questions were not displaying on the mobile exam session (`ExamSessionScreen`) and raised an inquiry to verify whether the reading `[passage]` / `PassageCard` component is causing or contributing to the question rendering failure.
- **Business / User Value:** Students need reliable, uninterrupted access to exam questions and their associated reading passages on mobile devices. Confirming or disproving whether `passage` blocks question rendering isolates root-cause analysis and prevents regressions in passage-based reading comprehension questions.
- **Success Criteria:**
  - Verify deterministically through static code tracing, data flow analysis, and automated test execution whether `passage` / `PassageCard` interferes with question prompt or option rendering.
  - Formulate clear evidence explaining the exact relationship between `passage` presence/absence and `QuestionCard` rendering behavior.
  - Document the actual verified mechanisms responsible for question visibility on native mobile (such as container viewport height, NativeWind compilation, and bundle reloading).

## 2. Requirements & Verification Scenarios

### Scenarios Evaluated

#### Scenario A: Question Without Passage (`passage === null` or undefined)

- **Data Flow:** `rawPassage` in `extractPassageDetails` resolves to `null`. `adaptExamQuestionsForMobile` outputs `passage: null`.
- **Render Behavior:** In `question-card.tsx`, `{passage ? <PassageCard passage={passage} title={passageTitle} /> : null}` evaluates to `null`.
- **Finding:** `PassageCard` is never mounted or executed. Question prompt `<Text>{text}</Text>` and inputs (`MultipleChoiceInput`, `EssayInput`, etc.) evaluate unconditionally. `passage` has zero impact on questions lacking passages.

#### Scenario B: Question With Passage (`passage` string present)

- **Data Flow:** `extractPassageDetails` extracts trimmed string from `passageContent`, `content.passage`, etc.
- **Render Behavior:** `PassageCard` is mounted above the question prompt. It normalizes HTML/breaks via `cleanPassageContent` and renders a collapsible container with `maxHeight: 220`.
- **Finding:** `PassageCard` renders as a sibling above `<Text>{text}</Text>`. It does not wrap, replace, or conditionally hide the question prompt or option inputs. Both the passage text and the question prompt/options are present in the component tree.

#### Scenario C: Malformed or Non-String Passage Value

- **Data Flow:** `extractPassageDetails` explicitly validates `typeof rawPassage === 'string' && rawPassage.trim().length > 0`. If an object, number, or array is supplied, it falls back to `null`.
- **Finding:** No runtime exception (e.g. `raw.replace is not a function`) can occur in `cleanPassageContent`.

### Automated Verification Results

- `features/exam/components/session/passage-card.test.tsx` (7/7 tests passed):
  - Renders passage body when expanded.
  - Renders default title `"Reading Passage"` when title is omitted.
  - Collapses content on toggle.
  - Cleans HTML markup and entities (`<p>`, `&amp;`).
  - Gracefully returns `null` for whitespace-only passage strings.
- `features/exam/components/session/question-card.test.tsx` (27/27 tests passed):
  - Renders both `PassageCard` content AND question options when question has a passage.
  - Renders question prompt and options cleanly when question has no passage (`passage: null`).
  - Verifies all 8 question types render inputs successfully.

## 3. Technical & Architectural Context

### Data and Component Flow

```mermaid
graph TD
    A[API / DB: exam_questions] -->|passage_content, content| B[mobile-question-adapter]
    B -->|extractPassageDetails| C[MobileSessionQuestion.passage]
    C -->|question prop| D[QuestionCard]
    D -->|passage ? <PassageCard/> : null| E[PassageCard (Max Height 220)]
    D -->|Always Rendered| F[QuestionCardHeader]
    D -->|Always Rendered| G[Question Text Prompt]
    D -->|Always Rendered| H[Type-Specific Input Component]
```

### Actual Culprit for Missing Questions Identified

In live device debug logs (`[debug][exam-question-render]`):
`{"card": {"height": 0, "width": 440}, "viewport": {"height": 0, "width": 440}, "questionCount": 5, "hasCurrentQuestion": true}`

1. **Zero-Height Container Collapse:**
   - In React Native / Expo Router, child `<ScrollView style={{ flex: 1 }}>` components collapse to `height: 0` if any ancestor in the stack layout lacks `contentStyle: { flex: 1 }` or bounded dimensions.
   - Commit `98b3fdcc` resolved this by applying `contentStyle: { flex: 1 }` in `_layout.tsx` and removing redundant duplicate `<Stack.Screen>` overrides.
2. **NativeWind Tailwind Scope:**
   - `tailwind.config.js` content array previously omitted `./features`, preventing utility classes in `QuestionCard` and input components from compiling.
3. **Client Cache / Metro Bundler Refresh:**
   - If the mobile app on the device or simulator has not fetched an updated bundle after recent layout fixes, the prior collapsed bundle (`height: 0`) remains active.

## 4. UI/UX & Interaction Guidelines

- `PassageCard` must stay bounded to `maxHeight: 220` with `nestedScrollEnabled` so it never consumes the full viewport on small mobile devices.
- `PassageCard` must remain collapsible so students on small mobile screens can minimize the passage once read to view more answer options.
- The outer `ScrollView` in `QuestionCard` must maintain `flexGrow: 1` and `paddingBottom: 140` to ensure prompt and options clear the floating `SessionFooter`.

## 5. Scope & Boundaries

- **In Scope:** Verification of `passage` / `PassageCard` data flow and render lifecycle; analysis of question visibility in `sentinel-mobile`.
- **Out of Scope / Non-Goals:** Altering backend API contracts for passages; refactoring passage data models.

## 6. References & External Context

- Context Investigation: `docs/context/September/13/investigate-mobile-attempt-question-rendering.md`
- Proctoring & Calibration Context: `docs/context/September/14/mobile-proctoring-audio-and-severity-calibration.md`
- Layout & Flow Repair Commit: `98b3fdcc` (`fix(exam): improve layout, error handling, and submission flow`)
- Key Components:
  - `app/sentinel-mobile/features/exam/components/session/passage-card.tsx`
  - `app/sentinel-mobile/features/exam/components/session/question-card.tsx`
  - `app/sentinel-mobile/features/exam/lib/mobile-question-parser.ts`
  - `app/sentinel-mobile/features/exam/lib/mobile-question-adapter.ts`
