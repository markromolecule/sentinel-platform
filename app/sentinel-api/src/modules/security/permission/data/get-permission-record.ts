import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export async function getPermissionRecord(dbClient: DbClient, permissionId: string) {
    const permission = await dbClient
        .selectFrom('rbac_permissions')
        .selectAll()
        .where('permission_id', '=', permissionId)
        .executeTakeFirst();

    if (!permission) {
        throw new HTTPException(404, { message: 'Permission not found.' });
    }

    return permission;
}
