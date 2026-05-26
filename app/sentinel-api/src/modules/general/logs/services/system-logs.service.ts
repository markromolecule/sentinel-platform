import { type DbClient } from '@sentinel/db';
import { createLogData } from '../data/create-log';
import { getLogsData } from '../data/get-logs';
import type { LogQuery } from '../logs.dto';

export class SystemLogsService {
    /**
     * Captures a system operational diagnostic, job completion, or module exception.
     *
     * @param dbClient database client
     * @param args log actions and details
     */
    static async logSystemEvent(
        dbClient: DbClient,
        args: {
            action: string;
            details?: any;
            institutionId?: string | null;
            branchId?: string | null;
        },
    ) {
        return await createLogData({
            dbClient,
            values: {
                action: args.action,
                resource_type: 'system',
                resource_id: 'system',
                details: args.details,
                institution_id: args.institutionId,
                branch_id: args.branchId,
            },
        });
    }

    /**
     * Fetches paginated backend system error and integration logs.
     *
     * @param dbClient database client
     * @param scopingInstitutionId parent institution boundary ID
     * @param scopingBranchId child branch context boundary ID
     * @param filters request pagination query parameters
     */
    static async getSystemLogs(
        dbClient: DbClient,
        scopingInstitutionId: string,
        scopingBranchId: string | null | undefined,
        filters: LogQuery,
    ) {
        const systemFilters: LogQuery = {
            ...filters,
            resourceType: 'system',
        };

        return await getLogsData({
            dbClient,
            scopingInstitutionId,
            scopingBranchId,
            filters: systemFilters,
        });
    }
}
