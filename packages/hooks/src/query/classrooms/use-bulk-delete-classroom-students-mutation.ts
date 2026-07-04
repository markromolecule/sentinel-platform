import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteClassroomStudent } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { type DeleteClassroomStudentVariables } from './use-delete-classroom-student-mutation';

export type UseBulkDeleteClassroomStudentsMutationArgs = UseMutationOptions<
    void,
    Error,
    DeleteClassroomStudentVariables[]
>;

export function useBulkDeleteClassroomStudentsMutation(
    args: UseBulkDeleteClassroomStudentsMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: async (variables) => {
            await Promise.all(
                variables.map((variable) => deleteClassroomStudent(apiClient, variable)),
            );
        },
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: CLASSROOM_QUERY_KEYS.all });

            const classroomIds = Array.from(
                new Set(variables.map((variable) => variable.classroomId)),
            );
            await Promise.all(
                classroomIds.map((classroomId) =>
                    queryClient.invalidateQueries({
                        queryKey: CLASSROOM_QUERY_KEYS.details(classroomId),
                    }),
                ),
            );

            await queryClient.invalidateQueries({ queryKey: ['instructor-students'] });

            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Selected students unenrolled successfully');
        },
    });
}
