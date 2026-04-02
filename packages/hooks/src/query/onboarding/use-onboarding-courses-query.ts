import { useQuery } from '@tanstack/react-query';
import { getOnboardingCourses } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useOnboardingCoursesQuery(departmentId?: string, institutionId?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    return useQuery({
        queryKey: ['onboarding-courses', departmentId, institutionId],
        queryFn: () => getOnboardingCourses(apiClient, departmentId, institutionId),
        enabled: isAuthenticatedQueryEnabled && !!departmentId && !!institutionId,
    });
}
