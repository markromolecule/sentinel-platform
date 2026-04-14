export const INVALID_SUBJECT_PAYLOAD_ERROR_CODE = 'INVALID_SUBJECT_PAYLOAD';
export const DUPLICATE_SUBJECT_CODE_ERROR_CODE = '23505';
export const SUBJECT_HAS_OFFERINGS_ERROR_CODE = 'SUBJECT_HAS_OFFERINGS';

export function buildSubjectError(message: string, code: string) {
    const error: any = new Error(message);
    error.code = code;
    return error;
}
