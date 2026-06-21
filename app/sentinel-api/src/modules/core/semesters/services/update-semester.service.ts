import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { type UpdateSemesterBody } from '../semesters.dto';
import { updateSemesterData } from '../data/update-semester';
import { deactivateInstitutionSemestersData } from '../data/deactivate-institution-semesters';
import { getInstitutionKindData } from '../data/get-institution-kind';
import { getInstitutionNameData } from '../data/get-institution-name';
import { getSemesterStateData } from '../data/get-semester-state';
import { hasTermsUpdatedAtColumnData } from '../data/has-terms-updated-at-column';
import { buildUpdateSemesterValues } from './build-semester-values';
import { mapSemesterResponse } from './map-semester-response';
import { buildSemesterLabel, SEMESTER_INHERITANCE_CONFIG } from './_utils';
import { upsertInheritedOverride } from '../../inheritance/inheritable-write-helper';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export type UpdateSemesterServiceArgs = {
    dbClient: DbClient;
    id: string;
    data: UpdateSemesterBody;
    institutionId?: string;
    actorUserId?: string;
};

/**
 * Updates a semester. Child institutions are blocked. When the semester is
 * inherited an override is upserted instead. Deactivates competing active
 * semesters when transitioning to active. Throws 409 on duplicate, 404 when
 * not found.
 *
 * @param args.dbClient - Database client
 * @param args.id - Term ID to update
 * @param args.data - Fields to update
 * @param args.institutionId - Institution context
 * @param args.actorUserId - ID of the acting user for activity notifications
 * @returns The updated (or overridden) semester mapped to its response shape
 */
export async function updateSemesterService({
    dbClient,
    id,
    data,
    institutionId,
    actorUserId,
}: UpdateSemesterServiceArgs) {
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
        const resolvedTargetInstitutionId =
            institutionId ?? data.institution_id ?? current.institution_id;

        const shouldDeactivateOtherTerms =
            Boolean(resolvedTargetInstitutionId) &&
            ((data.is_active === true && !current.is_active) ||
                (current.is_active && resolvedTargetInstitutionId !== current.institution_id));

        if (shouldDeactivateOtherTerms && resolvedTargetInstitutionId) {
            await deactivateInstitutionSemestersData({
                dbClient,
                institutionId: resolvedTargetInstitutionId,
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

            const notificationInstitutionId =
                currentScopeInstitutionId ?? resolvedTargetInstitutionId;
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
            values: buildUpdateSemesterValues(
                data,
                resolvedTargetInstitutionId,
                hasUpdatedAtColumn,
            ),
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

        const notificationInstitutionId = currentScopeInstitutionId ?? resolvedTargetInstitutionId;
        if (actorUserId && notificationInstitutionId) {
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId,
                institutionId: notificationInstitutionId,
                operation: 'UPDATED',
                targetType: 'SEMESTER',
                targetId: rawSemester.term_id,
                targetLabel: buildSemesterLabel(rawSemester.academic_year, rawSemester.semester),
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

export type UpdateSemesterServiceResponse = Awaited<ReturnType<typeof updateSemesterService>>;
