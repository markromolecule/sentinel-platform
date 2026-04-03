import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    saveBuilderWorkspace,
    type BuilderWorkspace,
    type SaveBuilderWorkspacePayload,
} from '@sentinel/services';
import { BUILDER_QUERY_KEYS, EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseSaveBuilderWorkspaceMutationArgs = UseMutationOptions<
    BuilderWorkspace,
    Error,
    { id: string; payload: SaveBuilderWorkspacePayload }
>;

export function useSaveBuilderWorkspaceMutation(
    args: UseSaveBuilderWorkspaceMutationArgs = {
        onSuccess: () => toast.success('Builder workspace saved successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (params) => saveBuilderWorkspace(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: BUILDER_QUERY_KEYS.workspace(variables.id),
                }),
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.details(variables.id),
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
