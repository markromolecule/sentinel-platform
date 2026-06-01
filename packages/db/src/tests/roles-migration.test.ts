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
});
