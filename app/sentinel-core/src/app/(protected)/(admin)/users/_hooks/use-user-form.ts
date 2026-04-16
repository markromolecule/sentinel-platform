'use client';

import {
    useCreateUserMutation,
    useInviteUserMutation,
    useUpdateUserMutation,
    useUserQuery,
} from '@sentinel/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { userFormSchema, UserFormValues } from '@sentinel/shared/schema';
import { User, UserRole } from '@sentinel/shared/types';
import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { usePathname } from 'next/navigation';

interface UseUserFormProps {
    user?: User | null;
    onSuccess?: () => void;
    defaultRole?: UserRole;
}

export function useUserForm({ user, onSuccess, defaultRole }: UseUserFormProps = {}) {
    const pathname = usePathname();
    const { data: adminAuth } = useUser();
    const { data: adminProfile } = useUserQuery(adminAuth?.id || '');

    // Determine default role based on pathname if not provided
    const computedDefaultRole =
        defaultRole ||
        (pathname.includes('/students')
            ? 'student'
            : pathname.includes('/instructors')
              ? 'instructor'
              : 'student');

    // Fetch target user details if editing
    const { data: targetUserDetail } = useUserQuery(user?.id || '');

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            role: computedDefaultRole,
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

    // Handle initial loading of admin profile (for new users) or existing user data
    useEffect(() => {
        const currentUser = targetUserDetail || user;

        if (currentUser) {
            const currentCourseIds =
                currentUser.role === 'instructor'
                    ? currentUser.courseIds?.length
                        ? currentUser.courseIds
                        : currentUser.courseId
                          ? [currentUser.courseId]
                          : []
                    : [];

            form.reset({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                role: currentUser.role,
                department: currentUser.departmentId || '',
                course:
                    currentUser.role === 'instructor'
                        ? currentCourseIds[0] || ''
                        : currentUser.courseId || currentUser.courseIds?.[0] || '',
                courseIds: currentCourseIds,
                studentNo: currentUser.studentNo || '',
                employeeNo: currentUser.employeeNo || '',
                institution: currentUser.institutionId || '',
            });
        } else if (adminProfile?.institutionId) {
            const isSuperadmin =
                adminAuth?.role === 'superadmin' || adminProfile?.role === 'superadmin';
            if (!isSuperadmin) {
                // Pre-populate institution
                const currentInstitution = form.getValues('institution');
                if (!currentInstitution || currentInstitution !== adminProfile.institutionId) {
                    form.setValue('institution', adminProfile.institutionId);
                }

                // Pre-populate department if available
                if (adminProfile.departmentId) {
                    const currentDepartment = form.getValues('department');
                    if (!currentDepartment || currentDepartment !== adminProfile.departmentId) {
                        form.setValue('department', adminProfile.departmentId);
                    }
                }
            }
        }
    }, [user, targetUserDetail, adminProfile, adminAuth, form]);

    const createMutation = useCreateUserMutation();
    const inviteMutation = useInviteUserMutation();
    const updateMutation = useUpdateUserMutation();

    const normalizeValues = (values: UserFormValues): UserFormValues => {
        const normalizedCourseIds = Array.from(
            new Set(
                (values.role === 'instructor'
                    ? values.courseIds?.length
                        ? values.courseIds
                        : values.course
                          ? [values.course]
                          : []
                    : values.course
                      ? [values.course]
                      : []
                ).filter(Boolean),
            ),
        );

        return {
            ...values,
            course: normalizedCourseIds[0] ?? '',
            courseIds: values.role === 'instructor' ? normalizedCourseIds : [],
            studentNo: values.role === 'student' ? values.studentNo : undefined,
            employeeNo: values.role === 'instructor' ? values.employeeNo : undefined,
        };
    };

    const onSubmit = (values: UserFormValues) => {
        const payload = normalizeValues(values);

        if (user) {
            updateMutation.mutate(
                { id: user.id, payload },
                {
                    onSuccess: () => {
                        form.reset();
                        onSuccess?.();
                    },
                },
            );
        } else if (payload.role !== 'student') {
            inviteMutation.mutate(payload, {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                },
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                },
            });
        }
    };

    const isPending =
        createMutation.isPending || inviteMutation.isPending || updateMutation.isPending;

    return {
        form,
        onSubmit,
        watchedRole,
        isPending,
    };
}
