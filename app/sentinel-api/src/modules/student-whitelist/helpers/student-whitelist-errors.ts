const DUPLICATE_STUDENT_WHITELIST_ERROR =
    'Student whitelist record already exists for this institution';
const STUDENT_WHITELIST_UNIQUE_CONSTRAINT =
    'student_whitelist_institution_id_student_number_key';

export function throwDuplicateStudentWhitelistError(): never {
    throw new Error(DUPLICATE_STUDENT_WHITELIST_ERROR);
}

export function isDuplicateStudentWhitelistError(error: unknown) {
    const code = (error as any)?.code;
    const constraint = (error as any)?.constraint;

    return (
        (code === 'P2002' || code === '23505') &&
        (!constraint || constraint === STUDENT_WHITELIST_UNIQUE_CONSTRAINT)
    );
}
