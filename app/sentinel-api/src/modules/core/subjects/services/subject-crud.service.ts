import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { createSubjectData } from '../data/create-subject';
import { deleteSubjectData } from '../data/delete-subject';
import { deleteSelectedSubjectsData } from '../data/delete-selected-subjects';
import { getSubjectByCodeData } from '../data/get-subject-by-code';
import { getSubjectByIdData } from '../data/get-subject-by-id';
import { getSubjectsData } from '../data/get-subjects';
import { updateSubjectData } from '../data/update-subject';
import {
    isMissingSubjectOfferingColumnError,
    supportsSubjectOfferingFields,
} from '../helper/subject-offering-compat';
import { supportsSubjectOfferingTables } from '@/modules/core/subject-offerings/helper/subject-offering-compat';

const INVALID_SUBJECT_PAYLOAD_ERROR_CODE = 'INVALID_SUBJECT_PAYLOAD';
const DUPLICATE_SUBJECT_CODE_ERROR_CODE = '23505';
const SUBJECT_HAS_OFFERINGS_ERROR_CODE = 'SUBJECT_HAS_OFFERINGS';

type CreateSubjectCrudPayload = {
    code: string;
    title: string;
    term_id?: string | null;
    is_opened?: boolean;
    offering_start_date?: string | Date | null;
    offering_end_date?: string | Date | null;
    created_by?: string | null;
};

type UpdateSubjectCrudPayload = {
    code?: string;
    title?: string;
    term_id?: string | null;
    is_opened?: boolean;
    offering_start_date?: string | Date | null;
    offering_end_date?: string | Date | null;
    updated_by?: string;
};

function buildError(message: string, code: string) {
    const error: any = new Error(message);
    error.code = code;
    return error;
}

