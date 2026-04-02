import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteStudentWhitelist } from '@sentinel/services';
import { type StudentWhitelist } from '@sentinel/shared/types';
import { STUDENT_WHITELIST_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { toast } from 'sonner';

export type DeleteSelectedStudentWhitelistResult = {
    deletedCount: number;
    skippedClaimedCount: number;
    failedCount: number;
};

export type UseDeleteSelectedStudentWhitelistMutationArgs = UseMutationOptions<
    DeleteSelectedStudentWhitelistResult,
    Error,
    StudentWhitelist[]
>;

export function useDeleteSelectedStudentWhitelistMutation(
    args: UseDeleteSelectedStudentWhitelistMutationArgs = {
        onSuccess: (result) => {
            if (result.deletedCount > 0) {
                toast.success(
                    `Deleted ${result.deletedCount} whitelist entr${
                        result.deletedCount === 1 ? 'y' : 'ies'
                    }.`,
                );
            }

            if (result.skippedClaimedCount > 0) {
                toast.info(
                    `${result.skippedClaimedCount} claimed entr${
                        result.skippedClaimedCount === 1 ? 'y was' : 'ies were'
                    } skipped.`,
                );
            }

            if (result.failedCount > 0) {
                toast.error(
                    `${result.failedCount} whitelist entr${
                        result.failedCount === 1 ? 'y could' : 'ies could'
                    } not be deleted.`,
                );
            }
        },
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: async (records) => {
            const claimedRecords = records.filter((record) => Boolean(record.claimedUserId));
            const deletableRecords = records.filter((record) => !record.claimedUserId);

            const results = await Promise.allSettled(
                deletableRecords.map((record) => deleteStudentWhitelist(apiClient, record.id)),
            );

            const deletedCount = results.filter((result) => result.status === 'fulfilled').length;
            const failedCount = results.length - deletedCount;

            return {
                deletedCount,
                skippedClaimedCount: claimedRecords.length,
                failedCount,
            };
        },
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
