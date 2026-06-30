import type { ApiClientType } from '../api-client';
import type {
    CreateFeedbackSchemaValues,
    FeedbackPage,
    FeedbackRecord,
    GetFeedbacksQuery,
} from '@sentinel/shared/schema';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export function buildFeedbacksQueryString(params?: Partial<GetFeedbacksQuery>): string {
    if (!params) {
        return '';
    }

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === '') {
            continue;
        }

        searchParams.set(key, String(value));
    }

    const query = searchParams.toString();
    return query ? `?${query}` : '';
}

export async function createFeedback(
    apiClient: ApiClientType,
    payload: CreateFeedbackSchemaValues,
): Promise<FeedbackRecord> {
    const response: ApiResponse<FeedbackRecord> = await apiClient('/feedbacks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.data;
}

export async function getFeedbacks(
    apiClient: ApiClientType,
    params?: Partial<GetFeedbacksQuery>,
): Promise<FeedbackPage> {
    const response: ApiResponse<FeedbackPage> = await apiClient(
        `/feedbacks${buildFeedbacksQueryString(params)}`,
    );

    return response.data;
}

export async function getFeedback(
    apiClient: ApiClientType,
    feedbackId: string,
): Promise<FeedbackRecord> {
    const response: ApiResponse<FeedbackRecord> = await apiClient(`/feedbacks/${feedbackId}`);
    return response.data;
}

export type { CreateFeedbackSchemaValues, FeedbackPage, FeedbackRecord, GetFeedbacksQuery };
