import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    purgeStudentWhitelist,
    type StudentWhitelistPurgeInput,
    type StudentWhitelistPurgeResult,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { STUDENT_WHITELIST_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UsePurgeStudentWhitelistMutationArgs = UseMutationOptions<
    StudentWhitelistPurgeResult,
    Error,
    StudentWhitelistPurgeInput
>;

export function usePurgeStudentWhitelistMutation(
    args: UsePurgeStudentWhitelistMutationArgs = {
        onSuccess: (result) =>
            toast.success(
                `Deleted ${result.deletedCount} whitelist entr${
                    result.deletedCount === 1 ? 'y' : 'ies'
                }.`,
            ),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => purgeStudentWhitelist(apiClient, payload),
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
