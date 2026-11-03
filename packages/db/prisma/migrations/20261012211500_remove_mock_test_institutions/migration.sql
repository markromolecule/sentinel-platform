-- Migration: 20261012211500_remove_mock_test_institutions
-- Description: Remove mock-seeded test institutions ('Telemetry Test Institution b461327a', 'Test Services Institution') and all related downstream test data.

DO $$
DECLARE
    target_inst_ids uuid[];
    target_student_ids uuid[];
    target_exam_ids uuid[];
    target_attempt_ids uuid[];
    target_mock_user_ids uuid[];
BEGIN
    -- 1. Identify target mock institutions by known name or ID
    SELECT ARRAY_AGG(id) INTO target_inst_ids
    FROM public.institutions
    WHERE name IN ('Telemetry Test Institution b461327a', 'Test Services Institution')
       OR id IN ('79736166-890b-4820-ac65-eeb64cbc0e87'::uuid, '44444444-4444-4444-4444-444444444444'::uuid);

    -- Exit early if no mock institutions exist
    IF target_inst_ids IS NULL OR array_length(target_inst_ids, 1) = 0 THEN
        RAISE NOTICE 'No mock institutions found. Skipping cleanup.';
        RETURN;
    END IF;

    -- 2. Identify mock test users (created exclusively for telemetry test suite)
    SELECT ARRAY_AGG(user_id) INTO target_mock_user_ids
    FROM public.students
    WHERE institution_id = ANY(target_inst_ids)
      AND user_id IS NOT NULL;

    SELECT ARRAY_AGG(id) INTO target_mock_user_ids
    FROM auth.users
    WHERE id = ANY(COALESCE(target_mock_user_ids, ARRAY[]::uuid[]))
       OR email = 'telemetry-b461327a@sentinel.test';

    -- 3. Identify students, exams, and exam attempts linked to target institutions
    SELECT ARRAY_AGG(student_id) INTO target_student_ids
    FROM public.students
    WHERE institution_id = ANY(target_inst_ids);

    SELECT ARRAY_AGG(exam_id) INTO target_exam_ids
    FROM public.exams
    WHERE institution_id = ANY(target_inst_ids);

    SELECT ARRAY_AGG(attempt_id) INTO target_attempt_ids
    FROM public.exam_attempts
    WHERE (target_exam_ids IS NOT NULL AND exam_id = ANY(target_exam_ids))
       OR (target_student_ids IS NOT NULL AND student_id = ANY(target_student_ids));

    -- 4. Delete attempt-level data (telemetry, incidents, answers, events)
    IF target_attempt_ids IS NOT NULL THEN
        DELETE FROM public.flagged_incidents WHERE attempt_id = ANY(target_attempt_ids);
        DELETE FROM public.telemetry_incident_evidence WHERE attempt_id = ANY(target_attempt_ids);
        DELETE FROM public.exam_attempt_lifecycle_events WHERE attempt_id = ANY(target_attempt_ids);
        DELETE FROM public.exam_attempts WHERE attempt_id = ANY(target_attempt_ids);
    END IF;

    -- 5. Delete exam-level data (assignments, shares, admissions, feedbacks, exams)
    IF target_exam_ids IS NOT NULL THEN
        DELETE FROM public.exam_section_assignments WHERE exam_id = ANY(target_exam_ids);
        DELETE FROM public.exam_assigned_sections WHERE exam_id = ANY(target_exam_ids);
        DELETE FROM public.exam_shares WHERE exam_id = ANY(target_exam_ids);
        DELETE FROM public.exam_lobby_admissions WHERE exam_id = ANY(target_exam_ids);
        DELETE FROM public.exam_feedbacks WHERE exam_id = ANY(target_exam_ids);
        DELETE FROM public.exams WHERE exam_id = ANY(target_exam_ids);
    END IF;

    -- 6. Delete telemetry evidence, exports, analytics, and background jobs
    DELETE FROM public.telemetry_incident_evidence WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.exam_answer_key_exports WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.exam_report_exports WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.analytics_reports WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.live_inspection_leases WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.ai_generation_jobs WHERE institution_id = ANY(target_inst_ids);

    -- 7. Delete announcements, calendar events, notifications
    DELETE FROM public.announcements WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.calendar_events WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.notifications WHERE institution_id = ANY(target_inst_ids);

    -- 8. Delete branding, templates, and naming conventions
    DELETE FROM public.institution_pdf_branding WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.pdf_templates WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.institution_naming_conventions WHERE institution_id = ANY(target_inst_ids);

    -- 9. Delete question bank collections and questions
    DELETE FROM public.question_bank_questions WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.question_bank_collections WHERE institution_id = ANY(target_inst_ids);

    -- 10. Delete students, whitelist, and enrollments
    IF target_student_ids IS NOT NULL THEN
        DELETE FROM public.enrollments WHERE student_id = ANY(target_student_ids);
        DELETE FROM public.exam_feedbacks WHERE student_id = ANY(target_student_ids);
        DELETE FROM public.exam_lobby_admissions WHERE student_id = ANY(target_student_ids);
    END IF;
    DELETE FROM public.student_whitelist WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.students WHERE institution_id = ANY(target_inst_ids);

    -- 11. Delete instructors and associated assignments
    DELETE FROM public.instructors WHERE institution_id = ANY(target_inst_ids);

    -- 12. Delete class groups, sections, and rooms
    DELETE FROM public.class_groups WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.sections WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.rooms WHERE institution_id = ANY(target_inst_ids);

    -- 13. Delete academic offerings, classifications, subjects, courses, departments, terms
    DELETE FROM public.subject_offerings WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.subject_classifications WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.subjects WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.courses WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.departments WHERE institution_id = ANY(target_inst_ids);
    DELETE FROM public.terms WHERE institution_id = ANY(target_inst_ids);

    -- 14. Clean audit logs referencing target institutions
    DELETE FROM public.audit_logs 
    WHERE institution_id = ANY(target_inst_ids) 
       OR branch_id = ANY(target_inst_ids);

    -- 15. Dissociate any user profiles linked to these institutions
    UPDATE public.user_profiles
    SET institution_id = NULL
    WHERE institution_id = ANY(target_inst_ids);

    -- 16. Delete mock test user records
    IF target_mock_user_ids IS NOT NULL THEN
        DELETE FROM public.user_roles WHERE user_id = ANY(target_mock_user_ids);
        DELETE FROM public.user_profiles WHERE user_id = ANY(target_mock_user_ids);
        DELETE FROM auth.users WHERE id = ANY(target_mock_user_ids);
    END IF;

    -- 17. Unlink child institutions if any existed
    UPDATE public.institutions
    SET parent_institution_id = NULL
    WHERE parent_institution_id = ANY(target_inst_ids);

    -- 18. Finally, remove the mock institutions
    DELETE FROM public.institutions WHERE id = ANY(target_inst_ids);

    RAISE NOTICE 'Successfully removed mock institutions and all related data.';
END $$;
