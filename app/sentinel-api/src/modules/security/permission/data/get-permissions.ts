import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export function parsePermissionCount(value: string | number | bigint | null | undefined) {
    if (typeof value === 'number') return value;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') return Number(value);

    return 0;
}

export function toNullablePermissionDate(value: Date | string | null | undefined) {
    return value ?? null;
}

export async function getPermissionsData(dbClient: DbClient, search?: string) {
    let query = dbClient
        .selectFrom('rbac_permissions as p')
        .leftJoin('rbac_role_permissions as rrp', 'rrp.permission_id', 'p.permission_id')
        .leftJoin('rbac_user_permission_overrides as upo', 'upo.permission_id', 'p.permission_id')
        .select([
            'p.permission_id',
            'p.permission_key',
            'p.module_key',
            'p.action_key',
            'p.category',
            'p.scope',
            'p.name',
            'p.description',
            'p.is_system',
            'p.created_at',
            'p.updated_at',
            sql<number>`COUNT(DISTINCT rrp.role_id)`.as('roleCount'),
            sql<number>`COUNT(DISTINCT upo.user_id)`.as('overrideCount'),
        ]);

    if (search) {
        query = query.where((eb) =>
            eb.or([
                eb('p.name', 'ilike', `%${search}%`),
                eb('p.permission_key', 'ilike', `%${search}%`),
                eb('p.description', 'ilike', `%${search}%`),
                eb('p.module_key', 'ilike', `%${search}%`),
                eb('p.action_key', 'ilike', `%${search}%`),
                eb('p.category', 'ilike', `%${search}%`),
                eb('p.scope', 'ilike', `%${search}%`),
            ]),
        );
    }

    return query
        .groupBy([
            'p.permission_id',
            'p.permission_key',
            'p.module_key',
            'p.action_key',
            'p.category',
            'p.scope',
            'p.name',
            'p.description',
            'p.is_system',
            'p.created_at',
            'p.updated_at',
        ])
        .orderBy('p.module_key', 'asc')
        .orderBy('p.action_key', 'asc')
        .execute();
}
