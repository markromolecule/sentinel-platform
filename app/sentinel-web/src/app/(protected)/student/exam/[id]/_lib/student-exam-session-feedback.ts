import { ApiError } from '@sentinel/services';

type StudentExamSessionErrorPayload = {
    data?: {
        error?: unknown;
        errorCode?: unknown;
        attemptId?: unknown;
    };
    error?: unknown;
    message?: unknown;
};

function getStudentExamSessionErrorPayload(error: unknown): StudentExamSessionErrorPayload | null {
    if (!(error instanceof ApiError)) {
        return null;
    }

    const responseBody = error.body as StudentExamSessionErrorPayload | undefined;
    return responseBody ?? null;
}

export function getStudentExamSessionErrorCode(error: unknown) {
    const payload = getStudentExamSessionErrorPayload(error);

    return typeof payload?.data?.errorCode === 'string' ? payload.data.errorCode : null;
}

export function getStudentExamSessionAttemptId(error: unknown) {
    const payload = getStudentExamSessionErrorPayload(error);

    return typeof payload?.data?.attemptId === 'string' ? payload.data.attemptId : null;
}

export function isStudentExamAlreadyTurnedInError(error: unknown) {
    return getStudentExamSessionErrorCode(error) === 'ATTEMPT_ALREADY_COMPLETED';
}

export function resolveStudentExamSessionError(error: unknown) {
    if (error instanceof ApiError) {
        const responseBody = getStudentExamSessionErrorPayload(error);

        if (typeof responseBody?.data?.error === 'string' && responseBody.data.error.length > 0) {
            return responseBody.data.error;
        }

        if (typeof responseBody?.error === 'string' && responseBody.error.length > 0) {
            return responseBody.error;
        }

        if (typeof responseBody?.message === 'string' && responseBody.message.length > 0) {
            return responseBody.message;
        }
    }

    if (error instanceof Error && error.message.length > 0) {
        return error.message;
    }

    return 'Failed to prepare the exam session.';
}
