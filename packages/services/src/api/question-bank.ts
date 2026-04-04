import type { CreateQuestionPayload, QuestionRecord } from './questions';
import type { ApiClientType } from '../api-client';

interface ApiResponse<T> {
    message: string;
    data: T;
}

export interface QuestionBankCollectionRecord {
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
}

export interface QuestionBankCollectionDetailRecord extends QuestionBankCollectionRecord {
    questions: QuestionRecord[];
}

export interface GetQuestionBankCollectionsParams {
    search?: string;
    institutionId?: string;
}

export interface CreateQuestionBankCollectionPayload {
    institutionId?: string;
    name: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
    questionIds?: string[];
    questions?: CreateQuestionPayload[];
}

export interface UpdateQuestionBankCollectionPayload {
    institutionId?: string;
    name?: string;
    description?: string | null;
    tags?: string[];
    isPublic?: boolean;
}

export interface MutateQuestionBankCollectionQuestionsPayload {
    questionIds?: string[];
    questions?: CreateQuestionPayload[];
}

function buildQueryString(params?: GetQuestionBankCollectionsParams) {
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

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

export async function getQuestionBankCollections(
    apiClient: ApiClientType,
    params?: GetQuestionBankCollectionsParams,
): Promise<QuestionBankCollectionRecord[]> {
    const response: ApiResponse<QuestionBankCollectionRecord[]> = await apiClient(
        `/question-bank/collections${buildQueryString(params)}`,
    );

    return response.data;
}

export async function getQuestionBankCollection(
    apiClient: ApiClientType,
    id: string,
): Promise<QuestionBankCollectionDetailRecord> {
    const response: ApiResponse<QuestionBankCollectionDetailRecord> = await apiClient(
        `/question-bank/collections/${id}`,
    );

    return response.data;
}

export async function createQuestionBankCollection(
    apiClient: ApiClientType,
    payload: CreateQuestionBankCollectionPayload,
): Promise<QuestionBankCollectionDetailRecord> {
    const response: ApiResponse<QuestionBankCollectionDetailRecord> = await apiClient(
        '/question-bank/collections',
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

export async function updateQuestionBankCollection(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: UpdateQuestionBankCollectionPayload;
    },
): Promise<QuestionBankCollectionDetailRecord> {
    const response: ApiResponse<QuestionBankCollectionDetailRecord> = await apiClient(
        `/question-bank/collections/${id}`,
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

export async function deleteQuestionBankCollection(
    apiClient: ApiClientType,
    id: string,
): Promise<void> {
    await apiClient(`/question-bank/collections/${id}`, {
        method: 'DELETE',
    });
}

export async function addQuestionBankCollectionQuestions(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: MutateQuestionBankCollectionQuestionsPayload;
    },
): Promise<QuestionBankCollectionDetailRecord> {
    const response: ApiResponse<QuestionBankCollectionDetailRecord> = await apiClient(
        `/question-bank/collections/${id}/questions`,
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

export async function removeQuestionBankCollectionQuestions(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: MutateQuestionBankCollectionQuestionsPayload;
    },
): Promise<QuestionBankCollectionDetailRecord> {
    const response: ApiResponse<QuestionBankCollectionDetailRecord> = await apiClient(
        `/question-bank/collections/${id}/questions`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    return response.data;
}
