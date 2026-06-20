import { type DbClient } from '@sentinel/db';
import { type EnrollStudentsBody } from '../enrollments.dto';
import { enrollStudentsData } from '../data/enroll-students';
import { previewStudentEnrollmentData } from '../data/preview-student-enrollment';
import { LogsService } from '../../../general/logs/logs.service';

// ---------------------------------------------------------------------------
// Enrol students
// ---------------------------------------------------------------------------

export type EnrollStudentsServiceArgs = {
    dbClient: DbClient;
    institutionId: string;
    userId: string;
    payload: EnrollStudentsBody;
};

/**
 * Bulk-enrols students into a class group and logs a telemetry event.
 *
 * @param args.dbClient - Database client
 * @param args.institutionId - Institution context
 * @param args.userId - Acting user ID
 * @param args.payload - Enrolment payload (student numbers, class group ID, etc.)
 * @returns Data access result
 */
export async function enrollStudentsService({
    dbClient,
    institutionId,
    userId,
    payload,
}: EnrollStudentsServiceArgs) {
    const result = await enrollStudentsData({ dbClient, institutionId, userId, payload });

    try {
        await LogsService.createLog(dbClient, {
            userId: userId,
            action: 'enrollment.bulk_student_enrolled',
            resourceType: 'enrollment',
            resourceId: payload.classGroupId,
            activeInstitutionId: institutionId,
            details: {
                classGroupId: payload.classGroupId,
                studentNumbersCount: payload.studentNumbers?.length || 0,
            },
        });
    } catch (logErr) {
        console.error('Failed to log enrollment.bulk_student_enrolled:', logErr);
    }

    return result;
}

// ---------------------------------------------------------------------------
// Preview student enrolment
// ---------------------------------------------------------------------------

export type PreviewStudentEnrollmentServiceArgs = {
    dbClient: DbClient;
    institutionId: string;
    userId: string;
    studentNumbers: string[];
    classGroupId?: string;
};

/**
 * Returns a preview of which students would be enrolled (existing vs new)
 * without making any changes to the database.
 *
 * @param args.dbClient - Database client
 * @param args.institutionId - Institution context
 * @param args.userId - Acting user ID
 * @param args.studentNumbers - Student numbers to preview
 * @param args.classGroupId - Optional class group filter
 */
export async function previewStudentEnrollmentService({
    dbClient,
    institutionId,
    userId,
    studentNumbers,
    classGroupId,
}: PreviewStudentEnrollmentServiceArgs) {
    return previewStudentEnrollmentData({ dbClient, institutionId, userId, studentNumbers, classGroupId });
}

export type PreviewStudentEnrollmentServiceResponse = Awaited<
    ReturnType<typeof previewStudentEnrollmentService>
>;
