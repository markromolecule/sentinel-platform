import {
    buildSubjectError,
    INVALID_SUBJECT_PAYLOAD_ERROR_CODE,
} from './subject-errors';

export type CreateSubjectCrudPayload = {
    code: string;
    title: string;
    institution_id?: string | null;
    term_id?: string | null;
    is_opened?: boolean;
    offering_start_date?: string | Date | null;
    offering_end_date?: string | Date | null;
    created_by?: string | null;
};

export type UpdateSubjectCrudPayload = {
    code?: string;
    title?: string;
    institution_id?: string | null;
    term_id?: string | null;
    is_opened?: boolean;
    offering_start_date?: string | Date | null;
    offering_end_date?: string | Date | null;
    updated_by?: string;
};

function normalizeOptionalDate(value?: string | Date | null) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    const normalized = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(normalized.getTime())) {
        throw buildSubjectError('Offering dates must be valid dates', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    return normalized;
}

export function normalizeCreatePayload(data: CreateSubjectCrudPayload) {
    const code = data.code.trim();
    const title = data.title.trim();
    const offering_start_date = normalizeOptionalDate(data.offering_start_date);
    const offering_end_date = normalizeOptionalDate(data.offering_end_date);

    if (!code || !title) {
        throw buildSubjectError('Subject code and title are required', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    if (data.is_opened && !data.term_id) {
        throw buildSubjectError(
            'Term is required when a subject is opened',
            INVALID_SUBJECT_PAYLOAD_ERROR_CODE,
        );
    }

    if (
        offering_start_date &&
        offering_end_date &&
        offering_end_date.getTime() < offering_start_date.getTime()
    ) {
        throw buildSubjectError(
            'Offering end date must be on or after the start date',
            INVALID_SUBJECT_PAYLOAD_ERROR_CODE,
        );
    }

    return {
        code,
        title,
        institution_id: data.institution_id ?? null,
        term_id: data.term_id ?? null,
        is_opened: data.is_opened ?? false,
        offering_start_date,
        offering_end_date,
        created_by: data.created_by ?? null,
    };
}

export function normalizeUpdatePayload(data: UpdateSubjectCrudPayload) {
    const code = data.code?.trim();
    const title = data.title?.trim();
    const offering_start_date = normalizeOptionalDate(data.offering_start_date);
    const offering_end_date = normalizeOptionalDate(data.offering_end_date);

    if (code !== undefined && !code) {
        throw buildSubjectError('Subject code is required', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    if (title !== undefined && !title) {
        throw buildSubjectError('Subject title is required', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    if (data.is_opened && data.term_id === null) {
        throw buildSubjectError(
            'Term is required when a subject is opened',
            INVALID_SUBJECT_PAYLOAD_ERROR_CODE,
        );
    }

    if (
        offering_start_date &&
        offering_end_date &&
        offering_end_date.getTime() < offering_start_date.getTime()
    ) {
        throw buildSubjectError(
            'Offering end date must be on or after the start date',
            INVALID_SUBJECT_PAYLOAD_ERROR_CODE,
        );
    }

    return {
        code,
        title,
        institution_id: data.institution_id,
        term_id: data.term_id,
        is_opened: data.is_opened,
        offering_start_date,
        offering_end_date,
        updated_by: data.updated_by,
    };
}
