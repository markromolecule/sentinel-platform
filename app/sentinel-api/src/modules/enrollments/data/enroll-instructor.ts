import { type DbClient } from '@sentinel/db';
import { EnrollInstructorSubjectBody } from '../enrollments.dto';

export const enrollInstructorData = async ({
    dbClient,
    userId,
    payload,
}: {
    dbClient: DbClient;
    userId: string;
    payload: EnrollInstructorSubjectBody;
}) => {
    // find the subject_id by subject_code
    const subject = await dbClient
        .selectFrom('subjects')
        .select('subject_id')
        .where('subject_code', '=', payload.subject_code)
        .executeTakeFirst();

    if (!subject) throw new Error('Subject not found');

    const classGroupIds: string[] = [];

    let newRequestsCount = 0;
    let existingRequestsCount = 0;
    let existingRolesCount = 0;

    // Assuming we do an asynchronous map / loop to handle multiple section_ids
    for (const sectionId of payload.section_ids) {
        // Find existing class group
        let classGroup = await dbClient
            .selectFrom('class_groups')
            .select('class_group_id')
            .where('subject_id', '=', subject.subject_id)
            .where('section_id', '=', sectionId)
            // .where('term_id', '=', ...) // Optionally handle terms later
            .executeTakeFirst();

        if (!classGroup) {
            classGroup = await dbClient
                .insertInto('class_groups')
                .values({
                    subject_id: subject.subject_id,
                    section_id: sectionId,
                })
                .returning('class_group_id')
                .executeTakeFirstOrThrow();
        }

        classGroupIds.push(classGroup.class_group_id);

        const existingRole = await dbClient
            .selectFrom('class_roles')
            .select(['class_group_id'])
            .where('class_group_id', '=', classGroup.class_group_id)
            .where('user_id', '=', userId)
            .executeTakeFirst();

        if (!existingRole) {
            // Check if there is already a pending request
            const existingRequest = await dbClient
                .selectFrom('enrollment_requests')
                .select(['request_id'])
                .where('class_group_id', '=', classGroup.class_group_id)
                .where('user_id', '=', userId)
                .where('status', '=', 'PENDING')
                .executeTakeFirst();

            if (!existingRequest) {
                await dbClient
                    .insertInto('enrollment_requests')
                    .values({
                        class_group_id: classGroup.class_group_id,
                        user_id: userId,
                        status: 'PENDING',
                    })
                    .execute();
                newRequestsCount++;
            } else {
                existingRequestsCount++;
            }
        } else {
            existingRolesCount++;
        }
    }

    return {
        classGroupIds,
        newRequestsCount,
        existingRequestsCount,
        existingRolesCount,
        total: payload.section_ids.length,
    };
};
