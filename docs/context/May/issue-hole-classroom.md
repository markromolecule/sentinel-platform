# System Design: Instructor-to-Classroom Assignment Flow

> Scope: Communication gaps and process streamlining between `[instructor]`, `[admin]`, and `[superadmin]` roles when assigning instructors to classrooms.

---

## 1. Core Assignment Flow & Gap Analysis

- What is the **end-to-end flow** when an `[administrator]` assigns an `[instructor]` to a `[classroom]`? What are the exact steps, actors, and decision points involved?
- Where does the current flow **break down or create ambiguity** — specifically at the handoff between the `[instructor]`'s preferences/requests and the `[administrator]`'s assignment authority?
- Is the assignment **unilateral** (admin decides alone) or **collaborative** (instructor must acknowledge/accept)? What should the expected behavior be in each case?
- What is the **source of truth** for classroom availability — is it managed by the system, the `[superadmin]`, or the `[admin]`?
- Should an `[instructor]` ever be able to **reject** an assigned `[classroom]`? If so, what happens next in the flow?

---

## 2. Subject-to-Instructor Matching

- What happens when an `[administrator]` attempts to assign an `[instructor]` to a `[classroom]` for an `[offered_subject]` that the instructor has **not requested or is not qualified for**?
- Should the system **block, warn, or allow** assignments where there is a mismatch between the instructor's requested subjects and the classroom's assigned subject?
- How does the system currently store what **subjects an instructor is eligible or qualified** to handle? Is this based on requests, credentials, or admin-defined tags?
- If an instructor is **qualified for a subject but hasn't requested it**, should the `[administrator]` still be allowed to assign them? Should the instructor be notified beforehand?
- How should the system handle **partial matches** — e.g., the instructor requested a subject but not the specific section or course level being offered?
- Should there be a mechanism for an `[administrator]` to **override a mismatch** with an attached justification or approval from a `[superadmin]`?

---

## 3. Classroom Structure & Offered Subjects

- What defines a `[classroom]` in the system? Does it represent a **physical room**, a **schedule slot**, a **section-subject-course bundle**, or all of the above?
- How is an `[offered_subject]` tied to a `[classroom]`? Is this set by the `[superadmin]`, auto-generated from a curriculum, or manually entered by an `[admin]`?
- Can a single `[classroom]` have **multiple offered subjects** (e.g., cross-listed subjects), and if so, does each subject require a separate instructor assignment?
- What is the relationship between `[offered_subject]`, `[section]`, and `[course]`? Are these independently assignable, or is assigning to a classroom always a single bundled action?
- How are **conflicts** handled — e.g., two instructors assigned to the same classroom, or one instructor assigned to two classrooms at the same time slot?

---

## 4. Instructor Request & Self-Initiated Flow

- What is the current mechanism for an `[instructor]` to **request** a subject, section, or classroom? Is there a formal request system, or is this done informally?
- Should instructors be able to **browse available classrooms or offered subjects** and submit a request/preference? What level of transparency into the schedule should they have?
- Should the system support **instructor-initiated classroom creation** (e.g., a proposal flow where the instructor defines the subject, section, and schedule for admin approval)?
- If an instructor submits a request, what are the **possible states** of that request (e.g., pending, approved, rejected, waitlisted, cancelled)?
- What happens to an instructor's pending request if the classroom they requested is **already filled** by the time the admin reviews it?
- Should instructors receive **real-time updates** when their requests are reviewed, approved, or when they are assigned to a classroom by an admin?

---

## 5. Administrator Workflow & Streamlining

- What tools or views does the `[administrator]` currently have to **see which classrooms are unassigned** and which instructors are available?
- Should the system provide the `[administrator]` with **smart suggestions** — e.g., recommended instructors for a classroom based on subject eligibility, current load, and preferences?
- Can an `[administrator]` perform **bulk assignments** — assigning multiple instructors to multiple classrooms in a single action?
- Should the system enforce **load balancing rules** (e.g., max subjects per instructor per term) that prevent or flag over-assignment?
- What is the `[admin]`'s visibility into the `[superadmin]`'s decisions? Can an admin act independently, or do certain assignments require `[superadmin]` approval before going into effect?
- Should there be an **assignment draft/staging mode** where an admin can plan assignments before officially committing them, to avoid premature notifications to instructors?

