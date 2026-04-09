import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export function parseCount(value: string | number | bigint | null | undefined) {
    if (typeof value === 'number') return value;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') return Number(value);

    return 0;
}

export function toNullableDate(value: Date | string | null | undefined) {
    return value ?? null;
}

export function parseUuidArray(value: string[] | null | undefined) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
}

export async function getRolesData(dbClient: DbClient) {
    return dbClient
        .selectFrom('roles')
        .leftJoin('rbac_role_permissions as rrp', 'rrp.role_id', 'roles.role_id')
        .leftJoin('user_roles as ur', 'ur.role_id', 'roles.role_id')
        .select([
            'roles.role_id',
            'roles.role_name',
            'roles.description',
            'roles.is_system',
            'roles.created_at',
            'roles.updated_at',
            sql<string[]>`COALESCE(ARRAY_AGG(DISTINCT rrp.permission_id) FILTER (WHERE rrp.permission_id IS NOT NULL), ARRAY[]::uuid[])`.as(
                'permissionIds',
            ),
            sql<number>`COUNT(DISTINCT rrp.permission_id)`.as('permissionCount'),
            sql<number>`COUNT(DISTINCT ur.user_id)`.as('assignmentCount'),
        ])
        .groupBy([
            'roles.role_id',
            'roles.role_name',
            'roles.description',
            'roles.is_system',
            'roles.created_at',
            'roles.updated_at',
        ])
        .orderBy('roles.is_system', 'desc')
        .orderBy('roles.role_name', 'asc')
        .execute();
}
