import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import sectionsRoutes from '../sections.routes';

vi.mock('../../../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
        await next();
    },
}));

vi.mock('./create-section.controller', () => ({
    createSectionRoute: { method: 'post', path: '/' },
    createSectionRouteHandler: async (c: any) => c.json({ id: '1' }, 201),
}));

vi.mock('./create-bulk-sections.controller', () => ({
    createBulkSectionsRoute: { method: 'post', path: '/bulk' },
    createBulkSectionsRouteHandler: async (c: any) => c.json([]),
}));

vi.mock('./get-sections.controller', () => ({
    getSectionsRoute: { method: 'get', path: '/' },
    getSectionsRouteHandler: async (c: any) =>
        c.json({
            message: 'Sections fetched successfully',
            data: [{ section_id: 'section-1' }],
            pagination: { page: 2, limit: 1, total: 4, hasMore: true },
        }),
}));

vi.mock('./update-section.controller', () => ({
    updateSectionRoute: { method: 'put', path: '/:id' },
    updateSectionRouteHandler: async (c: any) => c.json({ id: '1' }),
}));

vi.mock('./delete-section.controller', () => ({
    deleteSectionRoute: { method: 'delete', path: '/:id' },
    deleteSectionRouteHandler: async (c: any) => c.json({ success: true }),
}));

vi.mock('./delete-sections.controller', () => ({
    deleteSectionsRoute: { method: 'delete', path: '/' },
    deleteSectionsRouteHandler: async (c: any) => c.json({ success: true }),
}));

describe('Sections Route Access', () => {
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
        app.route('/sections', sectionsRoutes);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns pagination metadata when page and limit are provided', async () => {
        const app = makeAppWithContext('support', ['sections:view']);
        const res = await app.request('/sections?page=2&limit=1', { method: 'GET' });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.data).toHaveLength(1);
        expect(body.pagination).toEqual({
            page: 2,
            limit: 1,
            total: 4,
            hasMore: true,
        });
    });
});
