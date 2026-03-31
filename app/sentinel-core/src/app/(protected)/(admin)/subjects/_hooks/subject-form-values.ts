import { type SubjectFormValues } from '@sentinel/shared/schema';
import { type MasterSubject } from '@sentinel/shared/types';

export const EMPTY_SUBJECT_FORM_VALUES: SubjectFormValues = {
    code: '',
    title: '',
};

export function toSubjectFormValues(subject?: MasterSubject | null): SubjectFormValues {
    if (!subject) {
        return {
            code: EMPTY_SUBJECT_FORM_VALUES.code,
            title: EMPTY_SUBJECT_FORM_VALUES.title,
        };
    }

    return {
        code: subject.code ?? '',
        title: subject.title ?? '',
    };
}
