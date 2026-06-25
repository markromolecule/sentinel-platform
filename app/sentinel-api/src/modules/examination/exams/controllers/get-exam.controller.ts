import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentReadAccess,
    resolveAssessmentActorRole,
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
    const role = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentReadAccess(c);

    const examAccessRecord = requireExamRecord(
        await getExamByIdData({
            dbClient: c.get('dbClient'),
            id,
            institutionId: c.get('institutionId') || undefined,
            studentUserId: role === 'student' ? user?.id : undefined,
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

    if (
        role === 'instructor' &&
        examAccessRecord.is_public === false &&
        user?.id !== examAccessRecord.created_by &&
        !examAccessRecord.assigned_instructor_ids?.includes(user?.id) &&
        !isShared
    ) {
        throw new HTTPException(404, {
            message: 'Exam not found.',
        });
    }

    const exam = await ExamService.getExamById(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
        role === 'student' ? user?.id : undefined,
    );

    if (user?.id && c.get('institutionId')) {
        void logAssessmentQuery(
            c.get('dbClient'),
            user.id,
            id,
            c.get('institutionId')!,
            role || 'unknown',
        );
    }

    return c.json({
        message: 'Exam fetched successfully',
        data: exam,
    });
};
