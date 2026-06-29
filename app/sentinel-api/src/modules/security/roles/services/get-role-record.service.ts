import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { RolesRepository } from '../roles.repository';

/**
 * Retrieves a raw role database record by ID. Throws 404 if not found.
 */
export async function getRoleRecord(dbClient: DbClient, roleId: number) {
    const record = await RolesRepository.findRoleById(dbClient, roleId);
    if (!record) {
        throw new HTTPException(404, { message: 'Role not found.' });
    }
    return record;
}
