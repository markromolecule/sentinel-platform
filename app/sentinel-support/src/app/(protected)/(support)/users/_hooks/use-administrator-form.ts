'use client';

import { useInviteUserMutation, useUpdateUserMutation, useUserQuery } from '@sentinel/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { userFormSchema, UserFormValues } from '@sentinel/shared/schema';
import { User } from '@sentinel/shared/types';
import { useEffect } from 'react';

interface UseAdministratorFormProps {
    user?: User | null;
    onSuccess?: () => void;
}

export function useAdministratorForm({ user, onSuccess }: UseAdministratorFormProps = {}) {
    const { data: targetUserDetail } = useUserQuery(user?.id || '');

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            role: 'superadmin',
            department: '',
            course: '',
            courseIds: [],
            studentNo: '',
            employeeNo: '',
            institution: '',
        },
    });

    useEffect(() => {
        const currentUser = targetUserDetail || user;

        if (currentUser) {
            form.reset({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                role: 'superadmin',
                department: currentUser.departmentId || '',
                course: '',
                courseIds: [],
                studentNo: '',
                employeeNo: '',
                institution: currentUser.institutionId || '',
            });
        }
    }, [user, targetUserDetail, form]);

    const inviteMutation = useInviteUserMutation();
    const updateMutation = useUpdateUserMutation();

    const onSubmit = async (values: UserFormValues) => {
        const payload: UserFormValues = {
            ...values,
            role: 'superadmin',
            department: values.department ?? '',
            course: '',
            courseIds: [],
            studentNo: undefined,
            employeeNo: undefined,
            institution: values.institution ?? '',
        };

        if (user) {
            await updateMutation.mutateAsync({ id: user.id, payload });
            form.reset();
            onSuccess?.();
            return;
        }

        await inviteMutation.mutateAsync({
            ...payload,
        });
        form.reset();
        onSuccess?.();
    };

    return {
        form,
        onSubmit,
        isPending: inviteMutation.isPending || updateMutation.isPending,
    };
}
