import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '@/data';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';

// Hook to fetch all departments
export function useDepartmentsQuery(search?: string) {
    return useQuery({
        queryKey: [...DEPARTMENT_QUERY_KEYS.all, search],
        queryFn: () => getDepartments(search),
        placeholderData: (previousData) => previousData,
    });
}
