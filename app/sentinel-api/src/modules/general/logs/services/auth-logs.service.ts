import { type DbClient } from '@sentinel/db';
import { createLogData } from '../data/create-log';
import { getLogsData } from '../data/get-logs';
import type { LogQuery } from '../logs.dto';

export class AuthLogsService {
    /**
     * Captures and stores an authentication event (login, logout, failures).
     *
     * @param dbClient database client
     * @param args log details and context variables
     */
    static async logAuthEvent(
        dbClient: DbClient,
        args: {
            userId?: string | null;
            action:
                | 'auth.login'
                | 'auth.logout'
                | 'auth.failed_login'
                | 'auth.session_expiry'
                | 'auth.token_refresh';
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
                resource_type: 'auth',
                resource_id: args.userId ?? null,
                details: args.details,
                ip_address: args.ipAddress,
                institution_id: args.institutionId,
                branch_id: args.branchId,
            },
        });
    }

    /**
     * Fetches paginated authentication and session activity logs.
     *
     * @param dbClient database client
     * @param scopingInstitutionId parent institution boundary ID
     * @param scopingBranchId child branch context boundary ID
     * @param filters request pagination query parameters
     */
    static async getAuthLogs(
        dbClient: DbClient,
        scopingInstitutionId: string,
        scopingBranchId: string | null | undefined,
        filters: LogQuery,
    ) {
        const authFilters: LogQuery = {
            ...filters,
            resourceType: 'auth',
        };

        return await getLogsData({
            dbClient,
            scopingInstitutionId,
            scopingBranchId,
            filters: authFilters,
        });
    }
}
