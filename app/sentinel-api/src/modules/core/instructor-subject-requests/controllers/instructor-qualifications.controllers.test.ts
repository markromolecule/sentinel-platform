import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    assignQualificationRoute,
    assignQualificationRouteHandler,
} from './assign-qualification.controller';
import {
    revokeQualificationRoute,
    revokeQualificationRouteHandler,
} from './revoke-qualification.controller';
import {
    listQualifiedInstructorsRoute,
    listQualifiedInstructorsRouteHandler,
} from './list-qualified-instructors.controller';
import { InstructorQualificationsService } from '../services/instructor-qualifications.service';

vi.mock('../services/instructor-qualifications.service', () => ({
    InstructorQualificationsService: {
        assignQualification: vi.fn(),
        revokeQualification: vi.fn(),
        listQualifiedInstructors: vi.fn(),
    },
}));

describe('Instructor Qualifications Controllers', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'admin-1' } as any);
        c.set('institutionId', 'inst-1');
        c.set('activePermissionKeys', ['subjects:update', 'subjects:view']);
        await next();
    });

    app.openapi(assignQualificationRoute, assignQualificationRouteHandler);
    app.openapi(revokeQualificationRoute, revokeQualificationRouteHandler);
    app.openapi(listQualifiedInstructorsRoute, listQualifiedInstructorsRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /qualifications (assignQualification)', () => {
        it('returns 200 and calls service on successful assignment', async () => {
            vi.mocked(InstructorQualificationsService.assignQualification).mockResolvedValue(
                undefined,
            );

            const res = await app.request('/qualifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instructorId: '11111111-1111-4111-8111-111111111111',
                    subjectId: '22222222-2222-4222-8222-222222222222',
                }),
            });

            expect(res.status).toBe(200);
            expect(InstructorQualificationsService.assignQualification).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    instructorId: '11111111-1111-4111-8111-111111111111',
                    subjectId: '22222222-2222-4222-8222-222222222222',
                    assignedByUserId: 'admin-1',
                    institutionId: 'inst-1',
                },
            );
        });
    });

    describe('DELETE /qualifications/:instructorId/:subjectId (revokeQualification)', () => {
        it('returns 200 and calls service on successful revocation', async () => {
            vi.mocked(InstructorQualificationsService.revokeQualification).mockResolvedValue(
                undefined,
            );

            const res = await app.request(
                '/qualifications/11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222',
                {
                    method: 'DELETE',
                },
            );

            expect(res.status).toBe(200);
            expect(InstructorQualificationsService.revokeQualification).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    instructorId: '11111111-1111-4111-8111-111111111111',
                    subjectId: '22222222-2222-4222-8222-222222222222',
                    institutionId: 'inst-1',
                },
            );
        });
    });

    describe('GET /subjects/:subjectId/instructors (listQualifiedInstructors)', () => {
        it('returns 200 and returns qualified instructors list', async () => {
            const mockQualified = [
                {
                    instructor_id: 'ins-1',
                    user_id: 'user-1',
                    employee_number: 'EMP-01',
                    name: 'Qualified Instructor',
                    qualification_type: 'explicit',
                },
            ];
            vi.mocked(InstructorQualificationsService.listQualifiedInstructors).mockResolvedValue(
                mockQualified as any,
            );

            const res = await app.request(
                '/subjects/22222222-2222-4222-8222-222222222222/instructors',
                {
                    method: 'GET',
                },
            );

            expect(res.status).toBe(200);
            await expect(res.json()).resolves.toEqual({
                message: 'Qualified instructors retrieved successfully',
                data: mockQualified,
            });
        });
    });
});
