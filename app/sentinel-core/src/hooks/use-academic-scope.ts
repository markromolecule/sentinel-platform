'use client';

import { useUserQuery, useActivePermissions } from '@sentinel/hooks';
import { useUser } from '@/hooks/use-user';

/**
 * A custom hook that resolves the current user's academic routing scope, active profile information,
 * and capability-based read-only gates. It enforces strict academic scoping across Sentinel's resources.
 * 
 * @returns An object containing the role, auth user data, active academic profiles, and boundary locks.
 */
export function useAcademicScope() {
    const { data: authUser, isLoading: isLoadingAuth } = useUser();
    const { data: currentProfile, isLoading: isLoadingProfile } = useUserQuery(authUser?.id || '');
    const { hasAnyPermission, isLoading: isLoadingPermissions } = useActivePermissions();

    const role = authUser?.role;
    const isSuperadmin = role === 'superadmin';
    const isAdmin = role === 'admin';

    const isReadOnlyFor = (resourceKey: string) => {
        if (isSuperadmin) return false;

        const actionPermissionsMap: Record<string, string[]> = {
            institutions: ['institutions:create', 'institutions:update', 'institutions:delete'],
            departments: ['departments:create', 'departments:update', 'departments:delete'],
            semesters: ['semesters:create', 'semesters:update', 'semesters:delete'],
            courses: ['courses:create', 'courses:update', 'courses:delete'],
            permissions: [
                'access_control:manage_roles',
                'access_control:manage_permissions',
                'access_control:manage_assignments',
            ],
        };

        const actionPermissions = actionPermissionsMap[resourceKey] || [];
        if (actionPermissions.length === 0) return true;

        return !hasAnyPermission(actionPermissions);
    };

    return {
        role,
        authUser,
        currentProfile,
        isSuperadmin,
        isAdmin,
        isLoading: isLoadingAuth || isLoadingProfile || isLoadingPermissions,
        institutionId: currentProfile?.institutionId || '',
        institutionName: currentProfile?.institution || '',
        assignedDepartmentId: currentProfile?.departmentId || '',
        assignedCourseId: currentProfile?.courseId || '',
        shouldLockInstitution: isAdmin,
        shouldLockDepartment: isAdmin,
        shouldLockCourse: isAdmin,
        isReadOnlyFor,
    };
}
