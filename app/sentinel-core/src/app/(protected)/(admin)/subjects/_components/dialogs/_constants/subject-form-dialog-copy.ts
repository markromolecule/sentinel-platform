'use client';

import { type MasterSubject } from '@sentinel/shared/types';

export const ADD_SUBJECT_DIALOG_COPY = {
    title: 'Add Subject',
    description: 'Enter the subject code and title.',
    submitLabel: 'Add Subject',
    submittingLabel: 'Adding...',
} as const;

export function getEditSubjectDialogCopy(subject: MasterSubject) {
    return {
        title: 'Edit Subject',
        description: `Update "${subject.code} - ${subject.title}".`,
        submitLabel: 'Save Changes',
        submittingLabel: 'Saving...',
    } as const;
}
