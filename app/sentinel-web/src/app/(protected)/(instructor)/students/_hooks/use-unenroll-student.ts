'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { unenrollStudent } from './student-enrollment/student-enrollment-api';

export function useUnenrollStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (enrollmentId: string) => unenrollStudent(enrollmentId),
        onSuccess: () => {
            toast.success('Student removed successfully');
            queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
            queryClient.invalidateQueries({ queryKey: ['instructor-student-enrollment-detail'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to remove student');
        },
    });
}
