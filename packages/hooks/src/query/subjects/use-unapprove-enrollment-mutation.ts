import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unapproveEnrollmentRequest } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export function useUnapproveEnrollmentMutation() {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestIds: string[]) => unapproveEnrollmentRequest(apiClient, requestIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            toast.success('Enrollment requests moved back to pending successfully');
        },
        onError: (error: any) => {
            console.error('Unapprove enrollment error:', error);
            toast.error(error?.message || 'Failed to unapprove enrollment request');
        },
    });
}
