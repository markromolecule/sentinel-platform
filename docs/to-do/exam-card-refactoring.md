# Exam Card Refactoring Plan

## 1. Analysis
The `ExamCard` component currently blends state management (delete alert), complex conditional logic (primary actions and styling), and rendering a massive UI structure. This violates the Single Responsibility Principle and creates a monolithic component.

## 2. Split UI and Logic
- [ ] Create `use-exam-card.tsx` hook (or `.ts` depending on rules).
- [ ] Move the delete logic (`handleDelete`) and `showDeleteAlert` state to the hook.
- [ ] Move `getPrimaryAction` into a separate utility file or keep it encapsulated within the hook.

## 3. Extract Sub-components
Break `exam-card.tsx` into smaller, independent parts:
- [ ] `ExamCardHeader.tsx`: Handles the top container, title, status badge, and the actions dropdown menu.
- [ ] `ExamCardContent.tsx`: Handles the scheduling date and the number of questions.
- [ ] `ExamCardFooter.tsx`: Handles the primary action button rendering.
- [ ] `ExamCardDeleteAlert.tsx`: Handles the isolated alert dialog for deletions.
- [ ] `exam-card.tsx`: Acts purely as the compositional layout layer for the above components.

## 4. Apply Best Practices
- [ ] Move the `ExamPrimaryAction` types to `_types.ts`.
- [ ] Ensure `lucide-react` icons and `sonner` toasts are maintained appropriately within the hook.

## 5. Testing & Verification
- [ ] Run `pnpm lint` in the web package to verify the new structure.
- [ ] Manually verify logic in the UI.
