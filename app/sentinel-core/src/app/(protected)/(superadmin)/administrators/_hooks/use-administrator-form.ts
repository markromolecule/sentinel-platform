'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { userFormSchema, UserFormValues } from '@sentinel/shared/schema';
import { User } from '@sentinel/shared/types';
import { useInviteUserMutation } from '@/hooks/query/users/use-invite-user-mutation';
import { useUpdateUserMutation } from '@/hooks/query/users/use-update-user-mutation';
import { useEffect } from 'react';
import { useUserQuery } from '@/hooks/query/users/use-user-query';

interface UseAdministratorFormProps {
    user?: User | null;
    onSuccess?: () => void;
}

export function useAdministratorForm({ user, onSuccess }: UseAdministratorFormProps = {}) {
    // Fetch target user details if editing
    const { data: targetUserDetail } = useUserQuery(user?.id);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            role: 'admin',
            department: '',
            studentNo: '',
            institution: '',
        },
    });

    const watchedRole = useWatch({
        control: form.control,
        name: 'role',
    });

    // Handle initial loading of existing user data
    useEffect(() => {
        const currentUser = targetUserDetail || user;
        
        if (currentUser) {
            form.reset({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                role: currentUser.role || 'admin',
                department: currentUser.departmentId || '',
                studentNo: (currentUser as User & { studentNo?: string }).studentNo || '',
                institution: currentUser.institutionId || '',
            });
        }
    }, [user, targetUserDetail, form]);

    const inviteMutation = useInviteUserMutation();
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
            // Administrators are always invited
            inviteMutation.mutate(values, {
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
