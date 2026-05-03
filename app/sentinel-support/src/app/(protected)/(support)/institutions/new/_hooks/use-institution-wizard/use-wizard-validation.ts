import { useState, useCallback } from 'react';
import type { WizardDraft } from '../../_types';

export type UseWizardValidationArgs = {
    draft: WizardDraft;
    summary: {
        departments: number;
        courses: number;
        terms: number;
        subjects: number;
        namingConventions: number;
    };
};

export function useWizardValidation({ draft, summary }: UseWizardValidationArgs) {
    const [errors, setErrors] = useState<string[]>([]);

    const validateStep = useCallback(
        (step: number) => {
            const nextErrors: string[] = [];

            if (step === 0) {
                if (!draft.identity.name.trim()) nextErrors.push('Institution name is required.');
                if (!draft.identity.code.trim()) nextErrors.push('Institution code is required.');
                if (
                    draft.identity.institutionKind === 'CHILD' &&
                    !draft.identity.parentInstitutionId
                ) {
                    nextErrors.push('Branch institutions must select a parent institution.');
                }
            }

            if (step === 1 && summary.departments === 0) {
                nextErrors.push('Add at least one department.');
            }

            if (step === 2) {
                const invalidCourse = draft.courses.some(
                    (course) =>
                        course.title.trim() &&
                        (!course.code.trim() || !course.departmentClientId.trim()),
                );
                if (summary.courses === 0) nextErrors.push('Add at least one course.');
                if (invalidCourse)
                    nextErrors.push('Every course needs a code and department assignment.');
            }

            if (step === 3) {
                const invalidTerm = draft.terms.some(
                    (term) => term.academicYear.trim() && !term.semester.trim(),
                );
                if (summary.terms === 0) nextErrors.push('Add at least one academic term.');
                if (invalidTerm) nextErrors.push('Every academic year row needs a term name.');
            }

            if (step === 4) {
                const invalidSubject = draft.subjects.some(
                    (subject) => subject.title.trim() && !subject.code.trim(),
                );
                if (summary.subjects === 0) nextErrors.push('Add at least one subject.');
                if (invalidSubject) nextErrors.push('Every subject needs a subject code.');
            }

            if (step === 5) {
                if (!draft.naming.room.label.trim())
                    nextErrors.push('Room display label is required.');
                if (!draft.naming.room.prefix.trim())
                    nextErrors.push('Physical room prefix is required.');
            }

            setErrors(nextErrors);
            return nextErrors.length === 0;
        },
        [draft, summary],
    );

    return {
        errors,
        setErrors,
        validateStep,
    };
}
