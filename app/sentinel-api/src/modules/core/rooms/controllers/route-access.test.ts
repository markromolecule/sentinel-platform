import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import roomsRoutes from '../room.routes';

vi.mock('../../../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
        await next();
    },
}));

vi.mock('./create-room.controller', () => ({
    createRoomRoute: { method: 'post', path: '/' },
    createRoomRouteHandler: async (c: any) => c.json({ id: '1' }, 201),
}));

vi.mock('./get-rooms.controller', () => ({
    getRoomsRoute: { method: 'get', path: '/' },
    getRoomsRouteHandler: async (c: any) =>
        c.json({
            message: 'Rooms fetched successfully',
            data: [],
            pagination: { page: 3, limit: 1, total: 1, hasMore: false },
        }),
}));

vi.mock('./update-room.controller', () => ({
    updateRoomRoute: { method: 'put', path: '/:id' },
    updateRoomRouteHandler: async (c: any) => c.json({ id: '1' }),
}));

vi.mock('./delete-room.controller', () => ({
    deleteRoomRoute: { method: 'delete', path: '/:id' },
    deleteRoomRouteHandler: async (c: any) => c.json({ success: true }),
}));

vi.mock('./delete-rooms.controller', () => ({
    deleteRoomsRoute: { method: 'delete', path: '/' },
    deleteRoomsRouteHandler: async (c: any) => c.json({ success: true }),
}));

vi.mock('./bulk-create-rooms.controller', () => ({
    bulkCreateRoomsRoute: { method: 'post', path: '/bulk' },
    bulkCreateRoomsRouteHandler: async (c: any) => c.json([]),
}));

describe('Rooms Route Access', () => {
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
        app.route('/rooms', roomsRoutes);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('allows GET lists for roles with rooms:view permission', async () => {
        const app = makeAppWithContext('instructor', ['rooms:view']);
        const res = await app.request('/rooms', { method: 'GET' });
        expect(res.status).toBe(200);
    });

    it('blocks GET lists for users lacking rooms:view permission', async () => {
        const app = makeAppWithContext('instructor', []);
        const res = await app.request('/rooms', { method: 'GET' });
        expect(res.status).toBe(403);
    });

    it('allows mutations (POST, PUT, DELETE) for roles with rooms:manage permission', async () => {
        const app = makeAppWithContext('admin', ['rooms:manage']);

        const postRes = await app.request('/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Room 101', capacity: 30 }),
        });
        expect(postRes.status).toBe(201);

        const putRes = await app.request('/rooms/1', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Room 101 Updated', capacity: 35 }),
        });
        expect(putRes.status).toBe(200);

        const deleteRes = await app.request('/rooms/1', {
            method: 'DELETE',
        });
        expect(deleteRes.status).toBe(200);
    });

    it('blocks mutations (POST, PUT, DELETE) for users lacking rooms:manage permission', async () => {
        const app = makeAppWithContext('instructor', ['rooms:view']);
        const res = await app.request('/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Room 101', capacity: 30 }),
        });
        expect(res.status).toBe(403);
    });

    it('returns pagination metadata when page and limit are provided', async () => {
        const app = makeAppWithContext('support', ['rooms:view']);
        const res = await app.request('/rooms?page=3&limit=1', { method: 'GET' });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.pagination).toEqual({
            page: 3,
            limit: 1,
            total: 1,
            hasMore: false,
        });
        expect(body.data).toEqual([]);
    });
});
