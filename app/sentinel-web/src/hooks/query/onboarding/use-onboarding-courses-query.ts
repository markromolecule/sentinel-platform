import { useQuery } from '@tanstack/react-query';
import { getOnboardingCourses } from '@/data/api/onboarding';

export const ONBOARDING_COURSES_QUERY_KEY = ['onboarding-courses'] as const;

export function useOnboardingCoursesQuery(departmentId?: string, institutionId?: string) {
    return useQuery({
        queryKey: [...ONBOARDING_COURSES_QUERY_KEY, departmentId, institutionId],
        queryFn: () => getOnboardingCourses(departmentId, institutionId),
        enabled: !!departmentId || !!institutionId,
    });
}
