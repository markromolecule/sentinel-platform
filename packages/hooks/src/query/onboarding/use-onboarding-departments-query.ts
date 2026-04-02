import { useQuery } from '@tanstack/react-query';
import { getOnboardingDepartments } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useOnboardingDepartmentsQuery(institutionId?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    return useQuery({
        queryKey: ['onboarding-departments', institutionId],
        queryFn: () => getOnboardingDepartments(apiClient, institutionId),
        enabled: isAuthenticatedQueryEnabled && !!institutionId,
    });
}
