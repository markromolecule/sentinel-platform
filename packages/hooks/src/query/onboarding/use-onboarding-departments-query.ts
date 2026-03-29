import { useQuery } from '@tanstack/react-query';
import { getOnboardingDepartments } from '@sentinel/services';
import { useApi } from '../../api-provider';

export function useOnboardingDepartmentsQuery(institutionId?: string) {
    const apiClient = useApi();
    return useQuery({
        queryKey: ['onboarding-departments', institutionId],
        queryFn: () => getOnboardingDepartments(apiClient, institutionId),
        enabled: !!institutionId,
    });
}
