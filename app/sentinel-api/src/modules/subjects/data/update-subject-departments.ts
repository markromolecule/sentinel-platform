import { type DbClient } from '@sentinel/db';

export type UpdateSubjectDepartmentsDataArgs = {
    dbClient: DbClient;
    subjectId: string;
    departmentIds: string[];
};

export async function updateSubjectDepartmentsData({
    dbClient,
    subjectId,
    departmentIds,
}: UpdateSubjectDepartmentsDataArgs) {
    await dbClient.deleteFrom('subject_departments').where('subject_id', '=', subjectId).execute();

    if (departmentIds.length === 0) {
        return;
    }

    await dbClient
        .insertInto('subject_departments')
        .values(
            departmentIds.map((departmentId) => ({
                subject_id: subjectId,
                department_id: departmentId,
            })),
        )
        .execute();
}
