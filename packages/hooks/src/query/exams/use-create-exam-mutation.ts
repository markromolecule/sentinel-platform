import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExam } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export function useCreateExamMutation() {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createExam.bind(null, apiClient),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: EXAM_QUERY_KEYS.all,
            });
            toast.success('Exam draft created successfully.');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to create exam draft.');
        },
    });
}
