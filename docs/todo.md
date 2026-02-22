# Sentinel — Development To-Do

> Last updated: **2026-02-22** (Sunday)

---

## ✅ Done Today

| Area | Task |
|------|------|
| **DB / Schema** | Added `exam_questions` table to Prisma schema with `question_type` enum (`MULTIPLE_CHOICE`, `IDENTIFICATION`, `ESSAY`, `ENUMERATION`, `TRUE_FALSE`) |
| **Supabase** | Generated `03_exam_questions.sql` migration file in `src/supabase/migrations/` — includes `question_type` enum, `exam_questions` table DDL, and FK to `exams` |
| **Prisma** | Ran `prisma generate` — rebuilt Prisma Client (v7.3.0) and re-generated Kysely types in `src/lib/types.ts` |
| **Kysely** | Verified generated `exam_questions` Kysely type and `DB` registry are correct |
| **Exam Builder** | Built the full question builder UI — `question-card.tsx`, `question-list.tsx`, individual form components (MCQ, True/False, Identification, Essay, Enumeration) |
| **Zustand Store** | Created `use-exam-builder-store.ts` — manages questions, types, content, reordering, dirty/submitting states |
| **API — ExamService** | Implemented `ExamService.createDraftExam`, `saveBuilderState` (upsert with transaction + auto-delete removed questions), `getExamWithQuestions` using Kysely |

---

## 🔲 To-Do Next

### High Priority

- [ ] **Wire `Save Draft` button to API** — `builder/page.tsx` `handleSaveDraft` is currently a frontend-only stub. It must call `POST /proctor/exams/:id/builder` passing the full questions array from the Zustand store.
- [ ] **Add `useExamQuestions` query hook** — Fetch existing questions on builder page load (when revisiting a draft), hydrate the Zustand store via `setExamMetadata` + `setQuestions`.
- [ ] **Apply Supabase migration** — Run `03_exam_questions.sql` via the Supabase dashboard or CLI against production.
- [ ] **Add `exam.routes.ts` endpoints** — `PUT /exams/:id/builder` for saving builder state + `GET /exams/:id/builder` wired to `ExamService.getExamWithQuestions`.

### Medium Priority

- [ ] **Exam controller validation** — Add Zod schemas in the exam controller for builder payload validation (question type enum, content shape guards).
- [ ] **Question DAL refactor** — Split `ExamService` into proper per-operation files per `data-access-via-db.md` rules (e.g., `src/data/exam-questions/create-exam-question.ts`, etc.)
- [ ] **True/False fix** — `correctAnswer` stored as `boolean` in the store but displayed as `"true"/"false"` string in `question-card.tsx` — normalize the type in the shared `ExamQuestion` type.
- [ ] **Duplicate question action** — `handleDuplicate` in `question-card.tsx` currently just *adds a new blank question* of the same type instead of deep-copying content. Implement a proper `duplicateQuestion` action in the store.

### Low Priority

- [ ] **Drag-and-drop reordering** — The `GripVertical` icon is rendered but reordering is not hooked up (no drag library yet). Consider `@dnd-kit/core`.
- [ ] **RLS policies for `exam_questions`** — Policy was not added during the migration. Add authenticated read/write policies.
- [ ] **`audit_logs` removal** — The generated migration drops `audit_logs` (schema drift from Prisma model rename to `audit_log_entries`). Confirm this is intentional.

---

## 📎 Notes

- `db push` failed on auth schema tables — Supabase auth tables are owned by the `supabase_admin` role. Changes to `auth.*` in Prisma schema (e.g., dropping `email_optional` on `flow_state`) **cannot** be applied via `db push`. Keep the auth schema models in Prisma just for type generation; never diff/push auth schema changes.
- Kysely `DB` type now includes `exam_questions` — all future exam question queries are fully type-safe.
