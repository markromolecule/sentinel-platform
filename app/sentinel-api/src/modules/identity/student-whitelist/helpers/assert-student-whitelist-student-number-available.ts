import { type DbClient } from '@sentinel/db';
import { getStudentWhitelistByStudentNumberData } from '../data/get-student-whitelist-by-student-number';
import { throwDuplicateStudentWhitelistError } from './student-whitelist-errors';

export async function assertStudentWhitelistStudentNumberAvailable({
    dbClient,
    institutionId,
    studentNumber,
    excludeId,
}: {
    dbClient: DbClient;
    institutionId: string;
    studentNumber: string;
    excludeId?: string;
}) {
    const existingRecord = await getStudentWhitelistByStudentNumberData({
        dbClient,
        institutionId,
        studentNumber,
    });

    if (existingRecord && existingRecord.whitelist_id !== excludeId) {
        throwDuplicateStudentWhitelistError();
    }
}
