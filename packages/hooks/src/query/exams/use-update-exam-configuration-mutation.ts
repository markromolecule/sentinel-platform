import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateExamConfiguration, type ExamConfigurationState } from '@sentinel/services';
import { BUILDER_QUERY_KEYS, EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseUpdateExamConfigurationMutationArgs = UseMutationOptions<
    ExamConfigurationState,
    Error,
    {
        examId: string;
        payload: Partial<ExamConfigurationState>;
    }
>;

export function useUpdateExamConfigurationMutation(
    args: UseUpdateExamConfigurationMutationArgs = {
        onSuccess: () => toast.success('Exam configuration updated successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateExamConfiguration(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.configuration(variables.examId),
                }),
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.details(variables.examId),
                }),
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: BUILDER_QUERY_KEYS.workspace(variables.examId),
                }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
