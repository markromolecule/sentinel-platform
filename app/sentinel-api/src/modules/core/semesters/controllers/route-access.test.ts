import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import semestersRoutes from '../semesters.routes';
import { SemesterService } from '../semesters.service';

vi.mock('../../../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
        await next();
    },
}));

vi.mock('../semesters.service', () => ({
    SemesterService: {
        getSemesters: vi.fn().mockResolvedValue([]),
        getSemesterById: vi.fn().mockResolvedValue({ id: '1', name: 'Spring 2026' }),
        createSemester: vi.fn().mockResolvedValue({ id: '1', name: 'Spring 2026' }),
        updateSemester: vi.fn().mockResolvedValue({ id: '1', name: 'Spring 2026' }),
        deleteSemester: vi.fn().mockResolvedValue(true),
        deleteSemesters: vi.fn().mockResolvedValue(true),
    },
}));

describe('Semesters Route Access', () => {
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
        app.route('/semesters', semestersRoutes);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('allows GET lists for support, superadmin, admin, and instructor with view permission', async () => {
        for (const role of ['support', 'superadmin', 'admin', 'instructor']) {
            const app = makeAppWithContext(role, ['semesters:view']);
            const res = await app.request('/semesters', { method: 'GET' });
            expect(res.status).not.toBe(403);
        }
    });

    it('blocks GET lists for users lacking semesters:view permission', async () => {
        const app = makeAppWithContext('admin', []);
        const res = await app.request('/semesters', { method: 'GET' });
        expect(res.status).toBe(403);
    });

    it('allows mutations (POST, PUT, DELETE) for support, superadmin, and admin when they have active permissions', async () => {
        for (const role of ['support', 'superadmin', 'admin']) {
            const app = makeAppWithContext(role, [
                'semesters:manage',
                'semesters:create',
                'semesters:update',
                'semesters:delete',
            ]);

            const postRes = await app.request('/semesters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Spring 2026',
                    code: 'S26',
                    startDate: '2026-01-01',
                    endDate: '2026-05-01',
                }),
            });
            expect(postRes.status).not.toBe(403);

            const putRes = await app.request('/semesters/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Spring 2026 Updated',
                    code: 'S26',
                    startDate: '2026-01-01',
                    endDate: '2026-05-01',
                }),
            });
            expect(putRes.status).not.toBe(403);

            const deleteRes = await app.request('/semesters/1', {
                method: 'DELETE',
            });
            expect(deleteRes.status).not.toBe(403);
        }
    });

    it('blocks mutations (POST, PUT, DELETE) for instructors and other non-admin roles', async () => {
        const app = makeAppWithContext('instructor', [
            'semesters:create',
            'semesters:update',
            'semesters:delete',
        ]);
        const res = await app.request('/semesters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Spring 2026',
                code: 'S26',
                startDate: '2026-01-01',
                endDate: '2026-05-01',
            }),
        });
        expect(res.status).toBe(403);
    });
});
