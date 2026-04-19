import { resolveExamStatus } from '@sentinel/shared';
import type {
    ExamAttemptAnswers,
    ExamAttemptScoreSummary,
    ExamQuestion,
    ExamStatus,
    InternalExamStatus,
    ProctorExam,
    StudentExamStatus,
} from '@sentinel/shared/types';
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
    sourceCollectionId?: string | null;
    sourceOrigin?: ExamQuestion['sourceOrigin'];
    sourceFileName?: string | null;
    sourcePageNumber?: number | null;
    sourceEvidence?: string | null;
    type: ExamQuestion['type'];
    points: number;
    orderIndex: number;
    content: ExamQuestion['content'];
    tags?: string[];
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
    roomId: string | null;
    roomName: string | null;
    scheduledDate: string | null;
    endDateTime: string | null;
    publishedAt: string | null;
    questionCount: number;
    createdAt: string | null;
    updatedAt: string | null;
    assigned_section_ids?: string[] | null;
}

interface ApiExamDetail extends ApiExamSummary {
    settings: NonNullable<ProctorExam['settings']>;
    configuration: NonNullable<ProctorExam['configuration']>;
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
    section?: string;
    sectionId?: string;
    sectionIds: string[];
    roomId?: string;
    startDateTime: string;
    endDateTime: string;
    durationMinutes: number;
    passingScore: number;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    randomizeChoices: boolean;
    settings?: ProctorExam['settings'];
    configuration?: ProctorExam['configuration'];
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
    sourceCollectionId?: string | null;
    sourceOrigin?: ExamQuestion['sourceOrigin'];
    sourceFileName?: string | null;
    sourcePageNumber?: number | null;
    sourceEvidence?: string | null;
    type: ExamQuestion['type'];
    points: number;
    orderIndex: number;
    content: ExamQuestion['content'];
};

export type UpdateExamPayload = Omit<
    Partial<CreateExamPayload>,
    'subjectId' | 'section' | 'sectionId' | 'roomId'
> & {
    subjectId?: string | null;
    section?: string | null;
    sectionId?: string | null;
    sectionIds?: string[] | null;
    roomId?: string | null;
    settings?: ProctorExam['settings'];
    configuration?: ProctorExam['configuration'];
    questionSections?: UpdateExamQuestionSectionPayload[];
    questions?: UpdateExamQuestionPayload[];
    status?: InternalExamStatus | StudentExamStatus;
};

export type UpdateExamStatusPayload = {
    id: string;
    status: ExamStatus;
};

export type ExamConfigurationState = {
    settings: NonNullable<ProctorExam['settings']>;
    configuration: NonNullable<ProctorExam['configuration']>;
};

export type StartExamSessionPayload = {
    examId: string;
};

export type StartExamSessionResult = {
    sessionId?: string;
    configSnapshot?: ExamConfigurationState;
    isResumed?: boolean;
    error?: string;
};

export type CompleteExamSessionPayload = {
    sessionId: string;
    answers: ExamAttemptAnswers;
    elapsedSeconds: number;
};

export type CompleteExamSessionResult = ExamAttemptScoreSummary & {
    attemptId: string;
    completedAt: string;
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
        status: resolveExamStatus({
            status: apiExam.status,
            scheduledDate: apiExam.scheduledDate,
            endDateTime: apiExam.endDateTime,
            durationMinutes: apiExam.durationMinutes,
        }),
        settings: 'settings' in apiExam ? apiExam.settings : undefined,
        configuration: 'configuration' in apiExam ? apiExam.configuration : undefined,
        questions:
            'questions' in apiExam
                ? apiExam.questions.map((question) => ({
                      id: question.id,
                      examId: question.examId,
                      sectionId: question.sectionId ?? undefined,
                      sourceQuestionBankQuestionId:
                          question.sourceQuestionBankQuestionId ?? undefined,
                      sourceCollectionId: question.sourceCollectionId ?? undefined,
                      sourceOrigin: question.sourceOrigin ?? undefined,
                      sourceFileName: question.sourceFileName ?? null,
                      sourcePageNumber: question.sourcePageNumber ?? null,
                      sourceEvidence: question.sourceEvidence ?? null,
                      type: question.type,
                      points: question.points,
                      orderIndex: question.orderIndex,
                      content: question.content,
                      tags: question.tags ?? [],
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
        sectionIds: apiExam.assigned_section_ids ?? [],
        room: apiExam.roomName ?? undefined,
        roomId: apiExam.roomId ?? undefined,
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
    const response: ApiResponse<ApiExamSummary[]> = await apiClient(
        `/exams${buildQueryString(params)}`,
    );
    return response.data.map(mapExam);
}

export async function getExam(apiClient: ApiClientType, id: string): Promise<ProctorExam> {
    const response: ApiResponse<ApiExamDetail> = await apiClient(`/exams/${id}`);
    return mapExam(response.data);
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

export async function getExamConfiguration(
    apiClient: ApiClientType,
    examId: string,
): Promise<ExamConfigurationState> {
    const response: ApiResponse<ExamConfigurationState> = await apiClient(
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
    const response: ApiResponse<ExamConfigurationState> = await apiClient(
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

export async function startExamSession(
    apiClient: ApiClientType,
    payload: StartExamSessionPayload,
): Promise<StartExamSessionResult> {
    const response: ApiResponse<StartExamSessionResult> = await apiClient(
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
    const response: ApiResponse<CompleteExamSessionResult> = await apiClient(
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
