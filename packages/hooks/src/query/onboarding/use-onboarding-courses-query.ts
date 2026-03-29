import { useQuery } from '@tanstack/react-query';
import { getOnboardingCourses } from '@sentinel/services';
import { useApi } from '../../api-provider';

export function useOnboardingCoursesQuery(departmentId?: string, institutionId?: string) {
    const apiClient = useApi();
    return useQuery({
        queryKey: ['onboarding-courses', departmentId, institutionId],
        queryFn: () => getOnboardingCourses(apiClient, departmentId, institutionId),
        enabled: !!departmentId && !!institutionId,
    });
}
