import { describe, expect, it } from 'vitest';
import type { AccessControlPermission } from '@sentinel/shared/types';
import { groupPermissionsBySystemArea, groupPermissionsByCategoryAndModule } from './groupers';

describe('groupers permission deduplication', () => {
    const mockPermissions: AccessControlPermission[] = [
        {
            id: 'perm-1',
            name: 'View Institution',
            actionKey: 'view',
            moduleKey: 'institutions',
            category: 'INSTITUTION',
            description: 'View institution',
            key: 'view_institutions',
            scope: 'global',
            isSystem: true,
            roleCount: 0,
            overrideCount: 0,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
        },
        {
            id: 'perm-1', // Duplicate of perm-1
            name: 'View Institution Duplicate',
            actionKey: 'view',
            moduleKey: 'institutions',
            category: 'INSTITUTION',
            description: 'View institution duplicate',
            key: 'view_institutions_duplicate',
            scope: 'global',
            isSystem: true,
            roleCount: 0,
            overrideCount: 0,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
        },
        {
            id: 'perm-2',
            name: 'Create User',
            actionKey: 'create',
            moduleKey: 'users',
            category: 'USER',
            description: 'Create user',
            key: 'create_users',
            scope: 'global',
            isSystem: true,
            roleCount: 0,
            overrideCount: 0,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
        },
        {
            id: 'perm-2', // Duplicate of perm-2
            name: 'Create User Duplicate',
            actionKey: 'create',
            moduleKey: 'users',
            category: 'USER',
            description: 'Create user duplicate',
            key: 'create_users_duplicate',
            scope: 'global',
            isSystem: true,
            roleCount: 0,
            overrideCount: 0,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
        },
    ];

    it('should deduplicate permissions by ID in groupPermissionsBySystemArea', () => {
        const result = groupPermissionsBySystemArea(mockPermissions);

        // Let's verify that the total number of permissions in modules is exactly 2, not 4
        let totalCount = 0;
        for (const area of result) {
            for (const module of area.modules) {
                totalCount += module.permissions.length;
            }
        }

        expect(totalCount).toBe(2);
    });

    it('should deduplicate permissions by ID in groupPermissionsByCategoryAndModule', () => {
        const result = groupPermissionsByCategoryAndModule(mockPermissions);

        // Verify categories are correct
        const institutionCategory = result.find((c) => c.categoryKey === 'INSTITUTION');
        const userCategory = result.find((c) => c.categoryKey === 'USER');

        expect(institutionCategory).toBeDefined();
        expect(userCategory).toBeDefined();

        // Verify total permission count inside categories
        const instPermissions = institutionCategory?.modules.flatMap((m) => m.permissions) || [];
        const userPermissions = userCategory?.modules.flatMap((m) => m.permissions) || [];

        expect(instPermissions.length).toBe(1);
        expect(userPermissions.length).toBe(1);

        expect(instPermissions[0].id).toBe('perm-1');
        expect(userPermissions[0].id).toBe('perm-2');
    });
});
