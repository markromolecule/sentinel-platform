import { type DbClient, executeTransaction } from '@sentinel/db';
import { getInstructorRoleId } from './classroom-instructor-write-helper.service';

/**
 * Ensures that the classroom has a head instructor assigned.
 */
export async function ensureClassroomHeadInstructorAssignment(args: {
    dbClient: DbClient;
    classGroupId: string;
    instructorUserId: string;
}) {
    const { dbClient, classGroupId, instructorUserId } = args;
    const instructorRoleId = await getInstructorRoleId(dbClient);

    await executeTransaction(async (trx) => {
        const existingRole = await trx
            .selectFrom('class_roles')
            .select('class_group_id')
            .where('class_group_id', '=', classGroupId)
            .where('user_id', '=', instructorUserId)
            .where('role_id', '=', instructorRoleId)
            .executeTakeFirst();

        if (!existingRole) {
            await trx
                .insertInto('class_roles')
                .values({
                    class_group_id: classGroupId,
                    user_id: instructorUserId,
                    role_id: instructorRoleId,
                    assigned_at: new Date(),
                })
                .execute();
        }

        await trx
            .updateTable('classroom_instructor_assignments')
            .set({
                is_head: false,
                updated_at: new Date(),
            })
            .where('class_group_id', '=', classGroupId)
            .execute();

        await trx
            .insertInto('classroom_instructor_assignments')
            .values({
                class_group_id: classGroupId,
                instructor_user_id: instructorUserId,
                assigned_by_user_id: instructorUserId,
                is_head: true,
                status: 'ACTIVE',
                updated_at: new Date(),
            })
            .onConflict((oc) =>
                oc.columns(['class_group_id', 'instructor_user_id']).doUpdateSet({
                    assigned_by_user_id: instructorUserId,
                    is_head: true,
                    status: 'ACTIVE',
                    updated_at: new Date(),
                }),
            )
            .execute();
    });
}
