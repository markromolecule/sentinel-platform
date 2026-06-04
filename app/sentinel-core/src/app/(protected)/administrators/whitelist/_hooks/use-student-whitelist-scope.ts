'use client';

import { useUserQuery } from '@sentinel/hooks';
import { useUser } from '@/hooks/use-user';

/**
 * Custom hook to retrieve the current user's role-based academic/whitelist scope,
 * determining whether they are a superadmin and returning any locked institution,
 * department, or course constraints for branch/institution filtering.
 *
 * @returns An object containing authUser, currentProfile, isSuperadmin flag, and locked IDs.
 */
export function useStudentWhitelistScope() {
    const { data: authUser } = useUser();
    const { data: currentProfile } = useUserQuery(authUser?.id || '');
    const isSuperadmin = authUser?.role === 'superadmin';
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
