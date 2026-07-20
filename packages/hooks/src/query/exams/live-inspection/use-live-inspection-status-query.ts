import { useQuery } from '@tanstack/react-query';
import { getLiveInspectionStatus } from '@sentinel/services';
import { isLiveInspectionTerminalState } from '@sentinel/shared/schema';
import { useApi } from '../../../api-provider';
import { useAuthenticatedQueryEnabled } from '../../_shared/use-authenticated-query-enabled';
import { LIVE_INSPECTION_QUERY_KEYS } from './query-keys';

export const LIVE_INSPECTION_STATUS_REFETCH_INTERVAL_MS = 2_000;

/**
 * Polls redacted staff live-inspection status until the lease is terminal.
 */
export function useLiveInspectionStatusQuery(args: {
    examId?: string;
    leaseId?: string;
    attemptId?: string;
    enabled?: boolean;
}) {
    const apiClient = useApi();
    const authenticated = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: args.examId
            ? LIVE_INSPECTION_QUERY_KEYS.status(args.examId, args.leaseId, args.attemptId)
            : LIVE_INSPECTION_QUERY_KEYS.all,
        queryFn: () =>
            getLiveInspectionStatus(apiClient, {
                examId: args.examId as string,
                leaseId: args.leaseId,
                attemptId: args.attemptId,
            }),
        enabled:
            Boolean(args.examId && (args.leaseId || args.attemptId)) &&
            authenticated &&
            args.enabled !== false,
        refetchInterval: (query) => {
            const state = query.state.data?.state;
            return state && isLiveInspectionTerminalState(state)
                ? false
                : LIVE_INSPECTION_STATUS_REFETCH_INTERVAL_MS;
        },
        refetchIntervalInBackground: true,
    });
}
