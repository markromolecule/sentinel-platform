import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectFormSchema, type SubjectFormValues } from '@sentinel/shared/schema';
import { useCreateSubjectMutation } from '@/hooks/query/subjects/use-create-subject-mutation';
import { type UseAddSubjectFormReturn } from './_types';
import { EMPTY_SUBJECT_FORM_VALUES } from '@/app/(protected)/(admin)/subjects/_hooks/subject-form-values';
import { useSubjectsQuery } from '@/hooks/query/subjects/use-subjects-query';
import { toast } from 'sonner';

export function useAddSubjectForm(): UseAddSubjectFormReturn {
    const [open, setOpen] = useState(false);
    const { data: existingSubjects = [] } = useSubjectsQuery();

    const form = useForm<SubjectFormValues>({
        resolver: zodResolver(subjectFormSchema) as Resolver<SubjectFormValues>,
        defaultValues: EMPTY_SUBJECT_FORM_VALUES,
    });

    const createSubject = useCreateSubjectMutation({
        onSuccess: () => {
            form.reset(EMPTY_SUBJECT_FORM_VALUES);
            setOpen(false);
        },
    });

    function onSubmit(values: SubjectFormValues) {
        const normalizedCode = values.code.trim();
        const normalizedTitle = values.title.trim();
        const hasDuplicateCode = existingSubjects.some(
            (subject) => subject.code.trim().toLowerCase() === normalizedCode.toLowerCase(),
        );

        if (hasDuplicateCode) {
            form.setError('code', {
                type: 'manual',
                message: 'Subject code already exists',
            });
            toast.error('Subject code already exists');
            return;
        }

        createSubject.mutate({
            ...values,
            code: normalizedCode,
            title: normalizedTitle,
        });
    }

    return {
        form,
        onSubmit,
        isPending: createSubject.isPending,
        open,
        setOpen,
    };
}
