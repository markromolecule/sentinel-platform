import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createClassroom } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import type { ClassroomDetail } from '@sentinel/shared/types';
import type { ClassroomFormValues } from '@sentinel/shared/schema';
import { toast } from 'sonner';

export type UseCreateClassroomMutationArgs = UseMutationOptions<
    ClassroomDetail,
    Error,
    ClassroomFormValues
>;

export function useCreateClassroomMutation(args: UseCreateClassroomMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createClassroom(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: CLASSROOM_QUERY_KEYS.all });
            await queryClient.invalidateQueries({
                queryKey: CLASSROOM_QUERY_KEYS.details(data.id),
            });

            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Classroom created successfully');
        },
    });
}
