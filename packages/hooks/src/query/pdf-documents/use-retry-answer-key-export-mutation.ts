import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { retryAnswerKeyExport } from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';

type RetryAnswerKeyExportResponse = Awaited<ReturnType<typeof retryAnswerKeyExport>>;

export interface RetryAnswerKeyExportVariables {
    exportId: string;
    institutionId?: string;
    examId?: string;
}

export type UseRetryAnswerKeyExportMutationArgs = UseMutationOptions<
    RetryAnswerKeyExportResponse,
    Error,
    RetryAnswerKeyExportVariables
>;

export function useRetryAnswerKeyExportMutation(args: UseRetryAnswerKeyExportMutationArgs = {}) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation<RetryAnswerKeyExportResponse, Error, RetryAnswerKeyExportVariables>({
        ...args,
        mutationFn: ({ exportId }) => retryAnswerKeyExport(apiClient, exportId),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({
                queryKey: ANALYTICS_QUERY_KEYS.answerKeyExports(
                    variables.institutionId,
                    variables.examId,
                ),
            });
            await queryClient.invalidateQueries({
                queryKey: ANALYTICS_QUERY_KEYS.answerKeyExportStatus(variables.exportId),
            });

            await args.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
}
