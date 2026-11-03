-- Migration: 20261012235000_clean_parent_humms_course_and_nu_dasmarinas_override
-- Description: Clean the erroneous 'HUMMS' course on the parent institution ('National University')
--              and remove its local override on 'National University - Dasmariñas', remapping any
--              dependent records and sections to the canonical 'HUMSS' course.

DO $$
DECLARE
    parent_inst_id uuid;
    child_inst_id uuid;
    parent_humms_id uuid;
    parent_humss_id uuid;
    child_humms_id uuid;
BEGIN
    -- 1. Identify parent institution (National University)
    SELECT id INTO parent_inst_id
    FROM public.institutions
    WHERE name = 'National University' AND institution_kind = 'PARENT'
    LIMIT 1;

    -- 2. Identify child institution (National University - Dasmariñas)
    SELECT id INTO child_inst_id
    FROM public.institutions
    WHERE name = 'National University - Dasmariñas'
    LIMIT 1;

    -- Exit early if parent institution not found
    IF parent_inst_id IS NULL THEN
        RAISE NOTICE 'Parent institution "National University" not found. Skipping cleanup.';
        RETURN;
    END IF;

    -- 3. Locate target courses
    SELECT course_id INTO parent_humms_id
    FROM public.courses
    WHERE code = 'HUMMS' AND institution_id = parent_inst_id
    LIMIT 1;

    SELECT course_id INTO parent_humss_id
    FROM public.courses
    WHERE code = 'HUMSS' AND institution_id = parent_inst_id
    LIMIT 1;

    IF child_inst_id IS NOT NULL THEN
        SELECT course_id INTO child_humms_id
        FROM public.courses
        WHERE institution_id = child_inst_id
          AND (code = 'HUMMS' OR (parent_humms_id IS NOT NULL AND source_record_id = parent_humms_id))
        LIMIT 1;
    END IF;

    -- Exit early if there is no erroneous HUMMS course
    IF parent_humms_id IS NULL AND child_humms_id IS NULL THEN
        RAISE NOTICE 'No erroneous HUMMS courses found. Skipping cleanup.';
        RETURN;
    END IF;

    IF parent_humss_id IS NULL THEN
        RAISE EXCEPTION 'Target canonical course HUMSS was not found on parent institution.';
    END IF;

    -- 4. Remap dependent sections from HUMMS to HUMSS and rename section names if needed
    UPDATE public.sections
    SET course_id = parent_humss_id,
        section_name = REPLACE(section_name, 'HUMMS', 'HUMSS')
    WHERE course_id IN (parent_humms_id, child_humms_id)
       OR (course_id IS NULL AND section_name LIKE 'HUMMS%');

    -- 5. Remap student whitelist
    UPDATE public.student_whitelist
    SET course_id = parent_humss_id
    WHERE course_id IN (parent_humms_id, child_humms_id);

    -- 6. Remap students
    UPDATE public.students
    SET course_id = parent_humss_id
    WHERE course_id IN (parent_humms_id, child_humms_id);

    -- 7. Remap instructor courses (avoiding duplicate keys)
    DELETE FROM public.instructor_courses
    WHERE course_id IN (parent_humms_id, child_humms_id)
      AND instructor_id IN (
          SELECT instructor_id FROM public.instructor_courses WHERE course_id = parent_humss_id
      );

    UPDATE public.instructor_courses
    SET course_id = parent_humss_id
    WHERE course_id IN (parent_humms_id, child_humms_id);

    -- 8. Remap course subjects (avoiding duplicate keys)
    DELETE FROM public.course_subjects
    WHERE course_id IN (parent_humms_id, child_humms_id)
      AND subject_id IN (
          SELECT subject_id FROM public.course_subjects WHERE course_id = parent_humss_id
      );

    UPDATE public.course_subjects
    SET course_id = parent_humss_id
    WHERE course_id IN (parent_humms_id, child_humms_id);

    -- 9. Remap subject classifications and offerings (avoiding duplicate keys)
    DELETE FROM public.subject_classification_courses
    WHERE course_id IN (parent_humms_id, child_humms_id)
      AND subject_classification_id IN (
          SELECT subject_classification_id FROM public.subject_classification_courses WHERE course_id = parent_humss_id
      );

    UPDATE public.subject_classification_courses
    SET course_id = parent_humss_id
    WHERE course_id IN (parent_humms_id, child_humms_id);

    DELETE FROM public.subject_offering_courses
    WHERE course_id IN (parent_humms_id, child_humms_id)
      AND subject_offering_id IN (
          SELECT subject_offering_id FROM public.subject_offering_courses WHERE course_id = parent_humss_id
      );

    UPDATE public.subject_offering_courses
    SET course_id = parent_humss_id
    WHERE course_id IN (parent_humms_id, child_humms_id);

    -- 10. Remap user profiles and instructors
    UPDATE public.user_profiles
    SET course_id = parent_humss_id
    WHERE course_id IN (parent_humms_id, child_humms_id);

    UPDATE public.instructors
    SET course_id = parent_humss_id
    WHERE course_id IN (parent_humms_id, child_humms_id);

    -- 11. Delete child override course on NU Dasmarinas
    IF child_humms_id IS NOT NULL THEN
        DELETE FROM public.courses WHERE course_id = child_humms_id;
    END IF;

    -- 12. Delete any remaining child courses referencing parent HUMMS, then delete parent HUMMS
    IF parent_humms_id IS NOT NULL THEN
        DELETE FROM public.courses WHERE source_record_id = parent_humms_id;
        DELETE FROM public.courses WHERE course_id = parent_humms_id;
    END IF;

    RAISE NOTICE 'Successfully migrated HUMMS records to HUMSS and cleaned erroneous parent and child override courses.';
END $$;
