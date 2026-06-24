# Bug: Assigned Exam Not Reflecting on Student Classroom Page

## Summary

After an exam is assigned to a classroom and published, it does not appear on the student's classroom page — regardless of whether the exam is public or private.

---

## Affected States

The issue reproduces under all of the following conditions:

| State              | Assigned to Classroom | Visible to Student |
| ------------------ | --------------------- | ------------------ |
| Public + Assigned  | ✅                    | ❌                 |
| Private + Assigned | ✅                    | ❌                 |

---

## Expected vs Actual Behavior

**Expected:**
After an instructor assigns and publishes an exam, it should appear on the student's classroom page under the available tab.

**Actual:**
The exam does not appear on the student's classroom page after publishing, even when it is correctly assigned to the classroom.

---

## New Exam Flow (Current — Broken)

The exam creation flow was recently refactored into separate steps:

```
[create-exam-dialog]         → Creates metadata only
  (title, description,         (no classroom assignment here)
   dates, subject)
        │
        ▼
[builder page]               → Add questions, configure settings
                               Set visibility (public / private)
        │
        ▼
[assign page]                → Assign exam to one or more classrooms
                               Passes exam metadata + content →
                               [assigned] → [classrooms]
                                              │
                                    (contains students,
                                     sections, subjects)
        │
        ▼
[publish]                    → Should reflect on student's
                               classroom page ← ❌ NOT HAPPENING
```

---

## Previous Exam Flow (Working)

> For reference only — do not revert.

```
[create-exam-dialog]    → Metadata + classroom included together
        │
        ▼
[builder page]          → Add questions
        │
        ▼
[publish]               → Reflected on student classroom page ✅
                          and available tab of history page ✅
```

**Key difference:** The old flow bundled classroom assignment inside the creation step. The new flow separates them — the assign step now handles passing exam metadata and content down to the classroom. This is where the data pipeline likely breaks.

---

## Investigation Checklist

Work through each layer to identify where the data handoff fails.

### 1. Frontend

- [ ] Does the assign page correctly send the classroom ID(s) along with exam data?
- [ ] Is the published state being set/read correctly in the classroom page component?
- [ ] Does the student classroom page fetch/display exams reactively after publish, or only on initial load?

### 2. Mutation / Hooks

- **Path:** `packages/hooks/src/query`
- [ ] Does the assign mutation include the correct exam payload (metadata + content)?
- [ ] Is the publish mutation triggering a refetch or invalidating the correct query cache for the classroom page?
- [ ] Are there any race conditions between assign and publish mutations?

### 3. API Call

- **Path:** `packages/services/src/api`
- [ ] Does the assign API call correctly map exam data to the classroom record?
- [ ] Does the publish API call update the correct status field that the student view depends on?
- [ ] Verify request/response payloads with network logs.

### 4. Backend — `sentinel-api`

- [ ] Locate the classroom or exam-assignment controller/service.
- [ ] Confirm the assign endpoint correctly writes exam data (incl. content) to the classroom's exam store.
- [ ] Confirm the publish endpoint updates visibility in a way the student classroom query can pick up.
- [ ] Check for any permission/visibility gate that might be filtering out exams on the student-facing query.

### 5. Database

- [ ] Identify the table responsible for storing assigned exams per classroom (used by the student classroom page query).
- [ ] After assigning + publishing, verify the exam row exists in that table with the correct `classroom_id` and published/visibility status.
- [ ] Compare the schema assumptions of the old flow vs the new flow — the assign step may be writing to a different table or missing a required column.

---

## Root Cause Hypothesis

The most likely breakpoint is in the **assign → classroom data handoff**. In the old flow, classroom context was baked into the exam at creation time. In the new flow, the assign step is solely responsible for linking the exam to the classroom — if this step fails silently (e.g., the mutation succeeds but writes incomplete data, or the backend skips a necessary join record), the student page query would return nothing.

**Start here:** Verify the database record after a full assign + publish cycle before debugging upstream layers.
