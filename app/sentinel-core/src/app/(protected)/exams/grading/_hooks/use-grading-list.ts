import { useQuery } from '@tanstack/react-query';
import { useApi } from '@sentinel/hooks';
import { getGradingExams } from '@sentinel/services';

export function useGradingList(sectionId?: string) {
    const apiClient = useApi();

    const {
        data: exams = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['grading-exams', sectionId],
        queryFn: () => getGradingExams(apiClient, { sectionId }),
    });

    return {
        exams,
        isLoading,
        isError,
        refetch,
    };
}
