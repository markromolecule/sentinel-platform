import { type DbClient } from '@sentinel/db';
import { bulkImportStudentWhitelist } from './services/bulk-import-student-whitelist';
import { createStudentWhitelist } from './services/create-student-whitelist';
import { deleteStudentWhitelist } from './services/delete-student-whitelist';
import { getStudentWhitelist } from './services/get-student-whitelist';
import { purgeStudentWhitelist } from './services/purge-student-whitelist';
import { updateStudentWhitelist } from './services/update-student-whitelist';
import type {
    BulkImportStudentWhitelistArgs,
    CreateStudentWhitelistArgs,
    DeleteStudentWhitelistArgs,
    GetStudentWhitelistArgs,
    PurgeStudentWhitelistArgs,
    UpdateStudentWhitelistArgs,
} from './student-whitelist.types';

export class StudentWhitelistService {
    static async getStudentWhitelist(dbClient: DbClient, args: GetStudentWhitelistArgs) {
        return await getStudentWhitelist(dbClient, args);
    }

    static async createStudentWhitelist(dbClient: DbClient, args: CreateStudentWhitelistArgs) {
        return await createStudentWhitelist(dbClient, args);
    }

    static async updateStudentWhitelist(dbClient: DbClient, args: UpdateStudentWhitelistArgs) {
        return await updateStudentWhitelist(dbClient, args);
    }

    static async deleteStudentWhitelist(dbClient: DbClient, args: DeleteStudentWhitelistArgs) {
        return await deleteStudentWhitelist(dbClient, args);
    }

    static async bulkImportStudentWhitelist(
        dbClient: DbClient,
        args: BulkImportStudentWhitelistArgs,
    ) {
        return await bulkImportStudentWhitelist(dbClient, args);
    }

    static async purgeStudentWhitelist(dbClient: DbClient, args: PurgeStudentWhitelistArgs) {
        return await purgeStudentWhitelist(dbClient, args);
    }
}
