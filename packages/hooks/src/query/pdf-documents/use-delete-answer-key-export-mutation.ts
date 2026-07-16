import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteAnswerKeyExport } from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';

type DeleteAnswerKeyExportResponse = Awaited<ReturnType<typeof deleteAnswerKeyExport>>;

export interface DeleteAnswerKeyExportVariables {
    exportId: string;
    institutionId?: string;
    examId?: string;
}

export type UseDeleteAnswerKeyExportMutationArgs = UseMutationOptions<
    DeleteAnswerKeyExportResponse,
    Error,
    DeleteAnswerKeyExportVariables
>;

export function useDeleteAnswerKeyExportMutation(args: UseDeleteAnswerKeyExportMutationArgs = {}) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation<DeleteAnswerKeyExportResponse, Error, DeleteAnswerKeyExportVariables>({
        ...args,
        mutationFn: ({ exportId }) => deleteAnswerKeyExport(apiClient, exportId),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({
                queryKey: ANALYTICS_QUERY_KEYS.answerKeyExports(
                    variables.institutionId,
                    variables.examId,
                ),
            });
            queryClient.removeQueries({
                queryKey: ANALYTICS_QUERY_KEYS.answerKeyExportStatus(variables.exportId),
            });

            await args.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
}
