import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveEnrollmentRequest } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export function useApproveEnrollmentMutation() {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestIds: string[]) => approveEnrollmentRequest(apiClient, requestIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            toast.success('Enrollment requests approved successfully');
        },
        onError: (error: any) => {
            console.error('Approve enrollment error:', error);
            toast.error(error?.message || 'Failed to approve enrollment request');
        },
    });
}
