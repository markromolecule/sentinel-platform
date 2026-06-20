import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getInstructorDashboard, ApiInstructorDashboardData } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

/**
 * Fetch instructor dashboard metrics and recent exams.
 *
 * @returns Query result containing the instructor dashboard data
 */
export function useInstructorDashboardQuery(): UseQueryResult<ApiInstructorDashboardData, Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...USER_QUERY_KEYS.all, 'instructor-dashboard'],
        queryFn: () => getInstructorDashboard(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
