import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getAnswerKeyExportStatus, type ExamAnswerKeyExportRecord } from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseAnswerKeyExportStatusQueryArgs = Omit<
    UseQueryOptions<ExamAnswerKeyExportRecord, Error>,
    'queryKey' | 'queryFn'
>;

export function useAnswerKeyExportStatusQuery(
    exportId?: string | null,
    options: UseAnswerKeyExportStatusQueryArgs = {},
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<ExamAnswerKeyExportRecord, Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.answerKeyExportStatus(exportId ?? null),
        queryFn: () => getAnswerKeyExportStatus(apiClient, exportId as string),
        enabled: isAuthenticatedQueryEnabled && Boolean(exportId) && (options.enabled ?? true),
        refetchInterval: (query) => {
            const status = (query.state.data as ExamAnswerKeyExportRecord | undefined)?.status;
            return status === 'PENDING' || status === 'GENERATING' ? 5000 : false;
        },
    });
}
