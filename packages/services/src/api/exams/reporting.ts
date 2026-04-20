import type { ExamReport } from '@sentinel/shared/types';
import type { ApiClientType } from '../../api-client';
import { mapExamReportStudent, mapExamReportActionItem } from './mappers';
import type { ApiExamResponse, ApiExamReport } from './types';

export async function getExamReport(apiClient: ApiClientType, examId: string): Promise<ExamReport> {
    const response: ApiExamResponse<ApiExamReport> = await apiClient(`/exams/${examId}/report`);

    return {
        exam: {
            id: response.data.exam.id,
            title: response.data.exam.title,
            subject: response.data.exam.subject,
            scheduledDate: response.data.exam.scheduledDate ?? null,
            endDateTime: response.data.exam.endDateTime ?? null,
            durationMinutes: response.data.exam.durationMinutes,
            passingScore: response.data.exam.passingScore,
        },
        summary: response.data.summary,
        students: response.data.students.map(mapExamReportStudent),
        actionItems: {
            review: response.data.actionItems.review.map(mapExamReportActionItem),
            makeup: response.data.actionItems.makeup.map(mapExamReportActionItem),
            retake: response.data.actionItems.retake.map(mapExamReportActionItem),
        },
    };
}
