import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import coursesRoutes from '../courses.routes';

vi.mock('../../../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
        await next();
    },
}));

vi.mock('./get-courses.controller', () => ({
    getCoursesRoute: { method: 'get', path: '/' },
    getCoursesRouteHandler: async (c: any) =>
        c.json({
            message: 'Courses fetched successfully',
            data: [{ course_id: 'course-1' }],
            pagination: { page: 1, limit: 1, total: 2, hasMore: true },
        }),
}));

vi.mock('./create-course.controller', () => ({
    createCourseRoute: { method: 'post', path: '/' },
    createCourseRouteHandler: async (c: any) => c.json({ id: '1' }, 201),
}));

vi.mock('./update-course.controller', () => ({
    updateCourseRoute: { method: 'put', path: '/:id' },
    updateCourseRouteHandler: async (c: any) => c.json({ id: '1' }),
}));

vi.mock('./delete-course.controller', () => ({
    deleteCourseRoute: { method: 'delete', path: '/:id' },
    deleteCourseRouteHandler: async (c: any) => c.json({ success: true }),
}));

vi.mock('./delete-courses.controller', () => ({
    deleteCoursesRoute: { method: 'delete', path: '/' },
    deleteCoursesRouteHandler: async (c: any) => c.json({ success: true }),
}));

describe('Courses Route Access', () => {
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
        app.route('/courses', coursesRoutes);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns pagination metadata when page and limit are provided', async () => {
        const app = makeAppWithContext('support', ['courses:view']);
        const res = await app.request('/courses?page=1&limit=1', { method: 'GET' });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.data).toHaveLength(1);
        expect(body.pagination).toEqual({
            page: 1,
            limit: 1,
            total: 2,
            hasMore: true,
        });
    });
});
