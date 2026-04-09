import { type DbClient } from '@sentinel/db';
import { PermissionService } from '../../permission/services/permission.service';
import { RolesService } from '../../roles/services/roles.service';

export async function ensureAccessControlCatalogs(dbClient: DbClient) {
    await RolesService.syncSystemRoles(dbClient);
    await PermissionService.syncSystemPermissions(dbClient);
}
