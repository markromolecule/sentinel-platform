import { describe, expect } from 'vitest';
import { SYSTEM_ROLE_BLUEPRINTS } from '@sentinel/shared/constants';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { syncSystemRoles } from './sync-system-roles';

describe('syncSystemRoles', () => {
    testWithDbClient('updates existing system roles and inserts only missing ones', async ({
        dbClient,
    }) => {
        const [firstRoleName, firstBlueprint] = Object.entries(SYSTEM_ROLE_BLUEPRINTS)[0]!;
        const missingRoleNames = Object.keys(SYSTEM_ROLE_BLUEPRINTS).filter(
            (roleName) => roleName !== firstRoleName,
        );

        await dbClient
            .insertInto('roles')
            .values({
                role_name: firstRoleName,
                description: 'outdated description',
                is_system: false,
            })
            .execute();

        await syncSystemRoles(dbClient);
        await syncSystemRoles(dbClient);

        const syncedRoles = await dbClient
            .selectFrom('roles')
            .select(['role_name', 'description', 'is_system'])
            .where('role_name', 'in', Object.keys(SYSTEM_ROLE_BLUEPRINTS))
            .execute();

        expect(syncedRoles).toHaveLength(Object.keys(SYSTEM_ROLE_BLUEPRINTS).length);

        const roleByName = new Map(syncedRoles.map((role) => [role.role_name, role]));

        expect(roleByName.get(firstRoleName)).toMatchObject({
            role_name: firstRoleName,
            description: firstBlueprint.description,
            is_system: true,
        });

        for (const roleName of missingRoleNames) {
            expect(roleByName.get(roleName)).toMatchObject({
                role_name: roleName,
                description: SYSTEM_ROLE_BLUEPRINTS[roleName]!.description,
                is_system: true,
            });
        }
    });
});
