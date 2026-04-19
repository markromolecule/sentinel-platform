import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteClassroom } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteClassroomMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteClassroomMutation(args: UseDeleteClassroomMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteClassroom(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: CLASSROOM_QUERY_KEYS.all });
            await queryClient.removeQueries({
                queryKey: CLASSROOM_QUERY_KEYS.details(variables),
            });
            await queryClient.invalidateQueries({ queryKey: ['instructor-students'] });

            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Classroom deleted successfully');
        },
    });
}
