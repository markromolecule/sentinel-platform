import type { ApiClientType } from '../api-client';

interface ApiResponse<T> {
    message: string;
    data: T;
}

export interface QuestionCollectionRecord {
    id: string;
    institutionId: string | null;
    name: string;
    description: string | null;
    tags: string[];
    isPublic: boolean;
    questionCount: number;
    questionIds: string[];
    createdAt: string | Date | null;
    updatedAt: string | Date | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdById: string | null;
    updatedById: string | null;
    creatorFirstName?: string | null;
    creatorLastName?: string | null;
}

export interface QuestionCollectionPageRecord {
    items: QuestionCollectionRecord[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface GetQuestionCollectionsParams {
    search?: string;
    institutionId?: string;
    page?: number;
    pageSize?: number;
}

function buildQueryString(params?: GetQuestionCollectionsParams) {
    if (!params) {
        return '';
    }

    const searchParams = new URLSearchParams();

    if (params.search) {
        searchParams.set('search', params.search);
    }

    if (params.institutionId) {
        searchParams.set('institutionId', params.institutionId);
    }

    if (params.page !== undefined) {
        searchParams.set('page', params.page.toString());
    }

    if (params.pageSize !== undefined) {
        searchParams.set('pageSize', params.pageSize.toString());
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Fetches question collections with server-side pagination metadata.
 */
export async function getQuestionCollections(
    apiClient: ApiClientType,
    params?: GetQuestionCollectionsParams,
): Promise<QuestionCollectionPageRecord> {
    const response: ApiResponse<QuestionCollectionPageRecord> = await apiClient(
        `/question-collection/collections${buildQueryString(params)}`,
    );

    return response.data;
}
