import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createStudentWhitelist } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { StudentWhitelist, StudentWhitelistInput } from '@sentinel/shared/types';
import { STUDENT_WHITELIST_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseCreateStudentWhitelistMutationArgs = UseMutationOptions<
    StudentWhitelist,
    Error,
    StudentWhitelistInput
>;

export function useCreateStudentWhitelistMutation(
    args: UseCreateStudentWhitelistMutationArgs = {
        onSuccess: () => toast.success('Whitelist record created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createStudentWhitelist(apiClient, payload),
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
