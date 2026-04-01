export function buildSubjectOfferingError(message: string, code: string) {
    const error: any = new Error(message);
    error.code = code;
    return error;
}
