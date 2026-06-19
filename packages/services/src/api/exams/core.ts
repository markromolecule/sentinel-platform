import type { ProctorExam } from '@sentinel/shared/types';
import type { ApiClientType } from '../../api-client';
import { mapExam } from './mappers';
import type {
    ApiExamResponse,
    ApiExamSummary,
    ApiExamDetail,
    ApiStudentExamAccessOverride,
    GetExamsParams,
    CreateExamPayload,
    CreateStudentExamAccessOverridePayload,
    OverrideReconnectLimitPayload,
    UpdateExamPayload,
    UpdateExamRuntimeAccessPayload,
    UpdateExamStatusPayload,
} from './types';

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

    if (params.classroomId) {
        searchParams.set('classroomId', params.classroomId);
    }

    if (params.institutionId) {
        searchParams.set('institutionId', params.institutionId);
    }

    const query = searchParams.toString();
    return query ? `?${query}` : '';
}

export async function getExams(
    apiClient: ApiClientType,
    params?: GetExamsParams,
): Promise<ProctorExam[]> {
    const response: ApiExamResponse<ApiExamSummary[]> = await apiClient(
        `/exams${buildQueryString(params)}`,
    );
    return response.data.map(mapExam);
}

export async function getExam(apiClient: ApiClientType, id: string): Promise<ProctorExam> {
    const response: ApiExamResponse<ApiExamDetail> = await apiClient(`/exams/${id}`);
    return mapExam(response.data);
}

export async function createExam(
    apiClient: ApiClientType,
    payload: CreateExamPayload,
): Promise<ProctorExam> {
    const response: ApiExamResponse<ApiExamDetail> = await apiClient('/exams', {
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
    const response: ApiExamResponse<ApiExamDetail> = await apiClient(`/exams/${id}`, {
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
    const response: ApiExamResponse<ApiExamDetail> = await apiClient(
        `/exams/${payload.id}/status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: payload.status,
            }),
        },
    );

    return mapExam(response.data);
}

export async function updateExamRuntimeAccess(
    apiClient: ApiClientType,
    payload: UpdateExamRuntimeAccessPayload,
) {
    const response: ApiExamResponse<NonNullable<ProctorExam['runtimeAccess']>> = await apiClient(
        `/exams/${payload.id}/runtime-access`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                state: payload.state,
                reopenedUntil: payload.reopenedUntil ?? null,
            }),
        },
    );

    return response.data;
}

export async function createStudentExamAccessOverride(
    apiClient: ApiClientType,
    payload: CreateStudentExamAccessOverridePayload,
) {
    const response: ApiExamResponse<ApiStudentExamAccessOverride> = await apiClient(
        `/exams/${payload.id}/student-overrides`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                studentId: payload.studentId,
                overrideType: payload.overrideType,
                availableFrom: payload.availableFrom,
                availableUntil: payload.availableUntil,
                allowedAttempts: payload.allowedAttempts ?? 1,
                sourceAttemptId: payload.sourceAttemptId ?? null,
                notes: payload.notes ?? null,
            }),
        },
    );

    return response.data;
}

export async function overrideReconnectLimit(
    apiClient: ApiClientType,
    payload: OverrideReconnectLimitPayload,
) {
    const response: ApiExamResponse<ApiStudentExamAccessOverride> = await apiClient(
        `/exams/${payload.id}/student-overrides/reconnect-override/${payload.studentId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reason: payload.reason ?? undefined,
            }),
        },
    );

    return response.data;
}
