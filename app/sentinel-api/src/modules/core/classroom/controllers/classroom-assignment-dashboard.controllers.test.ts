import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { getUnassignedClassroomsRoute, getUnassignedClassroomsRouteHandler } from './get-unassigned-classrooms.controller';
import { getInstructorLoadSummaryRoute, getInstructorLoadSummaryRouteHandler } from './get-instructor-load-summary.controller';
import { getSmartSuggestionsRoute, getSmartSuggestionsRouteHandler } from './get-smart-suggestions.controller';
import { bulkAssignClassroomInstructorsRoute, bulkAssignClassroomInstructorsRouteHandler } from './bulk-assign-classroom-instructors.controller';
import { ClassroomService } from '../classroom.service';

vi.mock('../classroom.service', () => ({
    ClassroomService: {
        getUnassignedClassrooms: vi.fn(),
        getInstructorLoadSummary: vi.fn(),
        getSmartSuggestions: vi.fn(),
        bulkAssignClassroomInstructors: vi.fn(),
    },
}));

describe('Classroom Assignment Dashboard Controllers', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'admin-1' } as any);
        c.set('institutionId', 'inst-1');
        c.set('activePermissionKeys', ['classrooms:view', 'classrooms:update']);
        await next();
    });

    app.openapi(getUnassignedClassroomsRoute, getUnassignedClassroomsRouteHandler);
    app.openapi(getInstructorLoadSummaryRoute, getInstructorLoadSummaryRouteHandler);
    app.openapi(getSmartSuggestionsRoute, getSmartSuggestionsRouteHandler);
    app.openapi(bulkAssignClassroomInstructorsRoute, bulkAssignClassroomInstructorsRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /dashboard/unassigned (getUnassignedClassrooms)', () => {
        it('returns unassigned classrooms list', async () => {
            const mockClassrooms = [{ class_group_id: 'class-1', class_name: 'Physics 101' }];
            vi.mocked(ClassroomService.getUnassignedClassrooms).mockResolvedValue(mockClassrooms as any);

            const res = await app.request('/dashboard/unassigned');

            expect(res.status).toBe(200);
            await expect(res.json()).resolves.toEqual({
                message: 'Unassigned classrooms list retrieved successfully',
                data: mockClassrooms,
            });
        });
    });

    describe('GET /dashboard/instructor-loads (getInstructorLoadSummary)', () => {
        it('returns instructor load list', async () => {
            const mockLoads = [{ instructor_id: 'ins-1', classroom_count: 2 }];
            vi.mocked(ClassroomService.getInstructorLoadSummary).mockResolvedValue(mockLoads as any);

            const res = await app.request('/dashboard/instructor-loads?termId=11111111-1111-4111-8111-111111111111');

            expect(res.status).toBe(200);
            expect(ClassroomService.getInstructorLoadSummary).toHaveBeenCalledWith(expect.any(Object), {
                institutionId: 'inst-1',
                termId: '11111111-1111-4111-8111-111111111111',
            });
        });
    });

    describe('GET /:id/suggestions (getSmartSuggestions)', () => {
        it('returns ranked recommendations', async () => {
            const mockSuggestions = [{ instructor_id: 'ins-1', name: 'Dr. John', qualification_type: 'explicit', classroom_count: 0 }];
            vi.mocked(ClassroomService.getSmartSuggestions).mockResolvedValue(mockSuggestions as any);

            const res = await app.request('/11111111-1111-4111-8111-111111111111/suggestions');

            expect(res.status).toBe(200);
            expect(ClassroomService.getSmartSuggestions).toHaveBeenCalledWith(expect.any(Object), {
                classGroupId: '11111111-1111-4111-8111-111111111111',
                institutionId: 'inst-1',
            });
        });
    });

    describe('POST /dashboard/bulk-assign (bulkAssignClassroomInstructors)', () => {
        it('successfully triggers bulk assignments', async () => {
            const mockResults = [{ classGroupId: '11111111-1111-4111-8111-111111111111', instructorUserId: '22222222-2222-4222-8222-222222222222', success: true }];
            vi.mocked(ClassroomService.bulkAssignClassroomInstructors).mockResolvedValue(mockResults as any);

            const res = await app.request('/dashboard/bulk-assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignments: [{ classGroupId: '11111111-1111-4111-8111-111111111111', instructorUserId: '22222222-2222-4222-8222-222222222222' }],
                }),
            });

            expect(res.status).toBe(200);
            expect(ClassroomService.bulkAssignClassroomInstructors).toHaveBeenCalledWith(expect.any(Object), {
                assignments: [{ classGroupId: '11111111-1111-4111-8111-111111111111', instructorUserId: '22222222-2222-4222-8222-222222222222' }],
                actorUserId: 'admin-1',
                institutionId: 'inst-1',
            });
        });
    });
});