---

## 6. Role Hierarchy & Permission Model

- What is the **exact permission boundary** between `[admin]` and `[superadmin]` in the context of classroom assignments? Which actions require each role?
- Can a `[superadmin]` **override or revoke** an assignment made by an `[admin]`? What notification or audit trail does this generate?
- Should `[admins]` be scoped (e.g., department-level admins who can only assign within their department), or do all admins have system-wide assignment access?
- How does the system handle **role conflicts** — e.g., a user who is both an instructor and an admin? Which role's view and permissions take precedence?
- Should there be a **delegation mechanism** — allowing a `[superadmin]` to delegate specific assignment authority to an `[admin]` for a defined period or scope?

---

## 7. Communication & Notification System

- What **notifications** should be triggered at each step of the assignment process — e.g., when an assignment is proposed, confirmed, rejected, or modified?
- Should communication between `[instructor]` and `[administrator]` happen **inside the system** (built-in messaging), or only through external channels (email, etc.)?
- Should there be a **discussion/comment thread** attached to each assignment or request, so that context is preserved and auditable?
- How should the system handle **time-sensitive communication** — e.g., an instructor who needs to be notified immediately before the enrollment period opens?
- Should the `[instructor]` receive a **confirmation prompt** before an assignment is finalized, ensuring they are aware and available?

---

## 8. Conflict Resolution & Edge Cases

- What happens if an `[instructor]` is assigned to a `[classroom]` but later becomes **unavailable** (leave, resignation, overload)?
- What is the **reassignment flow** — can an admin remove an instructor mid-assignment and replace them? What notifications are sent?
- How should the system handle a case where **no eligible instructor is available** for a given `[offered_subject]` or `[classroom]`?
- Should there be a **substitute/backup instructor** mechanism that can be pre-defined for each classroom or subject?
- What is the process if an `[instructor]` disputes or appeals their assignment — is there a formal review process involving `[superadmin]`?

---

## 9. Audit, History & Accountability

- Should the system maintain a **full audit log** of every assignment action — who assigned, who was assigned, when, and any changes made?
- Should instructors and administrators be able to **view historical assignments** (past terms/semesters) for reference or reporting?
- How should the system handle **data retention** — e.g., after a term ends, are assignments archived or purged?
- Are there **reporting requirements** (e.g., instructor load reports, subject coverage reports) that the assignment flow needs to support?

---

## 10. Scalability & Future-Proofing

- Should the system support **multi-campus or multi-department** scenarios where assignment flows may differ across organizational units?
- Is there a need to support **automated or AI-assisted assignment** in the future, where the system proposes instructor-classroom pairings based on historical data and constraints?
- Should the system expose an **API layer** for the assignment flow, enabling integration with external systems (e.g., HR, curriculum planning, third-party scheduling tools)?
- How should the system scale if the number of instructors, classrooms, or offered subjects grows significantly — are there performance or UX bottlenecks in the current flow?
- Should the assignment system support **recurring assignments** (e.g., the same instructor is automatically proposed for the same subject every term unless changed)?

---

## Summary of Key Design Decisions Required

| Decision                                | Options                                | Stakeholder        |
| --------------------------------------- | -------------------------------------- | ------------------ |
| Who initiates assignment?               | Admin-only / Instructor-request / Both | System Architect   |
| Can instructor reject assignment?       | Yes / No / With approval               | Policy Owner       |
| Mismatch handling (subject eligibility) | Block / Warn / Allow with override     | Admin / Superadmin |
| Notification model                      | Real-time / Batched / On-action        | Product Owner      |
| Role scope                              | Global admin / Department-scoped       | Superadmin         |
| Assignment staging                      | Draft mode / Immediate commit          | Admin UX           |
| Audit trail                             | Full history / Summary only            | Compliance         |
