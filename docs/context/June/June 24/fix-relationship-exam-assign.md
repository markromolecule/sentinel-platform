## System Context & Bug Report

### 1. Entities & Relationships

- **Instructor / Administrator (Creator/Owner):** Creates exams and assigns them to Classrooms.
- **Exam:** Contains metadata and multiple Questions. Has a publication/assignment status.
- **Classroom:** A grouping entity containing multiple Students.
- **Student:** A member of a Classroom who needs to view and take assigned Exams.

### 2. Intended Workflow (Happy Path)

1. **Creation:** `Instructor` creates `Exam` metadata $\rightarrow$ Adds `Questions`.
2. **Assignment:** `Instructor` publishes and assigns the `Exam` to one or more `Classrooms`.
3. **Delivery:** The system links the `Exam` to all `Students` enrolled in the designated `Classrooms`.
4. **Visibility:** The `Student` navigates to their dashboard and views the exam in two places:

- The specific **Classroom Page**.
- The **History Tab** under the **Available Exams** section.

---

### 3. The Issue (Current Bug)

- **Symptom:** Even though the `Instructor` successfully triggers the assignment action, the `Student` interface shows an empty state (**no data available**).
- **Location of Failure:** \* Student $\rightarrow$ Classroom Page (Missing assigned exam)
- Student $\rightarrow$ History Tab $\rightarrow$ Available Tab (Missing assigned exam)

### 4. Technical Behavior Contrast

- **Expected Behavior:** An assigned exam must be queryable and visible on the student-side UI elements immediately after assignment.
- **Actual Behavior:** The database or API fails to serve the assigned exam data to the student's views, resulting in an empty UI state.

---

### Potential Root Causes to Investigate (For the LLM)

- **Query Filter Mismatch:** Check if the student-side API query filters for a status flag (e.g., `is_published: true`, `status: 'ACTIVE'`) that isn't being set during the assignment phase.
- **Junction Table Breakage:** Verify if the relational/junction table linking `exams` to `classrooms` (or `students`) is successfully inserting rows.
- **Caching/Revalidation:** Check if the student dashboard views are fetching stale/cached data and missing the newly mutated assignment state.
- **RBAC / Tenant Isolation:** Ensure the query fetching exams for the student properly checks classroom membership IDs.
