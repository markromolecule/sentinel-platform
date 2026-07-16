import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    generateAnalyticsReport,
    type GenerateAnalyticsReportBody,
    type AnalyticsReport,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseGenerateAnalyticsReportMutationArgs = UseMutationOptions<
    AnalyticsReport,
    Error,
    GenerateAnalyticsReportBody
>;

/**
 * Mutation hook to queue a new analytics report generation request.
 *
 * @param args Optional mutation options.
 * @returns The mutation object.
 */
export function useGenerateAnalyticsReportMutation(
    args: UseGenerateAnalyticsReportMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation<AnalyticsReport, Error, GenerateAnalyticsReportBody>({
        ...args,
        mutationFn: (variables) => generateAnalyticsReport(apiClient, variables),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: [...ANALYTICS_QUERY_KEYS.all, 'reports'],
            });

            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
                return;
            }
            toast.success('Report queued');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }
            toast.error(error.message || 'Failed to trigger report generation');
        },
    });
}
