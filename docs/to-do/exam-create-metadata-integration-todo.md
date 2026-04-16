# Instructor Exam Creation Metadata Integration

This document scopes the first backend-connected exam flow from the instructor exams page. The goal is to let instructors create exam metadata from the exams dashboard and `exam-create-dialog`, using the real exam module only.

## 1-3-1 Rule Analysis

### The Problem

The instructor exams dashboard still uses local mock exams and the create dialog writes a fake draft into Zustand. We need to:

1. Load exams from the real `/exams` module.
2. Create a draft exam from the existing create dialog fields.
3. Limit this phase to metadata only:
    - title
    - description
    - subject
    - section
    - starts at
    - ends at

### Option 1: Keep the UI mock-based and only POST on submit

Use the current local subject store and local exam store, then send a best-effort create request while keeping the dashboard and cards backed by mock data.

- **Pros:** Lowest immediate change count on the frontend.
- **Cons:** Creation success would not be reflected consistently in the exams page, and the flow would still mix fake and real sources.

### Option 2: Connect the dashboard and create dialog directly to the exam module

Add exam services/hooks, fetch exams from `/exams`, submit real `POST /exams` requests, and source subject/section options from the instructor's enrolled subjects.

- **Pros:** Cleanest first real slice, keeps scope inside the exam page and dialog, and makes creation testable end to end.
- **Cons:** Requires a thin mapping layer from API exam responses to the existing exam card UI shape.

### Option 3: Fully connect create flow plus builder persistence in one pass

Create the exam via API, then also refactor the builder page/store to load and save questions against the backend immediately.

- **Pros:** Most complete long-term workflow.
- **Cons:** Expands beyond the requested test scope and touches substantially more files and behaviors.

### Best Option: **Option 2**

**Why:** It gives us a real, testable exam creation path from the requested entry points without dragging the builder refactor into this phase. We can validate metadata creation first, then extend the builder in a separate task.

---

## To-Do Workflow

- [ ] **1. Exam Data Access (`packages/services` and `packages/hooks`)**
    - [ ] Add `getExams` and `createExam` API functions for the exam module.
    - [ ] Add React Query hooks for exam listing and exam creation.
    - [ ] Add exam query keys and a thin mapper to the existing proctor exam card shape.

- [ ] **2. Instructor Exam Page Wiring (`app/sentinel-web/src/app/(protected)/(instructor)/exams/...`)**
    - [ ] Replace mock dashboard exam loading with the real exam list query.
    - [ ] Refresh the list after a successful create.

- [ ] **3. Exam Create Dialog Wiring (`app/sentinel-web/src/features/exams/...`)**
    - [ ] Replace the fake submit flow with a real create mutation.
    - [ ] Source subject and section options from enrolled instructor subjects.
    - [ ] Keep this phase focused on metadata creation only and avoid builder persistence changes.
