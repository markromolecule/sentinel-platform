import { type DbClient } from '@sentinel/db';

export const unenrollStudentData = async ({
    dbClient,
    enrollmentId,
}: {
    dbClient: DbClient;
    enrollmentId: string;
}) => {
    await dbClient.deleteFrom('enrollments').where('enrollment_id', '=', enrollmentId).execute();
};
