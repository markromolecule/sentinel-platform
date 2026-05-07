import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEnrollmentRequest } from '@sentinel/services';
import { toast } from 'sonner';
import type { UpdateEnrollmentRequestValues } from '@sentinel/shared';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';

export function useUpdateEnrollmentRequestMutation() {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateEnrollmentRequestValues) =>
            updateEnrollmentRequest(apiClient, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: SUBJECT_QUERY_KEYS.all,
            });
            toast.success(response?.message || 'Enrollment request updated successfully');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to update enrollment request');
        },
    });
}
