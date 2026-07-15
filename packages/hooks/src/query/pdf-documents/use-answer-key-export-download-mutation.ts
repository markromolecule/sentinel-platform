import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { getAnswerKeyExportDownload } from '@sentinel/services';
import { useApi } from '../../api-provider';

type AnswerKeyExportDownloadResponse = Awaited<ReturnType<typeof getAnswerKeyExportDownload>>;

export type UseAnswerKeyExportDownloadMutationArgs = UseMutationOptions<
    AnswerKeyExportDownloadResponse,
    Error,
    string
>;

export function useAnswerKeyExportDownloadMutation(
    args: UseAnswerKeyExportDownloadMutationArgs = {},
) {
    const apiClient = useApi();

    return useMutation<AnswerKeyExportDownloadResponse, Error, string>({
        ...args,
        mutationFn: (exportId) => getAnswerKeyExportDownload(apiClient, exportId),
    });
}
