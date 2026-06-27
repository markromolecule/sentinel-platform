# Grading — Attempt Summary Report

> Context for LLM · covers active bugs, feature requirements, and open questions.

## System context

An exam grading module where instructors review student attempt submissions. The **Attempt Summary Report** page lists all student attempts for a given exam. Instructors can override scores per student and finalize each report. The system integrates with Google Forms for question/answer data.

---

## Bugs

### B-1 · Score override not persisting

- **Symptom:** Submitting a score override has no visible effect — the value reverts.
- **Expected:** Updated score is saved and reflected immediately in the data table.
- **Actual:** Score does not update after override submission.

### B-2 · Override reason field is required but should be optional

- **Symptom:** `[Override Reason]` blocks form submission when left blank.
- **Expected:** Override reason is optional — instructors may leave it empty.

### B-3 · Overridden score not reflected in data table

- **Symptom:** After a successful override, the score in the attempt summary table does not update.
- **Expected:** The table row reflects the new score immediately without a full page reload.

### B-4 · 500 error on Save & Finalize

- **Symptom:** Clicking `[Save & Finalize]` triggers a 500 error from the attempts endpoint.
- **Error message:** `Cannot read properties of undefined (reading '7813756c-b61f-4a25-b237-3e38250e9f8d')`
- **Failing endpoint:** `POST :3001/grading/attempts/4a542627-7091-44c5-b606-80f0b04439d8` → `500 Internal Server Error`
- **Likely cause:** The server is trying to read a property keyed by a UUID that is missing or undefined — possibly a student attempt record that isn't loaded yet, or a mapping that isn't initialized before finalization runs.

---

## Feature requirements — streamlined finalization

Currently, instructors must navigate to each student row individually to finalize their report. This creates a risk of accidentally skipping students. The following cases should be supported.

### Case 1 · Objective-only exams (MCQ, true/false)

If all questions are auto-gradable, the report can be finalized automatically without instructor intervention. The system should detect this condition and surface a bulk finalize action.

- Show a "Finalize all" option at the top of the attempt summary table.
- No override step required, but the instructor should still have the option to override a score before bulk-finalizing.

### Case 2 · Exams with fill-in-the-blank or essay questions

Instructors must manually review open-ended responses. The UI should make it clear which students still need evaluation.

- Flag rows where manual review is pending (e.g. unevaluated essay answer).
- Allow the instructor to override the score if needed — override is **optional**.
- Allow finalizing a student's report even if no override was made (instructor reviewed and accepted the auto-score).
- Provide a bulk-finalize option once all rows are reviewed.

### Guardrails (both cases)

- Always expose two paths: (1) finalize individually per student, (2) finalize all at once.
- Surface a warning if any student reports are unfinalized before the instructor attempts a bulk finalize.

---

## Feature requirements — exam rules: score visibility

Instructors should be able to configure per-exam whether students see their score after submission.

- **Auto-release:** Score is shown to the student immediately after submission. Suitable for objective-only exams.
- **Manual release:** Score is hidden until the instructor finalizes and releases the report.
- This setting lives under "Exam Rules" at the exam creation/edit level.

---

## Open questions

### Q-1 · What is the "initial" score state when a student submits?

For reference: Google Forms assigns an initial score automatically on submission for auto-gradable questions; instructors can adjust after. We need to decide whether our system follows this model:

- Does the system auto-score objective answers on submission, making that the "initial" score?
- Or does the score start at zero/null until an instructor action sets it?
- The answer determines what "override" means — is it overriding an auto-score, or setting a score from scratch?

### Q-2 · How should the student-facing score flow work end-to-end?

- What does the student see immediately after submission — a confirmation, a pending state, or the score?
- When the instructor finalizes a report, is the student notified?
- Should students be able to see a per-question breakdown or only the total?