import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { HTTPException } from 'hono/http-exception';

type AccessControlSchemaSupport = {
    isReady: boolean;
    missingTables: string[];
    missingRoleColumns: string[];
    missingUserRoleColumns: string[];
};

const ACCESS_CONTROL_REQUIRED_TABLES = [
    'rbac_permissions',
    'rbac_role_permissions',
    'rbac_user_permission_overrides',
    'system_settings',
] as const;

const ACCESS_CONTROL_REQUIRED_ROLE_COLUMNS = [
    'description',
    'is_system',
    'created_at',
    'updated_at',
] as const;

const ACCESS_CONTROL_REQUIRED_USER_ROLE_COLUMNS = ['assigned_at'] as const;

const accessControlSchemaSupportCache = new WeakMap<object, Promise<AccessControlSchemaSupport>>();

export function getAccessControlSchemaSupport(dbClient: DbClient) {
    const cacheKey = dbClient as object;
    const cached = accessControlSchemaSupportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const pendingCheck = Promise.all([
        sql<{ table_name: string }>`
            select table_name
            from information_schema.tables
            where table_schema = 'public'
              and table_name in (
                'rbac_permissions',
                'rbac_role_permissions',
                'rbac_user_permission_overrides',
                'system_settings'
              )
        `.execute(dbClient),
        sql<{ column_name: string }>`
            select column_name
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'roles'
              and column_name in ('description', 'is_system', 'created_at', 'updated_at')
        `.execute(dbClient),
        sql<{ column_name: string }>`
            select column_name
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'user_roles'
              and column_name in ('assigned_at')
        `.execute(dbClient),
    ])
        .then(([tableResult, roleColumnResult, userRoleColumnResult]) => {
            const availableTables = new Set(tableResult.rows.map((row) => row.table_name));
            const availableRoleColumns = new Set(
                roleColumnResult.rows.map((row) => row.column_name),
            );
            const availableUserRoleColumns = new Set(
                userRoleColumnResult.rows.map((row) => row.column_name),
            );

            const missingTables = ACCESS_CONTROL_REQUIRED_TABLES.filter(
                (tableName) => !availableTables.has(tableName),
            );
            const missingRoleColumns = ACCESS_CONTROL_REQUIRED_ROLE_COLUMNS.filter(
                (columnName) => !availableRoleColumns.has(columnName),
            );
            const missingUserRoleColumns = ACCESS_CONTROL_REQUIRED_USER_ROLE_COLUMNS.filter(
                (columnName) => !availableUserRoleColumns.has(columnName),
            );

            const support = {
                isReady:
                    missingTables.length === 0 &&
                    missingRoleColumns.length === 0 &&
                    missingUserRoleColumns.length === 0,
                missingTables,
                missingRoleColumns,
                missingUserRoleColumns,
            } satisfies AccessControlSchemaSupport;

            if (!support.isReady) {
                accessControlSchemaSupportCache.delete(cacheKey);
            }

            return support;
        })
        .catch(() => {
            accessControlSchemaSupportCache.delete(cacheKey);

            return {
                isReady: false,
                missingTables: [...ACCESS_CONTROL_REQUIRED_TABLES],
                missingRoleColumns: [...ACCESS_CONTROL_REQUIRED_ROLE_COLUMNS],
                missingUserRoleColumns: [...ACCESS_CONTROL_REQUIRED_USER_ROLE_COLUMNS],
            } satisfies AccessControlSchemaSupport;
        });

    accessControlSchemaSupportCache.set(cacheKey, pendingCheck);
    return pendingCheck;
}

export async function ensureAccessControlSchemaReady(dbClient: DbClient) {
    const support = await getAccessControlSchemaSupport(dbClient);

    if (support.isReady) {
        return;
    }

    const missingParts = [
        support.missingTables.length > 0 ? `tables: ${support.missingTables.join(', ')}` : null,
        support.missingRoleColumns.length > 0
            ? `roles columns: ${support.missingRoleColumns.join(', ')}`
            : null,
        support.missingUserRoleColumns.length > 0
            ? `user_roles columns: ${support.missingUserRoleColumns.join(', ')}`
            : null,
    ].filter(Boolean);

    throw new HTTPException(503, {
        message: `Access control database schema is not ready. Apply the RBAC foundation migration at app/sentinel-web/supabase/migrations/20260409100000_add_access_control_foundation.sql or run \`pnpm run db:migrate\`. Missing: ${missingParts.join('; ')}.`,
    });
}