function normalizeOptionalDate(value?: string | Date | null) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    const normalized = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(normalized.getTime())) {
        throw buildError('Offering dates must be valid dates', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    return normalized;
}

function normalizeCreatePayload(data: CreateSubjectCrudPayload) {
    const code = data.code.trim();
    const title = data.title.trim();
    const offering_start_date = normalizeOptionalDate(data.offering_start_date);
    const offering_end_date = normalizeOptionalDate(data.offering_end_date);

    if (!code || !title) {
        throw buildError('Subject code and title are required', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    if (data.is_opened && !data.term_id) {
        throw buildError(
            'Term is required when a subject is opened',
            INVALID_SUBJECT_PAYLOAD_ERROR_CODE,
        );
    }

    if (
        offering_start_date &&
        offering_end_date &&
        offering_end_date.getTime() < offering_start_date.getTime()
    ) {
        throw buildError(
            'Offering end date must be on or after the start date',
            INVALID_SUBJECT_PAYLOAD_ERROR_CODE,
        );
    }

    return {
        code,
        title,
        term_id: data.term_id ?? null,
        is_opened: data.is_opened ?? false,
        offering_start_date,
        offering_end_date,
        created_by: data.created_by ?? null,
    };
}

function normalizeUpdatePayload(data: UpdateSubjectCrudPayload) {
    const code = data.code?.trim();
    const title = data.title?.trim();
    const offering_start_date = normalizeOptionalDate(data.offering_start_date);
    const offering_end_date = normalizeOptionalDate(data.offering_end_date);

    if (code !== undefined && !code) {
        throw buildError('Subject code is required', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    if (title !== undefined && !title) {
        throw buildError('Subject title is required', INVALID_SUBJECT_PAYLOAD_ERROR_CODE);
    }

    if (data.is_opened && data.term_id === null) {
        throw buildError(
            'Term is required when a subject is opened',
            INVALID_SUBJECT_PAYLOAD_ERROR_CODE,
        );
    }

    if (
        offering_start_date &&
        offering_end_date &&
        offering_end_date.getTime() < offering_start_date.getTime()
    ) {
        throw buildError(
            'Offering end date must be on or after the start date',
            INVALID_SUBJECT_PAYLOAD_ERROR_CODE,
        );
    }

    return {
        code,
        title,
        term_id: data.term_id,
        is_opened: data.is_opened,
        offering_start_date,
        offering_end_date,
        updated_by: data.updated_by,
    };
}

function mapSubjectRecord(subject: any) {
    return {
        ...subject,
        term_id: subject.term_id ?? null,
        is_opened: subject.is_opened ?? false,
        offering_start_date: subject.offering_start_date ?? null,
        offering_end_date: subject.offering_end_date ?? null,
        created_by: subject.creator_first_name
            ? `${subject.creator_first_name} ${subject.creator_last_name}`
            : subject.created_by,
        updated_by: subject.updater_first_name
            ? `${subject.updater_first_name} ${subject.updater_last_name}`
            : subject.updated_by,
        creator_first_name: undefined,
        creator_last_name: undefined,
        updater_first_name: undefined,
        updater_last_name: undefined,
    };
}

export class SubjectCrudService {
    private static async countSubjectOfferings(dbClient: DbClient, id: string) {
        const subjectOfferingTablesSupported = await supportsSubjectOfferingTables(dbClient);

        if (!subjectOfferingTablesSupported) {
            return 0;
        }

        const result = await dbClient
            .selectFrom('subject_offerings')
            .select(sql<number>`count(*)::int`.as('count'))
            .where('subject_id', '=', id)
            .executeTakeFirst();

        return result?.count ?? 0;
    }

    private static async countSelectedSubjectOfferings(dbClient: DbClient, ids: string[]) {
        const subjectOfferingTablesSupported = await supportsSubjectOfferingTables(dbClient);

        if (!subjectOfferingTablesSupported) {
            return 0;
        }

        const result = await dbClient
            .selectFrom('subject_offerings')
            .select(sql<number>`count(*)::int`.as('count'))
            .where('subject_id', 'in', ids)
            .executeTakeFirst();

        return result?.count ?? 0;
    }

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

    static async getSubjects(dbClient: DbClient, search?: string) {
        const includeOfferingFields = await supportsSubjectOfferingFields(dbClient);

        try {
            const rawSubjects = await getSubjectsData({
                dbClient,
                search,
                includeOfferingFields,
            });
            return rawSubjects.map(mapSubjectRecord);
        } catch (error) {
            if (!isMissingSubjectOfferingColumnError(error)) {
                throw error;
            }

            const rawSubjects = await getSubjectsData({
                dbClient,
                search,
                includeOfferingFields: false,
            });

            return rawSubjects.map(mapSubjectRecord);
        }
    }

    static async getSubjectById(dbClient: DbClient, id: string) {
        const includeOfferingFields = await supportsSubjectOfferingFields(dbClient);

        try {
            const subject = await getSubjectByIdData({
                dbClient,
                id,
                includeOfferingFields,
            });

            return mapSubjectRecord(subject);
        } catch (error) {
            if (!isMissingSubjectOfferingColumnError(error)) {
                throw error;
            }

            const subject = await getSubjectByIdData({
                dbClient,
                id,
                includeOfferingFields: false,
            });

            return mapSubjectRecord(subject);
        }
    }

    static async createSubject(dbClient: DbClient, data: CreateSubjectCrudPayload) {
        const payload = normalizeCreatePayload(data);
        await SubjectCrudService.ensureSubjectCodeAvailable(dbClient, payload.code);
        const includeOfferingFields = await supportsSubjectOfferingFields(dbClient);

        try {
            return await createSubjectData({
                dbClient,
                values: {
                    subject_code: payload.code,
                    subject_title: payload.title,
                    term_id: payload.term_id,
                    is_opened: payload.is_opened,
                    offering_start_date: payload.offering_start_date,
                    offering_end_date: payload.offering_end_date,
                    created_by: payload.created_by,
                },
                includeOfferingFields,
            });
        } catch (error) {
            if (!isMissingSubjectOfferingColumnError(error)) {
                throw error;
            }

            return await createSubjectData({
                dbClient,
                values: {
                    subject_code: payload.code,
                    subject_title: payload.title,
                    term_id: payload.term_id,
                    is_opened: payload.is_opened,
                    offering_start_date: payload.offering_start_date,
                    offering_end_date: payload.offering_end_date,
                    created_by: payload.created_by,
                },
                includeOfferingFields: false,
            });
        }
    }

    static async updateSubject(dbClient: DbClient, id: string, data: UpdateSubjectCrudPayload) {
        const payload = normalizeUpdatePayload(data);

        if (payload.code) {
            await SubjectCrudService.ensureSubjectCodeAvailable(dbClient, payload.code, id);
        }
        const includeOfferingFields = await supportsSubjectOfferingFields(dbClient);

        const values = {
            ...(payload.code !== undefined ? { subject_code: payload.code } : {}),
            ...(payload.title !== undefined ? { subject_title: payload.title } : {}),
            ...(payload.term_id !== undefined ? { term_id: payload.term_id } : {}),
            ...(payload.is_opened !== undefined ? { is_opened: payload.is_opened } : {}),
            ...(payload.offering_start_date !== undefined
                ? { offering_start_date: payload.offering_start_date }
                : {}),
            ...(payload.offering_end_date !== undefined
                ? { offering_end_date: payload.offering_end_date }
                : {}),
            updated_by: payload.updated_by,
            updated_at: new Date().toISOString(),
        };

        try {
            return await updateSubjectData({
                dbClient,
                id,
                values,
                includeOfferingFields,
            });
        } catch (error) {
            if (!isMissingSubjectOfferingColumnError(error)) {
                throw error;
            }

            return await updateSubjectData({
                dbClient,
                id,
                values,
                includeOfferingFields: false,
            });
        }
    }

    static async deleteSubject(dbClient: DbClient, id: string) {
        const subjectOfferingCount = await SubjectCrudService.countSubjectOfferings(dbClient, id);

        if (subjectOfferingCount > 0) {
            throw buildError(
                `Cannot delete this subject while ${subjectOfferingCount} offered subject${subjectOfferingCount === 1 ? ' is' : 's are'} still active. Unoffer ${subjectOfferingCount === 1 ? 'it' : 'them'} first.`,
                SUBJECT_HAS_OFFERINGS_ERROR_CODE,
            );
        }

        return await deleteSubjectData({
            dbClient,
            id,
        });
    }

    static async deleteSelectedSubjects(dbClient: DbClient, ids: string[]) {
        const subjectOfferingCount = await SubjectCrudService.countSelectedSubjectOfferings(
            dbClient,
            ids,
        );

        if (subjectOfferingCount > 0) {
            throw buildError(
                `Cannot delete the selected subjects while ${subjectOfferingCount} offered subject${subjectOfferingCount === 1 ? ' is' : 's are'} still active. Remove ${subjectOfferingCount === 1 ? 'it' : 'them'} from Offered Subjects first.`,
                SUBJECT_HAS_OFFERINGS_ERROR_CODE,
            );
        }

        return await deleteSelectedSubjectsData({
            dbClient,
            ids,
        });
    }
}
