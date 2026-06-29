import { useQuery } from '@tanstack/react-query';
import { useApi } from '@sentinel/hooks';
import { getExam, getGradingStudents } from '@sentinel/services';

/**
 * Fetches exam detail and a flat list of students for grading.
 * Pass `search` to filter students server-side by name or student number.
 */
export function useGradingDetail(examId: string, sectionId?: string, search?: string) {
    const apiClient = useApi();

    const { data: exam, isLoading: isLoadingExam } = useQuery({
        queryKey: ['exam', examId],
        queryFn: () => getExam(apiClient, examId),
        enabled: !!examId,
    });

    const {
        data: gradingStudents,
        isLoading: isLoadingStudents,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['grading-students', examId, sectionId, search],
        queryFn: () => getGradingStudents(apiClient, examId, { sectionId, search }),
        enabled: !!examId,
    });

    return {
        exam,
        students: gradingStudents?.students ?? [],
        isLoading: isLoadingExam || isLoadingStudents,
        isError,
        refetch,
    };
}
