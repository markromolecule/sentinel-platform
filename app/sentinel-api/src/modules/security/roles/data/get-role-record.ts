import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export async function getRoleRecord(dbClient: DbClient, roleId: number) {
    const role = await dbClient
        .selectFrom('roles')
        .selectAll()
        .where('role_id', '=', roleId)
        .executeTakeFirst();

    if (!role) {
        throw new HTTPException(404, { message: 'Role not found.' });
    }

    return role;
}
