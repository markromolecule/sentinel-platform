import { describe, expect } from 'vitest';
import { syncSystemPermissions } from '../../permission/data/sync-system-permissions';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { syncSystemRolePermissions } from './sync-system-role-permissions';
import { syncSystemRoles } from './sync-system-roles';

describe('syncSystemRolePermissions', () => {
    testWithDbClient(
        'adds newly required blueprint permissions to existing system role mappings',
        async ({ dbClient }) => {
            await syncSystemPermissions(dbClient);
            await syncSystemRoles(dbClient);
            await syncSystemRolePermissions(dbClient);

            const supportRole = await dbClient
                .selectFrom('roles')
                .select('role_id')
                .where('role_name', '=', 'support')
                .executeTakeFirstOrThrow();

            const feedbackPermission = await dbClient
                .selectFrom('rbac_permissions')
                .select('permission_id')
                .where('permission_key', '=', 'feedback:view')
                .executeTakeFirstOrThrow();

            await dbClient
                .deleteFrom('rbac_role_permissions')
                .where('role_id', '=', supportRole.role_id)
                .where('permission_id', '=', feedbackPermission.permission_id)
                .execute();

            await syncSystemRolePermissions(dbClient);

            const restoredMapping = await dbClient
                .selectFrom('rbac_role_permissions')
                .select(['role_id', 'permission_id'])
                .where('role_id', '=', supportRole.role_id)
                .where('permission_id', '=', feedbackPermission.permission_id)
                .executeTakeFirst();

            expect(restoredMapping).toBeTruthy();
        },
    );

    testWithDbClient(
        'does not restore blueprint permissions for roles marked CUSTOM',
        async ({ dbClient }) => {
            await syncSystemPermissions(dbClient);
            await syncSystemRoles(dbClient);

            const supportRole = await dbClient
                .selectFrom('roles')
                .select(['role_id', 'permission_sync_mode'])
                .where('role_name', '=', 'support')
                .executeTakeFirstOrThrow();

            await dbClient
                .updateTable('roles')
                .set({ permission_sync_mode: 'CUSTOM' })
                .where('role_id', '=', supportRole.role_id)
                .execute();

            const feedbackPermission = await dbClient
                .selectFrom('rbac_permissions')
                .select('permission_id')
                .where('permission_key', '=', 'feedback:view')
                .executeTakeFirstOrThrow();

            await dbClient
                .deleteFrom('rbac_role_permissions')
                .where('role_id', '=', supportRole.role_id)
                .where('permission_id', '=', feedbackPermission.permission_id)
                .execute();

            await syncSystemRolePermissions(dbClient);

            const restoredMapping = await dbClient
                .selectFrom('rbac_role_permissions')
                .select(['role_id', 'permission_id'])
                .where('role_id', '=', supportRole.role_id)
                .where('permission_id', '=', feedbackPermission.permission_id)
                .executeTakeFirst();

            expect(restoredMapping).toBeUndefined();

            await dbClient
                .updateTable('roles')
                .set({ permission_sync_mode: 'BLUEPRINT' })
                .where('role_id', '=', supportRole.role_id)
                .execute();
        },
    );
});
