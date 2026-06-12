import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { bulkDeleteClassrooms } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseBulkDeleteClassroomsMutationArgs = UseMutationOptions<void, Error, string[]>;

/**
 * Mutation hook to delete multiple classrooms in bulk.
 *
 * @param args - Mutation configuration options.
 */
export function useBulkDeleteClassroomsMutation(args: UseBulkDeleteClassroomsMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (ids) => bulkDeleteClassrooms(apiClient, ids),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: CLASSROOM_QUERY_KEYS.all });
            for (const id of variables) {
                await queryClient.removeQueries({
                    queryKey: CLASSROOM_QUERY_KEYS.details(id),
                });
            }
            await queryClient.invalidateQueries({ queryKey: ['instructor-students'] });

            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Classrooms deleted successfully');
        },
    });
}
