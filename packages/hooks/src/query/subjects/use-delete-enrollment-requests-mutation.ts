import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteEnrollmentRequests } from '@sentinel/services';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { toast } from 'sonner';

export type UseDeleteEnrollmentRequestsMutationArgs = UseMutationOptions<number, Error, string[]>;

export function useDeleteEnrollmentRequestsMutation(
    args: UseDeleteEnrollmentRequestsMutationArgs = {
        onSuccess: (deletedCount) =>
            toast.success(
                deletedCount > 0
                    ? 'Selected enrollment requests deleted successfully.'
                    : 'No enrollment requests were deleted.',
            ),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (requestIds) => deleteEnrollmentRequests(apiClient, requestIds),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
