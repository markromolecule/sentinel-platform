```CREATE TYPE public.subject_offering_status AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED');

CREATE TABLE public.subject_offerings (
    subject_offering_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id uuid NOT NULL,
    term_id uuid NOT NULL,
    status public.subject_offering_status DEFAULT 'DRAFT',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    institution_id uuid
);

CREATE TABLE public.subject_offering_departments (
    subject_offering_id uuid NOT NULL,
    department_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subject_offering_departments_pkey PRIMARY KEY (subject_offering_id, department_id)
);

CREATE TABLE public.subject_offering_courses (
    subject_offering_id uuid NOT NULL,
    course_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subject_offering_courses_pkey PRIMARY KEY (subject_offering_id, course_id)
);

CREATE TABLE public.subject_offering_sections (
    subject_offering_id uuid NOT NULL,
    section_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subject_offering_sections_pkey PRIMARY KEY (subject_offering_id, section_id)
);

CREATE TABLE public.subject_offering_year_levels (
    subject_offering_id uuid NOT NULL,
    year_level smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subject_offering_year_levels_pkey PRIMARY KEY (subject_offering_id, year_level),
    CONSTRAINT subject_offering_year_levels_year_level_check CHECK (year_level >= 1 AND year_level <= 6)
);

ALTER TABLE public.class_groups
    ADD COLUMN IF NOT EXISTS subject_offering_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS subject_offerings_subject_term_institution_key
    ON public.subject_offerings (subject_id, term_id, institution_id);

CREATE INDEX IF NOT EXISTS subject_offerings_institution_id_idx
    ON public.subject_offerings (institution_id);

CREATE INDEX IF NOT EXISTS subject_offerings_term_id_idx
    ON public.subject_offerings (term_id);

CREATE INDEX IF NOT EXISTS class_groups_subject_offering_id_idx
    ON public.class_groups (subject_offering_id);

DO $$
BEGIN
    ALTER TABLE public.subject_offerings
        ADD CONSTRAINT subject_offerings_subject_id_fkey
        FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offerings
        ADD CONSTRAINT subject_offerings_term_id_fkey
        FOREIGN KEY (term_id) REFERENCES public.terms(term_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offerings
        ADD CONSTRAINT subject_offerings_institution_id_fkey
        FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offerings
        ADD CONSTRAINT subject_offerings_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offerings
        ADD CONSTRAINT subject_offerings_updated_by_fkey
        FOREIGN KEY (updated_by) REFERENCES auth.users(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offering_departments
        ADD CONSTRAINT subject_offering_departments_subject_offering_id_fkey
        FOREIGN KEY (subject_offering_id) REFERENCES public.subject_offerings(subject_offering_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offering_departments
        ADD CONSTRAINT subject_offering_departments_department_id_fkey
        FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offering_courses
        ADD CONSTRAINT subject_offering_courses_subject_offering_id_fkey
        FOREIGN KEY (subject_offering_id) REFERENCES public.subject_offerings(subject_offering_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offering_courses
        ADD CONSTRAINT subject_offering_courses_course_id_fkey
        FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offering_sections
        ADD CONSTRAINT subject_offering_sections_subject_offering_id_fkey
        FOREIGN KEY (subject_offering_id) REFERENCES public.subject_offerings(subject_offering_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offering_sections
        ADD CONSTRAINT subject_offering_sections_section_id_fkey
        FOREIGN KEY (section_id) REFERENCES public.sections(section_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_offering_year_levels
        ADD CONSTRAINT subject_offering_year_levels_subject_offering_id_fkey
        FOREIGN KEY (subject_offering_id) REFERENCES public.subject_offerings(subject_offering_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.class_groups
        ADD CONSTRAINT class_groups_subject_offering_id_fkey
        FOREIGN KEY (subject_offering_id) REFERENCES public.subject_offerings(subject_offering_id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

INSERT INTO public.subject_offerings (
    subject_id,
    term_id,
    status,
    created_at,
    updated_at,
    created_by,
    updated_by,
    institution_id
)
SELECT DISTINCT
    source.subject_id,
    source.term_id,
    CASE
        WHEN terms.end_date IS NOT NULL AND terms.end_date < now() THEN 'CLOSED'::public.subject_offering_status
        WHEN terms.start_date IS NOT NULL AND terms.start_date <= now() AND (terms.end_date IS NULL OR terms.end_date >= now()) THEN 'OPEN'::public.subject_offering_status
        ELSE 'DRAFT'::public.subject_offering_status
    END,
    source.created_at,
    source.updated_at,
    source.created_by,
    source.updated_by,
    source.institution_id
FROM (
    SELECT
        s.subject_id,
        s.term_id,
        s.created_at,
        s.updated_at,
        s.created_by,
        s.updated_by,
        s.institution_id
    FROM public.subjects s
    WHERE s.term_id IS NOT NULL

    UNION

    SELECT
        cg.subject_id,
        cg.term_id,
        min(cg.created_at) AS created_at,
        min(cg.created_at) AS updated_at,
        NULL::uuid AS created_by,
        NULL::uuid AS updated_by,
        cg.institution_id
    FROM public.class_groups cg
    WHERE cg.subject_id IS NOT NULL
      AND cg.term_id IS NOT NULL
    GROUP BY cg.subject_id, cg.term_id, cg.institution_id
) source
INNER JOIN public.terms terms
    ON terms.term_id = source.term_id
ON CONFLICT (subject_id, term_id, institution_id) DO NOTHING;

INSERT INTO public.subject_offering_departments (subject_offering_id, department_id, created_at)
SELECT DISTINCT
    so.subject_offering_id,
    sd.department_id,
    COALESCE(sd.created_at, so.created_at, now())
FROM public.subject_offerings so
INNER JOIN public.subjects s
    ON s.subject_id = so.subject_id
   AND s.term_id = so.term_id
INNER JOIN public.subject_departments sd
    ON sd.subject_id = s.subject_id
ON CONFLICT (subject_offering_id, department_id) DO NOTHING;

INSERT INTO public.subject_offering_courses (subject_offering_id, course_id, created_at)
SELECT DISTINCT
    so.subject_offering_id,
    cs.course_id,
    COALESCE(so.created_at, now())
FROM public.subject_offerings so
INNER JOIN public.subjects s
    ON s.subject_id = so.subject_id
   AND s.term_id = so.term_id
INNER JOIN public.course_subjects cs
    ON cs.subject_id = s.subject_id
ON CONFLICT (subject_offering_id, course_id) DO NOTHING;

INSERT INTO public.subject_offering_sections (subject_offering_id, section_id, created_at)
SELECT DISTINCT
    mapped.subject_offering_id,
    mapped.section_id,
    mapped.created_at
FROM (
    SELECT
        so.subject_offering_id,
        ss.section_id,
        COALESCE(ss.created_at, so.created_at, now()) AS created_at
    FROM public.subject_offerings so
    INNER JOIN public.subjects s
        ON s.subject_id = so.subject_id
       AND s.term_id = so.term_id
    INNER JOIN public.subject_sections ss
        ON ss.subject_id = s.subject_id

    UNION

    SELECT
        so.subject_offering_id,
        cg.section_id,
        COALESCE(cg.created_at, so.created_at, now()) AS created_at
    FROM public.subject_offerings so
    INNER JOIN public.class_groups cg
        ON cg.subject_id = so.subject_id
       AND cg.term_id = so.term_id
       AND (cg.institution_id IS NOT DISTINCT FROM so.institution_id)
    WHERE cg.section_id IS NOT NULL
) mapped
ON CONFLICT (subject_offering_id, section_id) DO NOTHING;

INSERT INTO public.subject_offering_year_levels (subject_offering_id, year_level, created_at)
SELECT DISTINCT
    so.subject_offering_id,
    syl.year_level,
    COALESCE(syl.created_at, so.created_at, now())
FROM public.subject_offerings so
INNER JOIN public.subjects s
    ON s.subject_id = so.subject_id
   AND s.term_id = so.term_id
INNER JOIN public.subject_year_levels syl
    ON syl.subject_id = s.subject_id
ON CONFLICT (subject_offering_id, year_level) DO NOTHING;

UPDATE public.class_groups cg
SET subject_offering_id = so.subject_offering_id
FROM public.subject_offerings so
WHERE cg.subject_id = so.subject_id
  AND cg.term_id = so.term_id
  AND (cg.institution_id IS NOT DISTINCT FROM so.institution_id)
  AND cg.subject_offering_id IS NULL;

ALTER TABLE public.subject_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_offering_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_offering_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_offering_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_offering_year_levels ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view subject_offerings"
    ON public.subject_offerings
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view subject_offering_departments"
    ON public.subject_offering_departments
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view subject_offering_courses"
    ON public.subject_offering_courses
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view subject_offering_sections"
    ON public.subject_offering_sections
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view subject_offering_year_levels"
    ON public.subject_offering_year_levels
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

GRANT ALL ON TABLE public.subject_offerings TO anon;
GRANT ALL ON TABLE public.subject_offerings TO authenticated;
GRANT ALL ON TABLE public.subject_offerings TO service_role;

GRANT ALL ON TABLE public.subject_offering_departments TO anon;
GRANT ALL ON TABLE public.subject_offering_departments TO authenticated;
GRANT ALL ON TABLE public.subject_offering_departments TO service_role;

GRANT ALL ON TABLE public.subject_offering_courses TO anon;
GRANT ALL ON TABLE public.subject_offering_courses TO authenticated;
GRANT ALL ON TABLE public.subject_offering_courses TO service_role;

GRANT ALL ON TABLE public.subject_offering_sections TO anon;
GRANT ALL ON TABLE public.subject_offering_sections TO authenticated;
GRANT ALL ON TABLE public.subject_offering_sections TO service_role;

GRANT ALL ON TABLE public.subject_offering_year_levels TO anon;
GRANT ALL ON TABLE public.subject_offering_year_levels TO authenticated;
GRANT ALL ON TABLE public.subject_offering_year_levels TO service_role;
