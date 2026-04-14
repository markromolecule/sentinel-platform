import {
    buildClassificationError,
    INVALID_SUBJECT_CLASSIFICATION_PAYLOAD,
    SUBJECT_CLASSIFICATION_TYPES,
} from './subject-classification-errors';
import { toUniqueSubjectIds } from '../data/to-unique-subject-ids';

export type SubjectClassificationType = 'GENERAL' | 'CORE';

export type CreateSubjectClassificationPayload = {
    name: string;
    type: SubjectClassificationType;
    description?: string | null;
    subject_ids?: string[];
    department_id?: string | null;
    course_ids?: string[];
    created_by?: string | null;
    institution_id?: string | null;
};

export type UpdateSubjectClassificationPayload = Partial<{
    name: string;
    type: SubjectClassificationType;
    description: string | null;
    subject_ids: string[];
    department_id: string | null;
    course_ids: string[];
    updated_by: string | null;
}>;

function normalizeDescription(value?: string | null) {
    if (value === undefined) {
        return undefined;
    }

    const normalized = value?.trim() ?? '';
    return normalized ? normalized : null;
}

function normalizeType(value?: string) {
    if (!value) {
        return undefined;
    }

    const normalized = value.trim().toUpperCase();

    if (!SUBJECT_CLASSIFICATION_TYPES.has(normalized)) {
        throw buildClassificationError(
            'Classification type must be GENERAL or CORE',
            INVALID_SUBJECT_CLASSIFICATION_PAYLOAD,
        );
    }

    return normalized as SubjectClassificationType;
}

export function normalizeCreatePayload(data: CreateSubjectClassificationPayload) {
    const name = data.name.trim();
    const type = normalizeType(data.type);

    if (!name) {
        throw buildClassificationError(
            'Classification group name is required',
            INVALID_SUBJECT_CLASSIFICATION_PAYLOAD,
        );
    }

    if (!type) {
        throw buildClassificationError(
            'Classification type is required',
            INVALID_SUBJECT_CLASSIFICATION_PAYLOAD,
        );
    }

    return {
        name,
        type,
        description: normalizeDescription(data.description),
        subject_ids: toUniqueSubjectIds(data.subject_ids),
        department_id: data.department_id ?? null,
        course_ids: data.course_ids ? [...new Set(data.course_ids)] : [],
        created_by: data.created_by ?? null,
        institution_id: data.institution_id ?? null,
    };
}

export function normalizeUpdatePayload(data: UpdateSubjectClassificationPayload) {
    const name = data.name?.trim();
    const type = normalizeType(data.type);

    if (name !== undefined && !name) {
        throw buildClassificationError(
            'Classification group name is required',
            INVALID_SUBJECT_CLASSIFICATION_PAYLOAD,
        );
    }

    return {
        ...(name !== undefined ? { name } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(data.description !== undefined
            ? { description: normalizeDescription(data.description) }
            : {}),
        ...(data.subject_ids !== undefined
            ? { subject_ids: toUniqueSubjectIds(data.subject_ids) }
            : {}),
        ...(data.department_id !== undefined ? { department_id: data.department_id } : {}),
        ...(data.course_ids !== undefined ? { course_ids: [...new Set(data.course_ids)] } : {}),
        ...(data.updated_by !== undefined ? { updated_by: data.updated_by } : {}),
    };
}
