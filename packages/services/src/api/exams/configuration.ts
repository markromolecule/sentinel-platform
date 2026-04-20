import type { ApiClientType } from '../../api-client';
import type { ApiExamResponse, ExamConfigurationState } from './types';

export async function getExamConfiguration(
    apiClient: ApiClientType,
    examId: string,
): Promise<ExamConfigurationState> {
    const response: ApiExamResponse<ExamConfigurationState> = await apiClient(
        `/configuration/exams/${examId}`,
    );

    return response.data;
}

export async function updateExamConfiguration(
    apiClient: ApiClientType,
    {
        examId,
        payload,
    }: {
        examId: string;
        payload: Partial<ExamConfigurationState>;
    },
): Promise<ExamConfigurationState> {
    const response: ApiExamResponse<ExamConfigurationState> = await apiClient(
        `/configuration/exams/${examId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    return response.data;
}
