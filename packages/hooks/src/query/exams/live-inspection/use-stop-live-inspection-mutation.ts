import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { stopLiveInspection, type LiveInspectionLeasePayload } from '@sentinel/services';
import type { LiveInspectionStaffStatus } from '@sentinel/shared/schema';
import { useApi } from '../../../api-provider';
import { LIVE_INSPECTION_QUERY_KEYS } from './query-keys';

/**
 * Stops a live inspection and invalidates redacted status queries.
 */
export function useStopLiveInspectionMutation(
    options?: UseMutationOptions<LiveInspectionStaffStatus, Error, LiveInspectionLeasePayload>,
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: (payload) => stopLiveInspection(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: LIVE_INSPECTION_QUERY_KEYS.all });
            await (options?.onSuccess as any)?.(data, variables, context);
        },
    });
}
