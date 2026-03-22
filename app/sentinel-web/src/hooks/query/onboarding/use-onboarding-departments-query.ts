import { useQuery } from '@tanstack/react-query';
import { getOnboardingDepartments } from '@/data/api/onboarding';

export const ONBOARDING_DEPARTMENTS_QUERY_KEY = ['onboarding-departments'] as const;

// Hook to fetch departments specifically for the onboarding flow
export function useOnboardingDepartmentsQuery(institutionId?: string) {
    return useQuery({
        queryKey: [...ONBOARDING_DEPARTMENTS_QUERY_KEY, institutionId],
        queryFn: () => getOnboardingDepartments(institutionId),
        enabled: !!institutionId,
    });
}
