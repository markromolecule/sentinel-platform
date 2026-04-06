import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { createSubjectOfferingSchema } from '../subject-offerings.dto';
import { SubjectOfferingsService } from '../subject-offerings.service';
import { extractErrorCode } from '@/modules/core/subjects/helper/error-utils';
import { mapSubjectOfferingResponse } from '../helper/map-subject-offering-response';

export const createSubjectOfferingRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Subject Offerings'],
    summary: 'Create a subject offering',
    description: 'Creates a new term-based subject offering.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createSubjectOfferingSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createSubjectOfferingSchema.response,
                },
            },
            description: 'Subject offering created successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Related subject or term not found' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const createSubjectOfferingRouteHandler: AppRouteHandler<
    typeof createSubjectOfferingRoute
> = async (c) => {
    try {
        const body = c.req.valid('json');
        const user = c.get('user');

        const rawSubjectOffering = await SubjectOfferingsService.createSubjectOffering(
            c.get('dbClient'),
            {
                subject_id: body.subject_id,
                term_id: body.term_id,
                department_ids: body.department_ids,
                course_ids: body.course_ids,
                section_ids: body.section_ids,
                year_levels: body.year_levels,
                created_by: user.id,
                institution_id: c.get('institutionId'),
            },
        );

        return c.json(
            {
                message: 'Subject offering created successfully',
                data: mapSubjectOfferingResponse(rawSubjectOffering),
            },
            201,
        );
    } catch (error: any) {
        console.error('Create subject offering error:', error);
        const code = extractErrorCode(error);

        if (code === 'P2025') {
            return c.json({ error: error?.message ?? 'Subject offering dependency not found' }, 404);
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
