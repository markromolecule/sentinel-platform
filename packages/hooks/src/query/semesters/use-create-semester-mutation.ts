import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSemester } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SEMESTER_QUERY_KEYS } from '@sentinel/shared/constants';
import { SemesterInput } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export function useCreateSemesterMutation() {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SemesterInput) => createSemester(apiClient, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SEMESTER_QUERY_KEYS.all });
            toast.success('Semester created successfully');
        },
        onError: (error: any) => {
            notifyPermissionDenied(error, {
                resourceName: 'semesters',
                action: 'create',
                permissionKey: 'semesters:create',
                fallbackMessage: 'Failed to create semester',
            });
        },
    });
}
