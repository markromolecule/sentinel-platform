'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getTelemetryIncidents, type GetTelemetryIncidentsParams } from '@sentinel/services';
import { TELEMETRY_QUERY_KEYS } from '@sentinel/shared/constants';
import type { TelemetryIncidentRecord } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useTelemetryIncidentsQuery(
    params: GetTelemetryIncidentsParams = {},
): UseQueryResult<TelemetryIncidentRecord[], Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const hasSupportedFilter = Boolean(params.examId || params.attemptId || params.studentId);

    return useQuery({
        queryKey: TELEMETRY_QUERY_KEYS.incidents(params),
        queryFn: () => getTelemetryIncidents(apiClient, params),
        enabled: hasSupportedFilter && isAuthenticatedQueryEnabled,
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
    });
}
