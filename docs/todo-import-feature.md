# To-Do: Question Bank Import & GenAI Feature

## Phase 1: Planning & Setup
- [x] Investigate codebase for Question Bank / Collection pages
- [ ] Finalize implementation plan and get user approval (1-3-1 Rule)

## Phase 2: UI Implementation (Staging/Frontend Only)
- [ ] **Import / Upload Button**
    - [ ] Add button to `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/page.tsx`
    - [ ] Add button to `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/page.tsx`
- [ ] **Import Modal (Shadcn Dialog)**
    - [ ] Implement Bulk Upload section
        - [ ] Support CSV, XLSX, XLS
        - [ ] Max file size: 100MB validation (client-side)
    - [ ] Implement Generative AI section
        - [ ] Prompt input field for instructors
    - [ ] "Continue" button with redirect logic
- [ ] **Preview Page**
    - [ ] Create new page: `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import-preview/page.tsx`
    - [ ] Integrate `@sentinel/ui` data-table for question preview
    - [ ] Add "Collection Name" field and metadata fields
    - [ ] Add "Save to Collection" button (stubbed for staging)

## Phase 3: GenAI Concept
- [ ] Define the prompt-to-question transformation logic (mocked for frontend)
- [ ] Ensure seamless transition from prompt/upload to preview data-table

## Phase 4: Verification
- [ ] Manual test: File size validation
- [ ] Manual test: File type restriction
- [ ] Manual test: Prompt input UX
- [ ] Walkthrough recording of the new flow

## Phase 5: Exam Builder Refinement
- [x] Refactor `QuestionBankImportModal`
    - [x] Implement Two-Pane layout (Sidebar for Collections)
    - [x] Add Search/Filter functionality
    - [x] Implement robust scrolling for large lists
    - [x] Fix X button overlap in DialogHeader
