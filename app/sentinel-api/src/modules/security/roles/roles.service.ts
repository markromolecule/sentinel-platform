import { syncSystemRoles } from './services/sync-system-roles.service';
import { getRoleRecord } from './services/get-role-record.service';
import { getRoles, readRoles } from './services/get-roles.service';
import { createRole } from './services/create-role.service';
import { updateRole } from './services/update-role.service';
import { deleteRole } from './services/delete-role.service';
import { replaceRolePermissions } from './services/replace-role-permissions.service';
import { resetRolePermissionsToBlueprint } from './services/reset-role-permissions-to-blueprint.service';

/**
 * Service layer for Access Control Roles.
 * Serves as the main entry point, delegating queries and mutations to specialized modular services.
 */
export class RolesService {
    /**
     * Synchronizes system roles, permissions, and mappings from code blueprints.
     */
    static syncSystemRoles = syncSystemRoles;

    /**
     * Retrieves a raw role record from database by its ID. Throws 404 if missing.
     */
    static getRoleRecord = getRoleRecord;

    /**
     * Retrieves all roles from the database, executing system roles sync beforehand.
     */
    static getRoles = getRoles;

    /**
     * Reads all roles from the database without executing system roles sync.
     */
    static readRoles = readRoles;

    /**
     * Creates a new dynamic custom role, checking Option A scope boundaries.
     */
    static createRole = createRole;

    /**
     * Updates an existing custom role, checking Option A scope boundaries.
     */
    static updateRole = updateRole;

    /**
     * Deletes an existing custom role, checking Option A scope boundaries.
     */
    static deleteRole = deleteRole;

    /**
     * Replaces access-control permissions assigned to a given role ID.
     */
    static replaceRolePermissions = replaceRolePermissions;

    /**
     * Resets a system role's permissions to its hardcoded blueprint permissions.
     */
    static resetRolePermissionsToBlueprint = resetRolePermissionsToBlueprint;
}
