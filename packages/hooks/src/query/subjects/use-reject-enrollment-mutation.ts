import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectEnrollmentRequest } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export function useRejectEnrollmentMutation() {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestIds: string[]) => rejectEnrollmentRequest(apiClient, requestIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            toast.success('Enrollment requests rejected successfully');
        },
        onError: (error: any) => {
            console.error('Reject enrollment error:', error);
            toast.error(error?.message || 'Failed to reject enrollment request');
        },
    });
}
