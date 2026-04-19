import type { GradingExam, GradingStudent } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

interface ApiResponse<T> {
    message: string;
    data: T;
}

export type GetGradingExamsParams = {
    sectionId?: string;
};

export type GetGradingStudentsParams = {
    sectionId?: string;
};

function buildGradingQueryString(params?: GetGradingExamsParams | GetGradingStudentsParams) {
    if (!params) {
        return '';
    }
    const searchParams = new URLSearchParams();
    if (params.sectionId) {
        searchParams.set('sectionId', params.sectionId);
    }
    const query = searchParams.toString();
    return query ? `?${query}` : '';
}

export async function getGradingExams(
    apiClient: ApiClientType,
    params?: GetGradingExamsParams,
): Promise<GradingExam[]> {
    const response: ApiResponse<GradingExam[]> = await apiClient(
        `/grading${buildGradingQueryString(params)}`,
    );
    return response.data;
}

export async function getGradingStudents(
    apiClient: ApiClientType,
    examId: string,
    params?: GetGradingStudentsParams,
): Promise<GradingStudent[]> {
    const response: ApiResponse<GradingStudent[]> = await apiClient(
        `/grading/${examId}/students${buildGradingQueryString(params)}`,
    );
    return response.data;
}
