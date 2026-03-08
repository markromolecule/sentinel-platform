'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, type DepartmentFormValues } from '@sentinel/shared/schema';
import { useCreateDepartmentMutation } from '@/hooks/query/departments/use-create-department-mutation';

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
            name: '',
            code: '',
        },
    });

    function onSubmit(values: DepartmentFormValues) {
        createDepartment.mutate(values);
    }

    return {
        form,
        onSubmit,
        isPending: createDepartment.isPending,
    };
}
