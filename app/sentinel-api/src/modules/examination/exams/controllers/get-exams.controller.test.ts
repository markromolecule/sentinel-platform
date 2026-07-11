import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { getExamsRoute, getExamsRouteHandler } from './get-exams.controller';
import { ExamService } from '../exam.service';

vi.mock('../../assessment/assessment-access', async () => {
    const actual = await vi.importActual('../../assessment/assessment-access');

    return {
        ...(actual as object),
        assertAssessmentReadAccess: vi.fn(),
        resolveAssessmentReadScope: vi.fn(),
    };
});

vi.mock('../exam.service', () => ({
    ExamService: {
        getExams: vi.fn(),
    },
}));

import {
    assertAssessmentReadAccess,
    resolveAssessmentReadScope,
} from '../../assessment/assessment-access';

function createApp(
    user?: { id: string; user_profiles?: { department_id?: string | null } } | null,
) {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', user ?? null);
        c.set('institutionId', 'institution-1');
        c.set('supabaseUser', {
            user_metadata: {
                role: null,
            },
        } as any);
        c.set('role', null);
        c.set('activePermissionKeys', [] as any);
        await next();
    });

    app.openapi(getExamsRoute, getExamsRouteHandler);

    return app;
}

describe('getExamsRouteHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(resolveAssessmentReadScope).mockResolvedValue({
            role: 'support',
            institutionId: 'institution-1',
            studentUserId: undefined,
            departmentId: undefined,
            instructorUserId: undefined,
        });
        vi.mocked(ExamService.getExams).mockResolvedValue([]);
    });

    it('passes the authenticated user as student context when a student profile exists', async () => {
        vi.mocked(resolveAssessmentReadScope).mockResolvedValue({
            role: 'student',
            institutionId: 'institution-1',
            studentUserId: 'user-1',
            departmentId: undefined,
            instructorUserId: undefined,
        });

        const app = createApp({ id: 'user-1' });
        const response = await app.request('/');

        expect(response.status).toBe(200);
        expect(assertAssessmentReadAccess).not.toHaveBeenCalled();
        expect(ExamService.getExams).toHaveBeenCalledWith(
            expect.anything(),
            {},
            'institution-1',
            'user-1',
            undefined,
            undefined,
        );
    });

    it('omits student context when the authenticated user has no student profile', async () => {
        vi.mocked(resolveAssessmentReadScope).mockResolvedValue({
            role: 'instructor',
            institutionId: 'institution-1',
            studentUserId: undefined,
            departmentId: undefined,
            instructorUserId: 'user-1',
        });

        const app = createApp({ id: 'user-1' });
        const response = await app.request('/');

        expect(response.status).toBe(200);
        expect(assertAssessmentReadAccess).toHaveBeenCalled();
        expect(ExamService.getExams).toHaveBeenCalledWith(
            expect.anything(),
            {},
            'institution-1',
            undefined,
            undefined,
            'user-1',
        );
    });

    it('passes the instructor/admin user ID as instructorUserId when the actor is an admin', async () => {
        vi.mocked(resolveAssessmentReadScope).mockResolvedValue({
            role: 'admin',
            institutionId: 'institution-1',
            studentUserId: undefined,
            departmentId: 'dept-1',
            instructorUserId: 'admin-1',
        });

        const app = createApp({
            id: 'admin-1',
            user_profiles: { department_id: 'dept-1' },
        });
        const response = await app.request('/');

        expect(response.status).toBe(200);
        expect(assertAssessmentReadAccess).toHaveBeenCalled();
        expect(ExamService.getExams).toHaveBeenCalledWith(
            expect.anything(),
            {},
            'institution-1',
            undefined,
            'dept-1',
            'admin-1',
        );
    });

    it('forces student viewer scope when explicitly requested by student surfaces', async () => {
        vi.mocked(resolveAssessmentReadScope).mockResolvedValue({
            role: 'admin',
            institutionId: 'institution-1',
            studentUserId: 'user-1',
            departmentId: 'dept-1',
            instructorUserId: 'user-1',
        });

        const app = createApp({ id: 'user-1' });
        const response = await app.request('/?viewer=student');

        expect(response.status).toBe(200);
        expect(assertAssessmentReadAccess).not.toHaveBeenCalled();
        expect(ExamService.getExams).toHaveBeenCalledWith(
            expect.anything(),
            { viewer: 'student' },
            'institution-1',
            'user-1',
            undefined,
            undefined,
        );
    });
});
