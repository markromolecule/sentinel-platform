import { type DbClient } from '@sentinel/db';
import { createSubjectOfferingData } from './data/create-subject-offering';
import { deleteSubjectOfferingData } from './data/delete-subject-offering';
import { getSubjectOfferingByIdData } from './data/get-subject-offering-by-id';
import { getSubjectOfferingBaseRecordData } from './data/get-subject-offering-base-record';
import { getSubjectOfferingsData } from './data/get-subject-offerings';
import { getSubjectRecordData } from './data/get-subject-record';
import { getTermRecordData } from './data/get-term-record';
import { updateSubjectOfferingData } from './data/update-subject-offering';
import { mapSubjectOfferingResponse } from './helper/map-subject-offering-response';
import {
    isMissingSubjectOfferingTableError,
    supportsSubjectOfferingTables,
} from './helper/subject-offering-compat';
import { buildSubjectOfferingError } from './helper/subject-offering-errors';
import { validateInstitutionScope } from './helper/validate-institution-scope';
import { SubjectOfferingAssignmentsService } from './services/subject-offering-assignments.service';
import {
    buildCreateSubjectOfferingValues,
    buildUpdateSubjectOfferingValues,
    normalizeAssignments,
    type CreateSubjectOfferingPayload,
    type UpdateSubjectOfferingPayload,
} from './services/subject-offering-payload.service';

export class SubjectOfferingsService {
    static async getSubjectOfferings(
        dbClient: DbClient,
        args: {
            institutionId?: string;
            departmentId?: string;
            courseId?: string;
            search?: string;
            subjectId?: string;
            termId?: string;
            visibility?: 'default' | 'requestable';
            instructorDepartmentId?: string;
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
                departmentId: args.departmentId,
                courseId: args.courseId,
                search: args.search,
                subjectId: args.subjectId,
                termId: args.termId,
                visibility: args.visibility,
                instructorDepartmentId: args.instructorDepartmentId,
            });

            return rawSubjectOfferings.map(mapSubjectOfferingResponse);
        } catch (error) {
            if (isMissingSubjectOfferingTableError(error)) {
                return [];
            }

            throw error;
        }
    }

    static async getSubjectOfferingById(dbClient: DbClient, id: string, institutionId?: string) {
        const subjectOffering = await getSubjectOfferingByIdData({
            dbClient,
            id,
            institutionId,
        });

        return mapSubjectOfferingResponse(subjectOffering);
    }

    static async createSubjectOffering(dbClient: DbClient, data: CreateSubjectOfferingPayload) {
        const subject = await getSubjectRecordData({
            dbClient,
            subjectId: data.subject_id,
        });
        const term = await getTermRecordData({
            dbClient,
            termId: data.term_id,
        });

        if (!subject) {
            throw buildSubjectOfferingError('Subject not found', 'P2025');
        }

        if (!term) {
            throw buildSubjectOfferingError('Term not found', 'P2025');
        }

        validateInstitutionScope(subject, data.institution_id, 'Subject');
        validateInstitutionScope(term, data.institution_id, 'Term');

        const createdSubjectOffering = await createSubjectOfferingData({
            dbClient,
            values: buildCreateSubjectOfferingValues({
                payload: data,
                subjectInstitutionId: subject.institution_id,
                termInstitutionId: term.institution_id,
                term,
            }),
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
        const existingSubjectOffering = await getSubjectOfferingBaseRecordData({
            dbClient,
            id,
            institutionId: data.institution_id,
        });

        if (!existingSubjectOffering) {
            throw buildSubjectOfferingError('Subject offering not found', 'P2025');
        }

        const nextTermId = data.term_id ?? existingSubjectOffering.term_id;
        const termChanged =
            data.term_id !== undefined && data.term_id !== existingSubjectOffering.term_id;
        const term = await getTermRecordData({
            dbClient,
            termId: nextTermId,
        });

        if (!term) {
            throw buildSubjectOfferingError('Term not found', 'P2025');
        }

        validateInstitutionScope(term, data.institution_id, 'Term');

        await updateSubjectOfferingData({
            dbClient,
            id,
            values: buildUpdateSubjectOfferingValues({
                payload: data,
                nextTermId,
                term,
                existingStatus: existingSubjectOffering.status,
                termChanged,
            }),
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

    static async deleteSubjectOffering(
        dbClient: DbClient,
        id: string,
        institutionId?: string | null,
    ) {
        const existingSubjectOffering = await getSubjectOfferingBaseRecordData({
            dbClient,
            id,
            institutionId: institutionId ?? undefined,
        });

        if (!existingSubjectOffering) {
            throw buildSubjectOfferingError('Subject offering not found', 'P2025');
        }

        await deleteSubjectOfferingData(dbClient, id, institutionId ?? undefined);
    }
}
