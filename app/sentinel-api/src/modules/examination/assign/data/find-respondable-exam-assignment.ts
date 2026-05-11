import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export async function findRespondableExamAssignment(args: {
    dbClient: DbClient;
    assignmentId: string;
    userId: string;
    institutionId?: string;
}) {
    const { dbClient, assignmentId, userId, institutionId } = args;

    let query = dbClient
        .selectFrom('proctor_assignments as pa')
        .innerJoin('exams as e', 'e.exam_id', 'pa.exam_id')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
        .innerJoin('user_profiles as assigner_profile', 'assigner_profile.user_id', 'e.created_by')
        .innerJoin(
            'user_profiles as assignee_profile',
            'assignee_profile.user_id',
            'pa.instructor_id',
        )
        .select([
            'pa.assignment_id as id',
            'pa.status',
            'pa.scheduled_at as scheduledAt',
            'pa.created_at as createdAt',
            'pa.updated_at as updatedAt',
            'e.exam_id as examId',
            'e.title as examTitle',
            'e.scheduled_date as examScheduledDate',
            'e.end_date_time as examEndDateTime',
            's.subject_title as subjectTitle',
            'e.created_by as assignerId',
            sql<string>`trim(concat(assigner_profile.first_name, ' ', assigner_profile.last_name))`.as(
                'assignerName',
            ),
            'pa.instructor_id as assigneeId',
            sql<string>`trim(concat(assignee_profile.first_name, ' ', assignee_profile.last_name))`.as(
                'assigneeName',
            ),
        ])
        .where('pa.assignment_id', '=', assignmentId)
        .where('pa.instructor_id', '=', userId);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
