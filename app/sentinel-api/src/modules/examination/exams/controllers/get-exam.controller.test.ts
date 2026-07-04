import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { getExamRoute, getExamRouteHandler } from './get-exam.controller';
import { ExamService } from '../exam.service';
import { getExamByIdData } from '../data/get-exam-by-id';

vi.mock('../../assessment/assessment-access', async () => {
    const actual = await vi.importActual('../../assessment/assessment-access');

    return {
        ...(actual as object),
        assertAssessmentReadAccess: vi.fn(),
        resolveAssessmentReadScope: vi.fn(),
        assertExamReadScope: vi.fn(),
        logAssessmentQuery: vi.fn(),
    };
});

vi.mock('../data/get-exam-by-id', () => ({
    getExamByIdData: vi.fn(),
}));

vi.mock('../exam.service', () => ({
    ExamService: {
        getExamById: vi.fn(),
    },
}));

import {
    assertAssessmentReadAccess,
    resolveAssessmentReadScope,
    assertExamReadScope,
} from '../../assessment/assessment-access';

function createApp(
    user?: { id: string; user_profiles?: { department_id?: string | null } } | null,
) {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {
            selectFrom: () => ({
                select: () => ({
                    where: () => ({
                        where: () => ({
                            executeTakeFirst: () => Promise.resolve(null),
                        }),
                    }),
                }),
            }),
        } as any);
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

    app.openapi(getExamRoute, getExamRouteHandler);

    return app;
}

describe('getExamRouteHandler', () => {
    const examId = '11111111-1111-4111-8111-111111111111';

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(resolveAssessmentReadScope).mockResolvedValue({
            role: 'support',
            institutionId: 'institution-1',
            studentUserId: undefined,
            departmentId: undefined,
            instructorUserId: undefined,
        });
        vi.mocked(ExamService.getExamById).mockResolvedValue({ exam_id: examId } as any);
        vi.mocked(getExamByIdData).mockResolvedValue({ exam_id: examId, is_public: true } as any);
    });

    it('fetches exam details for student', async () => {
        vi.mocked(resolveAssessmentReadScope).mockResolvedValue({
            role: 'student',
            institutionId: 'institution-1',
            studentUserId: 'user-1',
            departmentId: undefined,
            instructorUserId: undefined,
        });

        const app = createApp({ id: 'user-1' });
        const response = await app.request(`/${examId}`);
        expect(response.status).toBe(200);

        expect(assertAssessmentReadAccess).toHaveBeenCalled();
        expect(getExamByIdData).toHaveBeenCalledWith({
            dbClient: expect.anything(),
            id: examId,
            institutionId: 'institution-1',
            studentUserId: 'user-1',
        });
        expect(ExamService.getExamById).toHaveBeenCalledWith(
            expect.anything(),
            examId,
            'institution-1',
            'user-1',
        );
    });

    it('calls assertExamReadScope with correctly resolved parameters', async () => {
        vi.mocked(resolveAssessmentReadScope).mockResolvedValue({
            role: 'instructor',
            institutionId: 'institution-1',
            studentUserId: undefined,
            departmentId: undefined,
            instructorUserId: 'user-1',
        });

        const mockExamRecord = { exam_id: examId, is_public: false, created_by: 'user-1' };
        vi.mocked(getExamByIdData).mockResolvedValue(mockExamRecord as any);

        const app = createApp({ id: 'user-1' });
        const response = await app.request(`/${examId}`);

        expect(response.status).toBe(200);
        expect(assertExamReadScope).toHaveBeenCalledWith({
            role: 'instructor',
            userId: 'user-1',
            examRecord: mockExamRecord,
            isShared: false,
        });
    });
});
