import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { NotificationService } from '../../../general/notification/notification.service';
import { LogsService } from '../../../general/logs/logs.service';
import { buildClassroomNotificationLabel } from './classroom-instructor-query.service';

/**
 * Acknowledges a classroom instructor assignment.
 */
export async function acknowledgeClassroomAssignment(args: {
    dbClient: DbClient;
    classGroupId: string;
    instructorUserId: string;
    justification?: string;
}) {
    const { dbClient, classGroupId, instructorUserId, justification } = args;

    const assignment = await dbClient
        .selectFrom('classroom_instructor_assignments')
        .select(['assignment_id', 'status'])
        .where('class_group_id', '=', classGroupId)
        .where('instructor_user_id', '=', instructorUserId)
        .executeTakeFirst();

    if (!assignment) {
        throw new HTTPException(404, {
            message: 'Classroom instructor assignment not found.',
        });
    }

    // Fetch classroom context and head instructor for notification routing
    const classroom = await dbClient
        .selectFrom('class_groups as cg')
        .leftJoin('subjects as s', 's.subject_id', 'cg.subject_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .select([
            'cg.institution_id',
            'cg.class_name',
            's.subject_title',
            'sec.section_name',
        ])
        .where('cg.class_group_id', '=', classGroupId)
        .executeTakeFirst();

    const headAssignment = await dbClient
        .selectFrom('classroom_instructor_assignments')
        .select('instructor_user_id')
        .where('class_group_id', '=', classGroupId)
        .where('is_head', '=', true)
        .executeTakeFirst();

    const instructorProfile = await dbClient
        .selectFrom('user_profiles')
        .select([sql<string>`trim(concat(first_name, ' ', last_name))`.as('name')])
        .where('user_id', '=', instructorUserId)
        .executeTakeFirst();

    await dbClient
        .updateTable('classroom_instructor_assignments')
        .set({
            status: 'ACKNOWLEDGED',
            responded_at: new Date(),
            justification: justification || null,
            updated_at: new Date(),
        })
        .where('class_group_id', '=', classGroupId)
        .where('instructor_user_id', '=', instructorUserId)
        .execute();

    const institutionId = classroom?.institution_id ?? null;
    const classroomLabel = buildClassroomNotificationLabel({
        class_name: classroom?.class_name,
        subject_title: classroom?.subject_title,
        section_name: classroom?.section_name,
    });
    const instructorName = instructorProfile?.name ?? 'Instructor';

    // Notify the head instructor that the assignment was acknowledged
    if (headAssignment?.instructor_user_id && headAssignment.instructor_user_id !== instructorUserId) {
        try {
            await NotificationService.notifyClassroomAssignmentAcknowledged({
                dbClient,
                recipientUserId: headAssignment.instructor_user_id,
                actorUserId: instructorUserId,
                institutionId,
                classGroupId,
                classroomLabel,
                instructorName,
            });
        } catch (notifErr) {
            console.error('Failed to send acknowledgment notification:', notifErr);
        }
    }

    // Audit log the acknowledgment
    if (institutionId) {
        try {
            await LogsService.createLog(dbClient, {
                userId: instructorUserId,
                action: 'classroom_assignment.acknowledged',
                resourceType: 'classroom_instructor_assignment',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: { classGroupId, instructorUserId, justification: justification ?? null },
            });
        } catch (logErr) {
            console.error('Failed to log classroom_assignment.acknowledged:', logErr);
        }
    }
}

/**
 * Flags a classroom instructor assignment (due to conflict, workload, etc).
 */
export async function flagClassroomAssignment(args: {
    dbClient: DbClient;
    classGroupId: string;
    instructorUserId: string;
    flagReason: string;
    justification?: string;
}) {
    const { dbClient, classGroupId, instructorUserId, flagReason, justification } = args;

    const assignment = await dbClient
        .selectFrom('classroom_instructor_assignments')
        .select(['assignment_id', 'status'])
        .where('class_group_id', '=', classGroupId)
        .where('instructor_user_id', '=', instructorUserId)
        .executeTakeFirst();

    if (!assignment) {
        throw new HTTPException(404, {
            message: 'Classroom instructor assignment not found.',
        });
    }

    // Fetch classroom context for notification and audit
    const classroom = await dbClient
        .selectFrom('class_groups as cg')
        .leftJoin('subjects as s', 's.subject_id', 'cg.subject_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .select([
            'cg.institution_id',
            'cg.class_name',
            's.subject_title',
            'sec.section_name',
        ])
        .where('cg.class_group_id', '=', classGroupId)
        .executeTakeFirst();

    const headAssignment = await dbClient
        .selectFrom('classroom_instructor_assignments')
        .select('instructor_user_id')
        .where('class_group_id', '=', classGroupId)
        .where('is_head', '=', true)
        .executeTakeFirst();

    const instructorProfile = await dbClient
        .selectFrom('user_profiles')
        .select([sql<string>`trim(concat(first_name, ' ', last_name))`.as('name')])
        .where('user_id', '=', instructorUserId)
        .executeTakeFirst();

    await dbClient
        .updateTable('classroom_instructor_assignments')
        .set({
            status: 'FLAGGED',
            responded_at: new Date(),
            flag_reason: flagReason,
            justification: justification || null,
            updated_at: new Date(),
        })
        .where('class_group_id', '=', classGroupId)
        .where('instructor_user_id', '=', instructorUserId)
        .execute();

    const institutionId = classroom?.institution_id ?? null;
    const classroomLabel = buildClassroomNotificationLabel({
        class_name: classroom?.class_name,
        subject_title: classroom?.subject_title,
        section_name: classroom?.section_name,
    });
    const instructorName = instructorProfile?.name ?? 'Instructor';

    // Notify the head instructor that the assignment was flagged
    if (headAssignment?.instructor_user_id && headAssignment.instructor_user_id !== instructorUserId) {
        try {
            await NotificationService.notifyClassroomAssignmentFlagged({
                dbClient,
                recipientUserId: headAssignment.instructor_user_id,
                actorUserId: instructorUserId,
                institutionId,
                classGroupId,
                classroomLabel,
                instructorName,
                flagReason,
            });
        } catch (notifErr) {
            console.error('Failed to send flag notification:', notifErr);
        }
    }

    // Audit log the flag action
    if (institutionId) {
        try {
            await LogsService.createLog(dbClient, {
                userId: instructorUserId,
                action: 'classroom_assignment.flagged',
                resourceType: 'classroom_instructor_assignment',
                resourceId: classGroupId,
                activeInstitutionId: institutionId,
                details: {
                    classGroupId,
                    instructorUserId,
                    flagReason,
                    justification: justification ?? null,
                },
            });
        } catch (logErr) {
            console.error('Failed to log classroom_assignment.flagged:', logErr);
        }
    }
}
