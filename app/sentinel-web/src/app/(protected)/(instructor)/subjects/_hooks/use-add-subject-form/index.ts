import { useSubjectsQuery, useEnrollSubjectMutation } from '@sentinel/hooks';
import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    instructorSubjectEnrollmentSchema,
    type InstructorSubjectEnrollmentFormValues,
} from '@sentinel/shared/schema';
import { type UseAddSubjectFormReturn } from './_types';
import { EMPTY_INSTRUCTOR_SUBJECT_FORM_VALUES } from '@/app/(protected)/(instructor)/subjects/_hooks/instructor-subject-form-values';
import { toast } from 'sonner';

export function useAddSubjectForm(): UseAddSubjectFormReturn {
    const [open, setOpen] = useState(false);
    // Fetch master subjects to match selected subject title
    const { data: masterSubjects = [] } = useSubjectsQuery();
    const enrollMutation = useEnrollSubjectMutation();
    // React hook form
    const form = useForm<InstructorSubjectEnrollmentFormValues>({
        resolver: zodResolver(
            instructorSubjectEnrollmentSchema,
        ) as Resolver<InstructorSubjectEnrollmentFormValues>,
        defaultValues: EMPTY_INSTRUCTOR_SUBJECT_FORM_VALUES,
    });

    function onSubmit(values: InstructorSubjectEnrollmentFormValues) {
        const selectedSubject = masterSubjects.find((s) => s.code === values.subject_code);
        if (!selectedSubject) {
            toast.error('Selected subject not found');
            return;
        }

        enrollMutation.mutate(values, {
            onSuccess: (response: { message?: string }) => {
                toast.success(response.message || 'Enrolled completely!');
                form.reset(EMPTY_INSTRUCTOR_SUBJECT_FORM_VALUES);
                setOpen(false);
            },
            onError: (err: Error) => {
                toast.error(err.message || 'Failed to enroll subject');
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
