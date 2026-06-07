import { describe, expect, it } from 'vitest';
import { ALL_PERMISSIONS } from '@sentinel/shared/constants';
import { syncSystemPermissions } from './sync-system-permissions';
import { testWithDbClient } from '../../../../lib/test-with-db-client';

describe('syncSystemPermissions', () => {
    it('should have all expected permission keys in the sync catalogue', () => {
        const expectedKeys = [
            'rooms:view',
            'rooms:manage',
            'semesters:view',
            'semesters:manage',
            'departments:view',
            'departments:manage',
            'institutions:view',
            'institutions:manage',
            'institutions:cross-tenant-view',
            'permissions:view',
            'permissions:manage',
            'assessments:view',
            'assessments:manage',
        ];

        const activeKeys = ALL_PERMISSIONS.map((p) => p.id);

        for (const key of expectedKeys) {
            expect(activeKeys).toContain(key);
        }
    });

    testWithDbClient('should sync permissions into the database', async ({ dbClient }) => {
        // Run sync
        await syncSystemPermissions(dbClient);

        // Fetch all synced system permissions from the db
        const dbPermissions = await dbClient
            .selectFrom('rbac_permissions')
            .selectAll()
            .where('is_system', '=', true)
            .execute();

        const dbKeys = dbPermissions.map((p) => p.permission_key);
        const expectedKeys = ALL_PERMISSIONS.map((p) => p.id.toLowerCase().trim());

        for (const key of expectedKeys) {
            expect(dbKeys).toContain(key);
        }
    });
});
