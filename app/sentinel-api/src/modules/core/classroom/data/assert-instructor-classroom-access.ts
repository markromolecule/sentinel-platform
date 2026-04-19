import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export async function assertInstructorClassroomAccess({
    dbClient,
    classGroupId,
    userId,
    institutionId,
}: {
    dbClient: DbClient;
    classGroupId: string;
    userId: string;
    institutionId: string;
}) {
    const classroom = await dbClient
        .selectFrom('class_groups as cg')
        .innerJoin('class_roles as cr', 'cr.class_group_id', 'cg.class_group_id')
        .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
        .select(['cg.class_group_id'])
        .where('cg.class_group_id', '=', classGroupId)
        .where('cg.institution_id', '=', institutionId)
        .where('cr.user_id', '=', userId)
        .where('r.role_name', '=', 'instructor')
        .executeTakeFirst();

    if (!classroom) {
        throw new HTTPException(404, { message: 'Classroom not found.' });
    }

    return classroom;
}
