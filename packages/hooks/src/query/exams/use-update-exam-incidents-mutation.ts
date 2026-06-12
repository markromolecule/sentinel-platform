import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    reviewIncidents,
    type ApiReviewExamIncidentsPayload,
    type ApiReviewExamIncidentsResponse,
} from '@sentinel/services';
import { useApi } from '../../api-provider';

export type UseUpdateExamIncidentsMutationArgs = UseMutationOptions<
    ApiReviewExamIncidentsResponse,
    Error,
    ApiReviewExamIncidentsPayload
>;

/**
 * Mutation hook to review (confirm or dismiss) one or more incidents.
 *
 * @param examId - The UUID of the exam to invalidate queries for.
 * @param options - Custom mutation options (onSuccess, onError, etc.).
 */
export function useUpdateExamIncidentsMutation(
    examId: string,
    options?: UseUpdateExamIncidentsMutationArgs,
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...options,
        mutationFn: (payload) => reviewIncidents(apiClient, examId, payload),
        onSuccess: async (data, variables, context) => {
            // Invalidate all incidents queries for this specific exam
            await queryClient.invalidateQueries({
                queryKey: ['exams', examId, 'incidents'],
            });
            await queryClient.invalidateQueries({
                queryKey: ['exam-report', examId], // Invalidate exam report since it has needsReview count summaries
            });

            (options?.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (options?.onError as any)?.(error, variables, context);
        },
    });
}
