import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { submitSubjectRequestRoute, submitSubjectRequestRouteHandler } from './submit-request.controller';
import { reviewSubjectRequestRoute, reviewSubjectRequestRouteHandler } from './review-request.controller';
import { cancelSubjectRequestRoute, cancelSubjectRequestRouteHandler } from './cancel-request.controller';
import { listSubjectRequestsRoute, listSubjectRequestsRouteHandler } from './list-requests.controller';
import { InstructorSubjectRequestsService } from '../instructor-subject-requests.service';

vi.mock('../instructor-subject-requests.service', () => ({
    InstructorSubjectRequestsService: {
        submitRequest: vi.fn(),
        reviewRequest: vi.fn(),
        cancelRequest: vi.fn(),
        listRequests: vi.fn(),
    },
}));

describe('Instructor Subject Request Controllers', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'instructor-1' } as any);
        c.set('institutionId', 'inst-1');
        c.set('activePermissionKeys', ['subjects:update']);
        await next();
    });

    app.openapi(submitSubjectRequestRoute, submitSubjectRequestRouteHandler);
    app.openapi(reviewSubjectRequestRoute, reviewSubjectRequestRouteHandler);
    app.openapi(cancelSubjectRequestRoute, cancelSubjectRequestRouteHandler);
    app.openapi(listSubjectRequestsRoute, listSubjectRequestsRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST / (submitRequest)', () => {
        it('returns 200 and calls service on successful submission', async () => {
            const mockRequest = { request_id: 'req-1', status: 'PENDING' };
            vi.mocked(InstructorSubjectRequestsService.submitRequest).mockResolvedValue(mockRequest as any);

            const res = await app.request('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectId: '11111111-1111-4111-8111-111111111111',
                    justification: 'I want to teach this course.',
                }),
            });

            expect(res.status).toBe(200);
            expect(InstructorSubjectRequestsService.submitRequest).toHaveBeenCalledWith(expect.any(Object), {
                instructorUserId: 'instructor-1',
                subjectId: '11111111-1111-4111-8111-111111111111',
                justification: 'I want to teach this course.',
                institutionId: 'inst-1',
            });
        });
    });

    describe('PATCH /:id/review (reviewRequest)', () => {
        it('returns 200 and calls service on successful review', async () => {
            const mockRequest = { request_id: 'req-1', status: 'APPROVED' };
            vi.mocked(InstructorSubjectRequestsService.reviewRequest).mockResolvedValue(mockRequest as any);

            const res = await app.request('/11111111-1111-4111-8111-111111111111/review', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'APPROVED',
                    reviewComments: 'Qualified!',
                }),
            });

            expect(res.status).toBe(200);
            expect(InstructorSubjectRequestsService.reviewRequest).toHaveBeenCalledWith(expect.any(Object), {
                requestId: '11111111-1111-4111-8111-111111111111',
                status: 'APPROVED',
                reviewerUserId: 'instructor-1',
                reviewComments: 'Qualified!',
                institutionId: 'inst-1',
            });
        });
    });

    describe('POST /:id/cancel (cancelRequest)', () => {
        it('returns 200 and calls service on successful cancellation', async () => {
            vi.mocked(InstructorSubjectRequestsService.cancelRequest).mockResolvedValue(undefined);

            const res = await app.request('/11111111-1111-4111-8111-111111111111/cancel', {
                method: 'POST',
            });

            expect(res.status).toBe(200);
            expect(InstructorSubjectRequestsService.cancelRequest).toHaveBeenCalledWith(expect.any(Object), {
                requestId: '11111111-1111-4111-8111-111111111111',
                instructorUserId: 'instructor-1',
            });
        });
    });

    describe('GET / (listRequests)', () => {
        it('returns 200 and calls service with correct filters', async () => {
            vi.mocked(InstructorSubjectRequestsService.listRequests).mockResolvedValue([]);

            const res = await app.request('/?status=PENDING', {
                method: 'GET',
            });

            expect(res.status).toBe(200);
            expect(InstructorSubjectRequestsService.listRequests).toHaveBeenCalledWith(expect.any(Object), {
                instructorUserId: undefined, // undefined because permissions includes subjects:update
                status: 'PENDING',
                institutionId: 'inst-1',
            });
        });
    });
});
