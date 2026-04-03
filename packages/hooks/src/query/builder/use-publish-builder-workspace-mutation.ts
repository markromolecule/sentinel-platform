import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { publishBuilderWorkspace, type BuilderWorkspace } from '@sentinel/services';
import { BUILDER_QUERY_KEYS, EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UsePublishBuilderWorkspaceMutationArgs = UseMutationOptions<
    BuilderWorkspace,
    Error,
    string
>;

export function usePublishBuilderWorkspaceMutation(
    args: UsePublishBuilderWorkspaceMutationArgs = {
        onSuccess: () => toast.success('Builder workspace published successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (examId) => publishBuilderWorkspace(apiClient, examId),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: BUILDER_QUERY_KEYS.workspace(variables),
                }),
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.details(variables),
                }),
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.all,
                }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
