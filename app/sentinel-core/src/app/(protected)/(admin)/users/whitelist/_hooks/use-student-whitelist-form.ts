'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
    useCreateStudentWhitelistMutation,
    useUpdateStudentWhitelistMutation,
} from '@sentinel/hooks';
import {
    studentWhitelistFormSchema,
    type StudentWhitelistFormValues,
} from '@sentinel/shared/schema';
import {
    StudentWhitelist,
    StudentWhitelistInput,
    StudentWhitelistStatus,
} from '@sentinel/shared/types';
import { useForm } from 'react-hook-form';

export type { StudentWhitelistFormValues } from '@sentinel/shared/schema';

interface UseStudentWhitelistFormArgs {
    record?: StudentWhitelist | null;
    onSuccess?: () => void;
}

const defaultValues: StudentWhitelistFormValues = {
    institution_id: '',
    department_id: '',
    course_id: '',
    student_number: '',
    last_name: '',
    first_name: '',
    status: 'ACTIVE',
};

export function useStudentWhitelistForm({ record, onSuccess }: UseStudentWhitelistFormArgs = {}) {
    const form = useForm<StudentWhitelistFormValues>({
        resolver: zodResolver(studentWhitelistFormSchema),
        defaultValues,
    });

    const createMutation = useCreateStudentWhitelistMutation();
    const updateMutation = useUpdateStudentWhitelistMutation();

    const normalizePayload = (values: StudentWhitelistFormValues): StudentWhitelistInput => ({
        institution_id: values.institution_id,
        department_id: values.department_id,
        course_id: values.course_id,
        student_number: values.student_number.trim(),
        last_name: values.last_name.trim(),
        first_name: values.first_name?.trim() || null,
        status: values.status as StudentWhitelistStatus,
    });

    const onSubmit = (values: StudentWhitelistFormValues) => {
        const payload = normalizePayload(values);

        if (record) {
            updateMutation.mutate(
                {
                    id: record.id,
                    payload,
                },
                {
                    onSuccess: () => {
                        onSuccess?.();
                    },
                },
            );
            return;
        }

        createMutation.mutate(payload, {
            onSuccess: () => {
                form.reset({
                    ...defaultValues,
                    institution_id: values.institution_id,
                    department_id: values.department_id,
                    course_id: values.course_id,
                    status: values.status,
                });
                onSuccess?.();
            },
        });
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return {
        form,
        onSubmit,
        isPending,
    };
}
