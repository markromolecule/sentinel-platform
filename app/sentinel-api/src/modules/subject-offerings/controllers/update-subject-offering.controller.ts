import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { updateSubjectOfferingSchema } from '../subject-offerings.dto';
import { SubjectOfferingsService } from '../subject-offerings.service';
import { extractErrorCode } from '../../subjects/helper/error-utils';
import { mapSubjectOfferingResponse } from '../helper/map-subject-offering-response';

export const updateSubjectOfferingRoute = createRoute({
    method: 'put',
    path: '/{id}',
    tags: ['Subject Offerings'],
    summary: 'Update a subject offering',
    description: 'Updates an existing subject offering.',
    request: {
        params: updateSubjectOfferingSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateSubjectOfferingSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateSubjectOfferingSchema.response,
                },
            },
            description: 'Subject offering updated successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Subject offering not found' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateSubjectOfferingRouteHandler: AppRouteHandler<
    typeof updateSubjectOfferingRoute
> = async (c) => {
    try {
        const { id } = c.req.valid('param');
        const body = c.req.valid('json');
        const user = c.get('user');

        const rawSubjectOffering = await SubjectOfferingsService.updateSubjectOffering(
            c.get('dbClient'),
            id,
            {
                term_id: body.term_id,
                status: body.status,
                department_ids: body.department_ids,
                course_ids: body.course_ids,
                section_ids: body.section_ids,
                year_levels: body.year_levels,
                updated_by: user.id,
                institution_id: c.get('institutionId'),
            },
        );

        return c.json(
            {
                message: 'Subject offering updated successfully',
                data: mapSubjectOfferingResponse(rawSubjectOffering),
            },
            200,
        );
    } catch (error: any) {
        console.error('Update subject offering error:', error);
        const code = extractErrorCode(error);

        if (code === 'P2025') {
            return c.json({ error: error?.message ?? 'Subject offering not found' }, 404);
        }

        if (code === 'P2002' || code === '23505') {
            return c.json({ error: 'This subject is already offered for the selected term' }, 409);
        }

        if (code === '23503' || code === '22P02' || code === 'INVALID_SUBJECT_OFFERING_PAYLOAD') {
            return c.json({ error: error?.message ?? 'Invalid subject offering payload' }, 400);
        }

        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
