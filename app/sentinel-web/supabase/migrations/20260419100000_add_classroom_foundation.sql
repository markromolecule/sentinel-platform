ALTER TABLE public.class_groups
    ADD COLUMN IF NOT EXISTS class_name varchar(255),
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE public.exams
    ADD COLUMN IF NOT EXISTS class_group_id uuid;

CREATE INDEX IF NOT EXISTS exams_class_group_id_idx
    ON public.exams (class_group_id);

DO $$
BEGIN
    ALTER TABLE public.class_groups
        ADD CONSTRAINT class_groups_updated_by_fkey
        FOREIGN KEY (updated_by) REFERENCES auth.users(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.exams
        ADD CONSTRAINT exams_class_group_id_fkey
        FOREIGN KEY (class_group_id) REFERENCES public.class_groups(class_group_id)
        ON DELETE SET NULL
        ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

WITH resolvable_exam_class_groups AS (
    SELECT
        e.exam_id,
        MIN(cg.class_group_id::text)::uuid AS class_group_id,
        COUNT(*) AS match_count
    FROM public.exams e
    INNER JOIN public.subjects s
        ON s.subject_id = e.subject_id
    INNER JOIN public.class_groups cg
        ON cg.subject_id = e.subject_id
        AND cg.section_id = e.section_id
        AND cg.term_id = s.term_id
        AND cg.institution_id IS NOT DISTINCT FROM e.institution_id
    WHERE e.class_group_id IS NULL
        AND e.subject_id IS NOT NULL
        AND e.section_id IS NOT NULL
        AND s.term_id IS NOT NULL
    GROUP BY e.exam_id
)
UPDATE public.exams e
SET class_group_id = resolved.class_group_id
FROM resolvable_exam_class_groups resolved
WHERE e.exam_id = resolved.exam_id
    AND resolved.match_count = 1;
