---
title: "Investigate Sentinel Mobile Attempt Question Rendering"
type: context
status: draft
created: "2026-09-13"
tags: [context, investigation, defect-resolution, sentinel-mobile, exam-session]
feature: "mobile-attempt-question-rendering-investigation"
---

# Investigate Sentinel Mobile Attempt Question Rendering Context Specification

## 1. Overview & Objective

- **Problem Statement:** A student can reach `/exam/[id]/session/[sessionId]` and see the session shell (header, footer, and other controls), but the question body is reported as absent. `sentinel-api` is an authoritative read-only reference because the same contract serves Sentinel Web successfully.
- **Business / User Value:** Students must be able to read and answer every supported question type without mobile proctoring startup masking or starving the runtime.
- **Success Criteria:**
  - The active adapted question renders its prompt and type-specific input for all eight supported types.
  - A valid non-empty `questions` list always yields a non-null `currentQuestion` at index zero.
  - MediaPipe, audio, and LiveKit failures cannot prevent the question viewport from rendering.
  - Verification uses an Expo/React Native-capable render path and an Android device/emulator attempt, rather than only a hand-built element-tree test.

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a student entering an active mobile attempt, I want the first prompt and its answer control to appear immediately so that I can complete the exam.*
- *As an instructor using proctoring, I want a MediaPipe or LiveKit startup fault to be observable and isolated from the student’s question UI.*

### Functional Requirements

- [ ] Trace the supplied exam response through `adaptExamQuestionsForMobile`, navigation, and `QuestionCard` for each supported type.
- [ ] Reproduce the attempt with proctoring enabled and disabled, recording platform, permission state, visible error, and bridge messages.
- [ ] Verify MediaPipe, audio, and LiveKit lifecycle boundaries independently of question rendering.
- [ ] Repair or replace tests that do not execute the actual React Native component tree before accepting a rendering fix.

### Edge Cases & Failure Modes

- `questions.length > 0` with a missing active item must render the explicit Question Unavailable recovery state.
- A camera/WebView permission, WASM, LiveKit, or audio failure must leave the question viewport usable and show a bounded diagnostic state.
- Empty or malformed question content must preserve the prompt fallback and a type-appropriate answer input.

## 3. Technical & Architectural Context

- **Verified render path:** `ExamSessionScreen` shows header/footer after it receives a non-empty `questions` array, then passes `navigation.currentQuestion` to `QuestionCard`. `useExamSessionNavigation` derives that value as `questions[currentIndex] ?? questions[0]`; therefore a populated list cannot naturally produce an undefined active question at the initial index.
- **Reproduction boundary confirmed:** The student reports the same blank question body with camera/proctoring disabled immediately after entering from the lobby. MediaPipe, audio, and LiveKit are therefore excluded as the primary trigger; they remain secondary hardening concerns only.
- **Question collection confirmed:** On the blank attempt, the footer question-grid button displays the expected current question count. This proves the live `questions` collection has been loaded into `ExamSessionScreen` and rules out an empty list, a missing student-view response, and the adapter’s empty-state branch.
- **Layout history:** The session screen’s `flex: 1` question viewport and fixed absolute footer predate the current hook-grouping and question-input refactors. Git history exposes no change that would collapse `QuestionCard` while retaining the session shell. The closed `QuestionDrawer` is translated below the screen height and has no pointer events.
- **Question contract:** `adaptExamQuestionsForMobile` normalizes the raw question list and `QuestionCard` supports multiple choice, multiple response, true/false, matching, fill blank, enumeration, essay, and identification.
- **Prior MediaPipe diagnosis:** the older inline bridge hid the HTML video using `display:none`, allowing zero-sized MediaPipe frames to create repeated errors. The current uncommitted refactor keeps the video visible to the DOM, validates its dimensions before inference, and makes the React Native WebView a 1x1, non-interactive view. This remains unproven on an Android attempt.
- **Prior QuestionCard change:** the current working-tree change replaces direct calls to leaf components with JSX. The leaf input components do not use React hooks, so this change is not established as a root-cause fix for an absent question body. It invalidates the existing element-tree unit tests because they only inspect the direct function-call output and do not render child JSX components.
- **Current verification gap:** `pnpm --filter sentinel-mobile test -- --runInBand` fails with 19 `QuestionCard` failures and two Expo initialization failures. It reports 327 passing tests, but cannot verify the altered question rendering path.
- **Focused checks:** `mobile-question-adapter`, session navigation, and drawer-animation tests pass (20/20); TypeScript checks pass. These prove contracts and state selection, not a real native visual render.
- **Deployment boundary:** The MediaPipe bridge and JSX QuestionCard changes are present only in the dirty working tree; `HEAD` still contains the prior direct-invocation QuestionCard implementation. Any installed/release build produced from `HEAD` cannot contain the stated previous fix. `pnpm --filter sentinel-mobile exec tsc --noEmit` completes successfully, but this does not establish which source revision the student's app executes.
- **Proctoring boundaries:** MediaPipe WebView mounting and landmark state live in `ExamSessionScreen`; LiveKit control is triggered by `MobileLiveInspectionBridge` and is visually null unless an inspection is live. The bridge intentionally opens no audio stream (`audio: false`). No source evidence currently shows LiveKit or audio overlaying the question viewport.
- **Data Model & Schema Changes:** None. The API and database are out of scope for modification.
- **Security & Authorization:** Preserve the authenticated student attempt and existing camera/proctoring permissions; do not relax telemetry or LiveKit authorization to address a rendering failure.

## 4. UI/UX & Interaction Guidelines

- The question body must remain below the session header and above the fixed footer, with enough bottom inset to scroll controls above the footer.
- Camera/proctoring initialization must not block the first question from becoming visible.
- Show a bounded, actionable failure state instead of a blank viewport when the active question is unavailable.

## 5. Scope & Boundaries

- **In Scope:** Sentinel Mobile attempt rendering, question adaptation/types, the session navigation boundary, MediaPipe, audio behavior, and LiveKit interaction as potential render blockers; test-harness validity.
- **Out of Scope / Non-Goals:** Changes to `app/sentinel-api`, backend contracts, database schema, Sentinel Web behavior, or a proctoring redesign without evidence.

## 6. References & External Context

- Existing, now-unverified completion claim: `docs/context/September/13/mobile-exam-session-telemetry-turned-in-fixes.md`.
- Existing implementation task: `docs/tasks/2026/09/2026-09-13/0003-task-fix-mobile-exam-rendering-telemetry-turned-in-tabs/`.
- Render entry point: `app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx`.
- Question adapter and view: `app/sentinel-mobile/features/exam/lib/mobile-question-adapter.ts`, `app/sentinel-mobile/features/exam/components/session/question-card.tsx`.
- MediaPipe and LiveKit boundaries: `app/sentinel-mobile/features/exam/components/checkup/mobile-mediapipe-bridge.tsx`, `app/sentinel-mobile/features/exam/hooks/monitoring/use-mobile-live-inspection.ts`.

## Open Question

On the blank attempt, is the QuestionCard header text (for example, "Question 1 of 10" and its point badge) visible above the missing prompt? This distinguishes a missing/collapsed QuestionCard from a card that mounts but fails within its prompt or type-specific input subtree.
