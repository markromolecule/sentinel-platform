import type { ApiClientType } from '../../api-client';
import type {
    ApiExamResponse,
    StartExamSessionPayload,
    StartExamSessionResult,
    CompleteExamSessionPayload,
    CompleteExamSessionResult,
} from './types';

export async function startExamSession(
    apiClient: ApiClientType,
    payload: StartExamSessionPayload,
): Promise<StartExamSessionResult> {
    const response: ApiExamResponse<StartExamSessionResult> = await apiClient(
        '/examination/flow/start',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    return response.data;
}

export async function completeExamSession(
    apiClient: ApiClientType,
    payload: CompleteExamSessionPayload,
): Promise<CompleteExamSessionResult> {
    const response: ApiExamResponse<CompleteExamSessionResult> = await apiClient(
        '/examination/flow/complete',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    return response.data;
}
