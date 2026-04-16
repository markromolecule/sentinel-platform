import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSemester } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SEMESTER_QUERY_KEYS } from '@sentinel/shared/constants';
import { SemesterInput } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export function useUpdateSemesterMutation() {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<SemesterInput> }) =>
            updateSemester(apiClient, { id, payload }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SEMESTER_QUERY_KEYS.all });
            toast.success('Semester updated successfully');
        },
        onError: (error: any) => {
            notifyPermissionDenied(error, {
                resourceName: 'semesters',
                action: 'update',
                permissionKey: 'semesters:update',
                fallbackMessage: 'Failed to update semester',
            });
        },
    });
}
