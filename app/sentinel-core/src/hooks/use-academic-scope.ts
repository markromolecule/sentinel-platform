'use client';

import { useUserQuery } from '@sentinel/hooks';
import { useUser } from '@/hooks/use-user';

export function useAcademicScope() {
    const { data: authUser, isLoading: isLoadingAuth } = useUser();
    const { data: currentProfile, isLoading: isLoadingProfile } = useUserQuery(authUser?.id || '');

    const role = authUser?.role;
    const isSuperadmin = role === 'superadmin';
    const isAdmin = role === 'admin';

    return {
        role,
        authUser,
        currentProfile,
        isSuperadmin,
        isAdmin,
        isLoading: isLoadingAuth || isLoadingProfile,
        institutionId: currentProfile?.institutionId || '',
        institutionName: currentProfile?.institution || '',
        assignedDepartmentId: currentProfile?.departmentId || '',
        assignedCourseId: currentProfile?.courseId || '',
        shouldLockDepartment: isAdmin,
        shouldLockCourse: isAdmin,
    };
}
