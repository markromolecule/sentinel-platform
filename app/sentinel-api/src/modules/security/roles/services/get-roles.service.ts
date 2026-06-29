import { type DbClient } from '@sentinel/db';
import type { AccessControlRole } from '@sentinel/shared/types';
import { RolesRepository } from '../roles.repository';
import { syncSystemRoles } from './sync-system-roles.service';
import { mapRoleRow } from './utils';

/**
 * Public entry point to retrieve all access control roles, executing system role sync beforehand.
 */
export async function getRoles(dbClient: DbClient, search?: string): Promise<AccessControlRole[]> {
    await syncSystemRoles(dbClient);
    return readRoles(dbClient, search);
}

/**
 * Reads all roles from the database without triggering system sync.
 * Use this for internal post-mutation reads.
 */
export async function readRoles(dbClient: DbClient, search?: string): Promise<AccessControlRole[]> {
    const roles = await RolesRepository.findAllRoles(dbClient, search);
    return roles.map(mapRoleRow);
}
