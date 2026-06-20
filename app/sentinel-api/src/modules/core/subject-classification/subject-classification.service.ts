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
import {
    decorateWithOriginMetadata,
    resolveParentScope,
} from '../inheritance/inheritance-resolver.helper';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

type PaginationMetadata = {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
};

type PaginatedResult<T> = {
    items: T[];
    pagination: PaginationMetadata;
};

function paginateItems<T>(
    items: T[],
    page?: number,
    limit?: number,
): T[] | PaginatedResult<T> {
    if (page === undefined || limit === undefined) {
        return items;
    }

    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);

    return {
        items: paginatedItems,
        pagination: {
            page,
            limit,
            total: items.length,
            hasMore: offset + paginatedItems.length < items.length,
        },
    };
}

export class SubjectClassificationService {
    static duplicateCode = DUPLICATE_SUBJECT_CLASSIFICATION_ERROR;
    static invalidPayloadCode = INVALID_SUBJECT_CLASSIFICATION_PAYLOAD;

    private static async getParentVisibleInstitutionIds(
        dbClient: DbClient,
        institutionId?: string,
    ): Promise<string[] | null> {
        if (!institutionId) {
            return null;
        }

        const scope = await resolveParentScope(dbClient, institutionId);

        if (scope.institutionKind !== 'PARENT') {
            return null;
        }

        const branches = await dbClient
            .selectFrom('institutions')
            .select('id')
            .where('parent_institution_id', '=', institutionId)
            .execute();

        return [institutionId, ...branches.map((branch) => branch.id)];
    }

    static async getSubjectClassifications(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
        page?: number,
        limit?: number,
    ) {
        const supportsTables = await supportsSubjectClassificationTables(dbClient);

        try {
            const parentVisibleInstitutionIds =
                await SubjectClassificationService.getParentVisibleInstitutionIds(
                    dbClient,
                    institutionId,
                );

            if (parentVisibleInstitutionIds) {
                const branchScopedRecords = await Promise.all(
                    parentVisibleInstitutionIds.map((scopeInstitutionId) =>
                        getSubjectClassificationsData({
                            dbClient,
                            institutionId: scopeInstitutionId,
                            search,
                            includeClassificationFields: supportsTables,
                        }),
                    ),
                );

                const records = branchScopedRecords
                    .flatMap((records) =>
                        decorateWithOriginMetadata(records, {
                            idKey: 'subject_classification_id',
                            effectiveInstitutionId: institutionId ?? null,
                        }),
                    )
                    .sort((left: any, right: any) =>
                        String(left.name ?? '').localeCompare(String(right.name ?? '')),
                    )
                    .map(mapClassificationRecord);

                return paginateItems(records, page, limit);
            }

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

            return paginateItems(records.map(mapClassificationRecord), page, limit);
        } catch (error) {
            if (!isMissingSubjectOfferingColumnError(error)) {
                throw error;
            }

            return paginateItems([], page, limit);
        }
    }

    static async getSubjectClassification(dbClient: DbClient, id: string, institutionId?: string) {
        const parentVisibleInstitutionIds =
            await SubjectClassificationService.getParentVisibleInstitutionIds(
                dbClient,
                institutionId,
            );

        if (parentVisibleInstitutionIds) {
            for (const scopeInstitutionId of parentVisibleInstitutionIds) {
                const record = await getSubjectClassificationByIdData({
                    dbClient,
                    id,
                    institutionId: scopeInstitutionId,
                }).catch(() => null);

                if (!record) {
                    continue;
                }

                return mapClassificationRecord(
                    decorateWithOriginMetadata([record], {
                        idKey: 'subject_classification_id',
                        effectiveInstitutionId: institutionId ?? null,
                    })[0],
                );
            }

            return null;
        }

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

            const classification = mapClassificationRecord(record);

            if (payload.created_by && payload.institution_id) {
                await ActivityNotificationService.notifySubjectClassificationCreated({
                    dbClient: trx,
                    actorUserId: payload.created_by,
                    institutionId: payload.institution_id,
                    classificationId: classification.subject_classification_id,
                    classificationLabel: classification.name,
                });
            }

            return classification;
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

            const classification = mapClassificationRecord(record);

            if (payload.updated_by && institutionId) {
                await ActivityNotificationService.notifySubjectClassificationUpdated({
                    dbClient: trx,
                    actorUserId: payload.updated_by,
                    institutionId,
                    classificationId: classification.subject_classification_id,
                    classificationLabel: classification.name,
                });
            }

            return classification;
        });
    }

    static async deleteSubjectClassification(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        actorUserId?: string,
    ) {
        const deletedClassification = await deleteSubjectClassificationData({
            dbClient,
            id,
            institutionId,
        });

        if (institutionId && actorUserId) {
            await ActivityNotificationService.notifySubjectClassificationDeleted({
                dbClient,
                actorUserId,
                institutionId,
                classificationId: deletedClassification.subject_classification_id,
                classificationLabel: deletedClassification.name,
            });
        }

        return deletedClassification;
    }
}
