import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getTelemetrySettings } from '@sentinel/services';
import { TELEMETRY_QUERY_KEYS } from '@sentinel/shared/constants';
import type { TelemetrySettingsRecord } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useTelemetrySettingsQuery(): UseQueryResult<TelemetrySettingsRecord, Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: TELEMETRY_QUERY_KEYS.settings(),
        queryFn: () => getTelemetrySettings(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
