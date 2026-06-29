import { type DbClient } from '@sentinel/db';
import { syncSystemPermissions } from '../../permission/data/sync-system-permissions';
import { syncSystemRoles as dbSyncSystemRoles } from '../data/sync-system-roles';
import { syncSystemRolePermissions } from '../data/sync-system-role-permissions';

/**
 * Synchronizes the system roles, permissions, and their mapping associations
 * from code blueprints into the database.
 */
export async function syncSystemRoles(dbClient: DbClient): Promise<void> {
    await syncSystemPermissions(dbClient);
    await dbSyncSystemRoles(dbClient);
    await syncSystemRolePermissions(dbClient);
}
