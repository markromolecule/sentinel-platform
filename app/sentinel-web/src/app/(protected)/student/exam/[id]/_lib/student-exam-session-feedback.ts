import { ApiError } from '@sentinel/services';

export function resolveStudentExamSessionError(error: unknown) {
    if (error instanceof ApiError) {
        const responseBody = error.body as
            | {
                  data?: {
                      error?: unknown;
                  };
                  error?: unknown;
                  message?: unknown;
              }
            | undefined;

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
