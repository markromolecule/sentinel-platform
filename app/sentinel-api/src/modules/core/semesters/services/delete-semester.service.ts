import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { deleteSemesterData } from '../data/delete-semester';
import { getInstitutionKindData } from '../data/get-institution-kind';
import { hideInheritedRecord } from '../../inheritance/inheritable-write-helper';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { buildSemesterLabel, getSemesterSummaryById, SEMESTER_INHERITANCE_CONFIG } from './_utils';

export type DeleteSemesterServiceArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    actorUserId?: string;
};

/**
 * Deletes a semester. Child (branch) institutions are blocked. When the
 * semester is inherited it is hidden instead of physically deleted.
 * Throws 409 if linked to class groups, 404 if not found.
 *
 * @param args.dbClient - Database client
 * @param args.id - Term ID to delete
 * @param args.institutionId - Institution context for scoped operations
 * @param args.actorUserId - ID of the acting user for activity notifications
 * @returns The hidden or deleted semester record
 */
export async function deleteSemesterService({
    dbClient,
    id,
    institutionId,
    actorUserId,
}: DeleteSemesterServiceArgs) {
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
        const existingSemester = await getSemesterSummaryById(dbClient, id, institutionId);

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

export type DeleteSemesterServiceResponse = Awaited<ReturnType<typeof deleteSemesterService>>;
