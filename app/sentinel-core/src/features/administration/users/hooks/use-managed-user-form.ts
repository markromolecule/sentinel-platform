'use client';

import {
    useCreateUserMutation,
    useInviteUserMutation,
    useUpdateUserMutation,
    useUserQuery,
} from '@sentinel/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { userFormSchema, type UserFormValues } from '@sentinel/shared/schema';
import { type User, type UserRole } from '@sentinel/shared/types';
import { useCoreAdminCapabilities } from '@/hooks/use-core-admin-capabilities';
import { useUser } from '@/hooks/use-user';

interface UseManagedUserFormProps {
    user?: User | null;
    onSuccess?: () => void;
    defaultRole?: UserRole;
    forcedRole?: UserRole;
}

/**
 * Resolves the default role for a managed-user form from explicit props and route context.
 */
export function resolveManagedUserDefaultRole(
    pathname: string,
    defaultRole?: UserRole,
    forcedRole?: UserRole,
) {
    if (forcedRole) {
        return forcedRole;
    }

    if (defaultRole) {
        return defaultRole;
    }

    if (pathname.includes('/students')) {
        return 'student';
    }

    if (pathname.includes('/instructors')) {
        return 'instructor';
    }

    return 'student';
}

/**
 * Normalizes course identifiers for single-course and multi-course user roles.
 */
export function normalizeManagedUserCourseIds(values: UserFormValues) {
    return Array.from(
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
}

/**
 * Derives profile-based institution and department defaults for non-superadmin flows.
 */
export function getManagedUserProfileDefaults(args: {
    currentUserProfile?: {
        institutionId?: string | null;
        departmentId?: string | null;
    } | null;
    isSuperadmin: boolean;
}) {
    if (!args.currentUserProfile?.institutionId || args.isSuperadmin) {
        return {
            institution: '',
            department: '',
        };
    }

    return {
        institution: args.currentUserProfile.institutionId,
        department: args.currentUserProfile.departmentId || '',
    };
}

/**
 * Builds the normalized mutation payload for create, invite, and update flows.
 */
export function buildManagedUserPayload(values: UserFormValues, forcedRole?: UserRole) {
    const normalizedCourseIds = normalizeManagedUserCourseIds(values);
    const normalizedRole = forcedRole || values.role;
    const payload: UserFormValues = {
        ...values,
        role: normalizedRole,
        course: normalizedCourseIds[0] ?? '',
        courseIds: normalizedRole === 'instructor' ? normalizedCourseIds : [],
        studentNo: normalizedRole === 'student' ? values.studentNo : undefined,
        employeeNo: normalizedRole === 'instructor' ? values.employeeNo : undefined,
    };

    if (forcedRole === 'admin') {
        payload.studentNo = undefined;
        payload.employeeNo = undefined;
        payload.courseIds = [];
    }

    return payload;
}

/**
 * Shared form controller for both user management and administrator management dialogs.
 */
export function useManagedUserForm({
    user,
    onSuccess,
    defaultRole,
    forcedRole,
}: UseManagedUserFormProps = {}) {
    const pathname = usePathname();
    const { data: authUser } = useUser();
    const { isSuperadmin } = useCoreAdminCapabilities();
    const { data: currentUserProfile } = useUserQuery(authUser?.id || '');
    const { data: targetUserDetail } = useUserQuery(user?.id || '');

    const computedDefaultRole = resolveManagedUserDefaultRole(pathname, defaultRole, forcedRole);

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

    useEffect(() => {
        const currentUser = targetUserDetail || user;

        if (currentUser) {
            const currentRole = forcedRole || currentUser.role || computedDefaultRole;
            const currentCourseIds =
                currentRole === 'instructor'
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
                role: currentRole,
                department: currentUser.departmentId || '',
                course:
                    currentRole === 'instructor'
                        ? currentCourseIds[0] || ''
                        : currentUser.courseId || currentUser.courseIds?.[0] || '',
                courseIds: currentCourseIds,
                studentNo: currentUser.studentNo || '',
                employeeNo: currentUser.employeeNo || '',
                institution: currentUser.institutionId || '',
            });

            return;
        }

        if (!currentUserProfile?.institutionId || isSuperadmin) {
            return;
        }

        const defaults = getManagedUserProfileDefaults({
            currentUserProfile,
            isSuperadmin,
        });

        const currentInstitution = form.getValues('institution');
        if (!currentInstitution || currentInstitution !== defaults.institution) {
            form.setValue('institution', defaults.institution);
        }

        if (defaults.department) {
            const currentDepartment = form.getValues('department');
            if (!currentDepartment || currentDepartment !== defaults.department) {
                form.setValue('department', defaults.department);
            }
        }
    }, [
        computedDefaultRole,
        currentUserProfile,
        forcedRole,
        form,
        isSuperadmin,
        targetUserDetail,
        user,
    ]);

    const createMutation = useCreateUserMutation();
    const inviteMutation = useInviteUserMutation();
    const updateMutation = useUpdateUserMutation();

    const onSubmit = async (values: UserFormValues) => {
        const payload = buildManagedUserPayload(values, forcedRole);

        if (user) {
            await updateMutation.mutateAsync({ id: user.id, payload });
            form.reset();
            onSuccess?.();
            return;
        }

        if (payload.role !== 'student') {
            await inviteMutation.mutateAsync({
                ...payload,
                institution: payload.institution || currentUserProfile?.institutionId || '',
            });
            form.reset();
            onSuccess?.();
            return;
        }

        await createMutation.mutateAsync(payload);
        form.reset();
        onSuccess?.();
    };

    return {
        form,
        onSubmit,
        watchedRole,
        isPending: createMutation.isPending || inviteMutation.isPending || updateMutation.isPending,
        shouldLockInstitution: Boolean(currentUserProfile?.institutionId),
    };
}
