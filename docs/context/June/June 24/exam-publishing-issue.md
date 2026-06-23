# Issue: Exam Visibility Failure After Decoupling Refactor

## 1. Architectural Context (The "Why")

To eliminate redundancy and increase flexibility, the exam system was refactored away from a tightly coupled architecture.

- **Previous Implementation:** Exams were tied directly to a single classroom at the moment of creation (e.g., `exam.classroom_id` was mandatory on creation). This prevented exam templates from being reused across multiple classes or instructors.
- **Current Implementation:** A decoupled, two-step workflow:

1. **Creation:** The user creates the standalone exam metadata, configuration, and question bank (acting as a reusable template).
2. **Assignment:** The creator maps that exam to themselves, other instructors, or one/more target classrooms.

---

## 2. The Current Problem (The Bug)

While the new decoupled creation workflow works, the **assignment mechanism is failing to propagate visibility**.

- When an administrator or instructor assigns a created exam to a specific classroom, the exam **does not appear** in that classroom’s feed or dashboard.
- Consequently, students enrolled in those target classrooms cannot see, access, or take the exam.

---

## 3. Expected Behavior & Acceptance Criteria

- **Data Propagation:** Assigning an exam template to a classroom must successfully create the relationship link in the data layer without creating duplicate copies of the core exam questions.
- **Role-Based Visibility:**
- **Instructors:** Must see the exam in their assigned/managed classroom dashboards.
- **Students:** Every user enrolled in the target classroom(s) must instantly receive and see the exam in their student view.

- **Flexibility:** A single exam template must be able to be assigned to multiple classrooms simultaneously without conflict.

---

## 4. Resolution

The visibility bug has been resolved by aligning the exam read paths with both assignment tables:

- Classroom and student exam predicates now recognize assignments stored in `exam_section_assignments` as well as the legacy `exam_assigned_sections` table.
- The exam detail payload now aggregates assigned section names and ids from both sources so classroom assignment visibility matches the list views.
- Student access entitlements now aggregate assigned section ids from both assignment tables, so student eligibility checks match the list visibility logic.
- Student history now limits the Available tab to active exam states only and no longer leaks archived exams into the active feed.
- Student classroom detail now hides archived exams from the active Class Assessments grid while preserving archived-card behavior in history/detail contexts.
- Service DTO mapping now preserves `sectionIds` from API responses and falls back to legacy `assigned_section_ids` only when needed.

Validation was completed with targeted Vitest runs against the touched API and web tests.
