import { type ExamHistory } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

interface ApiResponse<T> {
    message: string;
    data: T;
}

interface ApiExamHistorySummary {
    id: string;
    attemptId: string | null;
    examId: string;
    examTitle: string;
    subject: string;
    sectionName: string | null;
    status: 'upcoming' | 'past_due' | 'turned_in';
    result: 'passed' | 'failed' | null;
    availableAt: string | null;
    dueAt: string | null;
    completedAt: string | null;
    score: number | null;
    totalScore: number | null;
    percentage: number | null;
    timeSpent: number | null;
    cheated: boolean;
    cheatingType: ExamHistory['cheatingType'];
    incidentCount: number;
}

interface ApiExamHistoryDetail extends ApiExamHistorySummary {
    durationMinutes: number;
    passingScore: number;
    roomName: string | null;
}

function mapExamHistory(apiItem: ApiExamHistorySummary | ApiExamHistoryDetail): ExamHistory {
    return {
        id: apiItem.id,
        attemptId: apiItem.attemptId,
        examId: apiItem.examId,
        examTitle: apiItem.examTitle,
        subject: apiItem.subject,
        sectionName: apiItem.sectionName,
        status: apiItem.status,
        result: apiItem.result,
        availableAt: apiItem.availableAt,
        dueAt: apiItem.dueAt,
        completedAt: apiItem.completedAt,
        score: apiItem.score,
        totalScore: apiItem.totalScore,
        percentage: apiItem.percentage,
        timeSpent: apiItem.timeSpent,
        cheated: apiItem.cheated,
        cheatingType: apiItem.cheatingType ?? null,
        incidentCount: apiItem.incidentCount,
        durationMinutes: 'durationMinutes' in apiItem ? apiItem.durationMinutes : undefined,
        passingScore: 'passingScore' in apiItem ? apiItem.passingScore : undefined,
        roomName: 'roomName' in apiItem ? apiItem.roomName : undefined,
    };
}

export interface GetExamHistoryParams {
    page?: number;
    limit?: number;
    status?: 'turned_in' | 'past_due';
    search?: string;
}

export interface GetExamHistoryResponse {
    items: ExamHistory[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}

export async function getExamHistory(
    apiClient: ApiClientType,
    params?: GetExamHistoryParams,
): Promise<GetExamHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.set('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params?.status !== undefined) queryParams.set('status', params.status);
    if (params?.search !== undefined) queryParams.set('search', params.search);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response: ApiResponse<ApiExamHistorySummary[]> & {
        pagination: { page: number; limit: number; total: number; hasMore: boolean };
    } = await apiClient(`/history${queryString}`);

    return {
        items: response.data.map(mapExamHistory),
        pagination: response.pagination,
    };
}

export async function getExamHistoryDetail(
    apiClient: ApiClientType,
    attemptId: string,
): Promise<ExamHistory> {
    const response: ApiResponse<ApiExamHistoryDetail> = await apiClient(`/history/${attemptId}`);
    return mapExamHistory(response.data);
}
