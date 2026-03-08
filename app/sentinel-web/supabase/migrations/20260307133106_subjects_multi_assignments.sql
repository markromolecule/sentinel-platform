-- Subjects: support multiple departments, courses, sections, and year levels.

ALTER TABLE public.subjects
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
    ADD COLUMN IF NOT EXISTS created_by uuid,
    ADD COLUMN IF NOT EXISTS updated_by uuid;

CREATE TABLE IF NOT EXISTS public.subject_departments (
    subject_id uuid NOT NULL,
    department_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subject_departments_pkey PRIMARY KEY (subject_id, department_id)
);

CREATE TABLE IF NOT EXISTS public.subject_sections (
    subject_id uuid NOT NULL,
    section_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subject_sections_pkey PRIMARY KEY (subject_id, section_id)
);

CREATE TABLE IF NOT EXISTS public.subject_year_levels (
    subject_id uuid NOT NULL,
    year_level smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subject_year_levels_pkey PRIMARY KEY (subject_id, year_level),
    CONSTRAINT subject_year_levels_year_level_check CHECK (year_level >= 1 AND year_level <= 6)
);

-- Backfill existing single-department assignment.
INSERT INTO public.subject_departments (subject_id, department_id)
SELECT subject_id, department_id
FROM public.subjects
WHERE department_id IS NOT NULL
ON CONFLICT (subject_id, department_id) DO NOTHING;

-- Remove legacy single-department column after backfill.
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_department_id_fkey;
ALTER TABLE public.subjects DROP COLUMN IF EXISTS department_id;

DO $$
BEGIN
    ALTER TABLE public.subject_departments
        ADD CONSTRAINT subject_departments_subject_id_fkey
        FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_departments
        ADD CONSTRAINT subject_departments_department_id_fkey
        FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_sections
        ADD CONSTRAINT subject_sections_subject_id_fkey
        FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_sections
        ADD CONSTRAINT subject_sections_section_id_fkey
        FOREIGN KEY (section_id) REFERENCES public.sections(section_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subject_year_levels
        ADD CONSTRAINT subject_year_levels_subject_id_fkey
        FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subjects
        ADD CONSTRAINT subjects_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.subjects
        ADD CONSTRAINT subjects_updated_by_fkey
        FOREIGN KEY (updated_by) REFERENCES auth.users(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS subject_departments_department_id_idx
    ON public.subject_departments (department_id);
CREATE INDEX IF NOT EXISTS subject_sections_section_id_idx
    ON public.subject_sections (section_id);
CREATE INDEX IF NOT EXISTS subject_year_levels_year_level_idx
    ON public.subject_year_levels (year_level);

ALTER TABLE public.subject_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_year_levels ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view subject_departments"
    ON public.subject_departments
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view subject_sections"
    ON public.subject_sections
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view subject_year_levels"
    ON public.subject_year_levels
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

GRANT ALL ON TABLE public.subject_departments TO anon;
GRANT ALL ON TABLE public.subject_departments TO authenticated;
GRANT ALL ON TABLE public.subject_departments TO service_role;

GRANT ALL ON TABLE public.subject_sections TO anon;
GRANT ALL ON TABLE public.subject_sections TO authenticated;
GRANT ALL ON TABLE public.subject_sections TO service_role;

GRANT ALL ON TABLE public.subject_year_levels TO anon;
GRANT ALL ON TABLE public.subject_year_levels TO authenticated;
GRANT ALL ON TABLE public.subject_year_levels TO service_role;
