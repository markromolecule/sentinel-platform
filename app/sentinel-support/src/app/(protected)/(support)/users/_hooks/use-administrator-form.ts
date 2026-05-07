'use client';

import { useInviteUserMutation, useUpdateUserMutation, useUserQuery } from '@sentinel/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { userFormBaseSchema, UserFormValues } from '@sentinel/shared/schema';
import { User } from '@sentinel/shared/types';
import { useEffect } from 'react';
import { z } from 'zod';
import type { AdministratorRole } from '@/app/(protected)/(support)/users/_lib/administrator-role-config';

const administratorFormSchema = userFormBaseSchema.superRefine((data, ctx) => {
    if (!(data.institution ?? '').trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Institution is required',
            path: ['institution'],
        });
    }
});

interface UseAdministratorFormProps {
    role: AdministratorRole;
    user?: User | null;
    onSuccess?: () => void;
}

export function useAdministratorForm({ role, user, onSuccess }: UseAdministratorFormProps) {
    const { data: targetUserDetail } = useUserQuery(user?.id || '');

    const form = useForm<UserFormValues>({
        resolver: zodResolver(administratorFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            role,
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
                role,
                department: currentUser.departmentId || currentUser.department_id || '',
                course: '',
                courseIds: [],
                studentNo: '',
                employeeNo: '',
                institution: currentUser.institutionId || currentUser.institution_id || '',
            });
        }
    }, [form, role, targetUserDetail, user]);

    const inviteMutation = useInviteUserMutation();
    const updateMutation = useUpdateUserMutation();

    const onSubmit = async (values: UserFormValues) => {
        const payload: UserFormValues = {
            ...values,
            role,
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
