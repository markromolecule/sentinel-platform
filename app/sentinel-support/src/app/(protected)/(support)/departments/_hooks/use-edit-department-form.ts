'use client';

import { useUpdateDepartmentMutation } from '@/data';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, type DepartmentFormValues } from '@sentinel/shared/schema';
import { Department } from '@sentinel/shared/types';

export function useEditDepartmentForm(department: Department, onSuccess: () => void) {
    const updateDepartment = useUpdateDepartmentMutation({
        onSuccess: () => {
            form.reset();
            onSuccess();
        },
    });

    // Form instance
    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema) as Resolver<DepartmentFormValues>,
        defaultValues: {
            institution_id: department.institutionId ?? '',
            name: department.name,
            code: department.code ?? '',
        },
    });

    // Reset when the department changes
    useEffect(() => {
        form.reset({
            institution_id: department.institutionId ?? '',
            name: department.name,
            code: department.code ?? '',
        });
    }, [department, form]);

    // Submit handler
    function onSubmit(values: DepartmentFormValues) {
        if (!values.institution_id) {
            form.setError('institution_id', {
                type: 'manual',
                message: 'Institution is required',
            });
            return;
        }

        updateDepartment.mutate({
            id: department.id,
            payload: values,
        });
    }

    return {
        form,
        onSubmit,
        isPending: updateDepartment.isPending,
    };
}
