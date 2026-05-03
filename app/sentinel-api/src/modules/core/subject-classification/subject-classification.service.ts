import { type DbClient, executeTransaction } from '@sentinel/db';
import { createSubjectClassificationData } from './data/create-subject-classification';
import { deleteSubjectClassificationData } from './data/delete-subject-classification';
import { getSubjectClassificationByIdData } from './data/get-subject-classification-by-id';
import { getSubjectClassificationsData } from './data/get-subject-classifications';
import { updateSubjectClassificationSubjectsData } from './data/update-subject-classification-subjects';
import { updateSubjectClassificationCoursesData } from './data/update-subject-classification-courses';
import { updateSubjectClassificationData } from './data/update-subject-classification';
import { assertSubjectsInScopeData } from './data/assert-subjects-in-scope';
import {
    DUPLICATE_SUBJECT_CLASSIFICATION_ERROR,
    INVALID_SUBJECT_CLASSIFICATION_PAYLOAD,
} from './helper/subject-classification-errors';
import { mapClassificationRecord } from './helper/subject-classification-mapper';
import {
    type CreateSubjectClassificationPayload,
    type UpdateSubjectClassificationPayload,
    normalizeCreatePayload,
    normalizeUpdatePayload,
} from './helper/subject-classification-validator';
import {
    isMissingSubjectOfferingColumnError,
    supportsSubjectClassificationTables,
} from '../subjects/helper/subject-offering-compat';
import { loadEffectiveRows } from '../inheritance/effective-row-loader';

export class SubjectClassificationService {
    static duplicateCode = DUPLICATE_SUBJECT_CLASSIFICATION_ERROR;
    static invalidPayloadCode = INVALID_SUBJECT_CLASSIFICATION_PAYLOAD;

    static async getSubjectClassifications(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
    ) {
        const supportsTables = await supportsSubjectClassificationTables(dbClient);

        try {
            const records = await loadEffectiveRows<any>({
                institutionId,
                dbClient,
                idKey: 'subject_classification_id',
                loadRows: (scopeInstitutionId) =>
                    getSubjectClassificationsData({
                        dbClient,
                        institutionId: scopeInstitutionId,
                        search,
                        includeClassificationFields: supportsTables,
                    }),
            });

            return records.map(mapClassificationRecord);
        } catch (error) {
            if (!isMissingSubjectOfferingColumnError(error)) {
                throw error;
            }

            return [];
        }
    }

    static async getSubjectClassification(dbClient: DbClient, id: string, institutionId?: string) {
        if (institutionId) {
            const supportsTables = await supportsSubjectClassificationTables(dbClient);
            const effectiveRecords = await loadEffectiveRows<any>({
                institutionId,
                dbClient,
                idKey: 'subject_classification_id',
                loadRows: (scopeInstitutionId) =>
                    getSubjectClassificationsData({
                        dbClient,
                        institutionId: scopeInstitutionId,
                        includeClassificationFields: supportsTables,
                    }),
            });
            const effectiveRecord = effectiveRecords.find(
                (record: any) =>
                    record.subject_classification_id === id || record.sourceRecordId === id,
            );

            if (effectiveRecord) {
                return mapClassificationRecord(effectiveRecord);
            }
        }

        const record = await getSubjectClassificationByIdData({
            dbClient,
            id,
            institutionId,
        });

        if (!record) {
            return null;
        }

        return mapClassificationRecord(record);
    }

    static async createSubjectClassification(
        dbClient: DbClient,
        data: CreateSubjectClassificationPayload,
    ) {
        const payload = normalizeCreatePayload(data);
        await assertSubjectsInScopeData(dbClient, payload.subject_ids, payload.institution_id);

        return await executeTransaction(async (trx) => {
            const createdClassification = await createSubjectClassificationData({
                dbClient: trx,
                values: {
                    name: payload.name,
                    classification_type: payload.type,
                    description: payload.description,
                    department_id: payload.department_id,
                    created_by: payload.created_by,
                    institution_id: payload.institution_id,
                },
            });

            await updateSubjectClassificationSubjectsData({
                dbClient: trx,
                subjectClassificationId: createdClassification.subject_classification_id,
                subjectIds: payload.subject_ids,
            });

            await updateSubjectClassificationCoursesData({
                dbClient: trx,
                subjectClassificationId: createdClassification.subject_classification_id,
                courseIds: payload.course_ids,
            });

            const record = await getSubjectClassificationByIdData({
                dbClient: trx,
                id: createdClassification.subject_classification_id,
                institutionId: payload.institution_id ?? undefined,
            });

            return mapClassificationRecord(record);
        });
    }

    static async updateSubjectClassification(
        dbClient: DbClient,
        id: string,
        data: UpdateSubjectClassificationPayload,
        institutionId?: string,
    ) {
        const payload = normalizeUpdatePayload(data);

        if (payload.subject_ids) {
            await assertSubjectsInScopeData(dbClient, payload.subject_ids, institutionId);
        }

        return await executeTransaction(async (trx) => {
            await updateSubjectClassificationData({
                dbClient: trx,
                id,
                institutionId,
                values: {
                    ...(payload.name !== undefined ? { name: payload.name } : {}),
                    ...(payload.type !== undefined ? { classification_type: payload.type } : {}),
                    ...(payload.description !== undefined
                        ? { description: payload.description }
                        : {}),
                    ...(payload.department_id !== undefined
                        ? { department_id: payload.department_id }
                        : {}),
                    ...(payload.updated_by !== undefined ? { updated_by: payload.updated_by } : {}),
                    updated_at: new Date(),
                },
            });

            if (payload.subject_ids !== undefined) {
                await updateSubjectClassificationSubjectsData({
                    dbClient: trx,
                    subjectClassificationId: id,
                    subjectIds: payload.subject_ids,
                });
            }

            if (payload.course_ids !== undefined) {
                await updateSubjectClassificationCoursesData({
                    dbClient: trx,
                    subjectClassificationId: id,
                    courseIds: payload.course_ids,
                });
            }

            const record = await getSubjectClassificationByIdData({
                dbClient: trx,
                id,
                institutionId,
            });

            return mapClassificationRecord(record);
        });
    }

    static async deleteSubjectClassification(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
    ) {
        return await deleteSubjectClassificationData({
            dbClient,
            id,
            institutionId,
        });
    }
}
