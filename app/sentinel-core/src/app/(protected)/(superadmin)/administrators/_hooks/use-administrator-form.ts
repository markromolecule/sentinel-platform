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
            course: '',
            courseIds: [],
            studentNo: '',
            employeeNo: '',
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
                course: currentUser.courseId || currentUser.courseIds?.[0] || '',
                courseIds: [],
                studentNo: currentUser.studentNo || '',
                employeeNo: currentUser.employeeNo || '',
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

    const onSubmit = async (values: UserFormValues) => {
        const payload: UserFormValues = {
            ...values,
            role: 'admin',
            course: values.course ?? '',
            courseIds: [],
            studentNo: undefined,
            employeeNo: undefined,
        };

        if (user) {
            await updateMutation.mutateAsync({ id: user.id, payload });
            form.reset();
            onSuccess?.();
            return;
        }

        await inviteMutation.mutateAsync({
            ...payload,
            institution: payload.institution || currentUserProfile?.institutionId || '',
        });
        form.reset();
        onSuccess?.();
    };

    return {
        form,
        onSubmit,
        watchedRole,
        isInstitutionPreset: Boolean(!user && currentUserProfile?.institutionId),
        isPending: inviteMutation.isPending || updateMutation.isPending,
    };
}
