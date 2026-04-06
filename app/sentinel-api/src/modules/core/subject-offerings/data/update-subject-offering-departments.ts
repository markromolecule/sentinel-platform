import { type DbClient } from '@sentinel/db';

export type UpdateSubjectOfferingDepartmentsDataArgs = {
    dbClient: DbClient;
    subjectOfferingId: string;
    departmentIds: string[];
};

export async function updateSubjectOfferingDepartmentsData({
    dbClient,
    subjectOfferingId,
    departmentIds,
}: UpdateSubjectOfferingDepartmentsDataArgs) {
    await dbClient
        .deleteFrom('subject_offering_departments')
        .where('subject_offering_id', '=', subjectOfferingId)
        .execute();

    if (departmentIds.length === 0) {
        return;
    }

    await dbClient
        .insertInto('subject_offering_departments')
        .values(
            departmentIds.map((departmentId) => ({
                subject_offering_id: subjectOfferingId,
                department_id: departmentId,
            })),
        )
        .execute();
}
