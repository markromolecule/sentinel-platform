import { type DbClient } from '@sentinel/db';
import { PermissionService } from '../../permission/services/permission.service';
import { RolesService } from '../../roles/roles.service';

let catalogsSynced = false;

export function resetAccessControlCatalogsCache() {
    catalogsSynced = false;
}

export async function ensureAccessControlCatalogs(dbClient: DbClient) {
    if (catalogsSynced) {
        return;
    }
    await RolesService.syncSystemRoles(dbClient);
    await PermissionService.syncSystemPermissions(dbClient);
    catalogsSynced = true;
}
