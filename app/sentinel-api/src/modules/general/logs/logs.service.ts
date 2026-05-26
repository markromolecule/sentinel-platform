import { type DbClient } from '@sentinel/db';
import { AuthLogsService } from './services/auth-logs.service';
import { ActivityLogsService } from './services/activity-logs.service';
import { SystemLogsService } from './services/system-logs.service';
import type { LogQuery } from './logs.dto';

export class LogsService {
    /**
     * Resolves the parent institution and sub-branch context based on user's active institution.
     *
     * @param dbClient database client
     * @param activeInstitutionId user's current logged-in institution ID
     * @returns scopingInstitutionId (parent context) and scopingBranchId (if child kind)
     */
    static async resolveInstitutionHierarchy(
        dbClient: DbClient,
        activeInstitutionId: string,
    ) {
        if (!activeInstitutionId) {
            return {
                scopingInstitutionId: '',
                scopingBranchId: null,
            };
        }

        const institution = await dbClient
            .selectFrom('institutions')
            .select(['id', 'parent_institution_id as parentId', 'institution_kind as kind'])
            .where('id', '=', activeInstitutionId)
            .executeTakeFirst();

        if (!institution) {
            return {
                scopingInstitutionId: activeInstitutionId,
                scopingBranchId: null,
            };
        }

        if (institution.kind === 'CHILD' && institution.parentId) {
            return {
                scopingInstitutionId: institution.parentId,
                scopingBranchId: activeInstitutionId,
            };
        }

        return {
            scopingInstitutionId: activeInstitutionId,
            scopingBranchId: null,
        };
    }

    /**
     * Expose internal structured logging function for other modules to invoke.
     * Maps and routes the log creation call to appropriate sub-services transactionally.
     *
     * @param dbClient database client
     * @param args log details and active user session institutionId
     */
    static async createLog(
        dbClient: DbClient,
        args: {
            userId?: string | null;
            action: string;
            resourceType?: string | null;
            resourceId?: string | null;
            details?: any;
            ipAddress?: string | null;
            activeInstitutionId: string;
        },
    ) {
        const { scopingInstitutionId, scopingBranchId } = await this.resolveInstitutionHierarchy(
            dbClient,
            args.activeInstitutionId
        );

        if (args.resourceType === 'auth') {
            return await AuthLogsService.logAuthEvent(dbClient, {
                userId: args.userId,
                action: args.action as any,
                details: args.details,
                ipAddress: args.ipAddress,
                institutionId: scopingInstitutionId,
                branchId: scopingBranchId,
            });
        }

        if (args.resourceType === 'system') {
            return await SystemLogsService.logSystemEvent(dbClient, {
                action: args.action,
                details: args.details,
                institutionId: scopingInstitutionId,
                branchId: scopingBranchId,
            });
        }

        return await ActivityLogsService.logActivityEvent(dbClient, {
            userId: args.userId ?? '00000000-0000-0000-0000-000000000000',
            action: args.action,
            resourceType: args.resourceType ?? 'activity',
            resourceId: args.resourceId ?? 'system',
            details: args.details,
            ipAddress: args.ipAddress,
            institutionId: scopingInstitutionId,
            branchId: scopingBranchId,
        });
    }
}
