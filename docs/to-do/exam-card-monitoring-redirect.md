# To-Do: Add Monitoring Redirect to ExamCard

## Context

The `ExamCard` component (`src/features/exams/_components/exam-list/exam-card.tsx`) displays individual exam information on the Exams dashboard. Currently, the "Manage Exam" button does not redirect anywhere meaningful. The goal is to add a **"Monitor"** action (or update the existing button) that redirects to the exam's monitoring page at `/exams/[id]/monitoring`.

## 1-3-1 Rule

**1 Goal:** Add a monitoring redirect to the `ExamCard` component.

**3 Tasks:**
1. Update `ExamCard` to add a "Monitor" button using `next/link` pointing to `/exams/${exam.id}/monitoring`.
2. Ensure the `ExamCard` remains a Client Component (it already uses JSX event handlers/dropdowns).
3. Keep the component clean — no new state or hooks needed; pure navigation via `Link`.

**1 Outcome:** Clicking "Monitor" on any exam card navigates the proctor to `/exams/[id]/monitoring`.

---

## Detailed To-Do List

### Phase 1: Component Update

- [ ] Open `exam-card.tsx`
- [x] Import `Link` from `next/link`
- [x] Add a **"Monitor"** button in `CardFooter` that links to `/exams/${exam.id}/monitoring`
  - Use `Button` component with `asChild` prop wrapping a `Link`
  - Use `Monitor` icon from `lucide-react`
  - Position it alongside / replacing the existing "Manage Exam" button based on UX intent  
  - Follow the **1-3-1 rule**: only one primary action button (`Monitor`), the dropdown menu stays for secondary actions

### Phase 2: Validation

- [x] Verify the link is correctly generated with the `exam.id`
- [x] Confirm the page at `/exams/[id]/monitoring` loads correctly when navigated to
- [x] Ensure no TypeScript errors are introduced

---

## Files to Change

| File | Action |
|------|--------|
| `src/features/exams/_components/exam-list/exam-card.tsx` | Add `Monitor` link button |

## Rules Applied

- `next/link` for navigation (per `components.md` rule)
- Named export (per `components.md` rule)  
- No `"use client"` changes needed (already a client component)
- `kebab-case` filenames already correct
- No new types needed — uses existing `ProctorExam.id` field
