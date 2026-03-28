'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { userFormSchema, UserFormValues } from '@sentinel/shared/schema';
import { User, UserRole } from '@sentinel/shared/types';
import { useCreateUserMutation } from '@/hooks/query/users/use-create-user-mutation';
import { useInviteUserMutation } from '@/hooks/query/users/use-invite-user-mutation';
import { useUpdateUserMutation } from '@/hooks/query/users/use-update-user-mutation';
import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { useUserQuery } from '@/hooks/query/users/use-user-query';

interface UseUserFormProps {
    user?: User | null;
    onSuccess?: () => void;
    defaultRole?: UserRole;
}

export function useUserForm({ user, onSuccess, defaultRole = 'student' }: UseUserFormProps = {}) {
    const { data: adminAuth } = useUser();
    const { data: adminProfile } = useUserQuery(adminAuth?.id);

    // Fetch target user details if editing
    const { data: targetUserDetail } = useUserQuery(user?.id);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            role: defaultRole,
            department: '',
            studentNo: '',
            institution: '',
        },
    });

    const watchedRole = useWatch({
        control: form.control,
        name: 'role',
    });

    // Handle initial loading of admin profile (for new users) or existing user data
    useEffect(() => {
        const currentUser = targetUserDetail || user;

        if (currentUser) {
            form.reset({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                role: currentUser.role,
                department: currentUser.departmentId || '',
                studentNo: (currentUser as User & { studentNo?: string }).studentNo || '',
                institution: currentUser.institutionId || '',
            });
        } else if (adminProfile?.institutionId) {
            const isSuperadmin =
                adminAuth?.role === 'superadmin' || adminProfile?.role === 'superadmin';
            if (!isSuperadmin) {
                // Only set if different to avoid potential loops
                const currentInstitution = form.getValues('institution');
                if (currentInstitution !== adminProfile.institutionId) {
                    form.setValue('institution', adminProfile.institutionId);
                }
            }
        }
    }, [user, targetUserDetail, adminProfile, adminAuth, form]);

    const createMutation = useCreateUserMutation();
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
        } else if (values.role !== 'student') {
            inviteMutation.mutate(values, {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                },
            });
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                },
            });
        }
    };

    const isPending = createMutation.isPending || inviteMutation.isPending || updateMutation.isPending;
    
    return {
        form,
        onSubmit,
        watchedRole,
        isPending,
    };
}
