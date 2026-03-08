-- Multi-tenancy Support: Add institution_id to core entities and update unique constraints.

-- 1. Create a Default Institution if it doesn't exist.
INSERT INTO public.institutions (name, code)
VALUES ('Default Institution', 'DEFAULT')
ON CONFLICT (name) DO NOTHING;

-- Get the ID of the default institution.
DO $$
DECLARE
    default_institution_id uuid;
BEGIN
    SELECT id INTO default_institution_id FROM public.institutions WHERE code = 'DEFAULT' LIMIT 1;

    -- 2. Add institution_id to core tables and backfill.

    -- user_profiles
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS institution_id uuid;
    UPDATE public.user_profiles SET institution_id = default_institution_id WHERE institution_id IS NULL;
    ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;

    -- departments
    ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS institution_id uuid;
    UPDATE public.departments SET institution_id = default_institution_id WHERE institution_id IS NULL;
    ALTER TABLE public.departments ADD CONSTRAINT departments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
    ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_department_name_key;
    ALTER TABLE public.departments ADD CONSTRAINT departments_name_institution_unique UNIQUE (department_name, institution_id);

    -- courses
    ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS institution_id uuid;
    UPDATE public.courses SET institution_id = default_institution_id WHERE institution_id IS NULL;
    ALTER TABLE public.courses ADD CONSTRAINT courses_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
    ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_code_key;
    ALTER TABLE public.courses ADD CONSTRAINT courses_code_institution_unique UNIQUE (code, institution_id);

    -- sections
    ALTER TABLE public.sections ADD COLUMN IF NOT EXISTS institution_id uuid;
    UPDATE public.sections SET institution_id = default_institution_id WHERE institution_id IS NULL;
    ALTER TABLE public.sections ADD CONSTRAINT sections_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
    -- Note: sections already has UNIQUE ([section_name, year_level, department_id]) which is implicitly multi-tenant if departments are.
    -- But adding institution_id directly and explicitly is safer.
    ALTER TABLE public.sections DROP CONSTRAINT IF EXISTS sections_section_name_year_level_department_id_key;
    ALTER TABLE public.sections ADD CONSTRAINT sections_name_year_dept_inst_unique UNIQUE (section_name, year_level, department_id, institution_id);

    -- subjects
    ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS institution_id uuid;
    UPDATE public.subjects SET institution_id = default_institution_id WHERE institution_id IS NULL;
    ALTER TABLE public.subjects ADD CONSTRAINT subjects_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
    ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_subject_code_key;
    ALTER TABLE public.subjects ADD CONSTRAINT subjects_code_institution_unique UNIQUE (subject_code, institution_id);

    -- exams
    ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS institution_id uuid;
    UPDATE public.exams SET institution_id = default_institution_id WHERE institution_id IS NULL;
    ALTER TABLE public.exams ADD CONSTRAINT exams_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

    -- announcements
    ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS institution_id uuid;
    UPDATE public.announcements SET institution_id = default_institution_id WHERE institution_id IS NULL;
    ALTER TABLE public.announcements ADD CONSTRAINT announcements_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

    -- terms
    ALTER TABLE public.terms ADD COLUMN IF NOT EXISTS institution_id uuid;
    UPDATE public.terms SET institution_id = default_institution_id WHERE institution_id IS NULL;
    ALTER TABLE public.terms ADD CONSTRAINT terms_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
    ALTER TABLE public.terms DROP CONSTRAINT IF EXISTS terms_academic_year_semester_key;
    ALTER TABLE public.terms ADD CONSTRAINT terms_year_semester_inst_unique UNIQUE (academic_year, semester, institution_id);
    -- Handle is_active partial index if it exists (Prisma handled it via @@unique(map: "one_active_term", where: raw("(is_active = true)")))
    -- This should also be scoped to institution_id.
    DROP INDEX IF EXISTS public.one_active_term;
    CREATE UNIQUE INDEX one_active_term_per_institution ON public.terms (institution_id) WHERE (is_active = true);

    -- class_groups
    ALTER TABLE public.class_groups ADD COLUMN IF NOT EXISTS institution_id uuid;
    UPDATE public.class_groups SET institution_id = default_institution_id WHERE institution_id IS NULL;
    ALTER TABLE public.class_groups ADD CONSTRAINT class_groups_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
    ALTER TABLE public.class_groups DROP CONSTRAINT IF EXISTS class_groups_subject_id_section_id_term_id_key;
    ALTER TABLE public.class_groups ADD CONSTRAINT class_groups_subject_section_term_inst_unique UNIQUE (subject_id, section_id, term_id, institution_id);

END $$;
