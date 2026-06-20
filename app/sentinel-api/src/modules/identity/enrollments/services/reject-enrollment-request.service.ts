import { type DbClient } from '@sentinel/db';
import { rejectEnrollmentRequestData } from '../data/reject-enrollment-request';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { LogsService } from '../../../general/logs/logs.service';

export type RejectEnrollmentRequestServiceArgs = {
    dbClient: DbClient;
    requestIds: string[];
    approverId: string;
};

/**
 * Rejects one or more enrolment requests. Fires an activity notification and
 * a telemetry log for the rejector's institution when requests are processed.
 *
 * @param args.dbClient - Database client
 * @param args.requestIds - IDs of requests to reject
 * @param args.approverId - User ID of the rejector
 * @returns Rejected request IDs
 */
export async function rejectEnrollmentRequestService({
    dbClient,
    requestIds,
    approverId,
}: RejectEnrollmentRequestServiceArgs) {
    const result = await rejectEnrollmentRequestData({ dbClient, requestIds, approverId });

    if (result.length > 0) {
        await ActivityNotificationService.notifySubjectEnrollmentRequestRejected({
            dbClient,
            actorUserId: approverId,
            requestIds: result,
        });

        try {
            const profile = await dbClient
                .selectFrom('user_profiles')
                .select(['institution_id'])
                .where('user_id', '=', approverId)
                .executeTakeFirst();

            if (profile?.institution_id) {
                await LogsService.createLog(dbClient, {
                    userId: approverId,
                    action: 'enrollment.rejected',
                    resourceType: 'enrollment',
                    resourceId: result[0],
                    activeInstitutionId: profile.institution_id,
                    details: { requestIds: result, reason: 'request rejected' },
                });
            }
        } catch (logErr) {
            console.error('Failed to log enrollment.rejected:', logErr);
        }
    }

    return result;
}

export type RejectEnrollmentRequestServiceResponse = Awaited<
    ReturnType<typeof rejectEnrollmentRequestService>
>;
