import { type DbClient } from '@sentinel/db';
import { createSubjectData } from '../data/create-subject';
import { deleteSubjectData } from '../data/delete-subject';
import { deleteSelectedSubjectsData } from '../data/delete-selected-subjects';
import { getSubjectByCodeData } from '../data/get-subject-by-code';
import { getSubjectByIdData } from '../data/get-subject-by-id';
import { getSubjectsData } from '../data/get-subjects';
import { updateSubjectData } from '../data/update-subject';
import { countSubjectOfferingsData } from '../data/count-subject-offerings';
import { countSelectedSubjectOfferingsData } from '../data/count-selected-subject-offerings';
import {
    isMissingSubjectOfferingColumnError,
    omitSubjectOfferingFields,
    supportsSubjectOfferingFields,
    supportsSubjectClassificationTables,
} from '../helper/subject-offering-compat';
import {
    DUPLICATE_SUBJECT_CODE_ERROR_CODE,
    SUBJECT_HAS_OFFERINGS_ERROR_CODE,
    buildSubjectError,
} from '../helper/subject-errors';
import { mapSubjectRecord } from '../helper/subject-mapper';
import {
    type CreateSubjectCrudPayload,
    type UpdateSubjectCrudPayload,
    normalizeCreatePayload,
    normalizeUpdatePayload,
} from '../helper/subject-validator';
import { loadEffectiveRows } from '../../inheritance/effective-row-loader';
import {
    hideInheritedRecord,
    upsertInheritedOverride,
} from '../../inheritance/inheritable-write-helper';

const SUBJECT_INHERITANCE_CONFIG = {
    table: 'subjects',
    idColumn: 'subject_id',
    copyColumns: [
        'subject_code',
        'subject_title',
        'term_id',
        'is_opened',
        'offering_start_date',
        'offering_end_date',
        'created_by',
        'updated_by',
    ],
};

export class SubjectCrudService {
    private static async ensureSubjectCodeAvailable(
        dbClient: DbClient,
        code: string,
        institutionId?: string | null,
        excludeId?: string,
    ) {
        const existingSubject = await getSubjectByCodeData({
            dbClient,
            code,
            institutionId,
            excludeId,
        });

        if (existingSubject) {
            throw buildSubjectError(
                'Subject code already exists',
                DUPLICATE_SUBJECT_CODE_ERROR_CODE,
            );
        }
    }

    static async getSubjects(dbClient: DbClient, institutionId?: string, search?: string) {
        const [includeOfferingFields, includeClassificationFields] = await Promise.all([
            supportsSubjectOfferingFields(dbClient),
            supportsSubjectClassificationTables(dbClient),
        ]);

        try {
            const rawSubjects = await loadEffectiveRows<any>({
                institutionId,
                dbClient,
                idKey: 'subject_id',
                loadRows: (scopeInstitutionId) =>
                    getSubjectsData({
                        dbClient,
                        institutionId: scopeInstitutionId,
                        search,
                        includeOfferingFields,
                        includeClassificationFields,
                    }),
            });
            return rawSubjects.map(mapSubjectRecord);
        } catch (error) {
            if (!isMissingSubjectOfferingColumnError(error)) {
                throw error;
            }

            const rawSubjects = await loadEffectiveRows<any>({
                institutionId,
                dbClient,
                idKey: 'subject_id',
                loadRows: (scopeInstitutionId) =>
                    getSubjectsData({
                        dbClient,
                        institutionId: scopeInstitutionId,
                        search,
                        includeOfferingFields: false,
                        includeClassificationFields: false,
                    }),
            });

            return rawSubjects.map(mapSubjectRecord);
        }
    }

