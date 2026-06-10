import type {
    ExamQuestionContent,
    QuestionDifficulty,
    QuestionSourceOrigin,
    QuestionType,
} from '@sentinel/shared/types';
import type { QuestionBankStatus } from '@sentinel/shared';
import type { ApiClientType } from '../api-client';

interface ApiResponse<T> {
    message: string;
    data: T;
}

export interface QuestionRecord {
    id: string;
    subjectId: string | null;
    institutionId: string | null;
    sourceOrigin: QuestionSourceOrigin;
    sourceFileName: string | null;
    sourcePageNumber: number | null;
    sourceEvidence: string | null;
    type: QuestionType;
    difficulty: QuestionDifficulty;
    points: number;
    tags: string[];
    content: ExamQuestionContent;
    prompt: string | null;
    createdAt: string | Date | null;
    updatedAt: string | Date | null;
    createdBy: string | null;
    updatedBy: string | null;
    status: QuestionBankStatus;
}

export interface GetQuestionsParams {
    search?: string;
    type?: QuestionType;
    difficulty?: QuestionDifficulty;
    subjectId?: string;
    institutionId?: string;
    collectionId?: string;
    status?: QuestionBankStatus;
    page?: number;
    pageSize?: number;
}

export interface QuestionPageRecord {
    items: QuestionRecord[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface CreateQuestionPayload {
    subjectId?: string;
    institutionId?: string;
    sourceOrigin?: QuestionSourceOrigin;
    sourceFileName?: string | null;
    sourcePageNumber?: number | null;
    sourceEvidence?: string | null;
    type: QuestionType;
    difficulty?: QuestionDifficulty;
    points: number;
    tags?: string[];
    content: ExamQuestionContent;
}

export interface UpdateQuestionPayload {
    subjectId?: string | null;
    institutionId?: string;
    sourceOrigin?: QuestionSourceOrigin;
    sourceFileName?: string | null;
    sourcePageNumber?: number | null;
    sourceEvidence?: string | null;
    type?: QuestionType;
    difficulty?: QuestionDifficulty;
    points?: number;
    tags?: string[];
    content?: ExamQuestionContent;
    status?: QuestionBankStatus;
}

function buildQueryString(params?: GetQuestionsParams) {
    if (!params) {
        return '';
    }

    const searchParams = new URLSearchParams();

    if (params.search) {
        searchParams.set('search', params.search);
    }

    if (params.type) {
        searchParams.set('type', params.type);
    }

    if (params.difficulty) {
        searchParams.set('difficulty', params.difficulty);
    }

    if (params.subjectId) {
        searchParams.set('subjectId', params.subjectId);
    }

    if (params.institutionId) {
        searchParams.set('institutionId', params.institutionId);
    }

    if (params.collectionId) {
        searchParams.set('collectionId', params.collectionId);
    }

    if (params.status) {
        searchParams.set('status', params.status);
    }

    if (params.page) {
        searchParams.set('page', params.page.toString());
    }

    if (params.pageSize) {
        searchParams.set('pageSize', params.pageSize.toString());
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

export async function getQuestions(
    apiClient: ApiClientType,
    params?: GetQuestionsParams,
): Promise<QuestionPageRecord> {
    const response: ApiResponse<QuestionPageRecord> = await apiClient(
        `/questions${buildQueryString(params)}`,
    );
    return response.data;
}

export async function getQuestion(apiClient: ApiClientType, id: string): Promise<QuestionRecord> {
    const response: ApiResponse<QuestionRecord> = await apiClient(`/questions/${id}`);
    return response.data;
}

export async function createQuestion(
    apiClient: ApiClientType,
    payload: CreateQuestionPayload,
): Promise<QuestionRecord> {
    const response: ApiResponse<QuestionRecord> = await apiClient('/questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.data;
}

export async function updateQuestion(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: UpdateQuestionPayload;
    },
): Promise<QuestionRecord> {
    const response: ApiResponse<QuestionRecord> = await apiClient(`/questions/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.data;
}

export async function deleteQuestion(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/questions/${id}`, {
        method: 'DELETE',
    });
}
