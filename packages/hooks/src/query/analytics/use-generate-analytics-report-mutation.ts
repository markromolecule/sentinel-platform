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
 * Mutation hook to generate a new analytics report.
 * Automatically invalidates all analytics queries (including reports list) upon success.
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
            // Invalidate all analytics queries, especially reports list
            await queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.all });

            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
                return;
            }
            toast.success('Analytics report generation triggered successfully');
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
