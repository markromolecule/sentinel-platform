import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { deleteSubjectSchema } from '../subject.dto';
import { SubjectService } from '../subject.service';

export const deleteSubjectRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Subjects'],
    summary: 'Delete a subject',
    description: 'Deletes an existing subject.',
    request: {
        params: deleteSubjectSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSubjectSchema.response,
                },
            },
            description: 'Subject deleted successfully',
        },
        404: { description: 'Subject not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSubjectRouteHandler: AppRouteHandler<typeof deleteSubjectRoute> = async (c) => {
    try {
        const { id } = c.req.valid('param');

        await SubjectService.deleteSubject(c.get('dbClient'), id);

        return c.json(
            {
                message: 'Subject deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        console.error('Delete subject error:', error);
        if (error?.code === 'P2025' || error?.message === 'No result') {
            return c.json({ error: 'Subject not found' }, 404);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
