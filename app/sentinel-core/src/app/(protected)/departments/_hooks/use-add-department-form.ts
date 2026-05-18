'use client';

import { notifyPermissionDenied, useCreateDepartmentMutation } from '@/data';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, type DepartmentFormValues } from '@sentinel/shared/schema';
import { useProfileQuery } from '@sentinel/hooks';
import { useEffect } from 'react';

export function useAddDepartmentForm(onSuccess: () => void) {
    const { profile } = useProfileQuery();
    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema) as Resolver<DepartmentFormValues>,
        defaultValues: {
            institution_id: '',
            name: '',
            code: '',
        },
    });

    useEffect(() => {
        if (profile?.institutionId) {
            form.setValue('institution_id', profile.institutionId);
        }
    }, [profile?.institutionId, form]);

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
                    message:
                        'A department with this name already exists for the selected institution.',
                });
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'departments',
                action: 'create',
                permissionKey: 'departments:create',
                fallbackMessage: 'Failed to create department.',
            });
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
