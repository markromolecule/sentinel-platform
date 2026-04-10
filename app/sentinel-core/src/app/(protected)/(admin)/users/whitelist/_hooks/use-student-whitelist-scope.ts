'use client';

import { useUserQuery } from '@sentinel/hooks';
import { useUser } from '@/hooks/use-user';

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
