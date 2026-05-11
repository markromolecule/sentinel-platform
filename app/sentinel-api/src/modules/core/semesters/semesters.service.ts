import { getSemestersData } from './data/get-semesters';
import { createSemesterData } from './data/create-semester';
import { updateSemesterData } from './data/update-semester';
import { deleteSemesterData } from './data/delete-semester';
import { deleteSemestersData } from './data/delete-semesters';
import { deactivateInstitutionSemestersData } from './data/deactivate-institution-semesters';
import { getInstitutionKindData } from './data/get-institution-kind';
import { getInstitutionNameData } from './data/get-institution-name';
import { getSemesterStateData } from './data/get-semester-state';
import { hasTermsUpdatedAtColumnData } from './data/has-terms-updated-at-column';
import { type DbClient } from '@sentinel/db';
import { type CreateSemesterBody, type UpdateSemesterBody } from './semesters.dto';
import { HTTPException } from 'hono/http-exception';
import {
    buildCreateSemesterValues,
    buildUpdateSemesterValues,
} from './services/build-semester-values';
import { mapSemesterResponse } from './services/map-semester-response';
import { loadEffectiveRows } from '../inheritance/effective-row-loader';
import {
    hideInheritedRecord,
    upsertInheritedOverride,
} from '../inheritance/inheritable-write-helper';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

const SEMESTER_INHERITANCE_CONFIG = {
    table: 'terms',
    idColumn: 'term_id',
    copyColumns: ['academic_year', 'semester', 'is_active', 'start_date', 'end_date'],
};

function buildSemesterLabel(
    academicYear: string | null | undefined,
    semester: string | null | undefined,
) {
    if (academicYear && semester) {
        return `${academicYear} ${semester}`;
    }

    return semester || academicYear || 'Semester';
}

