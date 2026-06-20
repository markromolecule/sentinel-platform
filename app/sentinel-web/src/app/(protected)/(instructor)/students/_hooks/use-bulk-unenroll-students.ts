'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bulkUnenrollStudents } from './student-enrollment/student-enrollment-api';

/**
 * Custom hook to perform bulk student unenrollment mutation.
 * Handles loading, success toast, and cache invalidation.
 *
 * @returns React Query mutation object
 */
export function useBulkUnenrollStudents() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (enrollmentIds: string[]) => bulkUnenrollStudents(enrollmentIds),
        onSuccess: () => {
            toast.success('Selected students removed successfully');
            queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
            queryClient.invalidateQueries({ queryKey: ['instructor-student-enrollment-detail'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to remove selected students');
        },
    });
}
