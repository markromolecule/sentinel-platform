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

export async function getExamHistory(apiClient: ApiClientType): Promise<ExamHistory[]> {
    const response: ApiResponse<ApiExamHistorySummary[]> = await apiClient('/history');
    return response.data.map(mapExamHistory);
}

export async function getExamHistoryDetail(
    apiClient: ApiClientType,
    attemptId: string,
): Promise<ExamHistory> {
    const response: ApiResponse<ApiExamHistoryDetail> = await apiClient(
        `/history/${attemptId}`,
    );
    return mapExamHistory(response.data);
}
