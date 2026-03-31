import { useEnrollSubjectMutation } from '@sentinel/hooks';
import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    instructorSubjectEnrollmentSchema,
    type InstructorSubjectEnrollmentFormValues,
} from '@sentinel/shared/schema';
import { type UseAddSubjectFormReturn } from './_types';
import { EMPTY_INSTRUCTOR_SUBJECT_FORM_VALUES } from '@/app/(protected)/(instructor)/subjects/_hooks/instructor-subject-form-values';

export function useAddSubjectForm(): UseAddSubjectFormReturn {
    const [open, setOpen] = useState(false);
    const enrollMutation = useEnrollSubjectMutation();

    const form = useForm<InstructorSubjectEnrollmentFormValues>({
        resolver: zodResolver(
            instructorSubjectEnrollmentSchema,
        ) as Resolver<InstructorSubjectEnrollmentFormValues>,
        defaultValues: EMPTY_INSTRUCTOR_SUBJECT_FORM_VALUES,
    });

    function onSubmit(values: InstructorSubjectEnrollmentFormValues) {
        enrollMutation.mutate(values, {
            onSuccess: () => {
                form.reset(EMPTY_INSTRUCTOR_SUBJECT_FORM_VALUES);
                setOpen(false);
            },
        });
    }

    return {
        form,
        onSubmit,
        isPending: enrollMutation.isPending,
        open,
        setOpen,
    };
}
