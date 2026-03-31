# Subject Offerings Design

## Intent

Separate permanent catalog identity from term-specific rollout.

- `subjects`
  - Stable catalog record
  - Owns `subject_code`, `subject_title`, institution ownership, and long-lived references
- `subject_offerings`
  - One subject offered for one term in one institution
  - Owns assignment coverage and lifecycle for that rollout

This prevents the current overwrite problem where reusing a subject next term would replace the prior term's sections, year levels, and assignment context.

## Recommended Relationship Model

### Catalog layer

- `subjects`
  - `subject_id`
  - `subject_code`
  - `subject_title`
  - `institution_id`

### Offering layer

- `subject_offerings`
  - `subject_offering_id`
  - `subject_id`
  - `term_id`
  - `institution_id`
  - `status`
  - audit fields
  - unique on `(subject_id, term_id, institution_id)`

### Offering assignment coverage

- `subject_offering_departments`
- `subject_offering_courses`
- `subject_offering_sections`
- `subject_offering_year_levels`

These tables replace term-specific use of:

- `subject_departments`
- `course_subjects`
- `subject_sections`
- `subject_year_levels`

Those old tables remain in this migration for compatibility and staged cutover.

## Relationship To Existing Data

### Terms

- A subject offering belongs to exactly one term.
- Term `start_date` and `end_date` should be the source of schedule truth.
- Subject-level `offering_start_date` and `offering_end_date` can be retired in a later cleanup migration.

### Class groups

Current:

- `class_groups` links `subject_id + section_id + term_id`

Proposed:

- `class_groups.subject_offering_id` becomes the primary link
- `section_id` stays on `class_groups`
- `subject_id` and `term_id` remain temporarily for backward compatibility and backfill safety

Long term, class groups should be interpreted as:

- one section-specific class shell under one subject offering

### Enrollments and enrollment requests

No direct schema change is required beyond `class_groups`.

Flow remains:

- `subject_offerings`
  -> `class_groups`
  -> `class_roles`
  -> `enrollments`
  -> `enrollment_requests`

This is the safest transition because student and instructor membership already hangs off `class_groups`.

### Instructors

Instructor assignment should continue through `class_roles`.

That means an instructor is not assigned to the catalog subject directly. They are assigned to:

- a class group
- which belongs to a subject offering
- which belongs to a term

This preserves history per batch and term.

### Exams

Current exams still point to `subjects.subject_id`.

Short term:

- keep that link unchanged

Recommended next phase:

- add nullable `subject_offering_id` to `exams`
- use offering-level linkage when an exam is term-specific

That avoids ambiguity when the same subject exists across multiple terms.

## Backfill Strategy In Migration

The migration added in this change does the following:

1. Creates `subject_offerings` and offering assignment tables.
2. Adds `class_groups.subject_offering_id`.
3. Backfills one offering per distinct `(subject_id, term_id, institution_id)` from:
   - current `subjects.term_id`
   - existing `class_groups.subject_id + term_id`
4. Copies subject assignment coverage into offering assignment tables.
5. Updates `class_groups.subject_offering_id` by matching existing `subject_id + term_id + institution_id`.

## Transition Plan

### Phase 1

- Keep current app behavior working.
- Start writing new features against `subject_offerings`.
- Continue reading old subject-level fields where needed.

### Phase 2

- Move subject dialog into two flows:
  - `Add Subject`
  - `Offer Subject`
- Store term, sections, year levels, courses, and departments on the offering only.

### Phase 3

- Update enrollments, reporting, and instructor flows to read from `subject_offerings`.
- Add offering-aware exam linkage if needed.

### Phase 4

- Remove deprecated subject-level offering fields and assignment tables once all reads and writes are migrated.

## Recommended UI Direction

- `Add Subject`
  - catalog only
  - code + title

- `Offer Subject`
  - choose subject
  - choose term
  - choose departments, courses, year levels, sections

- `Edit Offering`
  - changes only the selected term rollout
  - preserves older term history

This gives the clearest mental model for admins and protects historical records for older batches.
