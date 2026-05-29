import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { LogQuery } from '../logs.dto';

export type GetLogsDataArgs = {
    dbClient: DbClient;
    scopingInstitutionId: string;
    scopingBranchId?: string | null;
    filters: LogQuery;
    excludeResourceTypes?: string[];
};

/**
 * Searches and paginates structured audit logs under strict context boundaries.
 *
 * @param args database client, dynamic filters, and scoping context
 * @returns paginated logs list
 */
export async function getLogsData({
    dbClient,
    scopingInstitutionId,
    scopingBranchId,
    filters,
    excludeResourceTypes,
}: GetLogsDataArgs) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    // Build base query with standard scoping and dynamic filters
    let baseQuery = dbClient.selectFrom('audit_logs as al');

    // 1. Mandate tenant data isolation boundaries
    baseQuery = baseQuery.where('al.institution_id', '=', scopingInstitutionId);

    if (scopingBranchId) {
        // Child user context: strictly isolate query within child branch boundary
        baseQuery = baseQuery.where('al.branch_id', '=', scopingBranchId);
    } else if (filters.branchId) {
        // Parent user context: optional search scoping by sub-branch ID
        baseQuery = baseQuery.where('al.branch_id', '=', filters.branchId);
    }

    // 2. Dynamic filter options
    if (filters.action) {
        baseQuery = baseQuery.where('al.action', '=', filters.action);
    }

    if (filters.resourceType) {
        baseQuery = baseQuery.where('al.resource_type', '=', filters.resourceType);
    }

    if (excludeResourceTypes && excludeResourceTypes.length > 0) {
        baseQuery = baseQuery.where('al.resource_type', 'not in', excludeResourceTypes);
    }

    if (filters.userId) {
        baseQuery = baseQuery.where('al.user_id', '=', filters.userId);
    }

    if (filters.startDate) {
        baseQuery = baseQuery.where('al.created_at', '>=', new Date(filters.startDate));
    }

    if (filters.endDate) {
        baseQuery = baseQuery.where('al.created_at', '<=', new Date(filters.endDate));
    }

    // Execute count query using the base query
    const countResult = await baseQuery
        .select(sql<number>`count(*)`.as('count'))
        .executeTakeFirst();

    const total = Number(countResult?.count ?? 0);

    // Execute items query using the base query with join and select
    const items = await baseQuery
        .leftJoin('user_profiles as up', 'up.user_id', 'al.user_id')
        .select([
            'al.log_id as logId',
            'al.user_id as userId',
            'al.action as action',
            'al.resource_type as resourceType',
            'al.resource_id as resourceId',
            'al.details as details',
            'al.ip_address as ipAddress',
            'al.created_at as createdAt',
            'al.institution_id as institutionId',
            'al.branch_id as branchId',
            'up.first_name as userFirstName',
            'up.last_name as userLastName',
        ])
        .orderBy('al.created_at', 'desc')
        .orderBy('al.log_id', 'desc')
        .limit(pageSize)
        .offset(offset)
        .execute();

    // Map Kysely types to match serialization structures
    const serializedItems = items.map((item) => ({
        ...item,
        createdAt: item.createdAt
            ? new Date(item.createdAt).toISOString()
            : new Date().toISOString(),
        details:
            typeof item.details === 'string' ? (JSON.parse(item.details) as unknown) : item.details,
    }));

    return {
        items: serializedItems,
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        hasMore: offset + items.length < total,
    };
}
