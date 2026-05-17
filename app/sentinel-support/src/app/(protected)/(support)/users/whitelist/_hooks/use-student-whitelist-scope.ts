'use client';

import { useUserQuery } from '@sentinel/hooks';
import { useUser } from '@/hooks/use-user';

/**
 * Hook to retrieve user authentication and scope details for whitelist management.
 * In sentinel-support, 'support' and 'superadmin' roles have global administrative access.
 */
export function useStudentWhitelistScope() {
    const { data: authUser } = useUser();
    const { data: currentProfile } = useUserQuery(authUser?.id || '');
    const isSuperadmin = authUser?.role === 'superadmin' || authUser?.role === 'support';
    const lockedInstitutionId = currentProfile?.institutionId || '';
    const lockedDepartmentId = currentProfile?.departmentId || '';
    const lockedCourseId = currentProfile?.courseId || '';

    return {
        authUser,
        currentProfile,
        isSuperadmin,
        lockedInstitutionId,
        lockedInstitutionName: currentProfile?.institution || '',
        lockedDepartmentId,
        lockedCourseId,
    };
}
