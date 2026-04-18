CREATE INDEX IF NOT EXISTS exam_attempts_student_exam_created_idx
ON public.exam_attempts (student_id, exam_id, created_at DESC);

CREATE INDEX IF NOT EXISTS exam_attempts_student_completed_idx
ON public.exam_attempts (student_id, completed_at DESC);
