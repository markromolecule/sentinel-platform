'use client';

import { useUpdateSubjectMutation } from "@sentinel/hooks";
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectFormSchema, type SubjectFormValues } from '@sentinel/shared/schema';
import { type MasterSubject } from '@sentinel/shared/types';
import {
    toSubjectFormValues,
} from '@/app/(protected)/(admin)/subjects/_hooks/subject-form-values';

export function useEditSubjectForm(subject: MasterSubject | null, onSuccess: () => void) {
    const updateSubject = useUpdateSubjectMutation({
        onSuccess: () => {
            form.reset(toSubjectFormValues(subject));
            onSuccess();
        },
    });

    const form = useForm<SubjectFormValues>({
        resolver: zodResolver(subjectFormSchema) as Resolver<SubjectFormValues>,
        defaultValues: toSubjectFormValues(subject),
    });

    useEffect(() => {
        form.reset(toSubjectFormValues(subject));
    }, [subject, form]);

    function onSubmit(values: SubjectFormValues) {
        if (!subject?.id) {
            return;
        }

        updateSubject.mutate({
            id: subject.id,
            payload: values,
        });
    }

    return {
        form,
        onSubmit,
        isPending: updateSubject.isPending,
    };
}
