import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteClassroomStudent } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type DeleteClassroomStudentVariables = {
    classroomId: string;
    studentId: string;
};

export type UseDeleteClassroomStudentMutationArgs = UseMutationOptions<
    void,
    Error,
    DeleteClassroomStudentVariables
>;

export function useDeleteClassroomStudentMutation(
    args: UseDeleteClassroomStudentMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (variables) => deleteClassroomStudent(apiClient, variables),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: CLASSROOM_QUERY_KEYS.all });
            await queryClient.invalidateQueries({
                queryKey: CLASSROOM_QUERY_KEYS.details(variables.classroomId),
            });
            await queryClient.invalidateQueries({ queryKey: ['instructor-students'] });

            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Student unenrolled successfully');
        },
    });
}
