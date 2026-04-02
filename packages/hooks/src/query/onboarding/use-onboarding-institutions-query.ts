import { useQuery } from '@tanstack/react-query';
import { getOnboardingInstitutions } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useOnboardingInstitutionsQuery() {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    return useQuery({
        queryKey: ['onboarding-institutions'],
        queryFn: () => getOnboardingInstitutions(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
