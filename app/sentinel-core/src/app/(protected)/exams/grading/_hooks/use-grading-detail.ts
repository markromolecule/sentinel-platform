import { useQuery } from '@tanstack/react-query';
import { useApi } from '@sentinel/hooks';
import { getExam, getGradingStudents } from '@sentinel/services';

export function useGradingDetail(examId: string, sectionId?: string) {
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
        queryKey: ['grading-students', examId, sectionId],
        queryFn: () => getGradingStudents(apiClient, examId, { sectionId }),
        enabled: !!examId,
    });

    return {
        exam,
        students: gradingStudents?.students ?? [],
        studentSections: gradingStudents?.sections ?? [],
        isLoading: isLoadingExam || isLoadingStudents,
        isError,
        refetch,
    };
}
