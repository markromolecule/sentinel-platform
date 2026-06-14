import { useQuery } from '@tanstack/react-query';
import { getExamSectionAssignments } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

/**
 * Hook to query exam section assignments.
 *
 * @param examId - UUID of the exam.
 * @returns Query object with exam section assignments.
 */
export function useExamSectionAssignmentsQuery(examId: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: EXAM_QUERY_KEYS.sectionAssignments(examId),
        queryFn: () => getExamSectionAssignments(apiClient, examId),
        enabled: isAuthenticatedQueryEnabled && !!examId,
    });
}
