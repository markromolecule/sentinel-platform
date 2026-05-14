import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
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
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const { search, institutionId: requestedInstitutionId } = c.req.valid('query');

        const institutionId = ['support', 'superadmin'].includes(role)
            ? (requestedInstitutionId ?? c.get('institutionId'))
            : c.get('institutionId');

        const classifications = await SubjectClassificationService.getSubjectClassifications(
            c.get('dbClient'),
            institutionId || undefined,
            search,
        );

        return c.json(
            {
                message: 'Subject classifications retrieved successfully',
                data: classifications.map(toSubjectClassificationResponse),
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get subject classifications error:');
    }
};
