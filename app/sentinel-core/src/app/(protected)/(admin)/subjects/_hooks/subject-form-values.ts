import { type SubjectFormValues } from '@sentinel/shared/schema';
import { type MasterSubject } from '@sentinel/shared/types';

export const EMPTY_SUBJECT_FORM_VALUES: SubjectFormValues = {
    code: '',
    title: '',
    department_ids: [],
    course_ids: [],
    section_ids: [],
    year_levels: [],
};

export function toSubjectFormValues(subject?: MasterSubject | null): SubjectFormValues {
    if (!subject) {
        return {
            code: EMPTY_SUBJECT_FORM_VALUES.code,
            title: EMPTY_SUBJECT_FORM_VALUES.title,
            department_ids: [...EMPTY_SUBJECT_FORM_VALUES.department_ids],
            course_ids: [...EMPTY_SUBJECT_FORM_VALUES.course_ids],
            section_ids: [...EMPTY_SUBJECT_FORM_VALUES.section_ids],
            year_levels: [...EMPTY_SUBJECT_FORM_VALUES.year_levels],
        };
    }

    return {
        code: subject.code ?? '',
        title: subject.title ?? '',
        department_ids: [...(subject.departmentIds ?? [])],
        course_ids: [...(subject.courseIds ?? [])],
        section_ids: [...(subject.sectionIds ?? [])],
        year_levels: [...(subject.yearLevels ?? [])],
    };
}
