import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollInstructorSubject } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import type { InstructorSubjectRequestValues } from '@sentinel/shared/schema';
import { toast } from 'sonner';

export function useEnrollSubjectMutation() {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: InstructorSubjectRequestValues) =>
            enrollInstructorSubject(apiClient, payload),

        onSuccess: (response: any) => {
            queryClient.invalidateQueries({
                queryKey: SUBJECT_QUERY_KEYS.all,
            });
            const message = response?.message || 'Enrollment request submitted for approval';
            toast.success(message);
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to submit enrollment request');
        },
    });
}
