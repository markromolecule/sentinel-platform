import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export async function findAssigneeInstructor(args: {
    dbClient: DbClient;
    assigneeId: string;
    institutionId?: string;
}) {
    const { dbClient, assigneeId, institutionId } = args;

    let query = dbClient
        .selectFrom('instructors as ins')
        .innerJoin('user_profiles as up', 'up.user_id', 'ins.user_id')
        .innerJoin('user_roles as ur', 'ur.user_id', 'ins.user_id')
        .innerJoin('roles as r', 'r.role_id', 'ur.role_id')
        .select([
            'ins.user_id as id',
            'ins.institution_id as institutionId',
            sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('name'),
        ])
        .where('ins.user_id', '=', assigneeId)
        .where('r.role_name', '=', 'instructor');

    if (institutionId) {
        query = query.where('ins.institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
