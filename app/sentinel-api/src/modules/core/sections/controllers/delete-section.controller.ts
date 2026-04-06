import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { deleteSectionSchema } from '../sections.dto';
import { SectionService } from '../sections.service';

export const deleteSectionRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Sections'],
    summary: 'Delete a section',
    description: 'Deletes an existing section.',
    request: {
        params: deleteSectionSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSectionSchema.response,
                },
            },
            description: 'Section deleted successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Section not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSectionRouteHandler: AppRouteHandler<typeof deleteSectionRoute> = async (c) => {
    try {
        const { id } = c.req.valid('param');

        await SectionService.deleteSection(c.get('dbClient'), id);

        return c.json(
            {
                message: 'Section deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        console.error('Delete section error:', error);
        if (error?.code === 'P2025' || error?.message === 'No result') {
            return c.json({ error: 'Section not found' }, 404);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
