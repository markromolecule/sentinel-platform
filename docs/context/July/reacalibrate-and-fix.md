# Proctoring System — Issue Report (Restructured)

## Glossary (for consistent terminology across tickets)

- **Event** — a single monitored action captured by the proctoring system (e.g. tab switch, right-click, clipboard use).
- **Flag** — the record created when an Event is evaluated and marked as suspicious.
- **Occurrence Count** — the number of times a specific Event type has happened for a given student during an exam attempt.
- **Severity** — the risk level assigned to a Flag: `Low`, `Medium`, or `High`.
- **Attempt Page** — the exam-taking view where the student's activity is recorded.
- **Instructor Page** — the monitoring dashboard where instructors review student Flags.

---

## 1. Bug: Duplicate Event on First Occurrence

**Current behavior:** The very first Event/Flag a student triggers is recorded twice — it appears as a `Duplicate` entry on both the Instructor Page and the Attempt Page.

**Expected behavior:** Each Event should be recorded exactly once per occurrence, regardless of whether it is the first Event in the session.

**Acceptance criteria:**

- Triggering any monitored Event for the first time in an attempt creates exactly one record.
- No `Duplicate` label appears on first-occurrence Events.

---

## 2. Bug: `full_screen_required` Falsely Triggered on Exam Submission

**Current behavior:** When a student submits their exam, the screen minimizes as part of the normal submission flow. The system incorrectly interprets this as a `full_screen_required` violation and creates a Flag.

**Expected behavior:** Screen minimization that occurs (a) after the student has submitted the exam, or (b) as a result of the system itself minimizing the window, must NOT be counted as a `full_screen_required` Flag.

**Acceptance criteria:**

- No `full_screen_required` Flag is created when minimization happens after submission.
- No `full_screen_required` Flag is created when the minimization is system-initiated (not student-initiated).
- `full_screen_required` still correctly fires for student-initiated minimization/exit _during_ an active, unsubmitted attempt.

---

## 3. Bug: `right_click_disable` Not Firing

**Current behavior:** Right-clicking during an exam does not create any Event or Flag on the Instructor Page — the detection appears non-functional.

**Expected behavior:** Every right-click during an active attempt should be captured as an Event and reflected as a Flag on the Instructor Page.

**Acceptance criteria:**

- Right-clicking during an attempt generates an Event.
- The Event appears on the Instructor Page and Attempt Page.

---

## 4. Logic Issue: Severity Escalates Too Aggressively

**Current behavior:** Sensitive Events (Clipboard Control, Tab Switching Monitor, and others) are marked `High` severity even when the Occurrence Count is only 1–2. There is no calibration between Occurrence Count and Severity.

**Expected behavior:** Severity should scale with Occurrence Count and/or behavioral pattern, not trigger `High` on a single or near-single occurrence. The goal is a system that is academically reasonable — isolated, low-count Events should not be treated the same as repeated or patterned behavior.

**Proposed severity model (adjust thresholds as needed per Event type):**

| Occurrence Count        | Severity |
| ----------------------- | -------- |
| 1–2                     | Low      |
| 3–5                     | Medium   |
| 6+ or repeating pattern | High     |

**Acceptance criteria:**

- Severity is calculated from Occurrence Count (and/or detected pattern), not hardcoded per Event type.
- All monitored Event types (Clipboard Control, Tab Switching Monitor, etc.) follow the same calibrated scale.
- Thresholds are consistent and documented so instructors can interpret them predictably.

---

## 5. Feature: Complete, Real-Time Instructor Monitoring

**Current behavior:** Not all committed Events are guaranteed to show on the Instructor Page. Updates are not real-time. There is no toast notification per Event.

**Expected behavior:**

1. Every Event/Flag committed by a student during an exam must appear on the Instructor Page — no Event should be silently dropped, to preserve exam integrity.
2. Severity (Low/Medium/High) should be derived from Occurrence Count and pattern, per the model in Issue 4, so instructors get a consistent risk signal.
3. The Instructor Page must update in real time (e.g. via websocket/live subscription) as Events occur — no manual refresh required.
4. Each Event should trigger a `toast.warning` notification on the Instructor Page at the moment it occurs.

**Acceptance criteria:**

- 100% of committed Events are visible on the Instructor Page (verify via event count parity between Attempt Page log and Instructor Page log).
- Instructor Page reflects new Events within a short delay (define target, e.g. <2s) without a page reload.
- A `toast.warning` fires for each new Event while the Instructor Page is open.
- Severity shown matches the calibrated model from Issue 4.

---

## Suggested Priority Order

1. **Bug fixes first** (Issues 1–3) — these are correctness/functional defects.
2. **Severity calibration** (Issue 4) — foundational logic that Issue 5 depends on.
3. **Real-time monitoring + toasts** (Issue 5) — builds on the corrected data and severity model.
