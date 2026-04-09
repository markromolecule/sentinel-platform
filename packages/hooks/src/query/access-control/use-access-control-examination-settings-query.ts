import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getAccessControlExaminationSettings } from '@sentinel/services';
import { ACCESS_CONTROL_QUERY_KEYS } from '@sentinel/shared/constants';
import type { ExaminationGlobalSettingsRecord } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useAccessControlExaminationSettingsQuery(): UseQueryResult<
    ExaminationGlobalSettingsRecord,
    Error
> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: ACCESS_CONTROL_QUERY_KEYS.examinationSettings(),
        queryFn: () => getAccessControlExaminationSettings(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
