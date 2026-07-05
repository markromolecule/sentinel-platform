# Issue

- The exam is not showing in the student view.
    - Classroom page
    - Historay page; Available tab
- Check for the [mutation] & [query] / api call to the frontend
    - @packages/hooks/src/query
    - @packages/services/src/api
- Check the component that holds the logic for the exam

# Checklist

- In the database, I confirm that it was being assigned to a [class_group]; however, the [room_id] is not being passed
- I think there's a mistake because the [exam_assigned_sections] table are empty
- [exam_section_assignments] - the exam that I was testing is not being located here also id = [04a56241-2209-42e1-b1da-89c42535f963]
    - In addition, the [schedule_at] column are not being filled this same goes applies on other test of exam creation and assigning them
- [exam_shares] - this column are also blank; investigate this further
    - **Finding:** `exam_shares` only controls shared access/co-proctoring permissions for other instructors/staff. A blank `exam_shares` is expected for student-assigned classroom exams. It is not used/needed for student visibility.

## Diagnostic and Remediation Paths

### Diagnostic SQL

Run this query to check the configuration state of exam `04a56241-2209-42e1-b1da-89c42535f963`:

```sql
SELECT
    e.exam_id,
    e.title,
    e.class_group_id,
    e.section_id,
    e.room_id,
    e.scheduled_date,
    e.end_date_time,
    cg.class_name,
    cg.subject_id,
    r.room_name,
    (SELECT count(*)::int FROM exam_section_assignments WHERE exam_id = e.exam_id) as assignment_rows_count,
    (SELECT count(*)::int FROM exam_assigned_sections WHERE exam_id = e.exam_id) as legacy_section_rows_count,
    (SELECT count(*)::int FROM exam_shares WHERE exam_id = e.exam_id) as share_rows_count
FROM exams e
LEFT JOIN class_groups cg ON cg.class_group_id = e.class_group_id
LEFT JOIN rooms r ON r.room_id = e.room_id
WHERE e.exam_id = '04a56241-2209-42e1-b1da-89c42535f963';
```

### Remediation SQL (One-Time Backfill)

Run this query to backfill `exam_section_assignments` rows for existing exams that were created without assignment rows but have valid denormalized classroom values:

```sql
INSERT INTO exam_section_assignments (
    id,
    exam_id,
    section_id,
    class_group_id,
    room_id,
    instructor_id,
    scheduled_at,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    e.exam_id,
    e.section_id,
    e.class_group_id,
    e.room_id,
    e.created_by,
    e.scheduled_date,
    NOW(),
    NOW()
FROM exams e
WHERE e.class_group_id IS NOT NULL
  AND e.section_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM exam_section_assignments esa
      WHERE esa.exam_id = e.exam_id
  );
```
