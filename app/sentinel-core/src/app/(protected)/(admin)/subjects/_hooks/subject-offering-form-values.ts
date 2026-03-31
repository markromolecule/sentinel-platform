import { type SubjectOfferingFormValues } from '@sentinel/shared/schema';
import { type MasterSubject } from '@sentinel/shared/types';

export const EMPTY_SUBJECT_OFFERING_FORM_VALUES: SubjectOfferingFormValues = {
    subject_id: '',
    term_id: '',
    department_ids: [],
    course_ids: [],
    section_ids: [],
    year_levels: [],
};

export function toSubjectOfferingFormValues(
    subject?: MasterSubject | null,
): SubjectOfferingFormValues {
    return {
        ...EMPTY_SUBJECT_OFFERING_FORM_VALUES,
        subject_id: subject?.id ?? '',
    };
}
