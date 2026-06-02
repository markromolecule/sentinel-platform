import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { OpenAPIHono } from '@hono/zod-openapi';
import { AnnouncementService } from '../announcement.service';
import {
    getAnnouncementsRoute,
    getAnnouncementsRouteHandler,
} from './get-announcements.controller';
import {
    getAnnouncementByIdRoute,
    getAnnouncementByIdRouteHandler,
} from './get-announcement-by-id.controller';
import {
    getAnnouncementBySlugRoute,
    getAnnouncementBySlugRouteHandler,
} from './get-announcement-by-slug.controller';
import {
    createAnnouncementRoute,
    createAnnouncementRouteHandler,
} from './create-announcement.controller';
import {
    updateAnnouncementRoute,
    updateAnnouncementRouteHandler,
} from './update-announcement.controller';
import {
    deleteAnnouncementRoute,
    deleteAnnouncementRouteHandler,
} from './delete-announcement.controller';

const mockFindAll = vi.fn();
const mockFindById = vi.fn();
const mockFindBySlug = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockRemove = vi.fn();

vi.mock('../announcement.service', () => {
    return {
        AnnouncementService: class {
            findAll = mockFindAll;
            findById = mockFindById;
            findBySlug = mockFindBySlug;
            create = mockCreate;
            update = mockUpdate;
            remove = mockRemove;
        },
    };
});

describe('Announcement Controllers', () => {
    function createTestApp(permissionKeys: string[]) {
        const app = new OpenAPIHono();

        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'user-123' } as any);
            c.set('institutionId', 'inst-456');
            c.set('role', 'admin');
            c.set('activePermissionKeys', permissionKeys);
            await next();
        });

        app.openapi(getAnnouncementsRoute, getAnnouncementsRouteHandler);
        app.openapi(getAnnouncementBySlugRoute, getAnnouncementBySlugRouteHandler);
        app.openapi(getAnnouncementByIdRoute, getAnnouncementByIdRouteHandler);
        app.openapi(createAnnouncementRoute, createAnnouncementRouteHandler);
        app.openapi(updateAnnouncementRoute, updateAnnouncementRouteHandler);
        app.openapi(deleteAnnouncementRoute, deleteAnnouncementRouteHandler);

        return app;
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /announcements', () => {
        it('fetches list of announcements when authorized', async () => {
            const mockAnnouncements = {
                items: [{ id: 'a-1', title: 'Welcome to Sentinel', slug: 'welcome-to-sentinel' }],
                total: 1,
            };

            mockFindAll.mockResolvedValue(mockAnnouncements);

            const app = createTestApp(['announcement:view']);
            const res = await app.request('/?page=1&limit=10');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(mockFindAll).toHaveBeenCalledWith(
                expect.objectContaining({ page: 1, limit: 10 }),
                'inst-456',
            );
            expect(body).toEqual({
                success: true,
                message: 'Announcements retrieved successfully',
                data: mockAnnouncements.items,
                meta: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            });
        });

        it('returns 403 Forbidden if caller lacks view permission', async () => {
            const app = createTestApp([]);
            const res = await app.request('/');

            expect(res.status).toBe(403);
        });
    });

    describe('GET /announcements/:id', () => {
        it('fetches a single announcement by ID when authorized', async () => {
            const mockAnnouncement = {
                id: '11111111-1111-4111-8111-111111111111',
                title: 'Welcome',
                slug: 'welcome',
            };

            mockFindById.mockResolvedValue(mockAnnouncement);

            const app = createTestApp(['announcement:view']);
            const res = await app.request('/11111111-1111-4111-8111-111111111111');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(mockFindById).toHaveBeenCalledWith(
                '11111111-1111-4111-8111-111111111111',
                'inst-456',
            );
            expect(body).toEqual({
                success: true,
                message: 'Announcement retrieved successfully',
                data: mockAnnouncement,
            });
        });
    });

    describe('GET /announcements/slug/:slug', () => {
        it('fetches a single announcement by Slug when authorized', async () => {
            const mockAnnouncement = {
                id: '11111111-1111-4111-8111-111111111111',
                title: 'Welcome',
                slug: 'welcome',
            };

            mockFindBySlug.mockResolvedValue(mockAnnouncement);

            const app = createTestApp(['announcement:view']);
            const res = await app.request('/slug/welcome');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(mockFindBySlug).toHaveBeenCalledWith('welcome', 'inst-456');
            expect(body).toEqual({
                success: true,
                message: 'Announcement retrieved successfully',
                data: mockAnnouncement,
            });
        });
    });

    describe('POST /announcements', () => {
        it('creates a new announcement when authorized', async () => {
            const payload = {
                title: 'New Term',
                content: 'New Term starts next week.',
            };
            const mockCreated = {
                id: '11111111-1111-4111-8111-111111111111',
                slug: 'new-term',
                ...payload,
            };

            mockCreate.mockResolvedValue(mockCreated);

            const app = createTestApp(['announcement:create']);
            const res = await app.request('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const body = await res.json();

            expect(res.status).toBe(201);
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({ title: 'New Term' }),
                'user-123',
                'inst-456',
            );
            expect(body).toEqual({
                success: true,
                message: 'Announcement created successfully',
                data: mockCreated,
            });
        });
    });

    describe('PATCH /announcements/:id', () => {
        it('updates an announcement when authorized', async () => {
            const payload = { title: 'Updated Title' };
            const mockUpdated = {
                id: '11111111-1111-4111-8111-111111111111',
                title: 'Updated Title',
            };

            mockUpdate.mockResolvedValue(mockUpdated);

            const app = createTestApp(['announcement:update']);
            const res = await app.request('/11111111-1111-4111-8111-111111111111', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(mockUpdate).toHaveBeenCalledWith(
                '11111111-1111-4111-8111-111111111111',
                expect.objectContaining({ title: 'Updated Title' }),
                'inst-456',
                { notifyOnUpdate: true },
            );
            expect(body).toEqual({
                success: true,
                message: 'Announcement updated successfully',
                data: mockUpdated,
            });
        });
    });

    describe('DELETE /announcements/:id', () => {
        it('deletes an announcement when authorized', async () => {
            mockRemove.mockResolvedValue({ id: '11111111-1111-4111-8111-111111111111' });

            const app = createTestApp(['announcement:delete']);
            const res = await app.request('/11111111-1111-4111-8111-111111111111', {
                method: 'DELETE',
            });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(mockRemove).toHaveBeenCalledWith(
                '11111111-1111-4111-8111-111111111111',
                'inst-456',
            );
            expect(body).toEqual({
                success: true,
                message: 'Announcement deleted successfully',
                data: null,
            });
        });
    });
});
