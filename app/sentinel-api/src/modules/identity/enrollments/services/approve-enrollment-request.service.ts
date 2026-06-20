import { type DbClient } from '@sentinel/db';
import { approveEnrollmentRequestData } from '../data/approve-enrollment-request';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { LogsService } from '../../../general/logs/logs.service';

export type ApproveEnrollmentRequestServiceArgs = {
    dbClient: DbClient;
    requestIds: string[];
    approverId: string;
};

/**
 * Approves one or more enrolment requests. Fires an activity notification and
 * a telemetry log for the approver's institution when requests are processed.
 *
 * @param args.dbClient - Database client
 * @param args.requestIds - IDs of requests to approve
 * @param args.approverId - User ID of the approver
 * @returns Data access result rows
 */
export async function approveEnrollmentRequestService({
    dbClient,
    requestIds,
    approverId,
}: ApproveEnrollmentRequestServiceArgs) {
    const result = await approveEnrollmentRequestData({ dbClient, requestIds, approverId });
    const processedRequestIds = result.map((row: any) => row.request_id).filter(Boolean);

    if (processedRequestIds.length > 0) {
        await ActivityNotificationService.notifySubjectEnrollmentRequestApproved({
            dbClient,
            actorUserId: approverId,
            requestIds: processedRequestIds,
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
                    action: 'enrollment.approved',
                    resourceType: 'enrollment',
                    resourceId: processedRequestIds[0],
                    activeInstitutionId: profile.institution_id,
                    details: { requestIds: processedRequestIds },
                });
            }
        } catch (logErr) {
            console.error('Failed to log enrollment.approved:', logErr);
        }
    }

    return result;
}

export type ApproveEnrollmentRequestServiceResponse = Awaited<
    ReturnType<typeof approveEnrollmentRequestService>
>;
