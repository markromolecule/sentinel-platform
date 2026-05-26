# To-Do Plan: Exam Builder Features & Refactoring

## Overview

This document outlines the planned state management and UI fixes for the Exam Builder application. Following the 1-3-1 rule and to-do workflow, I present options for the architecture and a task list.

## Investigation & 1-3-1 Analysis

### Task: Global State Management Implementation

**Objective**: Create a scalable state management solution for the exam (title, description, questions) without backend integration, simulating Save and Publish actions.
**Root Cause & Context**: Currently, there is an existing but complex store (`use-exam-builder-store.ts`) or localized state in `page.tsx`. To cleanly support "Save" and "Publish" simulations and easy prop access across deeply nested components (like the question table and builder forms), a centralized store is required.

**Viable Options:**

- **Option 1: React Context + `useReducer`**
    - _Description_: Wrap the Builder Page in a Context Provider and manage state via a reducer.
    - _Pros_: Built-in to React.
    - _Cons_: Boilerplate heavy, can cause unnecessary re-renders of the entire tree if not thoroughly memoized.
- **Option 2: Zustand Store (`use-exam-store`)**
    - _Description_: Implement a lightweight Zustand store dedicated to the Exam Builder.
    - _Pros_: Extremely minimal boilerplate, allows granular subscriptions (components only re-render when the specific state they use changes), matches existing project patterns.
    - _Cons_: Introduces an external dependency (already present in the project).
- **Option 3: Local State Lifting (`useState` in `page.tsx`)**
    - _Description_: Keep all state in `page.tsx` and pass callbacks/data down as props.
    - _Pros_: Simple to implement initially.
    - _Cons_: Leads to "prop drilling", making intermediate components messy and harder to maintain as the builder scales.

**Best Option & Why:**
**Option 2 (Zustand)** is the clear best choice. Zustand provides the simplest API for simulating the "Save" and "Publish" actions and easily exposes the description/title to the Header and Question Table without prop-drilling. It is also an established pattern in your repository.

---

## To-Do List

- [ ] **1. Global State Management (`use-exam-store`)**
    - [ ] Create `use-exam-store.ts` using Zustand.
    - [ ] Add state properties: `title`, `description`, `questions`, `status`.
    - [ ] Add actions: `updateTitle`, `updateDescription`, `setQuestions`, `saveExam` (console log & state update), `publishExam` (publish status & toast).
- [ ] **2. Builder Page UI Updates**
    - [ ] Add the "Test Description" display section at the top of the builder.
    - [ ] Implement the Settings button redirect (`/configuration`).
    - [ ] Wire up the Save and Publish buttons to the new store.
- [ ] **3. Question Table Enhancements**
    - [ ] Remove the Type Icon column.
    - [ ] Change the Question text style to `text-blue-600 underline cursor-pointer`.
    - [ ] Add the edit redirect/trigger to the Question text.
    - [ ] Remove the explicit "Edit" button from the Actions column.
- [ ] **4. Question Form Layout**
    - [ ] Update `QuestionTypeSelectorDialog.tsx` grid layout classes.
    - [ ] Force a 2x4 column grid instead of the current responsive 4x2 grid (`grid-cols-1 sm:grid-cols-2` only).

## Next Steps

Awaiting explicit instruction from you to evaluate this plan and proceed with coding.
