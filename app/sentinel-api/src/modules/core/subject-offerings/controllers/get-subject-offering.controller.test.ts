import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    getSubjectOfferingRoute,
    getSubjectOfferingRouteHandler,
} from './get-subject-offering.controller';
import { SubjectOfferingsService } from '../subject-offerings.service';

vi.mock('../../../_shared/academic-scope', () => ({
    buildRequesterAcademicScope: vi.fn((scope) => scope),
    assertSubjectOfferingRecordInScope: vi.fn(),
}));

vi.mock('../subject-offerings.service', () => ({
    SubjectOfferingsService: {
        getSubjectOfferingById: vi.fn(),
    },
}));

describe('getSubjectOfferingRouteHandler', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('institutionId', '11111111-1111-4111-8111-111111111111');
        c.set('supabaseUser', {
            user_metadata: {
                role: 'admin',
            },
        } as any);
        c.set('user', {
            id: '44444444-4444-4444-8444-444444444444',
            user_profiles: {
                department_id: null,
                course_id: null,
            },
        } as any);
        c.set('activePermissionKeys', ['subject_offerings:view']);
        await next();
    });

    app.openapi(getSubjectOfferingRoute, getSubjectOfferingRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 and subject offering details on successful fetch', async () => {
        const mockOffering = {
            subject_offering_id: 'd9b736b7-862d-4530-9b3f-1d8f6d7ab753',
            subject_id: '22222222-2222-2222-8222-222222222222',
            subject_code: 'INF231',
            subject_title: 'Introduction to Computing',
            term_id: '33333333-3333-3333-8333-333333333333',
            term_academic_year: '2026-2027',
            term_semester: '1st Semester',
            status: 'OPEN',
            department_ids: [],
            course_ids: [],
            section_ids: [],
            year_levels: [],
            departments: [],
            courses: [],
            sections: [],
            classifications: [],
            instructors: [],
        };

        vi.mocked(SubjectOfferingsService.getSubjectOfferingById).mockResolvedValue(mockOffering as any);

        const res = await app.request('/d9b736b7-862d-4530-9b3f-1d8f6d7ab753');

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.data).toEqual(mockOffering);
        expect(SubjectOfferingsService.getSubjectOfferingById).toHaveBeenCalledWith(
            {},
            'd9b736b7-862d-4530-9b3f-1d8f6d7ab753',
            '11111111-1111-4111-8111-111111111111',
        );
    });

    it('returns 404 if the subject offering is not found', async () => {
        vi.mocked(SubjectOfferingsService.getSubjectOfferingById).mockRejectedValue(new Error('No result'));

        const res = await app.request('/d9b736b7-862d-4530-9b3f-1d8f6d7ab754');

        expect(res.status).toBe(404);
    });
});
