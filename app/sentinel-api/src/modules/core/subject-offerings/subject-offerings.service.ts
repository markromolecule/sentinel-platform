import { type DbClient, executeTransaction } from '@sentinel/db';
import {
    createSubjectOfferingData,
    createSubjectOfferingsData,
} from './data/create-subject-offering';
import { deleteSubjectOfferingData } from './data/delete-subject-offering';
import { getExistingSubjectOfferingsBySubjectsData } from './data/get-existing-subject-offerings-by-subjects';
import { getSubjectOfferingByIdData } from './data/get-subject-offering-by-id';
import { getSubjectOfferingBaseRecordData } from './data/get-subject-offering-base-record';
import { getSubjectOfferingsData } from './data/get-subject-offerings';
import { getSubjectRecordData } from './data/get-subject-record';
import { getSubjectRecordsByIdsData } from './data/get-subject-records-by-ids';
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
import { SubjectClassificationService } from '../subject-classification/subject-classification.service';

type BulkSubjectOfferingPayload = {
    subject_classification_id: string;
    term_id: string;
    department_ids?: string[];
    course_ids?: string[];
    section_ids?: string[];
    year_levels?: number[];
    duplicate_strategy?: 'skip_existing' | 'fail_existing';
    created_by?: string | null;
    institution_id?: string | null;
};

type ClassificationSubjectForOffering = {
    id: string;
    code: string;
    title: string;
};

function isClassificationSubjectForOffering(
    value: unknown,
): value is ClassificationSubjectForOffering {
    return (
        Boolean(value) &&
        typeof value === 'object' &&
        typeof (value as ClassificationSubjectForOffering).id === 'string' &&
        typeof (value as ClassificationSubjectForOffering).code === 'string' &&
        typeof (value as ClassificationSubjectForOffering).title === 'string'
    );
}

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

    static async createSubjectOfferingsFromClassification(
        dbClient: DbClient,
        data: BulkSubjectOfferingPayload,
    ) {
        const duplicateStrategy = data.duplicate_strategy ?? 'skip_existing';
        const classification = await SubjectClassificationService.getSubjectClassification(
            dbClient,
            data.subject_classification_id,
            data.institution_id ?? undefined,
        );

        if (!classification) {
            throw buildSubjectOfferingError('Subject classification not found', 'P2025');
        }

        const classificationSubjects: ClassificationSubjectForOffering[] = Array.isArray(
            classification.subjects,
        )
            ? classification.subjects.filter(isClassificationSubjectForOffering)
            : [];
        const subjectIds = classificationSubjects
            .map((subject) => subject.id)
            .filter((subjectId): subjectId is string => Boolean(subjectId));

        if (subjectIds.length === 0) {
            throw buildSubjectOfferingError(
                'Subject classification has no assigned subjects',
                'EMPTY_SUBJECT_CLASSIFICATION',
            );
        }

        const term = await getTermRecordData({
            dbClient,
            termId: data.term_id,
        });

        if (!term) {
            throw buildSubjectOfferingError('Term not found', 'P2025');
        }

        validateInstitutionScope(term, data.institution_id, 'Term');

        const existingOfferings = await getExistingSubjectOfferingsBySubjectsData({
            dbClient,
            subjectIds,
            termId: data.term_id,
            institutionId: data.institution_id,
        });
        const existingOfferingBySubjectId = new Map(
            existingOfferings.map((offering) => [offering.subject_id, offering]),
        );

        if (existingOfferings.length > 0 && duplicateStrategy === 'fail_existing') {
            throw buildSubjectOfferingError(
                'One or more subjects are already offered for the selected term',
                'P2002',
            );
        }

        const skipped = classificationSubjects
            .map((subject) => {
                const existingOffering = existingOfferingBySubjectId.get(subject.id);

                if (!existingOffering) {
                    return null;
                }

                return {
                    subject_id: subject.id,
                    subject_code: subject.code,
                    subject_title: subject.title,
                    existing_subject_offering_id: existingOffering.subject_offering_id,
                    reason: 'already_offered' as const,
                };
            })
            .filter((subject): subject is NonNullable<typeof subject> => subject !== null);

        const subjectsToCreate = classificationSubjects.filter(
            (subject) => !existingOfferingBySubjectId.has(subject.id),
        );

        const subjectRecords = await getSubjectRecordsByIdsData({
            dbClient,
            subjectIds: subjectsToCreate.map((subject) => subject.id),
        });
        const subjectRecordById = new Map(
            subjectRecords.map((subjectRecord) => [subjectRecord.subject_id, subjectRecord]),
        );

        const subjectOfferingValues = subjectsToCreate.map((subject) => {
            const subjectRecord = subjectRecordById.get(subject.id);

            if (!subjectRecord) {
                throw buildSubjectOfferingError('Subject not found', 'P2025');
            }

            validateInstitutionScope(subjectRecord, data.institution_id, 'Subject');

            return buildCreateSubjectOfferingValues({
                payload: {
                    subject_id: subject.id,
                    term_id: data.term_id,
                    department_ids: data.department_ids,
                    course_ids: data.course_ids,
                    section_ids: data.section_ids,
                    year_levels: data.year_levels,
                    created_by: data.created_by,
                    institution_id: data.institution_id,
                },
                subjectInstitutionId: subjectRecord.institution_id,
                termInstitutionId: term.institution_id,
                term,
            });
        });

        const createdSubjectOfferings = await executeTransaction(async (trx) => {
            const createdRecords = await createSubjectOfferingsData({
                dbClient: trx,
                values: subjectOfferingValues,
            });

            await SubjectOfferingAssignmentsService.createAllForOfferings(
                trx,
                createdRecords.map((record) => record.subject_offering_id),
                normalizeAssignments(data),
            );

            return createdRecords;
        });

        const created = await Promise.all(
            createdSubjectOfferings.map((createdSubjectOffering) =>
                SubjectOfferingsService.getSubjectOfferingById(
                    dbClient,
                    createdSubjectOffering.subject_offering_id,
                    data.institution_id ?? undefined,
                ),
            ),
        );

        return {
            classification_id: classification.id ?? classification.subject_classification_id,
            classification_name: classification.name,
            term_id: data.term_id,
            created_count: created.length,
            skipped_count: skipped.length,
            total_subject_count: classificationSubjects.length,
            duplicate_strategy: duplicateStrategy,
            created,
            skipped,
        };
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
