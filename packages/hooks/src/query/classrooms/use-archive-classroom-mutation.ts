import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { archiveClassroom } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseArchiveClassroomMutationArgs = UseMutationOptions<void, Error, string>;

/**
 * Hook to archive a classroom.
 * Invalidates the classrooms query cache and alerts the user upon completion.
 */
export function useArchiveClassroomMutation(args: UseArchiveClassroomMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => archiveClassroom(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: CLASSROOM_QUERY_KEYS.all });
            await queryClient.removeQueries({
                queryKey: CLASSROOM_QUERY_KEYS.details(variables),
            });
            await queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
            await queryClient.removeQueries({
                queryKey: ['instructor-student-enrollment-detail'],
            });

            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Classroom archived successfully');
        },
    });
}
