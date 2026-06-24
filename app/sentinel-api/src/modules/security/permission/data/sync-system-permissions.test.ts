import { describe, expect, it } from 'vitest';
import { ALL_PERMISSIONS, SYSTEM_ROLE_BLUEPRINTS } from '@sentinel/shared/constants';
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
            'examinations:create',
            'examinations:update',
            'examinations:delete',
            'examinations:assign',
            'ai:generate_questions',
        ];

        const activeKeys = ALL_PERMISSIONS.map((p) => p.id);

        for (const key of expectedKeys) {
            expect(activeKeys).toContain(key);
        }
    });

    it('should grant the generate questions permission to the support blueprint', () => {
        expect(SYSTEM_ROLE_BLUEPRINTS.support.permissionKeys).toContain('ai:generate_questions');
    });

    it('should define classrooms:archive permission and assign it to key roles', () => {
        const activeKeys = ALL_PERMISSIONS.map((p) => p.id);
        expect(activeKeys).toContain('classrooms:archive');

        expect(SYSTEM_ROLE_BLUEPRINTS.support.permissionKeys).toContain('classrooms:archive');
        expect(SYSTEM_ROLE_BLUEPRINTS.superadmin.permissionKeys).toContain('classrooms:archive');
        expect(SYSTEM_ROLE_BLUEPRINTS.admin.permissionKeys).toContain('classrooms:archive');
        expect(SYSTEM_ROLE_BLUEPRINTS.instructor.permissionKeys).not.toContain(
            'classrooms:archive',
        );
    });

    it('should define exam CRUD and assignment permissions for managed roles', () => {
        const activeKeys = ALL_PERMISSIONS.map((p) => p.id);

        expect(activeKeys).toEqual(
            expect.arrayContaining([
                'examinations:create',
                'examinations:update',
                'examinations:delete',
                'examinations:assign',
            ]),
        );

        expect(SYSTEM_ROLE_BLUEPRINTS.support.permissionKeys).toEqual(
            expect.arrayContaining([
                'examinations:create',
                'examinations:update',
                'examinations:delete',
                'examinations:assign',
            ]),
        );
        expect(SYSTEM_ROLE_BLUEPRINTS.superadmin.permissionKeys).toEqual(
            expect.arrayContaining([
                'examinations:create',
                'examinations:update',
                'examinations:delete',
                'examinations:assign',
            ]),
        );
        expect(SYSTEM_ROLE_BLUEPRINTS.admin.permissionKeys).toEqual(
            expect.arrayContaining([
                'examinations:create',
                'examinations:update',
                'examinations:delete',
                'examinations:assign',
            ]),
        );
        expect(SYSTEM_ROLE_BLUEPRINTS.instructor.permissionKeys).toEqual(
            expect.arrayContaining([
                'examinations:create',
                'examinations:update',
                'examinations:delete',
                'examinations:assign',
            ]),
        );
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
