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
    const subjectOffering = await dbClient
        .selectFrom('subject_offerings')
        .select(['subject_offering_id', 'subject_id', 'term_id', 'institution_id', 'status'])
        .where('subject_offering_id', '=', payload.subject_offering_id)
        .executeTakeFirst();

    if (!subjectOffering) {
        throw new Error('Offered subject not found');
    }

    if (subjectOffering.status === 'CLOSED' || subjectOffering.status === 'ARCHIVED') {
        throw new Error('This offered subject is no longer open for enrollment');
    }

    const allowedSectionRows = await dbClient
        .selectFrom('subject_offering_sections')
        .select('section_id')
        .where('subject_offering_id', '=', subjectOffering.subject_offering_id)
        .where('section_id', 'in', payload.section_ids)
        .execute();

    const allowedSectionIds = new Set(allowedSectionRows.map((row) => row.section_id));
    const invalidSectionIds = payload.section_ids.filter((sectionId) => !allowedSectionIds.has(sectionId));

    if (invalidSectionIds.length > 0) {
        throw new Error('One or more selected sections do not belong to this offered subject');
    }

    const classGroupIds: string[] = [];

    let newRequestsCount = 0;
    let existingRequestsCount = 0;
    let existingRolesCount = 0;

    for (const sectionId of payload.section_ids) {
        let classGroup = await dbClient
            .selectFrom('class_groups')
            .select('class_group_id')
            .where('subject_offering_id', '=', subjectOffering.subject_offering_id)
            .where('section_id', '=', sectionId)
            .executeTakeFirst();

        if (!classGroup) {
            classGroup = await dbClient
                .insertInto('class_groups')
                .values({
                    subject_id: subjectOffering.subject_id,
                    subject_offering_id: subjectOffering.subject_offering_id,
                    section_id: sectionId,
                    term_id: subjectOffering.term_id,
                    institution_id: subjectOffering.institution_id,
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
