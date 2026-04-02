import { useQuery } from '@tanstack/react-query';
import { getStudentWhitelist, type GetStudentWhitelistParams } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { STUDENT_WHITELIST_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useStudentWhitelistQuery(params: GetStudentWhitelistParams = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...STUDENT_WHITELIST_QUERY_KEYS.all, params],
        queryFn: () => getStudentWhitelist(apiClient, params),
        enabled: isAuthenticatedQueryEnabled,
    });
}