export class SemesterService {
    private static async getSemesterSummaryById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
    ) {
        let query = dbClient
            .selectFrom('terms')
            .select(['term_id', 'academic_year', 'semester', 'institution_id'])
            .where('term_id', '=', id);

        if (institutionId) {
            query = query.where((eb) =>
                eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
            );
        }

        return await query.executeTakeFirst();
    }

    static async getSemesters(dbClient: DbClient, institutionId?: string, search?: string) {
        let effectiveInstitutionId = institutionId;

        if (institutionId) {
            const institution = await getInstitutionKindData({ dbClient, institutionId });
            if (institution?.institution_kind === 'CHILD' && institution.parent_institution_id) {
                effectiveInstitutionId = institution.parent_institution_id;
            }
        }

        const rawSemesters = await loadEffectiveRows<any>({
            dbClient,
            institutionId: effectiveInstitutionId,
            idKey: 'term_id',
            loadRows: (scopeInstitutionId) =>
                getSemestersData({ dbClient, institutionId: scopeInstitutionId, search }),
        });
        return rawSemesters.map(mapSemesterResponse);
    }

    static async createSemester(
        dbClient: DbClient,
        data: CreateSemesterBody,
        institutionId?: string,
        actorUserId?: string,
    ) {
        const targetInstitutionId = institutionId ?? data.institution_id;

        if (!targetInstitutionId) {
            throw new HTTPException(403, {
                message: 'Institution ID is required to create a semester.',
            });
        }

        const institution = await getInstitutionKindData({
            dbClient,
            institutionId: targetInstitutionId,
        });

        if (institution?.institution_kind === 'CHILD') {
            throw new HTTPException(403, {
                message:
                    'Branches cannot create semesters. Please manage semesters at the parent institution.',
            });
        }

        try {
            const hasUpdatedAtColumn = await hasTermsUpdatedAtColumnData({ dbClient });

            if (data.is_active) {
                await deactivateInstitutionSemestersData({
                    dbClient,
                    institutionId: targetInstitutionId,
                });
            }

            const rawSemester = await createSemesterData({
                dbClient,
                values: buildCreateSemesterValues(data, targetInstitutionId, hasUpdatedAtColumn),
            });

            const institutionName = await getInstitutionNameData({
                dbClient,
                institutionId: rawSemester.institution_id,
            });

            const semester = mapSemesterResponse({
                ...rawSemester,
                institution_name: institutionName,
            });

            if (actorUserId) {
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId,
                    institutionId: targetInstitutionId,
                    operation: 'CREATED',
                    targetType: 'SEMESTER',
                    targetId: rawSemester.term_id,
                    targetLabel: buildSemesterLabel(
                        rawSemester.academic_year,
                        rawSemester.semester,
                    ),
                    title: 'Semester created',
                    message: `A semester was created: "${buildSemesterLabel(rawSemester.academic_year, rawSemester.semester)}".`,
                    sourceModule: 'semesters',
                    sourceAction: 'create',
                    metadata: {
                        termId: rawSemester.term_id,
                    },
                });
            }

            return semester;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message || '';

            if (
                code === 'P2002' ||
                code === '23505' ||
                (code === 'P2010' && message.includes('23505'))
            ) {
                throw new HTTPException(409, {
                    message: 'Semester already exists for this academic year and institution.',
                });
            }
            throw error;
        }
    }

    static async updateSemester(
        dbClient: DbClient,
        id: string,
        data: UpdateSemesterBody,
        institutionId?: string,
        actorUserId?: string,
    ) {
        const targetInstitutionId = institutionId ?? data.institution_id;

        if (targetInstitutionId) {
            const institution = await getInstitutionKindData({
                dbClient,
                institutionId: targetInstitutionId,
            });

            if (institution?.institution_kind === 'CHILD') {
                throw new HTTPException(403, {
                    message:
                        'Branches cannot manage semesters. Please manage semesters at the parent institution.',
                });
            }
        }

        try {
            const hasUpdatedAtColumn = await hasTermsUpdatedAtColumnData({ dbClient });

            const current = await getSemesterStateData({ dbClient, id });

            const currentScopeInstitutionId = institutionId || current.institution_id || undefined;
            const targetInstitutionId =
                institutionId ?? data.institution_id ?? current.institution_id;

            const shouldDeactivateOtherTerms =
                Boolean(targetInstitutionId) &&
                ((data.is_active === true && !current.is_active) ||
                    (current.is_active && targetInstitutionId !== current.institution_id));

            if (shouldDeactivateOtherTerms && targetInstitutionId) {
                await deactivateInstitutionSemestersData({
                    dbClient,
                    institutionId: targetInstitutionId,
                    excludeTermId: id,
                });
            }

            const overrideSemester = await upsertInheritedOverride({
                dbClient,
                config: SEMESTER_INHERITANCE_CONFIG,
                id,
                institutionId: currentScopeInstitutionId,
                values: buildUpdateSemesterValues(data, undefined, hasUpdatedAtColumn),
            });

            if (overrideSemester) {
                const institutionName = await getInstitutionNameData({
                    dbClient,
                    institutionId: overrideSemester.institution_id,
                });

                const semester = mapSemesterResponse({
                    ...overrideSemester,
                    institution_name: institutionName,
                });
                const notificationInstitutionId = currentScopeInstitutionId ?? targetInstitutionId;
                if (actorUserId && notificationInstitutionId) {
                    await ActivityNotificationService.notifyGenericInstitutionActivity({
                        dbClient,
                        actorUserId,
                        institutionId: notificationInstitutionId,
                        operation: 'OVERRIDE_COMPLETED',
                        targetType: 'SEMESTER',
                        targetId: overrideSemester.term_id,
                        targetLabel: buildSemesterLabel(
                            overrideSemester.academic_year,
                            overrideSemester.semester,
                        ),
                        title: 'Semester override applied',
                        message: `A semester override was applied to "${buildSemesterLabel(overrideSemester.academic_year, overrideSemester.semester)}".`,
                        sourceModule: 'semesters',
                        sourceAction: 'override-update',
                        isAdminOverride: true,
                        metadata: {
                            termId: overrideSemester.term_id,
                        },
                    });
                }

                return semester;
            }

            const rawSemester = await updateSemesterData({
                dbClient,
                id,
                values: buildUpdateSemesterValues(data, targetInstitutionId, hasUpdatedAtColumn),
                institutionId: currentScopeInstitutionId,
            });

            const institutionName = await getInstitutionNameData({
                dbClient,
                institutionId: rawSemester.institution_id,
            });

            const semester = mapSemesterResponse({
                ...rawSemester,
                institution_name: institutionName,
            });
            const notificationInstitutionId = currentScopeInstitutionId ?? targetInstitutionId;
            if (actorUserId && notificationInstitutionId) {
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId,
                    institutionId: notificationInstitutionId,
                    operation: 'UPDATED',
                    targetType: 'SEMESTER',
                    targetId: rawSemester.term_id,
                    targetLabel: buildSemesterLabel(
                        rawSemester.academic_year,
                        rawSemester.semester,
                    ),
                    title: 'Semester updated',
                    message: `A semester was updated: "${buildSemesterLabel(rawSemester.academic_year, rawSemester.semester)}".`,
                    sourceModule: 'semesters',
                    sourceAction: 'update',
                    metadata: {
                        termId: rawSemester.term_id,
                    },
                });
            }

            return semester;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message || '';

            if (
                code === 'P2002' ||
                code === '23505' ||
                (code === 'P2010' && message.includes('23505'))
            ) {
                throw new HTTPException(409, { message: 'Semester already exists.' });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Semester not found.' });
            }
            throw error;
        }
    }

    static async deleteSemester(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        actorUserId?: string,
    ) {
        if (institutionId) {
            const institution = await getInstitutionKindData({ dbClient, institutionId });
            if (institution?.institution_kind === 'CHILD') {
                throw new HTTPException(403, {
                    message:
                        'Branches cannot delete semesters. Please manage semesters at the parent institution.',
                });
            }
        }

        try {
            const existingSemester = await this.getSemesterSummaryById(dbClient, id, institutionId);
            const hiddenSemester = await hideInheritedRecord({
                dbClient,
                config: SEMESTER_INHERITANCE_CONFIG,
                id,
                institutionId,
            });

            if (hiddenSemester) {
                if (actorUserId && institutionId) {
                    await ActivityNotificationService.notifyGenericInstitutionActivity({
                        dbClient,
                        actorUserId,
                        institutionId,
                        operation: 'OVERRIDE_COMPLETED',
                        targetType: 'SEMESTER',
                        targetId: hiddenSemester.term_id,
                        targetLabel: buildSemesterLabel(
                            hiddenSemester.academic_year,
                            hiddenSemester.semester,
                        ),
                        title: 'Semester override applied',
                        message: `A semester override was applied to "${buildSemesterLabel(hiddenSemester.academic_year, hiddenSemester.semester)}".`,
                        sourceModule: 'semesters',
                        sourceAction: 'hide-inherited',
                        isAdminOverride: true,
                        metadata: {
                            termId: hiddenSemester.term_id,
                        },
                    });
                }
                return hiddenSemester;
            }

            const deletedSemester = await deleteSemesterData({ dbClient, id, institutionId });

            if (actorUserId && institutionId) {
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId,
                    institutionId,
                    operation: 'DELETED',
                    targetType: 'SEMESTER',
                    targetId: deletedSemester.term_id,
                    targetLabel: buildSemesterLabel(
                        existingSemester?.academic_year,
                        existingSemester?.semester,
                    ),
                    title: 'Semester deleted',
                    message: `A semester was deleted: "${buildSemesterLabel(existingSemester?.academic_year, existingSemester?.semester)}".`,
                    sourceModule: 'semesters',
                    sourceAction: 'delete',
                    metadata: {
                        termId: deletedSemester.term_id,
                    },
                });
            }

            return deletedSemester;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message ?? '';
            if (
                code === 'P2003' ||
                code === '23503' ||
                (code === 'P2010' && message.includes('23503'))
            ) {
                throw new HTTPException(409, {
                    message: 'Cannot delete semester because it is being used by class groups.',
                });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Semester not found.' });
            }
            throw error;
        }
    }

    static async deleteSemesters(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        try {
            const deletedSemesters = await deleteSemestersData({ dbClient, ids, institutionId });

            if (actorUserId && institutionId && deletedSemesters.length > 0) {
                const label = `${deletedSemesters.length} semester${deletedSemesters.length === 1 ? '' : 's'}`;
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId,
                    institutionId,
                    operation: 'DELETED',
                    targetType: 'SEMESTER',
                    targetLabel: label,
                    title: 'Semesters deleted',
                    message: `${label} were deleted.`,
                    sourceModule: 'semesters',
                    sourceAction: 'bulk-delete',
                    metadata: {
                        termIds: deletedSemesters.map((semester) => semester.term_id),
                        count: deletedSemesters.length,
                        bulk: true,
                    },
                });
            }

            return deletedSemesters;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message ?? '';
            if (
                code === 'P2003' ||
                code === '23503' ||
                (code === 'P2010' && message.includes('23503'))
            ) {
                throw new HTTPException(409, {
                    message:
                        'Cannot delete one or more semesters because they are currently in use.',
                });
            }
            throw error;
        }
    }
}
