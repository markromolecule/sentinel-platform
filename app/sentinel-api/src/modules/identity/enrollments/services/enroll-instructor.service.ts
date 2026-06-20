import { type DbClient } from '@sentinel/db';
import { type EnrollInstructorSubjectBody } from '../enrollments.dto';
import { enrollInstructorData } from '../data/enroll-instructor';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { LogsService } from '../../../general/logs/logs.service';

export type EnrollInstructorServiceArgs = {
    dbClient: DbClient;
    userId: string;
    payload: EnrollInstructorSubjectBody;
    instructorDepartmentId?: string | null;
};

/**
 * Enrols an instructor in a subject offering. Fires activity and telemetry
 * notifications only when new requests are created.
 *
 * @param args.dbClient - Database client
 * @param args.userId - Instructor user ID
 * @param args.payload - Enrolment payload
 * @param args.instructorDepartmentId - Optional department scope
 * @returns Data access result including request counts and IDs
 */
export async function enrollInstructorService({
    dbClient,
    userId,
    payload,
    instructorDepartmentId,
}: EnrollInstructorServiceArgs) {
    const result = await enrollInstructorData({
        dbClient,
        userId,
        payload,
        instructorDepartmentId,
    });

    if (result.newRequestsCount > 0 && result.createdRequestIds.length > 0) {
        await ActivityNotificationService.notifySubjectEnrollmentRequestSubmitted({
            dbClient,
            actorUserId: userId,
            institutionId: result.institutionId,
            subjectOfferingId: result.subjectOfferingId,
            subjectLabel: result.subjectLabel,
            requestIds: result.createdRequestIds,
            requestCount: result.newRequestsCount,
        });

        // Telemetry logging
        try {
            await LogsService.createLog(dbClient, {
                userId: userId,
                action: 'enrollment.requested',
                resourceType: 'enrollment',
                resourceId: result.subjectOfferingId,
                activeInstitutionId: result.institutionId,
                details: {
                    subjectOfferingId: result.subjectOfferingId,
                    requestCount: result.newRequestsCount,
                    requestIds: result.createdRequestIds,
                },
            });
        } catch (logErr) {
            console.error('Failed to log enrollment.requested:', logErr);
        }
    }

    return result;
}

export type EnrollInstructorServiceResponse = Awaited<ReturnType<typeof enrollInstructorService>>;
