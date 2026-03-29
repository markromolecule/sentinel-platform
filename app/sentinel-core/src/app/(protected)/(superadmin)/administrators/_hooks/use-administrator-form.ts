'use client';

import { useInviteUserMutation, useUpdateUserMutation, useUserQuery } from '@sentinel/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { userFormSchema, UserFormValues } from '@sentinel/shared/schema';
import { User } from '@sentinel/shared/types';
import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user';

interface UseAdministratorFormProps {
    user?: User | null;
    onSuccess?: () => void;
}

export function useAdministratorForm({ user, onSuccess }: UseAdministratorFormProps = {}) {
    const { data: currentAuth } = useUser();
    const { data: currentUserProfile } = useUserQuery(currentAuth?.id || '');

    // Fetch target user details if editing
    const { data: targetUserDetail } = useUserQuery(user?.id || '');

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
        } else if (currentUserProfile?.institutionId) {
            const currentInstitution = form.getValues('institution');

            if (currentInstitution !== currentUserProfile.institutionId) {
                form.setValue('institution', currentUserProfile.institutionId);
            }
        }
    }, [user, targetUserDetail, currentUserProfile, form]);

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
            inviteMutation.mutate(
                {
                    ...values,
                    institution: values.institution || currentUserProfile?.institutionId || '',
                    role: 'admin',
                },
                {
                    onSuccess: () => {
                        form.reset();
                        onSuccess?.();
                    },
                },
            );
        }
    };

    return {
        form,
        onSubmit,
        watchedRole,
        isInstitutionPreset: Boolean(!user && currentUserProfile?.institutionId),
        isPending: inviteMutation.isPending || updateMutation.isPending,
    };
}
