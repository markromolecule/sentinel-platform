import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentReadAccess,
    resolveAssessmentReadScope,
} from '../../assessment/assessment-access';
import { getExamsSchema } from '../exam.dto';
import { ExamService } from '../exam.service';

export const getExamsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Exams'],
    summary: 'List exams',
    request: getExamsSchema.request,
    responses: {
        200: {
            description: 'Exams fetched successfully',
            content: {
                'application/json': {
                    schema: getExamsSchema.response,
                },
            },
        },
        400: {
            description: 'Institution context required',
            content: {
                'application/json': {
                    schema: getExamsSchema.response,
                },
            },
        },
    },
});

interface SupabaseUserMetadata {
    user_metadata?: {
        role?: string;
    };
}

/**
 * Handles exam list requests and enforces institution-scoped instructor visibility.
 *
 * Note: `assertAssessmentReadAccess` checks the context-level `role`/permissions
 * set by upstream auth middleware — a separate concept from the `role` resolved
 * below via `resolveAssessmentReadScope`, which is used purely for institution
 * scoping and query params. Don't conflate the two.
 */
export const getExamsRouteHandler: AppRouteHandler<typeof getExamsRoute> = async (c) => {
    const query = c.req.valid('query');
    const dbClient = c.get('dbClient');
    const user = c.get('user');
    const supabaseUser = c.get('supabaseUser') as SupabaseUserMetadata | undefined;

    let { role, institutionId, studentUserId, departmentId, instructorUserId } =
        await resolveAssessmentReadScope({
            dbClient,
            user,
            claimedRole: supabaseUser?.user_metadata?.role,
            contextInstitutionId: c.get('institutionId'),
            requestedInstitutionId: query.institutionId,
            activePermissionKeys: c.get('activePermissionKeys'),
        });

    if (query.viewer === 'student' && studentUserId) {
        role = 'student';
        departmentId = undefined;
        instructorUserId = undefined;
    }

    if (role !== 'student') {
        assertAssessmentReadAccess(c);
    }

    if (role === 'instructor' && !institutionId) {
        return c.json({ message: 'Institution context required', data: [] }, 400);
    }

    const exams = await ExamService.getExams(
        dbClient,
        query,
        institutionId,
        studentUserId,
        departmentId,
        instructorUserId,
    );

    return c.json({
        message: 'Exams fetched successfully',
        data: exams,
    });
};
