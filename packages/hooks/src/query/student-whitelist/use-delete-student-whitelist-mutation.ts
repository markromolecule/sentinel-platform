import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteStudentWhitelist } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { STUDENT_WHITELIST_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteStudentWhitelistMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteStudentWhitelistMutation(
    args: UseDeleteStudentWhitelistMutationArgs = {
        onSuccess: () => toast.success('Whitelist entry deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteStudentWhitelist(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: STUDENT_WHITELIST_QUERY_KEYS.all,
            });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
