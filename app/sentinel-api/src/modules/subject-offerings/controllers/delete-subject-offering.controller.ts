import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { deleteSubjectOfferingSchema } from '../subject-offerings.dto';
import { SubjectOfferingsService } from '../subject-offerings.service';
import { extractErrorCode } from '../../subjects/helper/error-utils';

export const deleteSubjectOfferingRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Subject Offerings'],
    summary: 'Delete a subject offering',
    description: 'Deletes an existing subject offering.',
    request: {
        params: deleteSubjectOfferingSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSubjectOfferingSchema.response,
                },
            },
            description: 'Subject offering deleted successfully',
        },
        404: { description: 'Subject offering not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSubjectOfferingRouteHandler: AppRouteHandler<
    typeof deleteSubjectOfferingRoute
> = async (c) => {
    try {
        const { id } = c.req.valid('param');

        await SubjectOfferingsService.deleteSubjectOffering(
            c.get('dbClient'),
            id,
            c.get('institutionId'),
        );

        return c.json(
            {
                message: 'Subject offering deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        console.error('Delete subject offering error:', error);
        const code = extractErrorCode(error);

        if (code === 'P2025' || error?.message === 'No result') {
            return c.json({ error: 'Subject offering not found' }, 404);
        }

        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
