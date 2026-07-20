import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { startLiveInspection, type StartLiveInspectionPayload } from '@sentinel/services';
import type { LiveInspectionStaffStatus } from '@sentinel/shared/schema';
import { useApi } from '../../../api-provider';
import { LIVE_INSPECTION_QUERY_KEYS } from './query-keys';

/**
 * Starts a live inspection and invalidates only redacted status queries.
 */
export function useStartLiveInspectionMutation(
    options?: UseMutationOptions<LiveInspectionStaffStatus, Error, StartLiveInspectionPayload>,
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: (payload) => startLiveInspection(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: LIVE_INSPECTION_QUERY_KEYS.all });
            await (options?.onSuccess as any)?.(data, variables, context);
        },
    });
}
