import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    overrideReconnectLimit,
    type ApiStudentExamAccessOverride,
    type OverrideReconnectLimitPayload,
} from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseOverrideReconnectLimitMutationArgs = UseMutationOptions<
    ApiStudentExamAccessOverride,
    Error,
    OverrideReconnectLimitPayload
>;

export function useOverrideReconnectLimitMutation(
    args: UseOverrideReconnectLimitMutationArgs = {
        onSuccess: () => toast.success('Reconnect override granted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => overrideReconnectLimit(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: EXAM_QUERY_KEYS.monitoring(variables.id),
            });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
