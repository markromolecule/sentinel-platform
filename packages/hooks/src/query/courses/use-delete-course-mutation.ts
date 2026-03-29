import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteCourse } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteCourseMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteCourseMutation(
    args: UseDeleteCourseMutationArgs = {
        onSuccess: () => toast.success('Course deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteCourse(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
