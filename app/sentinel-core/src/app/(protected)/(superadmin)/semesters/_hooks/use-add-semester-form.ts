'use client';

import { useCreateSemesterMutation } from '@sentinel/hooks';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { semesterSchema, type SemesterFormValues } from '@sentinel/shared/schema';

export function useAddSemesterForm(onSuccess: () => void) {
    const createSemester = useCreateSemesterMutation();

    const currentYear = new Date().getFullYear();
    const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;

    const form = useForm<SemesterFormValues>({
        resolver: zodResolver(semesterSchema) as Resolver<SemesterFormValues>,
        defaultValues: {
            institution_id: '',
            academic_year: defaultAcademicYear,
            semester: '1st Semester',
            is_active: false,
            start_date: '',
            end_date: '',
        },
    });

    async function onSubmit(values: SemesterFormValues) {
        if (!values.institution_id) {
            form.setError('institution_id', {
                type: 'manual',
                message: 'Institution is required',
            });
            return;
        }

        // Form values can include Date objects from the picker, but the API/Input expects formatted strings
        const payload = {
            ...values,
            start_date:
                values.start_date && values.start_date !== ''
                    ? new Date(values.start_date).toISOString()
                    : undefined,
            end_date:
                values.end_date && values.end_date !== ''
                    ? new Date(values.end_date).toISOString()
                    : undefined,
        };

        createSemester.mutate(payload, {
            onSuccess: () => {
                form.reset();
                onSuccess();
            },
        });
    }

    return {
        form,
        onSubmit,
        isPending: createSemester.isPending,
    };
}
