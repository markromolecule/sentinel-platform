import { useQuery } from '@tanstack/react-query';
import { getSubjects } from '@/data';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';

export function useSubjectsQuery() {
    return useQuery({
        queryKey: SUBJECT_QUERY_KEYS.all,
        queryFn: () => getSubjects(),
    });
}
