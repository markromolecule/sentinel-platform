import type { InstructorSubjectRequestValues } from '../schema';

type EnrollmentRequestFormValueSource = {
    subjectOfferingId?: string | null;
    departmentIds?: string[] | null;
    courseIds?: string[] | null;
    yearLevels?: number[] | null;
    sectionIds?: string[] | null;
};

export function buildEnrollmentRequestFormValues(
    source: EnrollmentRequestFormValueSource,
): InstructorSubjectRequestValues {
    return {
        subject_offering_id: source.subjectOfferingId ?? '',
        department_ids: [...new Set(source.departmentIds ?? [])],
        course_ids: [...new Set(source.courseIds ?? [])],
        year_levels: [...new Set(source.yearLevels ?? [])],
        section_ids: [...new Set(source.sectionIds ?? [])],
    };
}
