-- Rename proctor_id to instructor_id for instructor-based assignments
ALTER TABLE public.proctor_assignments
  RENAME COLUMN proctor_id TO instructor_id;

ALTER TABLE public.proctor_assignments
  RENAME CONSTRAINT proctor_assignments_exam_id_proctor_id_key
  TO proctor_assignments_exam_id_instructor_id_key;

ALTER TABLE public.proctor_assignments
  RENAME CONSTRAINT proctor_assignments_proctor_id_fkey
  TO proctor_assignments_instructor_id_fkey;
