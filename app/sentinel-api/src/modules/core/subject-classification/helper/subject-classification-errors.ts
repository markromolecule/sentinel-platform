export const INVALID_SUBJECT_CLASSIFICATION_PAYLOAD = 'INVALID_SUBJECT_CLASSIFICATION_PAYLOAD';
export const DUPLICATE_SUBJECT_CLASSIFICATION_ERROR = '23505';
export const SUBJECT_CLASSIFICATION_TYPES = new Set(['GENERAL', 'CORE']);

export function buildClassificationError(message: string, code: string) {
    const error: any = new Error(message);
    error.code = code;
    return error;
}
