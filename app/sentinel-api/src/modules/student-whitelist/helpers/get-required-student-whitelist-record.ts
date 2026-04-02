import { type DbClient } from '@sentinel/db';
import { getStudentWhitelistByIdData } from '../data/get-student-whitelist-by-id';

export async function getRequiredStudentWhitelistRecord(
    dbClient: DbClient,
    id: string,
    scope?: {
        institutionId?: string;
        departmentId?: string;
        courseId?: string;
    },
) {
    const record = await getStudentWhitelistByIdData({
        dbClient,
        id,
        institutionId: scope?.institutionId,
        departmentId: scope?.departmentId,
        courseId: scope?.courseId,
    });

    if (!record) {
        throw new Error('Student whitelist record not found');
    }

    return record;
}
