import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import departmentsRoutes from '../departments.routes';
import { DepartmentService } from '../departments.service';

vi.mock('../../../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
        await next();
    },
}));

vi.mock('../departments.service', () => ({
    DepartmentService: {
        getDepartments: vi.fn().mockResolvedValue([]),
        getDepartmentById: vi.fn().mockResolvedValue({ id: '1', name: 'CS' }),
        createDepartment: vi.fn().mockResolvedValue({ id: '1', name: 'CS' }),
        updateDepartment: vi.fn().mockResolvedValue({ id: '1', name: 'CS' }),
        deleteDepartment: vi.fn().mockResolvedValue(true),
        deleteDepartments: vi.fn().mockResolvedValue(true),
        bulkCreateDepartments: vi.fn().mockResolvedValue([]),
    },
}));

describe('Departments Route Access', () => {
    const makeAppWithContext = (role: string, permissionKeys: string[]) => {
        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'user-1' } as any);
            c.set('supabaseUser', { user_metadata: { role } } as any);
            c.set('institutionId', 'institution-1');
            c.set('activePermissionKeys', permissionKeys);
            await next();
        });
        app.route('/departments', departmentsRoutes);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('allows GET lists for support, superadmin, admin, and instructor with view permission', async () => {
        for (const role of ['support', 'superadmin', 'admin', 'instructor']) {
            const app = makeAppWithContext(role, ['departments:view']);
            const res = await app.request('/departments', { method: 'GET' });
            expect(res.status).not.toBe(403);
        }
    });

    it('blocks GET lists for users lacking departments:view permission', async () => {
        const app = makeAppWithContext('admin', []);
        const res = await app.request('/departments', { method: 'GET' });
        expect(res.status).toBe(403);
    });

    it('allows mutations (POST, PUT, DELETE) for support, superadmin, and admin when they have active permissions', async () => {
        for (const role of ['support', 'superadmin', 'admin']) {
            const app = makeAppWithContext(role, [
                'departments:manage',
                'departments:create',
                'departments:update',
                'departments:delete',
            ]);

            const postRes = await app.request('/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'CS', code: 'CS101' }),
            });
            expect(postRes.status).not.toBe(403);

            const putRes = await app.request('/departments/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'CS Updated', code: 'CS101' }),
            });
            expect(putRes.status).not.toBe(403);

            const deleteRes = await app.request('/departments/1', {
                method: 'DELETE',
            });
            expect(deleteRes.status).not.toBe(403);
        }
    });

    it('blocks mutations (POST, PUT, DELETE) for instructors and other non-admin roles', async () => {
        const app = makeAppWithContext('instructor', [
            'departments:create',
            'departments:update',
            'departments:delete',
        ]);
        const res = await app.request('/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'CS', code: 'CS101' }),
        });
        expect(res.status).toBe(403);
    });

    it('allows bulk mutations (POST /departments/bulk) only with departments:import permission', async () => {
        const appWithPermission = makeAppWithContext('admin', [
            'departments:import',
            'departments:manage',
        ]);
        const postRes = await appWithPermission.request('/departments/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ departments: [{ name: 'CS', code: 'CS101' }] }),
        });
        expect(postRes.status).not.toBe(403);

        const appWithoutPermission = makeAppWithContext('admin', []);
        const postResBlocked = await appWithoutPermission.request('/departments/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ departments: [{ name: 'CS', code: 'CS101' }] }),
        });
        expect(postResBlocked.status).toBe(403);
    });

    it('returns pagination metadata when page and limit are provided', async () => {
        vi.mocked(DepartmentService.getDepartments).mockResolvedValueOnce({
            items: [{ department_id: 'dept-1', department_name: 'CS' }],
            pagination: { page: 1, limit: 1, total: 2, hasMore: true },
        } as any);

        const app = makeAppWithContext('support', ['departments:view']);
        const res = await app.request('/departments?page=1&limit=1', { method: 'GET' });

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
