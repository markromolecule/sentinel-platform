import { type DbClient } from '@sentinel/db';
import { createLogData } from '../data/create-log';
import { getLogsData } from '../data/get-logs';
import type { LogQuery, LogRecord } from '../logs.dto';

export class ActivityLogsService {
    /**
     * Captures a user operational action (CRUD actions, administrative decisions).
     *
     * @param dbClient database client
     * @param args operational context details
     */
    static async logActivityEvent(
        dbClient: DbClient,
        args: {
            userId: string;
            action: string;
            resourceType: string;
            resourceId: string;
            details?: any;
            ipAddress?: string | null;
            institutionId?: string | null;
            branchId?: string | null;
        },
    ) {
        return await createLogData({
            dbClient,
            values: {
                user_id: args.userId,
                action: args.action,
                resource_type: args.resourceType,
                resource_id: args.resourceId,
                details: args.details,
                ip_address: args.ipAddress,
                institution_id: args.institutionId,
                branch_id: args.branchId,
            },
        });
    }

    /**
     * Fetches paginated user activity and administration logs.
     *
     * @param dbClient database client
     * @param scopingInstitutionId parent institution boundary ID
     * @param scopingBranchId child branch context boundary ID
     * @param filters request pagination query parameters
     */
    static async getActivityLogs(
        dbClient: DbClient,
        scopingInstitutionId: string,
        scopingBranchId: string | null | undefined,
        filters: LogQuery,
    ) {
        const baseResult = await getLogsData({
            dbClient,
            scopingInstitutionId,
            scopingBranchId,
            filters,
        });

        // Exclude system and authentication categories from operational feeds
        const filteredItems = baseResult.items.filter(
            (item: LogRecord) => item.resourceType !== 'auth' && item.resourceType !== 'system'
        );

        return {
            ...baseResult,
            items: filteredItems,
        };
    }
}
