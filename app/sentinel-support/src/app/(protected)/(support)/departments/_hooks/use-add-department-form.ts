'use client';

import { useCreateDepartmentMutation } from "@/data";
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, type DepartmentFormValues } from '@sentinel/shared/schema';
import { toast } from 'sonner';

export function useAddDepartmentForm(onSuccess: () => void) {
    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema) as Resolver<DepartmentFormValues>,
        defaultValues: {
            institution_id: '',
            name: '',
            code: '',
        },
    });

    const createDepartment = useCreateDepartmentMutation({
        onSuccess: () => {
            form.reset();
            onSuccess();
        },
        onError: (error: Error) => {
            const message = error.message || 'Failed to create department.';
            const isDuplicateName = message
                .toLowerCase()
                .includes('department already exists with this name');

            if (isDuplicateName) {
                form.setError('name', {
                    type: 'server',
                    message: 'A department with this name already exists for the selected institution.',
                });
                return;
            }

            toast.error(message);
        },
    });

    function onSubmit(values: DepartmentFormValues) {
        if (!values.institution_id) {
            form.setError('institution_id', {
                type: 'manual',
                message: 'Institution is required',
            });
            return;
        }

        createDepartment.mutate(values);
    }

    return {
        form,
        onSubmit,
        isPending: createDepartment.isPending,
    };
}
