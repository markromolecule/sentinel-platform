import { type DbClient } from '@sentinel/db';
import { purgeStudentWhitelistData } from '../data/purge-student-whitelist';
import { resolveStudentWhitelistQueryScope } from '../helpers/resolve-student-whitelist-scope';
import { verifyRequesterPermissions } from '../helpers/verify-requester-permissions';
import type { PurgeStudentWhitelistArgs } from '../student-whitelist.types';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export async function purgeStudentWhitelist(
    dbClient: DbClient,
    {
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
        requesterUserId,
        values,
    }: PurgeStudentWhitelistArgs,
) {
    verifyRequesterPermissions({
        requesterRole,
        requesterInstitutionId,
    });

    const whitelistScope = resolveStudentWhitelistQueryScope({
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
        queryInstitutionId: values.institution_id,
        departmentId: values.department_id,
        courseId: values.course_id,
    });

    const result = await purgeStudentWhitelistData({
        dbClient,
        institutionId: whitelistScope.institutionId,
        departmentId: whitelistScope.departmentId,
        courseId: whitelistScope.courseId,
        status: values.status,
        includeClaimed: values.include_claimed,
    });

    if (result.deletedCount > 0 && whitelistScope.institutionId) {
        await ActivityNotificationService.notifyGenericInstitutionActivity({
            dbClient,
            actorUserId: requesterUserId,
            institutionId: whitelistScope.institutionId,
            operation: 'DELETED',
            targetType: 'STUDENT_WHITELIST',
            targetLabel: `${result.deletedCount} whitelist record${result.deletedCount === 1 ? '' : 's'}`,
            title: 'Student whitelist records purged',
            message: `Purged ${result.deletedCount} student whitelist record${result.deletedCount === 1 ? '' : 's'}.`,
            sourceModule: 'student_whitelist',
            sourceAction: 'purge',
            metadata: {
                deletedCount: result.deletedCount,
                skippedClaimedCount: result.skippedClaimedCount,
                status: values.status,
                includeClaimed: values.include_claimed,
            },
        });
    }

    return result;
}
