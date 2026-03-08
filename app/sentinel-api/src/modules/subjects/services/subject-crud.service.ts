import { type DbClient } from '@/lib/create-db-client';
import { createSubjectData } from '../data/create-subject';
import { deleteSubjectData } from '../data/delete-subject';
import { getSubjectByCodeData } from '../data/get-subject-by-code';
import { getSubjectByIdData } from '../data/get-subject-by-id';
import { getSubjectsData } from '../data/get-subjects';
import { updateSubjectData } from '../data/update-subject';

const INVALID_SUBJECT_PAYLOAD_ERROR_CODE = 'INVALID_SUBJECT_PAYLOAD';
const DUPLICATE_SUBJECT_CODE_ERROR_CODE = '23505';

type CreateSubjectCrudPayload = {
    code: string;
    title: string;
    created_by?: string | null;
};

type UpdateSubjectCrudPayload = {
    code?: string;
    title?: string;
    updated_by?: string;
};

function buildError(message: string, code: string) {
    const error: any = new Error(message);
    error.code = code;
    return error;
}

function normalizeCreatePayload(data: CreateSubjectCrudPayload) {
    const code = data.code.trim();
    const title = data.title.trim();

    if (!code || !title) {
        throw buildError('Subject code and title are required', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    return {
        code,
        title,
        created_by: data.created_by ?? null,
    };
}

function normalizeUpdatePayload(data: UpdateSubjectCrudPayload) {
    const code = data.code?.trim();
    const title = data.title?.trim();

    if (code !== undefined && !code) {
        throw buildError('Subject code is required', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    if (title !== undefined && !title) {
        throw buildError('Subject title is required', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    return {
        code,
        title,
        updated_by: data.updated_by,
    };
}

export class SubjectCrudService {
    private static async ensureSubjectCodeAvailable(
        dbClient: DbClient,
        code: string,
        excludeId?: string,
    ) {
        const existingSubject = await getSubjectByCodeData({
            dbClient,
            code,
            excludeId,
        });

        if (existingSubject) {
            throw buildError('Subject code already exists', DUPLICATE_SUBJECT_CODE_ERROR_CODE);
        }
    }

    static async getSubjects(dbClient: DbClient) {
        return await getSubjectsData({ dbClient });
    }

    static async getSubjectById(dbClient: DbClient, id: string) {
        return await getSubjectByIdData({
            dbClient,
            id,
        });
    }

    static async createSubject(dbClient: DbClient, data: CreateSubjectCrudPayload) {
        const payload = normalizeCreatePayload(data);
        await SubjectCrudService.ensureSubjectCodeAvailable(dbClient, payload.code);

        return await createSubjectData({
            dbClient,
            values: {
                subject_code: payload.code,
                subject_title: payload.title,
                created_by: payload.created_by,
            },
        });
    }

    static async updateSubject(dbClient: DbClient, id: string, data: UpdateSubjectCrudPayload) {
        const payload = normalizeUpdatePayload(data);

        if (payload.code) {
            await SubjectCrudService.ensureSubjectCodeAvailable(dbClient, payload.code, id);
        }

        return await updateSubjectData({
            dbClient,
            id,
            values: {
                ...(payload.code !== undefined ? { subject_code: payload.code } : {}),
                ...(payload.title !== undefined ? { subject_title: payload.title } : {}),
                updated_by: payload.updated_by,
                updated_at: new Date().toISOString(),
            },
        });
    }

    static async deleteSubject(dbClient: DbClient, id: string) {
        return await deleteSubjectData({
            dbClient,
            id,
        });
    }
}
