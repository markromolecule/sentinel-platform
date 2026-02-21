import { MOCK_GRADING_EXAMS } from '@sentinel/shared/constants';;

export function useGradingList() {
    // In a real app, useQuery to fetch exams
    const exams = MOCK_GRADING_EXAMS;

    return {
        exams,
    };
}
