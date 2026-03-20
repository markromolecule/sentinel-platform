'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { userFormSchema, UserFormValues } from '@sentinel/shared/schema';
import { User } from '@sentinel/shared/types';
import { useCreateUserMutation } from '@/hooks/query/users/use-create-user-mutation';
import { useUpdateUserMutation } from '@/hooks/query/users/use-update-user-mutation';
import { useEffect } from 'react';

interface UseUserFormProps {
    user?: User | null;
    onSuccess?: () => void;
}

export function useUserForm({ user, onSuccess }: UseUserFormProps = {}) {
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            role: 'student',
            department: '',
            studentNo: '',
            institution: 'NU Dasmariñas',
        },
    });

    const watchedRole = useWatch({
        control: form.control,
        name: 'role',
    });

    useEffect(() => {
        if (user) {
            form.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email,
                role: user.role,
                department: user.department || '',
                studentNo: (user as User & { studentNo?: string }).studentNo || '',
                institution: user.institution || 'NU Dasmariñas',
            });
        }
    }, [user, form]);

    const createMutation = useCreateUserMutation();
    const updateMutation = useUpdateUserMutation();

    const onSubmit = (values: UserFormValues) => {
        if (user) {
            updateMutation.mutate(
                { id: user.id, payload: values },
                {
                    onSuccess: () => {
                        form.reset();
                        onSuccess?.();
                    },
                },
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                },
            });
        }
    };

    return {
        form,
        onSubmit,
        watchedRole,
    };
}
