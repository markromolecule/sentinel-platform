import { type DbClient } from '@sentinel/db';
import { createSubjectOfferingData } from './data/create-subject-offering';
import { deleteSubjectOfferingData } from './data/delete-subject-offering';
import { getSubjectOfferingByIdData } from './data/get-subject-offering-by-id';
import { getSubjectOfferingsData } from './data/get-subject-offerings';
import { updateSubjectOfferingData } from './data/update-subject-offering';
import { deriveSubjectOfferingStatus } from './helper/subject-offering-status';
import {
    isMissingSubjectOfferingTableError,
    supportsSubjectOfferingTables,
} from './helper/subject-offering-compat';
import {
    SubjectOfferingAssignmentsService,
    type SubjectOfferingAssignmentsPayload,
} from './services/subject-offering-assignments.service';

type CreateSubjectOfferingPayload = SubjectOfferingAssignmentsPayload & {
    subject_id: string;
    term_id: string;
    created_by?: string | null;
    institution_id?: string | null;
};

type UpdateSubjectOfferingPayload = SubjectOfferingAssignmentsPayload & {
    term_id?: string;
    updated_by?: string | null;
    institution_id?: string | null;
};

function buildError(message: string, code: string) {
    const error: any = new Error(message);
    error.code = code;
    return error;
}

async function getSubjectRecord(dbClient: DbClient, subjectId: string) {
    return await dbClient
        .selectFrom('subjects')
        .select(['subject_id', 'institution_id'])
        .where('subject_id', '=', subjectId)
        .executeTakeFirst();
}

async function getTermRecord(dbClient: DbClient, termId: string) {
    return await dbClient
        .selectFrom('terms')
        .select(['term_id', 'institution_id', 'start_date', 'end_date'])
        .where('term_id', '=', termId)
        .executeTakeFirst();
}

async function getOfferingBaseRecord(dbClient: DbClient, id: string, institutionId?: string | null) {
    let query = dbClient
        .selectFrom('subject_offerings')
        .select(['subject_offering_id', 'subject_id', 'term_id', 'institution_id'])
        .where('subject_offering_id', '=', id);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}

function validateInstitutionScope(
    entity: { institution_id: string | null } | undefined,
    institutionId: string | null | undefined,
    label: string,
) {
    if (!entity) {
        return;
    }

    if (institutionId && entity.institution_id && entity.institution_id !== institutionId) {
        throw buildError(`${label} does not belong to the current institution`, '23503');
    }
}

function normalizeAssignments(payload: SubjectOfferingAssignmentsPayload) {
    return {
        department_ids: payload.department_ids,
        course_ids: payload.course_ids,
        section_ids: payload.section_ids,
        year_levels: payload.year_levels,
    };
}

function mapSubjectOfferingRecord(subjectOffering: any) {
    return {
        ...subjectOffering,
        status: subjectOffering.status ?? 'DRAFT',
        created_by: subjectOffering.creator_first_name
            ? `${subjectOffering.creator_first_name} ${subjectOffering.creator_last_name}`
            : subjectOffering.created_by,
        updated_by: subjectOffering.updater_first_name
            ? `${subjectOffering.updater_first_name} ${subjectOffering.updater_last_name}`
            : subjectOffering.updated_by,
        creator_first_name: undefined,
        creator_last_name: undefined,
        updater_first_name: undefined,
        updater_last_name: undefined,
    };
}

export class SubjectOfferingsService {
    static async getSubjectOfferings(
        dbClient: DbClient,
        args: {
            institutionId?: string;
            search?: string;
            subjectId?: string;
            termId?: string;
        },
    ) {
        const subjectOfferingTablesSupported = await supportsSubjectOfferingTables(dbClient);

        if (!subjectOfferingTablesSupported) {
            return [];
        }

        try {
            const rawSubjectOfferings = await getSubjectOfferingsData({
                dbClient,
                institutionId: args.institutionId,
                search: args.search,
                subjectId: args.subjectId,
                termId: args.termId,
            });

            return rawSubjectOfferings.map(mapSubjectOfferingRecord);
        } catch (error) {
            if (isMissingSubjectOfferingTableError(error)) {
                return [];
            }

            throw error;
        }
    }

    static async getSubjectOfferingById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
    ) {
        const subjectOffering = await getSubjectOfferingByIdData({
            dbClient,
            id,
            institutionId,
        });

        return mapSubjectOfferingRecord(subjectOffering);
    }

    static async createSubjectOffering(dbClient: DbClient, data: CreateSubjectOfferingPayload) {
        const subject = await getSubjectRecord(dbClient, data.subject_id);
        const term = await getTermRecord(dbClient, data.term_id);

        if (!subject) {
            throw buildError('Subject not found', 'P2025');
        }

        if (!term) {
            throw buildError('Term not found', 'P2025');
        }

        validateInstitutionScope(subject, data.institution_id, 'Subject');
        validateInstitutionScope(term, data.institution_id, 'Term');

        const createdSubjectOffering = await createSubjectOfferingData({
            dbClient,
            values: {
                subject_id: data.subject_id,
                term_id: data.term_id,
                status: deriveSubjectOfferingStatus(term),
                created_by: data.created_by ?? null,
                updated_by: data.created_by ?? null,
                institution_id: data.institution_id ?? subject.institution_id ?? term.institution_id,
            },
        });

        try {
            await SubjectOfferingAssignmentsService.updateAll(
                dbClient,
                createdSubjectOffering.subject_offering_id,
                normalizeAssignments(data),
            );

            return await SubjectOfferingsService.getSubjectOfferingById(
                dbClient,
                createdSubjectOffering.subject_offering_id,
                data.institution_id ?? undefined,
            );
        } catch (error) {
            await deleteSubjectOfferingData(dbClient, createdSubjectOffering.subject_offering_id);
            throw error;
        }
    }

    static async updateSubjectOffering(
        dbClient: DbClient,
        id: string,
        data: UpdateSubjectOfferingPayload,
    ) {
        const existingSubjectOffering = await getOfferingBaseRecord(dbClient, id, data.institution_id);

        if (!existingSubjectOffering) {
            throw buildError('Subject offering not found', 'P2025');
        }

        const nextTermId = data.term_id ?? existingSubjectOffering.term_id;
        const term = await getTermRecord(dbClient, nextTermId);

        if (!term) {
            throw buildError('Term not found', 'P2025');
        }

        validateInstitutionScope(term, data.institution_id, 'Term');

        await updateSubjectOfferingData({
            dbClient,
            id,
            values: {
                term_id: nextTermId,
                status: deriveSubjectOfferingStatus(term),
                updated_by: data.updated_by ?? null,
            },
        });

        await SubjectOfferingAssignmentsService.updatePartial(
            dbClient,
            id,
            normalizeAssignments(data),
        );

        return await SubjectOfferingsService.getSubjectOfferingById(
            dbClient,
            id,
            data.institution_id ?? undefined,
        );
    }
}
