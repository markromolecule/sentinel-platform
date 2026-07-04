import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentReadAccess,
    resolveAssessmentReadScope,
    assertExamReadScope,
    logAssessmentQuery,
} from '../../assessment/assessment-access';
import { getExamByIdSchema } from '../exam.dto';
import { ExamService } from '../exam.service';
import { getExamByIdData } from '../data/get-exam-by-id';
import { requireExamRecord } from '../services/require-exam-record.service';

export const getExamRoute = createRoute({
    method: 'get',
    path: '/:id',
    tags: ['Exams'],
    summary: 'Get an exam',
    request: {
        params: getExamByIdSchema.params,
    },
    responses: {
        200: {
            description: 'Exam fetched successfully',
            content: {
                'application/json': {
                    schema: getExamByIdSchema.response,
                },
            },
        },
    },
});

/**
 * Handles single-exam read requests and blocks private exam leakage for instructors.
 */
export const getExamRouteHandler: AppRouteHandler<typeof getExamRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');

    assertAssessmentReadAccess(c);

    const { role, institutionId, studentUserId } =
        await resolveAssessmentReadScope({
            dbClient: c.get('dbClient'),
            user,
            claimedRole: supabaseUser?.user_metadata?.role,
            contextInstitutionId: c.get('institutionId'),
            activePermissionKeys: c.get('activePermissionKeys'),
        });

    const examAccessRecord = requireExamRecord(
        await getExamByIdData({
            dbClient: c.get('dbClient'),
            id,
            institutionId,
            studentUserId,
        }),
    );

    const isShared = user?.id
        ? await c
            .get('dbClient')
            .selectFrom('exam_shares')
            .select('user_id')
            .where('exam_id', '=', id)
            .where('user_id', '=', user.id)
            .executeTakeFirst()
        : null;

    assertExamReadScope({
        role,
        userId: user?.id,
        examRecord: examAccessRecord,
        isShared: Boolean(isShared),
    });

    const exam = await ExamService.getExamById(
        c.get('dbClient'),
        id,
        institutionId,
        studentUserId,
    );

    if (user?.id && institutionId) {
        void logAssessmentQuery(
            c.get('dbClient'),
            user.id,
            id,
            institutionId,
            role || 'unknown',
        );
    }

    return c.json({
        message: 'Exam fetched successfully',
        data: exam,
    });
};
