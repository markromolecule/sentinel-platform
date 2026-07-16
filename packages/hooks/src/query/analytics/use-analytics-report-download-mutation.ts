import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { getAnalyticsReportDownload } from '@sentinel/services';
import { useApi } from '../../api-provider';

type AnalyticsReportDownloadResponse = Awaited<ReturnType<typeof getAnalyticsReportDownload>>;

export type UseAnalyticsReportDownloadMutationArgs = UseMutationOptions<
    AnalyticsReportDownloadResponse,
    Error,
    string
>;

export function useAnalyticsReportDownloadMutation(
    args: UseAnalyticsReportDownloadMutationArgs = {},
) {
    const apiClient = useApi();

    return useMutation<AnalyticsReportDownloadResponse, Error, string>({
        ...args,
        mutationFn: (reportId) => getAnalyticsReportDownload(apiClient, reportId),
    });
}
