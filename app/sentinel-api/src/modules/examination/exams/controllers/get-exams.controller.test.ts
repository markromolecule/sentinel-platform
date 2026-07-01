import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { getExamsRoute, getExamsRouteHandler } from './get-exams.controller';
import { ExamService } from '../exam.service';

vi.mock('../../assessment/assessment-access', async () => {
    const actual = await vi.importActual('../../assessment/assessment-access');

    return {
        ...(actual as object),
        assertAssessmentReadAccess: vi.fn(),
        resolveAssessmentActorRole: vi.fn(),
        resolveAssessmentInstitutionId: vi.fn(),
    };
});

vi.mock('../../access/data/entitlements.repository', () => ({
    EntitlementsRepository: {
        getStudentProfileByUserId: vi.fn(),
    },
}));

vi.mock('../exam.service', () => ({
    ExamService: {
        getExams: vi.fn(),
    },
}));

import {
    assertAssessmentReadAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { EntitlementsRepository } from '../../access/data/entitlements.repository';

function createApp(user?: { id: string; user_profiles?: { department_id?: string | null } } | null) {
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
        vi.mocked(resolveAssessmentActorRole).mockResolvedValue('support');
        vi.mocked(resolveAssessmentInstitutionId).mockReturnValue('institution-1');
        vi.mocked(ExamService.getExams).mockResolvedValue([]);
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue(null);
    });

    it('passes the authenticated user as student context when a student profile exists', async () => {
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue({
            student_id: 'student-1',
            institution_id: 'institution-1',
        } as any);

        const app = createApp({ id: 'user-1' });
        const response = await app.request('/');

        expect(response.status).toBe(200);
        expect(assertAssessmentReadAccess).toHaveBeenCalled();
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
        const app = createApp({ id: 'user-1' });
        const response = await app.request('/');

        expect(response.status).toBe(200);
        expect(ExamService.getExams).toHaveBeenCalledWith(
            expect.anything(),
            {},
            'institution-1',
            undefined,
            undefined,
            undefined,
        );
    });
});
