import type { ExamQuestion, ExamStatus, ProctorExam } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

interface ApiResponse<T> {
    message: string;
    data: T;
}

interface ApiExamSection {
    id: string;
    title: string;
    orderIndex: number;
}

interface ApiExamQuestion {
    id: string;
    examId: string;
    sectionId?: string | null;
    sourceQuestionBankQuestionId?: string | null;
    type: ExamQuestion['type'];
    points: number;
    orderIndex: number;
    content: ExamQuestion['content'];
}

interface ApiExamSummary {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    passingScore: number;
    status: ExamStatus;
    subjectId: string | null;
    subjectTitle: string | null;
    sectionId: string | null;
    sectionName: string | null;
    scheduledDate: string | null;
    endDateTime: string | null;
    publishedAt: string | null;
    questionCount: number;
    createdAt: string | null;
    updatedAt: string | null;
}

interface ApiExamDetail extends ApiExamSummary {
    settings: NonNullable<ProctorExam['settings']>;
    questionSections: ApiExamSection[];
    questions: ApiExamQuestion[];
}

export type GetExamsParams = {
    search?: string;
    status?: ExamStatus;
    subjectId?: string;
};

export type CreateExamPayload = {
    title: string;
    description: string;
    subjectId: string;
    section: string;
    sectionId?: string;
    startDateTime: string;
    endDateTime: string;
    durationMinutes: number;
    passingScore: number;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    randomizeChoices: boolean;
};

export type UpdateExamQuestionSectionPayload = {
    id?: string;
    title: string;
    orderIndex: number;
};

export type UpdateExamQuestionPayload = {
    id?: string;
    sectionId?: string | null;
    sourceQuestionBankQuestionId?: string | null;
    type: ExamQuestion['type'];
    points: number;
    orderIndex: number;
    content: ExamQuestion['content'];
};

export type UpdateExamPayload = Partial<CreateExamPayload> & {
    subjectId?: string | null;
    section?: string | null;
    sectionId?: string | null;
    settings?: ProctorExam['settings'];
    questionSections?: UpdateExamQuestionSectionPayload[];
    questions?: UpdateExamQuestionPayload[];
};

export type UpdateExamStatusPayload = {
    id: string;
    status: ExamStatus;
};

function normalizeDateTime(value?: string | null) {
    return value ?? undefined;
}

export function mapExam(apiExam: ApiExamSummary | ApiExamDetail): ProctorExam {
    return {
        id: apiExam.id,
        title: apiExam.title,
        description: apiExam.description ?? '',
        duration: apiExam.durationMinutes,
        passingScore: apiExam.passingScore,
        status: apiExam.status,
        settings: 'settings' in apiExam ? apiExam.settings : undefined,
        questions:
            'questions' in apiExam
                ? apiExam.questions.map((question) => ({
                      id: question.id,
                      examId: question.examId,
                      sectionId: question.sectionId ?? undefined,
                      sourceQuestionBankQuestionId:
                          question.sourceQuestionBankQuestionId ?? undefined,
                      type: question.type,
                      points: question.points,
                      orderIndex: question.orderIndex,
                      content: question.content,
                  }))
                : undefined,
        questionSections:
            'questionSections' in apiExam
                ? apiExam.questionSections.map((section) => ({
                      ...section,
                      isCollapsed: false,
                  }))
                : undefined,
        createdAt: normalizeDateTime(apiExam.createdAt) ?? new Date().toISOString(),
        updatedAt: normalizeDateTime(apiExam.updatedAt) ?? new Date().toISOString(),
        publishedAt: normalizeDateTime(apiExam.publishedAt),
        subject: apiExam.subjectTitle ?? 'Untitled Subject',
        subjectId: apiExam.subjectId ?? undefined,
        section: apiExam.sectionName ?? undefined,
        scheduledDate: normalizeDateTime(apiExam.scheduledDate),
        endDateTime: normalizeDateTime(apiExam.endDateTime),
        questionCount: apiExam.questionCount,
        studentsCount: 0,
    };
}

function buildQueryString(params?: GetExamsParams) {
    if (!params) {
        return '';
    }

    const searchParams = new URLSearchParams();

    if (params.search) {
        searchParams.set('search', params.search);
    }

    if (params.status) {
        searchParams.set('status', params.status);
    }

    if (params.subjectId) {
        searchParams.set('subjectId', params.subjectId);
    }

    const query = searchParams.toString();
    return query ? `?${query}` : '';
}

export async function getExams(
    apiClient: ApiClientType,
    params?: GetExamsParams,
): Promise<ProctorExam[]> {
    const response: ApiResponse<ApiExamSummary[]> = await apiClient(`/exams${buildQueryString(params)}`);
    return response.data.map(mapExam);
}

export async function createExam(
    apiClient: ApiClientType,
    payload: CreateExamPayload,
): Promise<ProctorExam> {
    const response: ApiResponse<ApiExamDetail> = await apiClient('/exams', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapExam(response.data);
}

export async function updateExam(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: UpdateExamPayload;
    },
): Promise<ProctorExam> {
    const response: ApiResponse<ApiExamDetail> = await apiClient(`/exams/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapExam(response.data);
}

export async function deleteExam(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/exams/${id}`, {
        method: 'DELETE',
    });
}

export async function updateExamStatus(
    apiClient: ApiClientType,
    payload: UpdateExamStatusPayload,
): Promise<ProctorExam> {
    const response: ApiResponse<ApiExamDetail> = await apiClient(`/exams/${payload.id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            status: payload.status,
        }),
    });

    return mapExam(response.data);
}
