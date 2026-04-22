import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getTelemetryHealth, type TelemetryHealthSnapshot } from '@sentinel/services';
import { TELEMETRY_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useTelemetryHealthQuery(): UseQueryResult<TelemetryHealthSnapshot, Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: TELEMETRY_QUERY_KEYS.health(),
        queryFn: () => getTelemetryHealth(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
