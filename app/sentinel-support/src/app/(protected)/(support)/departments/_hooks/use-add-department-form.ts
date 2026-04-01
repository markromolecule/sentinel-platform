'use client';

import { useCreateDepartmentMutation } from "@/data";
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, type DepartmentFormValues } from '@sentinel/shared/schema';

export function useAddDepartmentForm(onSuccess: () => void) {
    const createDepartment = useCreateDepartmentMutation({
        onSuccess: () => {
            form.reset();
            onSuccess();
        },
    });

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema) as Resolver<DepartmentFormValues>,
        defaultValues: {
            institution_id: '',
            name: '',
            code: '',
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
