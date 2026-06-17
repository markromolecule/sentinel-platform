# Implementation Plan - Exam Builder Layout Adjustment

Redesign the exam builder layout to follow the sidebar-based subject workspace pattern, moving exam rules and configuration to the sidebar, and improving the UX for question sections and instructions.

## User Review Required

> [!IMPORTANT]
> The redesign will shift the current grid-based sidebar into a persistent workspace shell similar to the subject management page. This changes the primary navigation of the builder.

- [ ] Confirm if the "Configuration" in the sidebar should be a simplified version of the full configuration form or if it should open a modal/sub-page.
- [ ] Confirm if the "Instruction" for sections should support rich text or remain plain text.
<!-- NOTE: Implemented with a simplified sidebar configuration summary and plain-text section instructions based on the current builder UX. -->

---

## Proposed Options (1-3-1 Rule)

### Option 1: Simple Layout Wrap
- **Approach**: Wrap existing builder components in a shell mimicking the subject workspace. Move existing rules toggles to the sidebar with minimal changes.
- **Tradeoff**: Fast to implement but doesn't fully address UX goals for rules and sections.

### Option 2: Modular Redesign (Recommended)
- **Approach**: Create `ExamBuilderWorkspaceShell` based on `SubjectWorkspaceShell`. Redesign `ExamBuilderSidebar` with a dedicated settings navigation. Update `QuestionSectionCard` with an integrated "Section Instruction" UI.
- **Tradeoff**: Higher effort but ensures consistency and high-quality UX across the platform.

### Option 3: Tabbed Content Approach
- **Approach**: Use main-area tabs for "Questions", "Rules", and "Configuration", with a minimal sidebar for quick navigation.
- **Tradeoff**: Deviates from the "subject page pattern" requirement.

---

## Best Option: Option 2
**Why**: Aligns with existing workspace patterns, addresses all UX requirements, and provides a scalable foundation for future builder features.

---

## Implementation Phases

### Phase 1: Layout Shell & Navigation

**Goal:** Establish the new workspace layout structure.

- [x] [exam-builder-workspace-shell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/_components/layout/exam-builder-workspace-shell.tsx)
    - Create a new shell component following the `SubjectWorkspaceShell` pattern.
    - Include a sticky desktop sidebar and mobile-responsive navigation.
- [x] [exam-builder-screen.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/_components/exam-builder-screen.tsx)
    - Refactor to use the new `ExamBuilderWorkspaceShell`.
- [x] Write unit tests for `ExamBuilderWorkspaceShell` layout rendering.
    **Migration required:** No

### Phase 2: Sidebar Settings & Rules

**Goal:** Redesign the sidebar to showcase exam rules and configuration.

- [x] [exam-builder-sidebar.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/_components/exam-builder-sidebar.tsx)
    - Redesign to include sections for "Exam Rules" and "Configuration".
    - Use a cleaner UX (e.g., grouped toggles, status indicators).
- [x] [exam-rules-section.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/config/_components/exam-rules-section.tsx) (Reuse or adapt)
    - Integrate existing rules logic into the new sidebar.
- [x] Write tests for sidebar toggle interactions.
    **Migration required:** No

### Phase 3: Section & Instruction UX Improvements

**Goal:** Improve the UI for question sections and their instructions.

- [x] [question-section-card.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bucket-table/question-section-card.tsx)
    - Redesign the section header to clearly separate title and instructions.
    - Implement a "Add/Edit Instruction" toggle or inline editor that doesn't clutter the UI.
- [x] [question-bucket-table.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bucket-table.tsx)
    - Adjust container styling for better visual hierarchy between sections.
- [x] Write Vitest tests for section instruction updates.
    **Migration required:** No

### Phase 4: Verification & Refinement

**Goal:** Ensure cross-platform consistency and visual polish.

- [x] Sync changes to `app/sentinel-core` to maintain parity if applicable. <!-- NOTE: Not applicable; this feature is scoped to `sentinel-web` only. -->
- [x] Run lint and type checks: `pnpm lint` & `pnpm tsc`. <!-- NOTE: Full workspace runs surfaced pre-existing issues outside the changed files. -->
- [ ] Final visual pass for responsive behavior on mobile and tablet.

---

## Done Criteria

- [ ] Builder page uses the new `ExamBuilderWorkspaceShell` pattern.
- [ ] Sidebar contains functional "Exam Rules" and "Configuration" sections.
- [ ] Question sections have an improved UI with a dedicated instruction area.
- [ ] Layout is fully responsive and matches the `SubjectWorkspaceShell` style.
- [ ] All new components have corresponding Vitest tests.
