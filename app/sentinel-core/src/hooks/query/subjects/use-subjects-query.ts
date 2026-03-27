import { useQuery } from '@tanstack/react-query';
import { getSubjects } from '@/data';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';

export function useSubjectsQuery(search?: string) {
    return useQuery({
        queryKey: [...SUBJECT_QUERY_KEYS.all, search],
        queryFn: () => getSubjects(search),
        placeholderData: (previousData) => previousData,
    });
}
