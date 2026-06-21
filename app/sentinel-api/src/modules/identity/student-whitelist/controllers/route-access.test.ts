import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import studentWhitelistRoutes from '../student-whitelist.routes';

vi.mock('../../../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
        await next();
    },
}));

vi.mock('./get-student-whitelist.controller', () => ({
    getStudentWhitelistRoute: { method: 'get', path: '/' },
    getStudentWhitelistRouteHandler: async (c: any) =>
        c.json({
            message: 'Student whitelist fetched successfully',
            data: [{ whitelist_id: 'wh-1' }],
            pagination: { page: 1, pageSize: 1, total: 2, totalPages: 2, hasMore: true },
        }),
}));

vi.mock('./create-student-whitelist.controller', () => ({
    createStudentWhitelistRoute: { method: 'post', path: '/' },
    createStudentWhitelistRouteHandler: async (c: any) => c.json({ id: '1' }, 201),
}));

vi.mock('./bulk-import-student-whitelist.controller', () => ({
    bulkImportStudentWhitelistRoute: { method: 'post', path: '/bulk' },
    bulkImportStudentWhitelistRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./delete-student-whitelist.controller', () => ({
    deleteStudentWhitelistRoute: { method: 'delete', path: '/:id' },
    deleteStudentWhitelistRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./purge-student-whitelist.controller', () => ({
    purgeStudentWhitelistRoute: { method: 'post', path: '/purge' },
    purgeStudentWhitelistRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./update-student-whitelist.controller', () => ({
    updateStudentWhitelistRoute: { method: 'patch', path: '/:id' },
    updateStudentWhitelistRouteHandler: async (c: any) => c.json({}),
}));

describe('Student Whitelist Route Access', () => {
    const makeAppWithContext = (role: string, permissionKeys: string[]) => {
        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'user-1', user_profiles: {} } as any);
            c.set('supabaseUser', { user_metadata: { role } } as any);
            c.set('institutionId', 'institution-1');
            c.set('activePermissionKeys', permissionKeys);
            await next();
        });
        app.route('/student-whitelist', studentWhitelistRoutes);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns pagination metadata when page and pageSize are provided', async () => {
        const app = makeAppWithContext('support', ['student_whitelist:view']);
        const res = await app.request('/student-whitelist?page=1&pageSize=1', { method: 'GET' });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.data).toHaveLength(1);
        expect(body.pagination).toEqual({
            page: 1,
            pageSize: 1,
            total: 2,
            totalPages: 2,
            hasMore: true,
        });
    });
});
