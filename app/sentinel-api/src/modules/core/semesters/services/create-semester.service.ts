import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { type CreateSemesterBody } from '../semesters.dto';
import { createSemesterData } from '../data/create-semester';
import { deactivateInstitutionSemestersData } from '../data/deactivate-institution-semesters';
import { getInstitutionKindData } from '../data/get-institution-kind';
import { getInstitutionNameData } from '../data/get-institution-name';
import { hasTermsUpdatedAtColumnData } from '../data/has-terms-updated-at-column';
import { buildCreateSemesterValues } from './build-semester-values';
import { mapSemesterResponse } from './map-semester-response';
import { buildSemesterLabel } from './_utils';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export type CreateSemesterServiceArgs = {
    dbClient: DbClient;
    data: CreateSemesterBody;
    institutionId?: string;
    actorUserId?: string;
};

/**
 * Creates a new semester for an institution. Child (branch) institutions are
 * blocked from creating semesters. Deactivates all other active semesters in
 * the institution when `is_active` is set. Throws 409 on duplicate.
 *
 * @param args.dbClient - Database client
 * @param args.data - Semester creation payload
 * @param args.institutionId - Institution context override
 * @param args.actorUserId - ID of the acting user for activity notifications
 * @returns The created semester mapped to its response shape
 */
export async function createSemesterService({
    dbClient,
    data,
    institutionId,
    actorUserId,
}: CreateSemesterServiceArgs) {
    const targetInstitutionId = institutionId ?? data.institution_id;

    if (!targetInstitutionId) {
        throw new HTTPException(403, {
            message: 'Institution ID is required to create a semester.',
        });
    }

    const institution = await getInstitutionKindData({ dbClient, institutionId: targetInstitutionId });

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
                targetLabel: buildSemesterLabel(rawSemester.academic_year, rawSemester.semester),
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

export type CreateSemesterServiceResponse = Awaited<ReturnType<typeof createSemesterService>>;
