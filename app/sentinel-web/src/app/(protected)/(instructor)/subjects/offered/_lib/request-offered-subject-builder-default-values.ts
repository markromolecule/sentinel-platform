import type { RequestOfferedSubjectBuilderFormValues } from './request-offered-subject-builder-schema';

export const EMPTY_REQUEST_OFFERED_SUBJECT_BUILDER_FORM_VALUES: RequestOfferedSubjectBuilderFormValues =
    {
        subject_offering_id: '',
        department_ids: [],
        course_ids: [],
        year_levels: [],
        section_ids: [],
    };

export function createRequestOfferedSubjectBuilderFormValues(
    subjectOfferingId = '',
): RequestOfferedSubjectBuilderFormValues {
    return {
        ...EMPTY_REQUEST_OFFERED_SUBJECT_BUILDER_FORM_VALUES,
        subject_offering_id: subjectOfferingId,
    };
}