    static async getSubjectById(dbClient: DbClient, id: string, institutionId?: string) {
        const [includeOfferingFields, includeClassificationFields] = await Promise.all([
            supportsSubjectOfferingFields(dbClient),
            supportsSubjectClassificationTables(dbClient),
        ]);

        try {
            if (institutionId) {
                const effectiveSubjects = await loadEffectiveRows<any>({
                    institutionId,
                    dbClient,
                    idKey: 'subject_id',
                    loadRows: (scopeInstitutionId) =>
                        getSubjectsData({
                            dbClient,
                            institutionId: scopeInstitutionId,
                            includeOfferingFields,
                            includeClassificationFields,
                        }),
                });
                const effectiveSubject = effectiveSubjects.find(
                    (subject: any) => subject.subject_id === id || subject.sourceRecordId === id,
                );

                if (effectiveSubject) {
                    return mapSubjectRecord(effectiveSubject);
                }
            }

            const subject = await getSubjectByIdData({
                dbClient,
                id,
                institutionId,
                includeOfferingFields,
                includeClassificationFields,
            });

            return mapSubjectRecord(subject);
        } catch (error) {
            if (!isMissingSubjectOfferingColumnError(error)) {
                throw error;
            }

            const subject = await getSubjectByIdData({
                dbClient,
                id,
                institutionId,
                includeOfferingFields: false,
                includeClassificationFields: false,
            });

            return mapSubjectRecord(subject);
        }
    }

    static async createSubject(dbClient: DbClient, data: CreateSubjectCrudPayload) {
        const payload = normalizeCreatePayload(data);
        await SubjectCrudService.ensureSubjectCodeAvailable(
            dbClient,
            payload.code,
            payload.institution_id,
        );
        const includeOfferingFields = await supportsSubjectOfferingFields(dbClient);

        try {
            return await createSubjectData({
                dbClient,
                values: {
                    subject_code: payload.code,
                    subject_title: payload.title,
                    institution_id: payload.institution_id,
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
                    institution_id: payload.institution_id,
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

    static async updateSubject(
        dbClient: DbClient,
        id: string,
        data: UpdateSubjectCrudPayload,
        institutionId?: string,
    ) {
        const payload = normalizeUpdatePayload(data);

        if (payload.code) {
            await SubjectCrudService.ensureSubjectCodeAvailable(
                dbClient,
                payload.code,
                institutionId ?? payload.institution_id ?? null,
                id,
            );
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
            const overrideSubject = await upsertInheritedOverride({
                dbClient,
                config: SUBJECT_INHERITANCE_CONFIG,
                id,
                institutionId,
                actorId: payload.updated_by,
                values: includeOfferingFields ? values : omitSubjectOfferingFields(values),
            });

            if (overrideSubject) {
                return overrideSubject;
            }

            return await updateSubjectData({
                dbClient,
                id,
                values,
                institutionId,
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
                institutionId,
                includeOfferingFields: false,
            });
        }
    }

    static async deleteSubject(dbClient: DbClient, id: string, institutionId?: string) {
        const subjectOfferingCount = await countSubjectOfferingsData(dbClient, id);

        if (subjectOfferingCount > 0) {
            throw buildSubjectError(
                `Cannot delete this subject while ${subjectOfferingCount} offered subject${subjectOfferingCount === 1 ? ' is' : 's are'} still active. Unoffer ${subjectOfferingCount === 1 ? 'it' : 'them'} first.`,
                SUBJECT_HAS_OFFERINGS_ERROR_CODE,
            );
        }

        const hiddenSubject = await hideInheritedRecord({
            dbClient,
            config: SUBJECT_INHERITANCE_CONFIG,
            id,
            institutionId,
        });

        if (hiddenSubject) {
            return hiddenSubject;
        }

        return await deleteSubjectData({
            dbClient,
            id,
            institutionId,
        });
    }

    static async deleteSelectedSubjects(dbClient: DbClient, ids: string[], institutionId?: string) {
        const subjectOfferingCount = await countSelectedSubjectOfferingsData(dbClient, ids);

        if (subjectOfferingCount > 0) {
            throw buildSubjectError(
                `Cannot delete the selected subjects while ${subjectOfferingCount} offered subject${subjectOfferingCount === 1 ? ' is' : 's are'} still active. Remove ${subjectOfferingCount === 1 ? 'it' : 'them'} from Offered Subjects first.`,
                SUBJECT_HAS_OFFERINGS_ERROR_CODE,
            );
        }

        return await deleteSelectedSubjectsData({
            dbClient,
            ids,
            institutionId,
        });
    }
}
