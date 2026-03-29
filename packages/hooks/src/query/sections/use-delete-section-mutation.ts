import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteSection } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteSectionMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteSectionMutation(
    args: UseDeleteSectionMutationArgs = {
        onSuccess: () => toast.success('Section deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteSection(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SECTION_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
