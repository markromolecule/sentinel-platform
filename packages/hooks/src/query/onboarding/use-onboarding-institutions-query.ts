import { useQuery } from '@tanstack/react-query';
import { getOnboardingInstitutions } from '@sentinel/services';
import { useApi } from '../../api-provider';

export function useOnboardingInstitutionsQuery() {
    const apiClient = useApi();
    return useQuery({
        queryKey: ['onboarding-institutions'],
        queryFn: () => getOnboardingInstitutions(apiClient),
    });
}
