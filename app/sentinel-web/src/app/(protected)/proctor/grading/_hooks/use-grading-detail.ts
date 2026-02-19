import { MOCK_GRADING_EXAMS, MOCK_GRADING_STUDENTS } from "../_constants";

export function useGradingDetail(examId: string) {
    // In a real app, useQuery to fetch exam and students
    const exam = MOCK_GRADING_EXAMS.find((e) => e.id === examId) || MOCK_GRADING_EXAMS[0];
    const students = MOCK_GRADING_STUDENTS;

    return {
        exam,
        students,
    };
}
