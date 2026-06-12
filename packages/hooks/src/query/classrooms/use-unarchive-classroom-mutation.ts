import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { unarchiveClassroom } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseUnarchiveClassroomMutationArgs = UseMutationOptions<void, Error, string>;

/**
 * Hook to unarchive a classroom.
 * Invalidates the classrooms query cache and alerts the user upon completion.
 */
export function useUnarchiveClassroomMutation(args: UseUnarchiveClassroomMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => unarchiveClassroom(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: CLASSROOM_QUERY_KEYS.all });
            await queryClient.removeQueries({
                queryKey: CLASSROOM_QUERY_KEYS.details(variables),
            });

            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Classroom unarchived successfully');
        },
    });
}
