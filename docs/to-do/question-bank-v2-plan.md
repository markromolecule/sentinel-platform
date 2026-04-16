# Question Bank V2: Efficiency & Intelligence Plan

This plan outlines the enhancements to the Sentinel Question Bank to transition it from a simple list to a high-efficiency research and management engine for professors.

## 1. Interaction & Bulk Management

- [ ] **Row Selection Implementation:**
    - [ ] Add a checkbox column to `columns.tsx` using `@sentinel/ui` Checkbox.
    - [ ] Integrate `rowSelection` state in `QuestionsTable`.
- [ ] **Floating Action Bar:**
    - [ ] Create a `FloatingActionBar` component that appears when rows are selected.
    - [ ] Actions: "Add to Exam", "Bulk Edit Tags", "Export".
- [ ] **Quick Preview Side Panel:**
    - [ ] Implement a `QuestionPreviewSheet` using the `Sheet` component.
    - [ ] Display full question content, correct answers, and usage stats.
    - [ ] Trigger on row click (excluding the checkbox and actions column).

## 2. Organization & Smart Collections

- [ ] **Collections Sidebar:**
    - [ ] Add a `CollectionsSidebar` to the left of the `DataTable` in the Question Bank page.
    - [ ] Display folders for topics and difficulty levels.
    - [ ] Implement "Smart Filters" (e.g., "Recently Used", "Drafts").
- [ ] **Tag Filtering:**
    - [ ] Make table tags clickable to instantly filter the view.

## 3. Power-User Tools

- [ ] **AI-Powered Import (Mock):**
    - [ ] Create an "AI Import" button that opens a text area modal.
    - [ ] Implement a mock parsing function that converts text into structured `ExamQuestion` objects.
- [ ] **Duplicate & Clone:**
    - [ ] Add a "Clone" action to the row dropdown and preview panel.
- [ ] **Keyboard Shortcuts:**
    - [ ] Implement `Cmd+N` / `Ctrl+N` for new questions.
    - [ ] Add `Enter` to save in creation/edit forms.

## 4. UI/UX Enhancements

- [ ] **Usage & Difficulty Indicators:**
    - [ ] Add "Used in X Exams" badge to the table and preview.
    - [ ] Implement color-coded difficulty dots (🟢 Easy, 🟡 Medium, 🔴 Hard).
- [ ] **"Quick Add" Row:**
    - [ ] Add a compact input row at the top of the table for rapid "Draft" question creation.

## 5. Implementation Phases

### Phase 1: Core Selection & Preview (Foundation)

- Checkboxes, Floating Bar, and Preview Sheet.

### Phase 2: Organization (Sidebar)

- Collections Sidebar and Tag Filtering.

### Phase 3: Intelligence & Efficiency (Tools)

- AI Mock Import, Cloning, and Shortcuts.

### Phase 4: Polish & Feedback (Visuals)

- Indicators, Heatmaps, and Animations.
