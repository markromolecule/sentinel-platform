import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { deleteSelectedSubjectsSchema } from '../subject.dto';
import { SubjectService } from '../subject.service';
import { extractErrorCode } from '../helper/error-utils';

export const deleteSelectedSubjectsRoute = createRoute({
    method: 'delete',
    path: '/bulk',
    tags: ['Subjects'],
    summary: 'Delete selected subjects',
    description:
        'Deletes selected subjects from the master catalog when none of them have active offered subjects.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteSelectedSubjectsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSelectedSubjectsSchema.response,
                },
            },
            description: 'Subjects deleted successfully',
        },
        409: { description: 'One or more selected subjects still have offered subjects' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSelectedSubjectsRouteHandler: AppRouteHandler<
    typeof deleteSelectedSubjectsRoute
> = async (c) => {
    try {
        const body = c.req.valid('json');
        const result = await SubjectService.deleteSelectedSubjects(
            c.get('dbClient'),
            body.subject_ids,
        );

        return c.json(
            {
                message: 'Subjects deleted successfully',
                data: result,
            },
            200,
        );
    } catch (error: any) {
        console.error('Delete selected subjects error:', error);
        const code = extractErrorCode(error);

        if (code === 'SUBJECT_HAS_OFFERINGS') {
            return c.json(
                { error: error?.message ?? 'Selected subjects still have offered subjects' },
                409,
            );
        }

        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
