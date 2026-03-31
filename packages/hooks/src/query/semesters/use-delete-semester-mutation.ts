import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSemester } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SEMESTER_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export function useDeleteSemesterMutation() {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteSemester(apiClient, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SEMESTER_QUERY_KEYS.all });
            toast.success('Semester deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete semester');
        },
    });
}
