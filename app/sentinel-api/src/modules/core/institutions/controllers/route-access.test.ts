import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import institutionRoutes from '../institution.routes';
import { InstitutionService } from '../institution.service';

vi.mock('../../../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
        await next();
    },
}));

vi.mock('../institution.service', () => ({
    InstitutionService: {
        getInstitutions: vi.fn().mockResolvedValue([]),
        getInstitutionById: vi.fn().mockResolvedValue({ id: '1', name: 'MIT' }),
        createInstitution: vi.fn().mockResolvedValue({ id: '1', name: 'MIT' }),
        updateInstitution: vi.fn().mockResolvedValue({ id: '1', name: 'MIT' }),
        deleteInstitution: vi.fn().mockResolvedValue(true),
        deleteInstitutions: vi.fn().mockResolvedValue(true),
        getInstitutionBranches: vi.fn().mockResolvedValue([]),
        linkInstitutionBranch: vi.fn().mockResolvedValue({}),
        unlinkInstitutionBranch: vi.fn().mockResolvedValue({}),
        getEffectiveInstitutionNamingConvention: vi.fn().mockResolvedValue({}),
        saveInstitutionNamingConvention: vi.fn().mockResolvedValue({}),
    },
}));

describe('Institutions Route Access', () => {
    const makeAppWithContext = (role: string, permissionKeys: string[]) => {
        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            const dbMock = {
                selectFrom: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnThis(),
                    where: vi.fn().mockReturnThis(),
                    executeTakeFirst: vi.fn().mockResolvedValue({
                        id: 'institution-1',
                        parent_institution_id: null,
                        institution_kind: 'PARENT',
                    }),
                    execute: vi.fn().mockResolvedValue([]),
                }),
            };
            c.set('dbClient', dbMock as any);
            c.set('user', { id: 'user-1' } as any);
            c.set('supabaseUser', { user_metadata: { role } } as any);
            c.set('institutionId', 'institution-1');
            c.set('activePermissionKeys', permissionKeys);
            await next();
        });
        app.route('/institutions', institutionRoutes);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('allows GET lists for support, superadmin, and admin with view permission', async () => {
        for (const role of ['support', 'superadmin', 'admin']) {
            const app = makeAppWithContext(role, ['institutions:view']);
            const res = await app.request('/institutions', { method: 'GET' });
            expect(res.status).not.toBe(403);
        }
    });

    it('blocks GET lists for roles lacking institutions:view permission', async () => {
        const app = makeAppWithContext('admin', []);
        const res = await app.request('/institutions', { method: 'GET' });
        expect(res.status).toBe(403);
    });

    it('allows mutations (POST, PUT, DELETE) for support, superadmin, and admin when they have active permissions', async () => {
        for (const role of ['support', 'superadmin', 'admin']) {
            const app = makeAppWithContext(role, [
                'institutions:manage',
                'institutions:create',
                'institutions:update',
                'institutions:delete',
            ]);

            const postRes = await app.request('/institutions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'MIT', code: 'MIT', address: 'Boston' }),
            });
            expect(postRes.status).not.toBe(403);

            const putRes = await app.request('/institutions/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'MIT Updated', code: 'MIT', address: 'Boston' }),
            });
            expect(putRes.status).not.toBe(403);

            const deleteRes = await app.request('/institutions/1', {
                method: 'DELETE',
            });
            expect(deleteRes.status).not.toBe(403);
        }
    });

    it('blocks mutations (POST, PUT, DELETE) for instructors and other non-admin roles', async () => {
        const app = makeAppWithContext('instructor', [
            'institutions:create',
            'institutions:update',
            'institutions:delete',
        ]);
        const res = await app.request('/institutions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'MIT', code: 'MIT', address: 'Boston' }),
        });
        expect(res.status).toBe(403);
    });

    it('filters institution list for non-support scoped roles based on hierarchy', async () => {
        vi.mocked(InstitutionService.getInstitutions).mockImplementation(async (_db, filters) => {
            const items = [
                { id: 'institution-1', name: 'MIT', parent_institution_id: null },
                {
                    id: 'institution-branch-1',
                    name: 'MIT Branch',
                    parent_institution_id: 'institution-1',
                },
                {
                    id: 'unauthorized-institution',
                    name: 'Stanford',
                    parent_institution_id: null,
                },
            ] as any[];

            if (filters?.allowedIds) {
                return items.filter((institution) => filters.allowedIds?.includes(institution.id));
            }

            return items;
        });

        const mockUserInstBuilder = {
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            executeTakeFirst: vi.fn().mockResolvedValue({
                id: 'institution-1',
                parent_institution_id: null,
                institution_kind: 'PARENT',
            }),
        };

        const mockBranchesBuilder = {
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            execute: vi.fn().mockResolvedValue([{ id: 'institution-branch-1' }]),
        };

        const dbMock = {
            selectFrom: vi
                .fn()
                .mockReturnValueOnce(mockUserInstBuilder)
                .mockReturnValueOnce(mockBranchesBuilder),
        } as any;

        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            c.set('dbClient', dbMock);
            c.set('user', { id: 'user-1' } as any);
            c.set('supabaseUser', { user_metadata: { role: 'admin' } } as any);
            c.set('institutionId', 'institution-1');
            c.set('activePermissionKeys', ['institutions:view']);
            await next();
        });
        app.route('/institutions', institutionRoutes);

        const res = await app.request('/institutions', { method: 'GET' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.data).toHaveLength(2);
        const returnedIds = body.data.map((item: any) => item.id);
        expect(returnedIds).toContain('institution-1');
        expect(returnedIds).toContain('institution-branch-1');
        expect(returnedIds).not.toContain('unauthorized-institution');
    });

    it('returns pagination metadata when page and limit are provided', async () => {
        vi.mocked(InstitutionService.getInstitutions).mockResolvedValueOnce({
            items: [{ id: 'institution-1', name: 'MIT' }],
            pagination: { page: 2, limit: 1, total: 3, hasMore: true },
        } as any);

        const app = makeAppWithContext('support', ['institutions:view']);
        const res = await app.request('/institutions?page=2&limit=1', { method: 'GET' });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.data).toHaveLength(1);
        expect(body.pagination).toEqual({
            page: 2,
            limit: 1,
            total: 3,
            hasMore: true,
        });
    });
});
