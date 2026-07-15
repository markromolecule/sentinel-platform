import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { retryAnalyticsReport } from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';

type RetryAnalyticsReportResponse = Awaited<ReturnType<typeof retryAnalyticsReport>>;

export interface RetryAnalyticsReportVariables {
    reportId: string;
    institutionId?: string | null;
    page?: number;
    limit?: number;
    status?: string;
}

export type UseRetryAnalyticsReportMutationArgs = UseMutationOptions<
    RetryAnalyticsReportResponse,
    Error,
    RetryAnalyticsReportVariables
>;

export function useRetryAnalyticsReportMutation(args: UseRetryAnalyticsReportMutationArgs = {}) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation<RetryAnalyticsReportResponse, Error, RetryAnalyticsReportVariables>({
        ...args,
        mutationFn: ({ reportId }) => retryAnalyticsReport(apiClient, reportId),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({
                queryKey: ANALYTICS_QUERY_KEYS.reports(
                    variables.institutionId ?? null,
                    variables.page,
                    variables.limit,
                    variables.status,
                ),
            });

            await args.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
}
