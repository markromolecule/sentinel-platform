alter table "public"."class_groups" drop constraint "class_groups_subject_section_term_inst_unique";

alter table "public"."courses" drop constraint "courses_code_institution_unique";

alter table "public"."departments" drop constraint "departments_name_institution_unique";

alter table "public"."sections" drop constraint "sections_name_year_dept_inst_unique";

alter table "public"."subjects" drop constraint "subjects_code_institution_unique";

alter table "public"."terms" drop constraint "terms_year_semester_inst_unique";

alter table "public"."sections" drop constraint "sections_department_id_fkey";

drop index if exists "public"."class_groups_subject_section_term_inst_unique";

drop index if exists "public"."courses_code_institution_unique";

drop index if exists "public"."departments_name_institution_unique";

drop index if exists "public"."one_active_term_per_institution";

drop index if exists "public"."sections_name_year_dept_inst_unique";

drop index if exists "public"."subject_departments_department_id_idx";

drop index if exists "public"."subject_sections_section_id_idx";

drop index if exists "public"."subject_year_levels_year_level_idx";

drop index if exists "public"."subjects_code_institution_unique";

drop index if exists "public"."terms_year_semester_inst_unique";

alter table "public"."courses" add column "updated_by" uuid;

alter table "public"."departments" add column "updated_at" timestamp with time zone default now();

alter table "public"."departments" add column "updated_by" uuid;

alter table "public"."departments" alter column "created_by" set data type uuid using "created_by"::uuid;

alter table "public"."institutions" alter column "updated_at" set default CURRENT_TIMESTAMP;

alter table "public"."institutions" enable row level security;

alter table "public"."sections" add column "course_id" uuid;

alter table "public"."sections" add column "created_by" uuid;

alter table "public"."sections" add column "updated_at" timestamp with time zone default now();

alter table "public"."sections" add column "updated_by" uuid;

alter table "public"."user_profiles" add column "last_seen_at" timestamp(6) with time zone;

CREATE UNIQUE INDEX class_groups_subject_id_section_id_term_id_institution_id_key ON public.class_groups USING btree (subject_id, section_id, term_id, institution_id);

CREATE UNIQUE INDEX courses_code_institution_id_key ON public.courses USING btree (code, institution_id);

CREATE UNIQUE INDEX departments_department_name_institution_id_key ON public.departments USING btree (department_name, institution_id);

CREATE INDEX one_active_term ON public.terms USING btree (institution_id) WHERE (is_active = true);

CREATE UNIQUE INDEX sections_section_name_year_level_department_id_institution__key ON public.sections USING btree (section_name, year_level, department_id, institution_id);

CREATE UNIQUE INDEX subjects_subject_code_institution_id_key ON public.subjects USING btree (subject_code, institution_id);

CREATE UNIQUE INDEX terms_academic_year_semester_institution_id_key ON public.terms USING btree (academic_year, semester, institution_id);

alter table "public"."class_groups" add constraint "class_groups_subject_id_section_id_term_id_institution_id_key" UNIQUE using index "class_groups_subject_id_section_id_term_id_institution_id_key";

alter table "public"."courses" add constraint "courses_code_institution_id_key" UNIQUE using index "courses_code_institution_id_key";

alter table "public"."courses" add constraint "courses_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."courses" validate constraint "courses_updated_by_fkey";

alter table "public"."departments" add constraint "departments_department_name_institution_id_key" UNIQUE using index "departments_department_name_institution_id_key";

alter table "public"."institutions" add constraint "institutions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."institutions" validate constraint "institutions_created_by_fkey";

alter table "public"."institutions" add constraint "institutions_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."institutions" validate constraint "institutions_updated_by_fkey";

alter table "public"."sections" add constraint "sections_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE SET NULL not valid;

alter table "public"."sections" validate constraint "sections_course_id_fkey";

alter table "public"."sections" add constraint "sections_section_name_year_level_department_id_institution__key" UNIQUE using index "sections_section_name_year_level_department_id_institution__key";

alter table "public"."subjects" add constraint "subjects_subject_code_institution_id_key" UNIQUE using index "subjects_subject_code_institution_id_key";

alter table "public"."terms" add constraint "terms_academic_year_semester_institution_id_key" UNIQUE using index "terms_academic_year_semester_institution_id_key";

alter table "public"."sections" add constraint "sections_department_id_fkey" FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL not valid;

alter table "public"."sections" validate constraint "sections_department_id_fkey";


