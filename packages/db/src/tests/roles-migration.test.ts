import { describe, it, expect } from 'vitest';
import { prisma } from '../db';

describe('Roles Migration', () => {
    it('should query roles and have the new dynamic role fields', async () => {
        const supportRole = await prisma.roles.findFirst({
            where: { role_name: 'support' },
        });

        expect(supportRole).toBeDefined();
        expect(supportRole?.slug).toBe('support');
        expect(supportRole?.domain_scope).toContain('support');
        expect(supportRole?.is_active).toBe(true);
        expect(supportRole?.assignable_by).toContain('support');
    });

    it('should store role identifiers as integers across role tables', async () => {
        const columnTypes = await prisma.$queryRaw<
            Array<{ table_name: string; data_type: string }>
        >`
            SELECT table_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND column_name = 'role_id'
              AND table_name IN ('roles', 'class_roles', 'rbac_role_permissions', 'user_roles')
        `;

        expect(columnTypes).toHaveLength(4);

        for (const columnType of columnTypes) {
            expect(columnType.data_type).toBe('integer');
        }
    });
});
