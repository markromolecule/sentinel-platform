import { useQuery } from '@tanstack/react-query';
import { getOnboardingInstitutions } from '@/data/api/onboarding';

export const ONBOARDING_INSTITUTIONS_QUERY_KEY = ['onboarding-institutions'] as const;

export function useOnboardingInstitutionsQuery() {
    return useQuery({
        queryKey: ONBOARDING_INSTITUTIONS_QUERY_KEY,
        queryFn: getOnboardingInstitutions,
    });
}
