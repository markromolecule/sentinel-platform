import { type DbClient } from '@sentinel/db';
import { getStudentClassroomsData } from '../data/get-student-classrooms';
import { unenrollStudentData } from '../data/unenroll-student';
import { LogsService } from '../../../general/logs/logs.service';

// ---------------------------------------------------------------------------
// Get student classrooms
// ---------------------------------------------------------------------------

export type GetStudentClassroomsServiceArgs = {
    dbClient: DbClient;
    userId: string;
};

/**
 * Returns all classrooms (class groups) a student is currently enrolled in.
 *
 * @param args.dbClient - Database client
 * @param args.userId - Student user ID
 */
export async function getStudentClassroomsService({
    dbClient,
    userId,
}: GetStudentClassroomsServiceArgs) {
    return getStudentClassroomsData({ dbClient, userId });
}

// ---------------------------------------------------------------------------
// Unenrol single student
// ---------------------------------------------------------------------------

export type UnenrollStudentServiceArgs = {
    dbClient: DbClient;
    enrollmentId: string;
};

/**
 * Removes a single student enrolment and logs a telemetry event.
 *
 * @param args.dbClient - Database client
 * @param args.enrollmentId - Enrolment record ID to remove
 * @returns Data access result
 */
export async function unenrollStudentService({
    dbClient,
    enrollmentId,
}: UnenrollStudentServiceArgs) {
    const enrollment = await dbClient
        .selectFrom('enrollments as e')
        .innerJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
        .select(['cg.institution_id', 'e.student_id'])
        .where('e.enrollment_id', '=', enrollmentId)
        .executeTakeFirst();

    const result = await unenrollStudentData({ dbClient, enrollmentId });

    if (enrollment?.institution_id) {
        try {
            await LogsService.createLog(dbClient, {
                userId: '00000000-0000-0000-0000-000000000000',
                action: 'enrollment.deleted',
                resourceType: 'enrollment',
                resourceId: enrollmentId,
                activeInstitutionId: enrollment.institution_id,
                details: { enrollmentId, studentId: enrollment.student_id },
            });
        } catch (logErr) {
            console.error('Failed to log enrollment.deleted:', logErr);
        }
    }

    return result;
}

// ---------------------------------------------------------------------------
// Bulk unenrol students
// ---------------------------------------------------------------------------

export type BulkUnenrollStudentsServiceArgs = {
    dbClient: DbClient;
    enrollmentIds: string[];
};

/**
 * Unenrols multiple students by deleting their enrolment records and logging
 * a telemetry event per record.
 *
 * @param args.dbClient - Database client
 * @param args.enrollmentIds - Array of enrolment IDs to delete
 */
export async function bulkUnenrollStudentsService({
    dbClient,
    enrollmentIds,
}: BulkUnenrollStudentsServiceArgs): Promise<void> {
    const enrollments = await dbClient
        .selectFrom('enrollments as e')
        .innerJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
        .select(['cg.institution_id', 'e.student_id', 'e.enrollment_id'])
        .where('e.enrollment_id', 'in', enrollmentIds)
        .execute();

    await dbClient.deleteFrom('enrollments').where('enrollment_id', 'in', enrollmentIds).execute();

    for (const enrollment of enrollments) {
        if (enrollment.institution_id) {
            try {
                await LogsService.createLog(dbClient, {
                    userId: '00000000-0000-0000-0000-000000000000',
                    action: 'enrollment.deleted',
                    resourceType: 'enrollment',
                    resourceId: enrollment.enrollment_id,
                    activeInstitutionId: enrollment.institution_id,
                    details: {
                        enrollmentId: enrollment.enrollment_id,
                        studentId: enrollment.student_id,
                    },
                });
            } catch (logErr) {
                console.error('Failed to log enrollment.deleted:', logErr);
            }
        }
    }
}
