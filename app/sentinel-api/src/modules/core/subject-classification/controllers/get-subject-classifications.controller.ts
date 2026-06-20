import { Context } from 'hono';
import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler, type HonoEnv } from '../../../../types/hono';
import { getSubjectClassificationsSchema } from '../subject-classification.dto';
import { SubjectClassificationService } from '../subject-classification.service';
import { toSubjectClassificationResponse } from '../helper/response-utils';

export const getSubjectClassificationsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Subject Classification'],
    summary: 'Get subject classifications',
    description: 'Retrieves subject classification groups and their assigned subjects.',
    request: getSubjectClassificationsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getSubjectClassificationsSchema.response,
                },
            },
            description: 'Subject classifications retrieved successfully',
        },
        500: { description: 'Internal Server Error' },
    },
});

export const getSubjectClassificationsRouteHandler: AppRouteHandler<
    typeof getSubjectClassificationsRoute
> = async (c) => {
    try {
        requireActivePermission(c, 'subjects:view', 'Forbidden. Missing subjects:view permission.');
        const role = c.get('role');
        const {
            search,
            institutionId: requestedInstitutionId,
            page,
            limit,
        } = c.req.valid('query');

        const institutionId = ['support', 'superadmin'].includes(role)
            ? (requestedInstitutionId ?? undefined)
            : c.get('institutionId');

        const classificationResult = await SubjectClassificationService.getSubjectClassifications(
            c.get('dbClient'),
            institutionId || undefined,
            search,
            page,
            limit,
        );
        const classifications = Array.isArray(classificationResult)
            ? classificationResult
            : classificationResult.items;

        return c.json(
            {
                message: 'Subject classifications retrieved successfully',
                data: classifications.map(toSubjectClassificationResponse),
                ...(Array.isArray(classificationResult)
                    ? {}
                    : { pagination: classificationResult.pagination }),
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get subject classifications error:');
    }
};
