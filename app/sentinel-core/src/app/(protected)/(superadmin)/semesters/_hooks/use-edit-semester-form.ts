'use client';

import { useUpdateSemesterMutation } from '@sentinel/hooks';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { semesterSchema, type SemesterFormValues } from '@sentinel/shared/schema';
import { Semester } from '@sentinel/shared/types';
import { useEffect } from 'react';

export function useEditSemesterForm(semester: Semester, onSuccess: () => void) {
    const updateSemester = useUpdateSemesterMutation();

    const form = useForm<SemesterFormValues>({
        resolver: zodResolver(semesterSchema) as Resolver<SemesterFormValues>,
        defaultValues: {
            academic_year: semester.academicYear,
            semester: semester.semester,
            is_active: semester.isActive,
            start_date: semester.startDate
                ? new Date(semester.startDate).toISOString().slice(0, 10)
                : '',
            end_date: semester.endDate ? new Date(semester.endDate).toISOString().slice(0, 10) : '',
        },
    });

    // Reset form when semester changes
    useEffect(() => {
        form.reset({
            academic_year: semester.academicYear,
            semester: semester.semester,
            is_active: semester.isActive,
            start_date: semester.startDate
                ? new Date(semester.startDate).toISOString().slice(0, 10)
                : '',
            end_date: semester.endDate ? new Date(semester.endDate).toISOString().slice(0, 10) : '',
        });
    }, [semester, form]);

    async function onSubmit(values: SemesterFormValues) {
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

        updateSemester.mutate(
            {
                id: semester.id,
                payload,
            },
            {
                onSuccess: () => {
                    onSuccess();
                },
            },
        );
    }

    return {
        form,
        onSubmit,
        isPending: updateSemester.isPending,
    };
}
