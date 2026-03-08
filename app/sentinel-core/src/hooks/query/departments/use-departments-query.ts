import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '@/data';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';

// Hook to fetch all departments
export function useDepartmentsQuery() {
    return useQuery({
        queryKey: DEPARTMENT_QUERY_KEYS.all,
        queryFn: () => getDepartments(),
    });
}
