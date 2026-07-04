import type { ExamReport, ProctorExam } from '@sentinel/shared/types';
import type { AttemptGradingDetailType, GradingQuestionType } from '@sentinel/shared';
import type { ApiClientType } from '../../api-client';
import { mapExamReportStudent, mapExamReportActionItem, mapExam } from './mappers';
import type {
    ApiExamResponse,
    ApiExamReport,
    GetExamReportParams,
    GetExamReportsParams,
    ApiExamSummary,
    ApiExamReportStudentsPagination,
} from './types';

export async function getExamReportsList(
    apiClient: ApiClientType,
    params?: GetExamReportsParams,
): Promise<{ data: ProctorExam[]; meta: ApiExamReportStudentsPagination }> {
    const searchParams = new URLSearchParams();

    if (params?.page !== undefined) {
        searchParams.set('page', String(params.page));
    }

    if (params?.limit !== undefined) {
        searchParams.set('limit', String(params.limit));
    }

    if (params?.search) {
        searchParams.set('search', params.search);
    }

    const query = searchParams.toString();
    const queryString = query ? `?${query}` : '';

    const response: ApiExamResponse<ApiExamSummary[]> & {
        meta: { total: number; page: number; limit: number; totalPages: number };
    } = await apiClient(`/exams/reports${queryString}`);

    return {
        data: response.data.map(mapExam),
        meta: {
            page: response.meta.page,
            pageSize: response.meta.limit,
            total: response.meta.total,
            totalPages: response.meta.totalPages,
            hasMore: response.meta.page < response.meta.totalPages,
        },
    };
}

function buildExamReportQueryString(params?: GetExamReportParams) {
    if (!params) {
        return '';
    }

    const searchParams = new URLSearchParams();

    if (params.search) {
        searchParams.set('search', params.search);
    }

    if (params.sectionId) {
        searchParams.set('sectionId', params.sectionId);
    }

    if (params.page !== undefined) {
        searchParams.set('page', String(params.page));
    }

    if (params.pageSize !== undefined) {
        searchParams.set('pageSize', String(params.pageSize));
    }

    const query = searchParams.toString();

    return query ? `?${query}` : '';
}

export async function getExamReport(
    apiClient: ApiClientType,
    examId: string,
    params?: GetExamReportParams,
): Promise<ExamReport> {
    const response: ApiExamResponse<ApiExamReport> = await apiClient(
        `/exams/${examId}/report${buildExamReportQueryString(params)}`,
    );

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
        sections: response.data.sections,
        students: response.data.students.map(mapExamReportStudent),
        studentsPagination: response.data.studentsPagination,
        actionItems: {
            review: response.data.actionItems.review.map(mapExamReportActionItem),
            makeup: response.data.actionItems.makeup.map(mapExamReportActionItem),
            retake: response.data.actionItems.retake.map(mapExamReportActionItem),
        },
    };
}

export interface AttemptReport {
    attempt: AttemptGradingDetailType;
    questions: GradingQuestionType[];
}

export async function getAttemptReport(
    apiClient: ApiClientType,
    attemptId: string,
): Promise<AttemptReport> {
    const response: ApiExamResponse<AttemptReport> = await apiClient(
        `/exams/attempts/${attemptId}/report`,
    );

    return response.data;
}
