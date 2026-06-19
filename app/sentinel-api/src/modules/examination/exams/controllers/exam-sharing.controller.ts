import { createRoute, z } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { Schema } from '@sentinel/shared';
import { shareExamSchema, getExamSharesSchema } from '../exam.dto';
import { shareExam } from '../services/share-exam.service';
import { unshareExam } from '../services/unshare-exam.service';
import { HTTPException } from 'hono/http-exception';

/**
 * Returns the users currently shared with an exam.
 */
export const getExamSharesRoute = createRoute({
    method: 'get',
    path: '/exams/:id/shares',
    tags: ['Exams'],
    summary: 'List shared users for an exam',
    request: {
        params: getExamSharesSchema.params,
    },
    responses: {
        200: {
            description: 'Shared users fetched successfully',
            content: {
                'application/json': {
                    schema: getExamSharesSchema.response,
                },
            },
        },
    },
});

export const getExamSharesRouteHandler: AppRouteHandler<typeof getExamSharesRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const dbClient = c.get('dbClient');
    const user = c.get('user');

    // Check if the user has access to view the exam (is owner, assigned, or public within institution)
    const exam = await dbClient
        .selectFrom('exams')
        .select(['exam_id', 'created_by', 'is_public', 'institution_id'])
        .where('exam_id', '=', id)
        .executeTakeFirst();

    if (!exam) {
        throw new HTTPException(404, { message: 'Exam not found.' });
    }

    const isOwner = exam.created_by === user.id;
    const isPublicInInstitution = exam.is_public && exam.institution_id === c.get('institutionId');

    const isShared = await dbClient
        .selectFrom('exam_shares')
        .select('user_id')
        .where('exam_id', '=', id)
        .where('user_id', '=', user.id)
        .executeTakeFirst();

    if (!isOwner && !isPublicInInstitution && !isShared) {
        throw new HTTPException(403, {
            message: 'Forbidden. You do not have access to this exam.',
        });
    }

    const sharedUsers = await dbClient
        .selectFrom('exam_shares as es')
        .innerJoin('user_profiles as up', 'up.user_id', 'es.user_id')
        .innerJoin('auth.users as u', 'u.id', 'es.user_id')
        .select(['es.user_id', 'up.first_name', 'up.last_name', 'u.email'])
        .where('es.exam_id', '=', id)
        .orderBy('up.last_name', 'asc')
        .orderBy('up.first_name', 'asc')
        .execute();

    return c.json({
        message: 'Shared users fetched successfully',
        data: sharedUsers,
    });
};

/**
 * Replaces the exam share list with the provided user IDs.
 */
export const shareExamRoute = createRoute({
    method: 'post',
    path: '/exams/:id/shares',
    tags: ['Exams'],
    summary: 'Share an exam with users',
    request: {
        params: shareExamSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: shareExamSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam shared successfully',
            content: {
                'application/json': {
                    schema: shareExamSchema.response,
                },
            },
        },
    },
});

export const shareExamRouteHandler: AppRouteHandler<typeof shareExamRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const { userIds } = c.req.valid('json');
    const dbClient = c.get('dbClient');
    const user = c.get('user');
    const institutionId = c.get('institutionId') || null;

    const sharedUsers = await shareExam({
        dbClient,
        examId: id,
        userIds,
        requestingUserId: user.id,
        institutionId,
    });

    return c.json({
        message: 'Exam shared successfully',
        data: sharedUsers,
    });
};

/**
 * Removes a specific user from the exam share list.
 */
export const unshareExamRoute = createRoute({
    method: 'delete',
    path: '/exams/:id/shares/:userId',
    tags: ['Exams'],
    summary: 'Remove shared access for a user from an exam',
    request: {
        params: z.object({
            id: z.string().uuid(),
            userId: z.string().uuid(),
        }),
    },
    responses: {
        200: {
            description: 'Exam share removed successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        data: z.null(),
                    }),
                },
            },
        },
    },
});

export const unshareExamRouteHandler: AppRouteHandler<typeof unshareExamRoute> = async (c) => {
    const { id, userId } = c.req.valid('param');
    const dbClient = c.get('dbClient');
    const user = c.get('user');

    await unshareExam({
        dbClient,
        examId: id,
        userId,
        requestingUserId: user.id,
    });

    return c.json({
        message: 'Exam share removed successfully',
        data: null,
    });
};
