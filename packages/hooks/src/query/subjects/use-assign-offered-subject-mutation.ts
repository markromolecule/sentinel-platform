import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignOfferedSubject } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_OFFERING_QUERY_KEYS, SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export function useAssignOfferedSubjectMutation() {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { instructorId: string; subjectOfferingId: string }) =>
            assignOfferedSubject(apiClient, payload),

        onSuccess: (response: any) => {
            queryClient.invalidateQueries({
                queryKey: SUBJECT_QUERY_KEYS.all,
            });
            queryClient.invalidateQueries({
                queryKey: SUBJECT_OFFERING_QUERY_KEYS.all,
            });
            const message = response?.message || 'Successfully assigned offered subject to instructor.';
            toast.success(message);
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to assign offered subject to instructor.');
        },
    });
}
