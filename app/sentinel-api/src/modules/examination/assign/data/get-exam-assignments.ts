import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export async function getExamAssignmentsData(args: {
    dbClient: DbClient;
    userId: string;
    institutionId?: string;
}) {
    const { dbClient, userId, institutionId } = args;

    let query = dbClient
        .selectFrom('proctor_assignments as pa')
        .innerJoin('exams as e', 'e.exam_id', 'pa.exam_id')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
        .innerJoin('user_profiles as assigner_profile', 'assigner_profile.user_id', 'e.created_by')
        .innerJoin('user_profiles as assignee_profile', 'assignee_profile.user_id', 'pa.instructor_id')
        .select([
            'pa.assignment_id as id',
            sql<'INBOUND' | 'OUTBOUND'>`case
                when pa.instructor_id = ${userId} then 'INBOUND'
                else 'OUTBOUND'
            end`.as('relationship'),
            'e.exam_id as examId',
            'e.title as examTitle',
            's.subject_title as subjectTitle',
            'e.scheduled_date as examScheduledDate',
            'e.end_date_time as examEndDateTime',
            'e.created_by as assignerId',
            sql<string>`trim(concat(assigner_profile.first_name, ' ', assigner_profile.last_name))`.as(
                'assignerName',
            ),
            'pa.instructor_id as assigneeId',
            sql<string>`trim(concat(assignee_profile.first_name, ' ', assignee_profile.last_name))`.as(
                'assigneeName',
            ),
            'pa.status',
            'pa.scheduled_at as scheduledAt',
            'pa.created_at as createdAt',
            'pa.updated_at as updatedAt',
        ])
        .where((eb) =>
            eb.or([eb('e.created_by', '=', userId), eb('pa.instructor_id', '=', userId)]),
        );

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    return await query.orderBy('pa.created_at', 'desc').execute();
}
