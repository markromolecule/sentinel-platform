import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export async function findManageableExam(args: {
    dbClient: DbClient;
    examId: string;
    userId: string;
    institutionId?: string;
}) {
    const { dbClient, examId, userId, institutionId } = args;

    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
        .innerJoin('user_profiles as assigner_profile', 'assigner_profile.user_id', 'e.created_by')
        .select([
            'e.exam_id as id',
            'e.title',
            'e.created_by as createdBy',
            'e.institution_id as institutionId',
            'e.scheduled_date as scheduledDate',
            'e.end_date_time as endDateTime',
            's.subject_title as subjectTitle',
            sql<string>`trim(concat(assigner_profile.first_name, ' ', assigner_profile.last_name))`.as(
                'assignerName',
            ),
        ])
        .where('e.exam_id', '=', examId)
        .where('e.created_by', '=', userId);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
