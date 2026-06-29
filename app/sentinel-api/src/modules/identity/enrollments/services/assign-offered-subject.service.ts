import { type DbClient } from '@sentinel/db';
import { assignOfferedSubjectData } from '../data/enroll-instructor';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { LogsService } from '../../../general/logs/logs.service';

export type AssignOfferedSubjectServiceArgs = {
    dbClient: DbClient;
    instructorId: string;
    subjectOfferingId: string;
    approvedBy: string;
};

/**
 * Assigns an offered subject directly to an instructor. Pre-approves enrollment and maps roles.
 * Fires activity notifications and telemetry logs.
 *
 * @param args.dbClient - Database client
 * @param args.instructorId - Target instructor user ID
 * @param args.subjectOfferingId - Offered subject ID
 * @param args.approvedBy - Administrator/support user ID who assigns the subject
 * @returns Resulting arrays of assigned IDs
 */
export async function assignOfferedSubjectService({
    dbClient,
    instructorId,
    subjectOfferingId,
    approvedBy,
}: AssignOfferedSubjectServiceArgs) {
    const result = await assignOfferedSubjectData({
        dbClient,
        instructorId,
        subjectOfferingId,
        approvedBy,
    });

    if (result.enrollmentRequestIds.length > 0) {
        await ActivityNotificationService.notifySubjectEnrollmentRequestApproved({
            dbClient,
            actorUserId: approvedBy,
            requestIds: result.enrollmentRequestIds,
        });

        // Telemetry logging
        try {
            const profile = await dbClient
                .selectFrom('user_profiles')
                .select(['institution_id'])
                .where('user_id', '=', approvedBy)
                .executeTakeFirst();

            if (profile?.institution_id) {
                await LogsService.createLog(dbClient, {
                    userId: approvedBy,
                    action: 'enrollment.approved',
                    resourceType: 'enrollment',
                    resourceId: result.enrollmentRequestIds[0],
                    activeInstitutionId: profile.institution_id,
                    details: {
                        requestIds: result.enrollmentRequestIds,
                        assignedBy: 'admin',
                    },
                });
            }
        } catch (logErr) {
            console.error('Failed to log direct enrollment approval:', logErr);
        }
    }

    return result;
}

export type AssignOfferedSubjectServiceResponse = Awaited<
    ReturnType<typeof assignOfferedSubjectService>
>;
