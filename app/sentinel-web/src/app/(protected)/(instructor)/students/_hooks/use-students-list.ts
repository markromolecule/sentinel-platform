import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/data/api/client';
import { Student } from '@sentinel/shared/types';
import { useState } from 'react';

export function useStudentsList() {
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['instructor-students'],
        queryFn: async () => {
            const response = await apiClient('/users', {
                method: 'GET',
            });

            if (response.error) {
                throw new Error(response.error as string);
            }

            return (response.data || []) as Student[];
        },
    });

    const students = data || [];

    return {
        students,
        isLoading,
        error,
        isEnrollmentOpen,
        setIsEnrollmentOpen,
        refetch,
    };
}
